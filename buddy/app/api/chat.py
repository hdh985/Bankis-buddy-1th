from fastapi import APIRouter, Request
from app.services.openai_service import ask_chatgpt

router = APIRouter()

@router.post("/chat")
async def chat(request: Request):
    data = await request.json()
    message = data.get("message")
    reply = await ask_chatgpt(message)
    return {"reply": reply}
