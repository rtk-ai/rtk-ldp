import hashlib
import os
import re
import time
from datetime import datetime, timezone
from collections import defaultdict

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, EmailStr, field_validator
from google.cloud import firestore

app = FastAPI(title="RTK Cloud API", version="0.1.0")

# ── CORS ──────────────────────────────────────────
ALLOWED_ORIGINS = [
    "https://rtk-ai.app",
    "https://www.rtk-ai.app",
]

if os.getenv("ENV") == "dev":
    ALLOWED_ORIGINS.append("http://localhost:3000")
    ALLOWED_ORIGINS.append("http://localhost:8080")
    ALLOWED_ORIGINS.append("http://127.0.0.1:5500")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_methods=["POST", "GET", "OPTIONS"],
    allow_headers=["Content-Type"],
    max_age=86400,
)

# ── FIRESTORE ─────────────────────────────────────
db = firestore.Client()
COLLECTION = "waitlist"

# ── RATE LIMIT (in-memory, resets on restart) ─────
rate_limit_store: dict[str, list[float]] = defaultdict(list)
RATE_LIMIT_MAX = 10
RATE_LIMIT_WINDOW = 3600


def check_rate_limit(ip: str) -> bool:
    now = time.time()
    rate_limit_store[ip] = [
        t for t in rate_limit_store[ip] if now - t < RATE_LIMIT_WINDOW
    ]
    if len(rate_limit_store[ip]) >= RATE_LIMIT_MAX:
        return False
    rate_limit_store[ip].append(now)
    return True


def hash_ip(ip: str) -> str:
    return hashlib.sha256(ip.encode()).hexdigest()[:16]


# ── MODELS ────────────────────────────────────────
VALID_TOOLS = [
    "claude-code", "cursor", "gemini-cli", "aider",
    "codex", "windsurf", "cline", "copilot", "other", ""
]


class WaitlistEntry(BaseModel):
    email: EmailStr
    company: str = ""
    tool: str = ""

    @field_validator("company")
    @classmethod
    def sanitize_company(cls, v: str) -> str:
        return v.strip()[:100] if v else ""

    @field_validator("tool")
    @classmethod
    def validate_tool(cls, v: str) -> str:
        if v and v not in VALID_TOOLS:
            return "other"
        return v


# ── ROUTES ────────────────────────────────────────
@app.post("/waitlist")
async def join_waitlist(entry: WaitlistEntry, request: Request):
    client_ip = request.headers.get("X-Forwarded-For", request.client.host)
    if not check_rate_limit(client_ip):
        raise HTTPException(429, "Too many requests. Try again later.")

    doc_ref = db.collection(COLLECTION).document(entry.email)
    if doc_ref.get().exists:
        return JSONResponse(
            status_code=409,
            content={"message": "Already registered", "email": entry.email}
        )

    doc_ref.set({
        "email": entry.email,
        "company": entry.company,
        "tool": entry.tool,
        "ip_hash": hash_ip(client_ip),
        "created_at": datetime.now(timezone.utc).isoformat(),
        "source": "landing-page",
    })

    count = count_waitlist()
    return {"message": "Welcome to the waitlist!", "count": count}


@app.get("/waitlist/count")
async def get_waitlist_count():
    count = count_waitlist()
    return {"count": count}


def count_waitlist() -> int:
    docs = db.collection(COLLECTION).select([]).stream()
    return sum(1 for _ in docs)


@app.get("/health")
async def health():
    return {"status": "ok", "service": "rtk-cloud-api"}
