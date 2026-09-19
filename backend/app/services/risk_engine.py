from typing import Any


def calculate_case_risk(
    ml_result: dict[str, Any],
    url_results: list[dict[str, Any]] | None = None,
    ioc_result: dict[str, Any] | None = None,
    header_risk: dict[str, Any] | None = None,
) -> dict[str, Any]:

    url_results = url_results or []
    ioc_result = ioc_result or {}
    header_risk = header_risk or {}

    # -------------------------
    # ML RISK
    # -------------------------

    ml_confidence = float(
        ml_result.get("confidence", 0.0)
    )

    classification = ml_result.get(
        "classification",
        "unknown",
    )

    if classification == "phishing":
        ml_risk = ml_confidence * 100

    elif classification == "legitimate":
        ml_risk = (1 - ml_confidence) * 100

    else:
        ml_risk = 0.0

    # -------------------------
    # URL RISK
    # -------------------------

    if url_results:
        url_risk = max(
            float(result.get("risk_score", 0))
            for result in url_results
        )
    else:
        url_risk = 0.0

    # -------------------------
    # IOC RISK
    # -------------------------

    url_count = len(
        ioc_result.get("urls", [])
    )

    domain_count = len(
        ioc_result.get("domains", [])
    )

    ip_count = len(
        ioc_result.get("ips", [])
    )

    total_iocs = (
        url_count
        + domain_count
        + ip_count
    )

    if total_iocs == 0:
        ioc_risk = 0.0

    elif ip_count > 0:
        ioc_risk = 30.0

    else:
        ioc_risk = 10.0

    # -------------------------
    # HEADER FORENSICS RISK
    # -------------------------

    header_score = float(
        header_risk.get("risk_score", 0)
    )

    # -------------------------
    # FINAL RISK
    # -------------------------

    overall_score = (
        (ml_risk * 0.50)
        + (url_risk * 0.25)
        + (ioc_risk * 0.10)
        + (header_score * 0.15)
    )

    overall_score = int(
        round(
            min(
                max(overall_score, 0),
                100,
            )
        )
    )

    # -------------------------
    # RISK LEVEL
    # -------------------------

    if overall_score >= 75:
        risk_level = "critical"

    elif overall_score >= 50:
        risk_level = "high"

    elif overall_score >= 25:
        risk_level = "medium"

    else:
        risk_level = "low"

    # -------------------------
    # EXPLAINABLE FACTORS
    # -------------------------

    factors = []

    if ml_risk >= 75:
        factors.append(
            "ML model strongly classified the email as phishing"
        )

    elif ml_risk >= 50:
        factors.append(
            "ML model indicates elevated phishing risk"
        )

    if url_risk >= 75:
        factors.append(
            "URL analysis indicates critical risk"
        )

    elif url_risk >= 50:
        factors.append(
            "URL analysis indicates high risk"
        )

    elif url_risk >= 25:
        factors.append(
            "URL analysis indicates moderate risk"
        )

    if ip_count > 0:
        factors.append(
            "Email contains an IP-based URL"
        )

    if total_iocs > 0:
        factors.append(
            f"Email contains {total_iocs} extracted IOC(s)"
        )

    if header_score >= 75:
        factors.append(
            "Email headers contain critical forensic anomalies"
        )

    elif header_score >= 50:
        factors.append(
            "Email headers contain high-risk forensic anomalies"
        )

    elif header_score >= 25:
        factors.append(
            "Email headers contain suspicious forensic anomalies"
        )

    return {
        "overall_score": overall_score,
        "risk_level": risk_level,
        "components": {
            "ml_risk": round(ml_risk, 2),
            "url_risk": round(url_risk, 2),
            "ioc_risk": round(ioc_risk, 2),
            "header_risk": round(header_score, 2),
        },
        "factors": factors,
    }