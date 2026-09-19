from fastapi import APIRouter, Depends

from app.core.security import get_current_user
from app.core.supabase import supabase


router = APIRouter(
    prefix="/api/investigations",
    tags=["Investigations"],
)


@router.get("")
def get_investigations(
    current_user=Depends(get_current_user),
):
    user_id = current_user["user_id"]

    response = (
        supabase
        .table("cases")
        .select("*")
        .eq("user_id", user_id)
        .order("created_at", desc=True)
        .execute()
    )

    return {
        "data": response.data,
        "count": len(response.data),
    }