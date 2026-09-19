from typing import Any


HEADER_RISK_WEIGHTS = {
    "spf_failure": 25,
    "dkim_failure": 25,
    "dmarc_failure": 30,
    "from_reply_to_mismatch": 20,
    "from_return_path_mismatch": 15,
    "missing_received_headers": 10,
}


def calculate_header_risk(
    header_forensics: dict[str, Any],
) -> dict[str, Any]:

    anomalies = header_forensics.get("anomalies", [])

    score = 0
    signals = []

    for anomaly in anomalies:
        weight = HEADER_RISK_WEIGHTS.get(anomaly, 0)

        if weight > 0:
            score += weight
            signals.append({
                "anomaly": anomaly,
                "score": weight,
            })

    score = min(score, 100)

    if score >= 75:
        risk_level = "critical"
    elif score >= 50:
        risk_level = "high"
    elif score >= 25:
        risk_level = "medium"
    else:
        risk_level = "low"

    return {
        "risk_score": score,
        "risk_level": risk_level,
        "signals": signals,
        "anomaly_count": len(anomalies),
    }