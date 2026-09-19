import ipaddress
import re
from urllib.parse import urlparse


# ---------------------------------------------------------
# Suspicious keywords commonly seen in phishing URLs
# ---------------------------------------------------------

SUSPICIOUS_KEYWORDS = {
    "login",
    "signin",
    "verify",
    "verification",
    "secure",
    "account",
    "password",
    "credential",
    "update",
    "confirm",
    "authentication",
    "wallet",
    "payment",
    "invoice",
    "refund",
    "suspended",
    "unlock",
}


# ---------------------------------------------------------
# Helper functions
# ---------------------------------------------------------

def is_ip_address(hostname: str) -> bool:
    """Return True if hostname is an IPv4/IPv6 address."""

    if not hostname:
        return False

    try:
        ipaddress.ip_address(hostname)
        return True
    except ValueError:
        return False


def calculate_entropy(value: str) -> float:
    """
    Calculate Shannon entropy.

    Higher entropy can indicate randomly generated or
    obfuscated URL components.
    """

    if not value:
        return 0.0

    frequency = {}

    for char in value:
        frequency[char] = frequency.get(char, 0) + 1

    length = len(value)

    entropy = 0.0

    for count in frequency.values():
        probability = count / length
        entropy -= probability * __import__("math").log2(probability)

    return entropy


# ---------------------------------------------------------
# Main URL analyzer
# ---------------------------------------------------------

def analyze_url_risk(url: str) -> dict:
    """
    Perform static risk analysis on a URL.

    Returns:
        risk_score: 0-100
        risk_level: low / medium / high / critical
        signals: reasons contributing to the score
    """

    if not url:
        return {
            "url": url,
            "risk_score": 0,
            "risk_level": "low",
            "signals": [],
        }

    normalized_url = url.strip()

    if not normalized_url.startswith(("http://", "https://")):
        normalized_url = f"http://{normalized_url}"

    parsed = urlparse(normalized_url)

    hostname = parsed.hostname or ""
    path = parsed.path or ""
    query = parsed.query or ""

    score = 0
    signals = []

    # -----------------------------------------------------
    # 1. IP address instead of domain
    # -----------------------------------------------------

    if is_ip_address(hostname):
        score += 35

        signals.append(
            "IP address used instead of a domain name"
        )

    # -----------------------------------------------------
    # 2. HTTP instead of HTTPS
    # -----------------------------------------------------

    if parsed.scheme.lower() == "http":
        score += 15

        signals.append(
            "Unencrypted HTTP connection"
        )

    # -----------------------------------------------------
    # 3. @ symbol
    # -----------------------------------------------------

    if "@" in normalized_url:
        score += 30

        signals.append(
            "URL contains @ symbol"
        )

    # -----------------------------------------------------
    # 4. Excessive URL length
    # -----------------------------------------------------

    if len(normalized_url) > 150:
        score += 10

        signals.append(
            "Unusually long URL"
        )

    # -----------------------------------------------------
    # 5. Excessive subdomains
    # -----------------------------------------------------

    if hostname and not is_ip_address(hostname):

        labels = hostname.split(".")

        if len(labels) >= 5:
            score += 15

            signals.append(
                "Excessive number of subdomains"
            )

    # -----------------------------------------------------
    # 6. Suspicious keywords
    # -----------------------------------------------------

    url_lower = normalized_url.lower()

    found_keywords = []

    for keyword in SUSPICIOUS_KEYWORDS:

        if re.search(
            rf"(?<![a-z]){re.escape(keyword)}(?![a-z])",
            url_lower,
        ):
            found_keywords.append(keyword)

    if found_keywords:

        score += min(25, len(found_keywords) * 5)

        signals.append(
            "Suspicious URL keywords: "
            + ", ".join(sorted(found_keywords))
        )

    # -----------------------------------------------------
    # 7. Suspicious port
    # -----------------------------------------------------

    suspicious_ports = {
        21,
        22,
        23,
        25,
        445,
        3389,
        8080,
        8443,
    }

    if parsed.port in suspicious_ports:

        score += 15

        signals.append(
            f"URL uses unusual/sensitive port {parsed.port}"
        )

    # -----------------------------------------------------
    # 8. Encoded characters
    # -----------------------------------------------------

    encoded_count = len(
        re.findall(
            r"%[0-9a-fA-F]{2}",
            normalized_url,
        )
    )

    if encoded_count >= 3:

        score += 10

        signals.append(
            "Multiple percent-encoded characters"
        )

    # -----------------------------------------------------
    # 9. Excessive hyphens
    # -----------------------------------------------------

    if hostname.count("-") >= 3:

        score += 10

        signals.append(
            "Domain contains an unusually high number of hyphens"
        )

    # -----------------------------------------------------
    # 10. High entropy hostname
    # -----------------------------------------------------

    if hostname and not is_ip_address(hostname):

        entropy = calculate_entropy(hostname)

        if entropy >= 4.0:

            score += 10

            signals.append(
                "Hostname has high character entropy"
            )
        else:
            entropy = round(entropy, 3)
    else:
        entropy = 0.0

    # -----------------------------------------------------
    # Clamp score
    # -----------------------------------------------------

    score = min(score, 100)

    # -----------------------------------------------------
    # Risk level
    # -----------------------------------------------------

    if score >= 75:
        risk_level = "critical"

    elif score >= 50:
        risk_level = "high"

    elif score >= 25:
        risk_level = "medium"

    else:
        risk_level = "low"

    return {
        "url": url,
        "domain": hostname.lower() if hostname else None,
        "scheme": parsed.scheme.lower(),
        "risk_score": int(round(score)),
        "risk_level": risk_level,
        "signals": signals,
        "entropy": entropy,
    }