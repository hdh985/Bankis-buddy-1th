from dotenv import load_dotenv
from fastapi import FastAPI, Request
from .api import auth, qna, chat, event
from app.databases.database import create_db_and_tables
from fastapi.middleware.cors import CORSMiddleware
load_dotenv()

app = FastAPI()

# ✅ Startup 이벤트
@app.on_event("startup")
def startup():
    create_db_and_tables()


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://storage.googleapis.com",
        "https://34.47.66.169.sslip.io"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def logging_middleware(request: Request, call_next):
    response = await call_next(request)
    return response


@app.get("/")
def root():
    return {"message": "Hello, FastAPI!"}

# ✅ 라우터 등록
app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
app.include_router(qna.router, prefix="/api/qna", tags=["QnA"])
app.include_router(chat.router, prefix="/api/chat", tags=["Chat"])
app.include_router(event.router, prefix="/api/events", tags=["Event"])
