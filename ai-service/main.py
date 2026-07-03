"""
HealthyBite AI Service — Python (FastAPI)
Replaces/augments the Node.js Groq endpoint for AI assistant.
Run: uvicorn main:app --reload --port 8000
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from groq import Groq
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="HealthyBite AI Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

SYSTEM_PROMPT = (
    "أنت مساعد HealthyBite. أجب بالعربية. "
    "HealthyBite منصة توصيل أكل صحي في بني سويف، مصر. "
    "تأسست 2022. تقدم وجبات طازجة بسعرات محسوبة. "
    "كن مهذباً ومختصراً."
)


class AskRequest(BaseModel):
    message: str


class AskResponse(BaseModel):
    reply: str


@app.get("/health")
def health():
    return {"status": "ok", "service": "ai"}


@app.post("/ask", response_model=AskResponse)
def ask(req: AskRequest):
    if not req.message.strip():
        raise HTTPException(status_code=400, detail="Message is required")

    try:
        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": req.message},
            ],
            temperature=0.7,
            max_tokens=500,
        )
        reply = completion.choices[0].message.content or ""
        return AskResponse(reply=reply)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
