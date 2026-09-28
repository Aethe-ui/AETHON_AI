from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException

from app.core.security import get_current_user
from app.core.supabase import supabase


router = APIRouter(
    prefix="/api/dashboard",
    tags=["Dashboard"],
)


@router.get("/stats")
def get_dashboard_stats(
    current_user=Depends(get_current_user),
):
    user_id = current_user["user_id"]

    try:
        # -------------------------------------------------
        # 1. Fetch user's cases
        # -------------------------------------------------
        cases_response = (
            supabase
            .table("cases")
            .select("id, status, risk_score, created_at")
            .eq("user_id", user_id)
            .execute()
        )

        cases = cases_response.data or []

        # -------------------------------------------------
        # 2. Fetch user's emails through their cases
        # -------------------------------------------------
        emails_response = (
            supabase
            .table("emails")
            .select("id, case_id, is_malicious, created_at")
            .execute()
        )

        all_emails = emails_response.data or []

        case_ids = {
                case["id"]
                for case in cases
        }

        emails = [
                email
                for email in all_emails
                if email.get("case_id") in case_ids
        ]

        # -------------------------------------------------
        # 3. Basic statistics
        # -------------------------------------------------
        emails_analyzed = len(emails)

        threats_detected = sum(
            1
            for email in emails
            if email.get("is_malicious") is True
        )

        critical_threats = sum(
            1
            for case in cases
            if (case.get("risk_score") or 0) >= 80
        )

        open_cases = sum(
            1
            for case in cases
            if case.get("status") in {"open", "investigating"}
        )

        # -------------------------------------------------
        # 4. Detection trend — last 30 days
        # -------------------------------------------------
        now = datetime.now(timezone.utc)
        start_date = now - timedelta(days=29)

        daily_counts = {}

        for i in range(30):
            day = (start_date + timedelta(days=i)).date()
            daily_counts[day.isoformat()] = 0

        for email in emails:
            created_at = email.get("created_at")

            if not created_at:
                continue

            try:
                timestamp = datetime.fromisoformat(
                    created_at.replace("Z", "+00:00")
                )
            except (ValueError, TypeError):
                continue

            day = timestamp.date().isoformat()

            if day in daily_counts and email.get("is_malicious") is True:
                daily_counts[day] += 1

        trend = [
            {
                "date": datetime.fromisoformat(day).strftime("%b %d"),
                "count": count,
            }
            for day, count in daily_counts.items()
        ]

        # -------------------------------------------------
        # 5. Threat categories
        # -------------------------------------------------
        phishing = sum(
            1
            for email in emails
            if email.get("is_malicious") is True
        )

        total_threats = threats_detected

        categories = []

        if total_threats > 0:
            categories.append(
                {
                    "category": "Phishing",
                    "count": phishing,
                    "percentage": round(
                        phishing / total_threats * 100
                    ),
                }
            )

        # Keep dashboard contract stable.
        if not categories:
            categories = [
                {
                    "category": "Other",
                    "count": 0,
                    "percentage": 0,
                }
            ]

        # -------------------------------------------------
        # 6. Trends
        #
        # Historical comparison can be added later.
        # Keep zero until we have enough historical data.
        # -------------------------------------------------
        return {
            "stats": {
                "emailsAnalyzed": emails_analyzed,
                "emailsTrend": 0,
                "threatsDetected": threats_detected,
                "threatsTrend": 0,
                "criticalThreats": critical_threats,
                "criticalTrend": 0,
                "openCases": open_cases,
                "openCasesTrend": 0,
            },
            "trend": trend,
            "categories": categories,
        }

    except Exception as exc:
        import traceback
        traceback.print_exc()

        raise HTTPException(
            status_code=500,
            detail="Failed to retrieve dashboard statistics.",
        )