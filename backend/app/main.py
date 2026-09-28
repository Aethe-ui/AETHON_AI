from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from app.core.supabase import supabase
from app.core.security import get_current_user

from app.api.emails import router as emails_router
from app.api.investigations import router as investigations_router
from app.api.dashboard import router as dashboard_router
from app.core.config import CORS_ORIGINS

app = FastAPI(
    title="AETHON_AI Backend",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(investigations_router)
app.include_router(emails_router)
app.include_router(dashboard_router)

@app.get("/health")
def health_check():
    return {"status":"ok", "service": "AETHON AI Backend" }


@app.get("/api/auth/me")
def get_me(current_user=Depends(get_current_user)):
    return{"authenticated":True , "user":current_user,}