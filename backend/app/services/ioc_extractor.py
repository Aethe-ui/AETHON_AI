import ipaddress
import re
from urllib.parse import urlparse


# ---------------------------------------------------------
# Regular expressions
# ---------------------------------------------------------

URL_PATTERN = re.compile(
    r"""(?i)\b(?:https?://|www\.)[^\s<>"']+"""
)

IP_PATTERN = re.compile(
    r"\b(?:\d{1,3}\.){3}\d{1,3}\b"
)

EMAIL_PATTERN = re.compile(
    r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b"
)

DOMAIN_PATTERN = re.compile(
    r"\b(?:[A-Za-z0-9-]+\.)+[A-Za-z]{2,}\b"
)


# ---------------------------------------------------------
# Helper functions
# ---------------------------------------------------------

def clean_url(url: str) -> str:
    """
    Remove punctuation commonly attached to URLs in email text.
    """
    return url.rstrip(".,;:!?)]}>'\"")


def is_valid_ipv4(value: str) -> bool:
    """
    Check whether a string is a valid IPv4 address.
    """
    try:
        ipaddress.ip_address(value)
        return True
    except ValueError:
        return False


def extract_urls(text: str) -> list[str]:
    """
    Extract URLs from text.
    """
    matches = URL_PATTERN.findall(text)

    urls = []

    for url in matches:
        url = clean_url(url)

        if url and url not in urls:
            urls.append(url)

    return urls


def extract_ips(text: str) -> list[str]:
    """
    Extract valid IPv4 addresses from text.
    """
    matches = IP_PATTERN.findall(text)

    ips = []

    for value in matches:
        if is_valid_ipv4(value) and value not in ips:
            ips.append(value)

    return ips


def extract_emails(text: str) -> list[str]:
    """
    Extract email addresses from text.
    """
    matches = EMAIL_PATTERN.findall(text)

    emails = []

    for value in matches:
        value = value.lower()

        if value not in emails:
            emails.append(value)

    return emails


def extract_domains(text: str) -> list[str]:
    """
    Extract domain names from text.
    """

    domains = []

    # Domains from URLs
    urls = extract_urls(text)

    for url in urls:
        parsed = urlparse(
            url if url.startswith(("http://", "https://"))
            else f"http://{url}"
        )

        hostname = parsed.hostname

        if hostname:
            hostname = hostname.lower()

            if (
                hostname not in domains
                and not is_valid_ipv4(hostname)
            ):
                domains.append(hostname)

    # Standalone domains
    matches = DOMAIN_PATTERN.findall(text)

    for domain in matches:
        domain = domain.lower()

        # Don't add email domains twice
        if domain not in domains:
            domains.append(domain)

    return domains


# ---------------------------------------------------------
# URL analysis
# ---------------------------------------------------------

def analyze_url(url: str) -> dict:
    """
    Perform basic static analysis on a URL.
    """

    normalized_url = (
        url
        if url.startswith(("http://", "https://"))
        else f"http://{url}"
    )

    parsed = urlparse(normalized_url)

    hostname = parsed.hostname or ""

    is_ip_url = False

    if hostname:
        is_ip_url = is_valid_ipv4(hostname)

    suspicious_schemes = {
        "http",
    }

    has_suspicious_scheme = parsed.scheme.lower() in suspicious_schemes

    return {
        "url": url,
        "domain": hostname.lower() if hostname else None,
        "scheme": parsed.scheme.lower(),
        "is_ip_url": is_ip_url,
        "has_suspicious_scheme": has_suspicious_scheme,
        "path": parsed.path,
    }


# ---------------------------------------------------------
# Main IOC extraction function
# ---------------------------------------------------------

def extract_iocs(
    subject: str = "",
    body: str = "",
    headers: list[dict] | None = None,
) -> dict:

    headers = headers or []

    header_text = "\n".join(
        f"{header.get('key', '')}: {header.get('value', '')}"
        for header in headers
    )

    combined_text = "\n".join(
        [
            subject or "",
            body or "",
            header_text,
        ]
    )

    urls = extract_urls(combined_text)
    ips = extract_ips(combined_text)
    emails = extract_emails(combined_text)
    domains = extract_domains(combined_text)

    url_analysis = [
        analyze_url(url)
        for url in urls
    ]

    return {
        "urls": urls,
        "domains": domains,
        "ips": ips,
        "emails": emails,
        "url_analysis": url_analysis,
    }