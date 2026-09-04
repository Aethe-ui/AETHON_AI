import os
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("Supabase URL or key is missing from .env")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)


def save_scan(subject, body, prediction, phishing_probability):
    response = supabase.table("email_scans").insert({
    "subject": subject,
    "body": body,
    "prediction": prediction,
    "phishing_probability": phishing_probability
}).execute()

    return response.data