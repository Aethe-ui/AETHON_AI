import ipaddress
import re
from datetime import datetime
from typing import Any


IP_PATTERN = re.compile(
    r"\b(?:\d{1,3}\.){3}\d{1,3}\b"
)

HOST_PATTERN = re.compile(
    r"\b(?:[A-Za-z0-9-]+\.)+[A-Za-z]{2,}\b"
)

DATE_PATTERN = re.compile(
    r";\s*(.+)$"
)


def is_valid_ip(value: str) -> bool:
    """
    Check whether a string is a valid IPv4 or IPv6 address.
    """
    try:
        ipaddress.ip_address(value)
        return True
    except ValueError:
        return False


def is_private_ip(value: str) -> bool:
    """
    Check whether an IP belongs to a private/local/reserved
    network commonly relevant to email forensic analysis.
    """
    try:
        ip = ipaddress.ip_address(value)

        private_networks = [ipaddress.ip_network("10.0.0.0/8"),
                            ipaddress.ip_network("172.16.0.0/12"),
                            ipaddress.ip_network("192.168.0.0/16"),]

        if any(ip in network for network in private_networks):
            return True

        if ip.is_loopback or ip.is_link_local :
            return True

        return False


    except ValueError:
        return False


def extract_received_ips(received_header: str) -> list[str]:
    """
    Extract valid IP addresses from a Received header.
    """
    ips = []

    for match in IP_PATTERN.findall(received_header):
        if is_valid_ip(match) and match not in ips:
            ips.append(match)

    return ips


def extract_received_hostnames(
    received_header: str,
) -> list[str]:
    """
    Extract hostname/domain-like values from a Received header.
    """
    hosts = []

    for match in HOST_PATTERN.findall(received_header):
        if match not in hosts:
            hosts.append(match)

    return hosts


def extract_received_timestamp(
    received_header: str,
) -> str | None:
    """
    Extract and normalize the timestamp from a Received header.
    """

    match = DATE_PATTERN.search(received_header)

    if not match:
        return None

    timestamp = match.group(1).strip()

    try:
        parsed = datetime.strptime(
            timestamp,
            "%a, %d %b %Y %H:%M:%S %z",
        )

        return parsed.isoformat()

    except ValueError:
        return timestamp


def analyze_timing(
    hops: list[dict[str, Any]],
) -> dict[str, Any]:
    """
    Analyze timestamps between Received hops.

    Received headers are normally listed newest-to-oldest.
    """

    timestamps = []

    for hop in hops:
        timestamp = hop.get("timestamp")

        if not timestamp:
            continue

        try:
            parsed = datetime.fromisoformat(timestamp)

            timestamps.append({
                "hop": hop["hop"],
                "timestamp": parsed,
            })

        except (ValueError, TypeError):
            continue

    if len(timestamps) < 2:
        return {
            "available": False,
            "hop_delays_seconds": [],
            "max_delay_seconds": None,
            "suspicious_delays": [],
        }

    delays = []

    for index in range(len(timestamps) - 1):

        current = timestamps[index]["timestamp"]
        previous = timestamps[index + 1]["timestamp"]

        delay = abs(
            (current - previous).total_seconds()
        )

        delays.append({
            "from_hop": timestamps[index + 1]["hop"],
            "to_hop": timestamps[index]["hop"],
            "delay_seconds": delay,
        })

    suspicious_delays = [
        delay
        for delay in delays
        if delay["delay_seconds"] > 3600
    ]

    max_delay = max(
        (
            delay["delay_seconds"]
            for delay in delays
        ),
        default=None,
    )

    return {
        "available": True,
        "hop_delays_seconds": delays,
        "max_delay_seconds": max_delay,
        "suspicious_delays": suspicious_delays,
    }


def analyze_received_chain(
    received_headers: list[str],
) -> dict[str, Any]:
    """
    Analyze the complete Received header chain.

    Returns:
        - hop count
        - individual hop details
        - extracted IPs
        - extracted hostnames
        - originating IP
        - suspicious signals
        - timing analysis
    """

    hops = []

    all_ips = []
    all_hosts = []

    for index, header in enumerate(
        received_headers,
        start=1,
    ):

        ips = extract_received_ips(header)

        hosts = extract_received_hostnames(header)

        timestamp = extract_received_timestamp(
            header
        )

        private_ips = [
            ip
            for ip in ips
            if is_private_ip(ip)
        ]

        public_ips = [
            ip
            for ip in ips
            if not is_private_ip(ip)
        ]

        for ip in ips:
            if ip not in all_ips:
                all_ips.append(ip)

        for host in hosts:
            if host not in all_hosts:
                all_hosts.append(host)

        hops.append({
            "hop": index,
            "raw": header,
            "ips": ips,
            "private_ips": private_ips,
            "public_ips": public_ips,
            "hostnames": hosts,
            "timestamp": timestamp,
        })

    suspicious_signals = []

    # No Received headers
    if len(received_headers) == 0:
        suspicious_signals.append(
            "No Received headers were found"
        )

    # Very long chain
    if len(received_headers) >= 5:
        suspicious_signals.append(
            "Email contains an unusually long Received chain"
        )

    # Private/local IP detected
    if any(
        hop["private_ips"]
        for hop in hops
    ):
        suspicious_signals.append(
            "Received chain contains private IP addresses"
        )

    # Missing hostname
    if any(
        not hop["hostnames"]
        for hop in hops
    ):
        suspicious_signals.append(
            "A Received hop does not contain a recognizable hostname"
        )

    # Missing IP
    if any(
        not hop["ips"]
        for hop in hops
    ):
        suspicious_signals.append(
            "A Received hop does not contain a recognizable IP address"
        )

    # Timing analysis
    timing_analysis = analyze_timing(hops)

    if timing_analysis["suspicious_delays"]:
        suspicious_signals.append(
            "Received chain contains unusually long delivery delays"
        )

    # The oldest/last extracted IP is treated as the
    # originating IP for this analysis.
    originating_ip = (
        all_ips[-1]
        if all_ips
        else None
    )

    return {
        "hop_count": len(hops),
        "hops": hops,
        "all_ips": all_ips,
        "all_hostnames": all_hosts,
        "originating_ip": originating_ip,
        "suspicious_signals": suspicious_signals,
        "timing_analysis": timing_analysis,
    }