from fastapi import FastAPI
from app.api.chat import router as chat_router

app = FastAPI()

# 라우터 등록
app.include_router(chat_router)
