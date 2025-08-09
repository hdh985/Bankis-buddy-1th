# app/api/chat.py
from fastapi import APIRouter, HTTPException
from app.services.openai_service import ask_chatgpt
from pydantic import BaseModel

router = APIRouter()

class ChatMessage(BaseModel):
    message: str
#1
@router.post("/")
def send_message(data: ChatMessage):  # ✅ 일반 sync 함수로 변경
    try:
        reply = ask_chatgpt(data.message)  # ✅ await 제거
        return {"response": reply}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
