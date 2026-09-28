from fastapi import APIRouter, Depends, HTTPException
from app.services.header_forensics import analyze_header_forensics
from pydantic import BaseModel
from app.core.security import get_current_user
from app.core.supabase import supabase


router = APIRouter(
    prefix="/api/investigations",
    tags=["Investigations"],
)

class InvestigationStatusUpdate(BaseModel):
    status: str

@router.get("")
def get_investigations(
    current_user=Depends(get_current_user),
):
    user_id = current_user["user_id"]

    try:
        response = (
            supabase
            .table("cases")
            .select("*")
            .eq("user_id", user_id)
            .order("created_at", desc=True)
            .execute()
        )
    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Failed to retrieve investigations.",
        )

    return response.data or []

@router.get("/{case_id}")
def get_investigation(
    case_id: str,
    current_user=Depends(get_current_user),
):
    user_id = current_user["user_id"]

    try:
        case_response = (
            supabase
            .table("cases")
            .select("*")
            .eq("id", case_id)
            .eq("user_id", user_id)
            .maybe_single()
            .execute()
        )
    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Failed to retrieve investigation.",
        )

    if not case_response.data:
        raise HTTPException(
            status_code=404,
            detail="Investigation not found.",
        )

    case = case_response.data

    try:
        email_response = (
            supabase
            .table("emails")
            .select("*")
            .eq("case_id", case_id)
            .order("created_at", desc=True)
            .limit(1)
            .execute()
        )
    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Failed to retrieve email associated with investigation.",
        )   

    if not email_response.data:
        raise HTTPException(
            status_code=404,
            detail="Email associated with investigation not found.",
        )

    email = email_response.data[0]

    try:
        indicator_response = (
            supabase
            .table("indicators")
            .select("*")
            .eq("case_id", case_id)
            .execute()
        )
    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Failed to retrieve investigation indicators.",
        )

    indicators = indicator_response.data or []

    try:
        header_response = (
            supabase
            .table("email_headers")
            .select("header_key, header_value")
            .eq("email_id", email["id"])
            .execute()
        )
    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Failed to retrieve email headers.",
        )

    headers = [
        {
            "key": row["header_key"],
            "value": row["header_value"],
        }
        for row in (header_response.data or [])
    ]

    header_forensics = analyze_header_forensics(
        sender=email.get("sender"),
        headers=headers,
    )

    authentication = header_forensics["authentication"]

    def indicator_risk(indicator):
        risk_level = indicator.get("risk_level")

        if risk_level in {"low", "medium", "high", "critical"}:
            return risk_level

        return "low"

    domains = []
    urls = []
    ips = []

    for indicator in indicators:
        item = {
            "value": indicator["value"],
            "risk": indicator_risk(indicator),
        }

        signals = indicator.get("risk_signals")

        if signals:
            item["note"] = ", ".join(signals)

        if indicator["type"] == "domain":
            domains.append(item)

        elif indicator["type"] == "url":
            urls.append(item)

        elif indicator["type"] == "ip":
            ips.append(item)

    try:
        attachment_response = (
            supabase
            .table("attachments")
            .select("*")
            .eq("email_id", email["id"])
            .execute()
        )
    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Failed to retrieve email attachments.",
        )

    attachments = attachment_response.data or []

    attachment_items = []

    for attachment in attachments:
        attachment_items.append(
            {
                "value": attachment["file_name"],
                "risk": (
                    "high"
                    if attachment.get("is_malicious")
                    else "low"
                ),
            }
        )

    received_path = []

    for hop in header_forensics["received_chain_analysis"]["hops"]:
        ip = (
            hop["public_ips"][0]
            if hop["public_ips"]
            else (
                hop["private_ips"][0]
                if hop["private_ips"]
                else ""
            )
        )

        server = (
            hop["hostnames"][0]
            if hop["hostnames"]
            else None
        )

        received_path.append(
            {
                "hop": hop["hop"],
                "ip": ip,
                "server": server,
                "geo": {
                    "country": None,
                    "city": None,
                    "confidence": "low",
                    "accuracyRadiusKm": 0,
                },
            }
        )

    severity = (
        "critical"
        if case["risk_score"] >= 80
        else "high"
        if case["risk_score"] >= 60
        else "medium"
        if case["risk_score"] >= 30
        else "low"
    )

    return {
        "caseId": case["id"],
        "subject": email.get("subject") or case.get("title"),
        "status": case["status"],
        "severity": severity,
        "riskScore": case["risk_score"] or 0,
        "confidence": email.get("ml_confidence") or 0,
        "classification": (
            "Phishing"
            if email.get("is_malicious")
            else "Benign"
        ),
        "createdAt": case["created_at"],
        "analyst": None,
        "explanation": [],
        "authentication": {
            "spf": authentication.get("spf") or "none",
            "dkim": authentication.get("dkim") or "none",
            "dmarc": authentication.get("dmarc") or "none",
        },
        "receivedPath": received_path,
        "indicators": {
            "domains": domains,
            "urls": urls,
            "ips": ips,
            "attachments": attachment_items,
        },
        "timeline": [],
        "notes": [],
    }


@router.patch("/{case_id}")
def update_investigation(
    case_id: str,
    payload: InvestigationStatusUpdate,
    current_user=Depends(get_current_user),
):
    user_id = current_user["user_id"]

    allowed_statuses = {
        "open",
        "investigating",
        "closed",
    }

    if payload.status not in allowed_statuses:
        raise HTTPException(
            status_code=400,
            detail="Invalid investigation status.",
        )

    try:
        existing_case = (
            supabase
            .table("cases")
            .select("id")
            .eq("id", case_id)
            .eq("user_id", user_id)
            .maybe_single()
            .execute()
        )
    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Failed to retrieve investigation.",
        )

    if not existing_case.data:
        raise HTTPException(
            status_code=404,
            detail="Investigation not found.",
        )

    update_data = {
        "status": payload.status,
    }

    if payload.status == "closed":
        from datetime import datetime, timezone

        update_data["closed_at"] = datetime.now(
            timezone.utc
        ).isoformat()
    else:
        update_data["closed_at"] = None

    response = (
        supabase
        .table("cases")
        .update(update_data)
        .eq("id", case_id)
        .eq("user_id", user_id)
        .execute()
    )

    if not response.data:
        raise HTTPException(
            status_code=500,
            detail="Failed to update investigation.",
        )

    return response.data[0]

    