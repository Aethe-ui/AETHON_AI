import hashlib

from app.core.supabase import supabase


EMAIL_BUCKET = "email-evidence"
ATTACHMENT_BUCKET = "email-attachments"


def calculate_sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def upload_email_evidence(
    data: bytes,
    user_id: str,
    case_id: str,
    filename: str,
) -> tuple[str, str]:

    file_hash = calculate_sha256(data)

    storage_path = f"{user_id}/{case_id}/{filename}"

    supabase.storage.from_(EMAIL_BUCKET).upload(
        storage_path,
        data,
        {
            "content-type": "message/rfc822",
            "upsert": False,
        },
    )

    return storage_path, file_hash


def upload_attachment(
    data: bytes,
    user_id: str,
    case_id: str,
    filename: str,
    content_type: str,
) -> tuple[str, str]:

    file_hash = calculate_sha256(data)

    storage_path = f"{user_id}/{case_id}/{filename}"

    supabase.storage.from_(ATTACHMENT_BUCKET).upload(
        storage_path,
        data,
        {
            "content-type": content_type,
            "upsert": False,
        },
    )

    return storage_path, file_hash