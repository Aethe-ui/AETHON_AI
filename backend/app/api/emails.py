from pathlib import Path

from fastapi import (
    APIRouter,
    Depends,
    File,
    Form,
    HTTPException,
    UploadFile,
)

from app.core.security import get_current_user
from app.core.supabase import supabase
from app.services.email_parser import parse_raw_email
from app.services.file_storage import (
    upload_attachment,
    upload_email_evidence,
)
from app.services.ioc_extractor import extract_iocs
from app.services.ml_service import ml_service
from app.services.risk_engine import calculate_case_risk
from app.services.url_analyzer import analyze_url_risk
from app.services.header_forensics import analyze_header_forensics
from app.services.header_risk import calculate_header_risk

router = APIRouter(
    prefix="/api/emails",
    tags=["Emails"],
)


@router.post("/analyze")
async def analyze_email(
    email: UploadFile | None = File(default=None),
    rawEmail: str | None = Form(default=None),
    current_user=Depends(get_current_user),
):
    # ---------------------------------------------------------
    # 1. Validate input
    # ---------------------------------------------------------

    if email is None and not rawEmail:
        raise HTTPException(
            status_code=400,
            detail="Provide either an email file or rawEmail.",
        )

    if email is not None and rawEmail:
        raise HTTPException(
            status_code=400,
            detail="Provide either an email file or rawEmail, not both.",
        )

    # ---------------------------------------------------------
    # 2. Read raw email
    # ---------------------------------------------------------

    if email is not None:
        raw_email = await email.read()

        if not raw_email:
            raise HTTPException(
                status_code=400,
                detail="Uploaded email file is empty.",
            )

    else:
        raw_email = rawEmail.encode("utf-8")

    # ---------------------------------------------------------
    # 3. Parse email
    # ---------------------------------------------------------

    try:
        parsed = parse_raw_email(raw_email)
    except Exception as exc:
        raise HTTPException(
            status_code=400,
            detail=f"Unable to parse email: {exc}",
        )

    # ---------------------------------------------------------
    # 4. Get authenticated user
    # ---------------------------------------------------------

    user_id = current_user["user_id"]

    # ---------------------------------------------------------
    # 5. Run ML analysis
    # ---------------------------------------------------------

    ml_result = ml_service.predict(
        subject=parsed["subject"],
        body=parsed["body"],
    )

    # ---------------------------------------------------------
    # 6. Create investigation case
    # ---------------------------------------------------------

    existing_email = (
    supabase
    .table("emails")
    .select("id, case_id")
    .eq("message_id", parsed["message_id"])
    .maybe_single()
    .execute()
)

    if existing_email and existing_email.data:
        raise HTTPException(
            status_code=409,
            detail={
                "message": "Email with this Message-ID has already been analyzed.",
                "message_id": parsed["message_id"],
                "case_id": existing_email.data["case_id"],
            },
        )

    case_response = (
        supabase
        .table("cases")
        .insert(
            {
                "user_id": user_id,
                "title": parsed["subject"] or "Email Investigation",
                "description": "Email submitted for AETHON analysis.",
                "status": "open",
                "priority": "medium",
                "risk_score": 0,
            }
        )
        .execute()
    )

    if not case_response.data:
        raise HTTPException(
            status_code=500,
            detail="Failed to create investigation case.",
        )

    case_id = case_response.data[0]["id"]

    # ---------------------------------------------------------
    # 7. Upload original email to Supabase Storage
    # ---------------------------------------------------------

    original_filename = (
        email.filename
        if email is not None and email.filename
        else f"{case_id}.eml"
    )

    safe_filename = Path(original_filename).name

    try:
        storage_path, file_hash = upload_email_evidence(
            data=raw_email,
            user_id=user_id,
            case_id=case_id,
            filename=safe_filename,
        )
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to store raw email evidence: {exc}",
        )

   # ---------------------------------------------------------
# 8. Store email metadata + ML result
# ---------------------------------------------------------

    email_response = (
        supabase
        .table("emails")
        .insert(
                {
                    "case_id": case_id,
                    "message_id": parsed["message_id"],
                    "subject": parsed["subject"],
                    "sender": parsed["sender"],
                    "recipients": parsed["recipients"],
                    "is_malicious": ml_result["is_malicious"],
                    "ml_confidence": ml_result["confidence"],
                    "raw_email_path": storage_path,
                    "raw_email_hash": file_hash,
                }
        )       
    .execute()
    )   

    if not email_response.data:
        raise HTTPException(
            status_code=500,
            detail="Failed to store email.",
        )

    email_id = email_response.data[0]["id"]

    # ---------------------------------------------------------
    # 9. Extract IOCs
    # ---------------------------------------------------------

    ioc_result = extract_iocs(
        subject=parsed["subject"],
        body=parsed["body"],
        headers=parsed["headers"],
    )

    header_forensics = analyze_header_forensics(
    sender=parsed["sender"],
    headers=parsed["headers"],
    )

    header_risk = calculate_header_risk(
    header_forensics
    )
    
    received_chain_analysis = header_forensics["received_chain_analysis"]

    # ---------------------------------------------------------
    # 10. Analyze extracted URLs
    # ---------------------------------------------------------

    url_results = [
        analyze_url_risk(url)
        for url in ioc_result["urls"]
    ]

    # ---------------------------------------------------------
    # 11. Calculate overall case risk
    # ---------------------------------------------------------

    case_risk = calculate_case_risk(
        ml_result=ml_result,
        url_results=url_results,
        ioc_result=ioc_result,
        header_risk=header_risk,
    )

    # ---------------------------------------------------------
    # 12. Update case risk score
    # ---------------------------------------------------------

    (
        supabase
        .table("cases")
        .update(
            {
                "risk_score": case_risk["overall_score"],
            }
        )
        .eq("id", case_id)
        .execute()
    )

    # ---------------------------------------------------------
    # 13. Store IOCs in indicators table
    # ---------------------------------------------------------

    indicator_rows = []

    # URLs
    for url, url_risk in zip(
    ioc_result["urls"],
    url_results,
    ):
       indicator_rows.append(
        {
            "case_id": case_id,
            "email_id": email_id,
            "type": "url",
            "value": url,
            "reputation": "unknown",
            "source": "aethon_url_analyzer",
            "confidence": 0.0,
            "risk_score": url_risk["risk_score"],
            "risk_level": url_risk["risk_level"],
            "risk_signals": url_risk["signals"],
        }
       )
    # Domains
    for domain in ioc_result["domains"]:

        indicator_rows.append(
            {
                "case_id": case_id,
                "email_id": email_id,
                "type": "domain",
                "value": domain,
                "reputation": "unknown",
                "source": "aethon_ioc_extractor",
                "confidence": 0.0,
            }
        )

    # IP addresses
    for ip in ioc_result["ips"]:

        indicator_rows.append(
            {
                "case_id": case_id,
                "email_id": email_id,
                "type": "ip",
                "value": ip,
                "reputation": "unknown",
                "source": "aethon_ioc_extractor",
                "confidence": 0.0,
            }
        )

    # Email addresses
    for extracted_email in ioc_result["emails"]:

        indicator_rows.append(
            {
                "case_id": case_id,
                "email_id": email_id,
                "type": "email",
                "value": extracted_email,
                "reputation": "unknown",
                "source": "aethon_ioc_extractor",
                "confidence": 0.0,
            }
        )

    if indicator_rows:

        (
            supabase
            .table("indicators")
            .insert(indicator_rows)
            .execute()
        )

    # ---------------------------------------------------------
    # 14. Store email headers
    # ---------------------------------------------------------

    header_rows = [
        {
            "email_id": email_id,
            "header_key": header["key"],
            "header_value": header["value"],
        }
        for header in parsed["headers"]
    ]

    if header_rows:

        (
            supabase
            .table("email_headers")
            .insert(header_rows)
            .execute()
        )

    # ---------------------------------------------------------
    # 15. Store attachments
    # ---------------------------------------------------------

    for attachment in parsed["attachments"]:

        filename = Path(
            attachment["filename"]
        ).name

        try:

            attachment_path, attachment_hash = upload_attachment(
                data=attachment["content"],
                user_id=user_id,
                case_id=case_id,
                filename=filename,
                content_type=attachment["content_type"],
            )

        except Exception as exc:

            raise HTTPException(
                status_code=500,
                detail=(
                    f"Failed to store attachment "
                    f"{filename}: {exc}"
                ),
            )

        attachment_response = (
            supabase
            .table("attachments")
            .insert(
                {
                    "email_id": email_id,
                    "file_name": filename,
                    "file_type": attachment["content_type"],
                    "file_size": attachment["size"],
                    "file_path": attachment_path,
                    "file_hash": attachment_hash,
                    "is_malicious": False,
                    "ml_confidence": 0.0,
                }
            )
            .execute()
        )

        if not attachment_response.data:

            raise HTTPException(
                status_code=500,
                detail=f"Failed to store attachment {filename}.",
            )

    # ---------------------------------------------------------
    # 16. Return analysis result
    # ---------------------------------------------------------

    return {
        "caseId": case_id,
        "analysis": {
            "classification": ml_result["classification"],
            "confidence": ml_result["confidence"],
            "isMalicious": ml_result["is_malicious"],
            "riskScore": case_risk["overall_score"],
            "riskLevel": case_risk["risk_level"],
            "riskComponents": case_risk["components"],
            "riskFactors": case_risk["factors"],
            "headerRisk": header_risk,
            "headerForensics" : header_forensics,
            "receivedChainAnalysis": received_chain_analysis,
        },
    }