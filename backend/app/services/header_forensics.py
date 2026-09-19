import re
from email.utils import parseaddr
from typing import Any
from app.services.received_chain import analyze_received_chain

def extract_email_address(value: str | None) -> str | None:
    if not value:
        return None

    _, address = parseaddr(value)

    return address.lower() if address else None


def get_header_value(headers: list[dict[str, str]], name: str) -> str | None:
    target = name.lower()

    for header in headers:
        if header["key"].lower() == target:
            return header["value"]

    return None


def get_all_header_values(
    headers: list[dict[str, str]],
    name: str,
) -> list[str]:
    target = name.lower()

    return [
        header["value"]
        for header in headers
        if header["key"].lower() == target
    ]


def extract_ips_from_received(headers: list[dict[str, str]]) -> list[str]:
    ips = []

    for received in get_all_header_values(headers, "Received"):
        matches = re.findall(
            r"\b(?:\d{1,3}\.){3}\d{1,3}\b",
            received,
        )

        for ip in matches:
            if ip not in ips:
                ips.append(ip)

    return ips


def parse_authentication_results(
    headers: list[dict[str, str]],
) -> dict[str, str | None]:

    authentication = get_header_value(
        headers,
        "Authentication-Results",
    )

    result = {
        "spf": None,
        "dkim": None,
        "dmarc": None,
    }

    if not authentication:
        return result

    spf_match = re.search(
        r"\bspf=(pass|fail|softfail|neutral|none|temperror|permerror)\b",
        authentication,
        re.IGNORECASE,
    )

    dkim_match = re.search(
        r"\bdkim=(pass|fail|neutral|none|temperror|permerror)\b",
        authentication,
        re.IGNORECASE,
    )

    dmarc_match = re.search(
        r"\bdmarc=(pass|fail|bestguesspass|fail|none|temperror|permerror)\b",
        authentication,
        re.IGNORECASE,
    )

    if spf_match:
        result["spf"] = spf_match.group(1).lower()

    if dkim_match:
        result["dkim"] = dkim_match.group(1).lower()

    if dmarc_match:
        result["dmarc"] = dmarc_match.group(1).lower()

    return result


def analyze_header_forensics(
    sender: str | None,
    headers: list[dict[str, str]],
) -> dict[str, Any]:

    from_email = extract_email_address(sender)

    reply_to = get_header_value(headers, "Reply-To")
    reply_to_email = extract_email_address(reply_to)

    return_path = get_header_value(headers, "Return-Path")
    return_path_email = extract_email_address(return_path)

    received_headers = get_all_header_values(
        headers,
        "Received",
    )

    originating_ips = extract_ips_from_received(headers)
    received_chain_analysis = analyze_received_chain(
                            received_headers)

    authentication = parse_authentication_results(headers)

    findings = []
    anomalies = []

    # From vs Reply-To
    if from_email and reply_to_email:
        if from_email != reply_to_email:
            findings.append(
                "Reply-To address differs from the sender address"
            )
            anomalies.append("from_reply_to_mismatch")

    # From vs Return-Path
    if from_email and return_path_email:
        if from_email != return_path_email:
            findings.append(
                "Return-Path differs from the sender address"
            )
            anomalies.append("from_return_path_mismatch")

    # Authentication failures
    for method in ("spf", "dkim", "dmarc"):
        result = authentication.get(method)

        if result in {"fail", "softfail", "permerror"}:
            findings.append(
                f"{method.upper()} authentication result: {result}"
            )
            anomalies.append(f"{method}_failure")

    # Missing authentication results
    if not authentication["spf"]:
        findings.append("SPF result was not found")

    if not authentication["dkim"]:
        findings.append("DKIM result was not found")

    if not authentication["dmarc"]:
        findings.append("DMARC result was not found")

    # Received chain
    if not received_headers:
        findings.append("No Received headers were found")
        anomalies.append("missing_received_headers")
    
    

    for signal in received_chain_analysis["suspicious_signals"]:
        findings.append(signal)
        anomalies.append(
        "received_chain_anomaly")

    return {
        "from_email": from_email,
        "reply_to": reply_to_email,
        "return_path": return_path_email,
        "received_chain": received_headers,
        "originating_ips": originating_ips,
        "authentication": authentication,
        "findings": findings,
        "anomalies": anomalies,
        "received_chain_analysis": received_chain_analysis
    }