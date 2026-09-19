from email import policy
from email.parser import BytesParser


def parse_raw_email(raw_email: bytes) -> dict:
    message = BytesParser(policy=policy.default).parsebytes(raw_email)

    # ---------------------------------------------------------
    # Basic email information
    # ---------------------------------------------------------

    message_id = message.get("Message-ID")
    subject = message.get("Subject", "")
    sender = message.get("From", "")
    recipients = message.get_all("To", [])

    # ---------------------------------------------------------
    # Headers
    # ---------------------------------------------------------

    headers = [
        {
            "key": key,
            "value": value,
        }
        for key, value in message.items()
    ]

    # ---------------------------------------------------------
    # Body
    # ---------------------------------------------------------

    body_parts = []

    if message.is_multipart():
        for part in message.walk():

            if part.get_content_disposition() == "attachment":
                continue

            if part.get_content_type() == "text/plain":
                try:
                    content = part.get_content()
                    if content:
                        body_parts.append(content)
                except Exception:
                    pass

    else:
        try:
            if message.get_content_type() == "text/plain":
                body_parts.append(message.get_content())
        except Exception:
            pass

    body = "\n".join(body_parts).strip()

    # ---------------------------------------------------------
    # Attachments
    # ---------------------------------------------------------

    attachments = []

    for part in message.iter_attachments():
        filename = part.get_filename()

        if not filename:
            filename = "unnamed_attachment"

        try:
            content = part.get_payload(decode=True)
        except Exception:
            content = None

        if content is None:
            content = b""

        attachments.append(
            {
                "filename": filename,
                "content_type": part.get_content_type(),
                "size": len(content),
                "content": content,
            }
        )

    # ---------------------------------------------------------
    # Final parsed result
    # ---------------------------------------------------------

    return {
        "message_id": message_id,
        "subject": subject,
        "sender": sender,
        "recipients": recipients,
        "headers": headers,
        "body": body,
        "attachments": attachments,
    }