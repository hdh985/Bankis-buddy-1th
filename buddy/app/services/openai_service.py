import openai
import os
from dotenv import load_dotenv

load_dotenv()  # .env 불러오기
openai.api_key = os.getenv("OPENAI_API_KEY")

async def ask_chatgpt(message: str) -> str:
    response = await openai.ChatCompletion.acreate(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": "너는 친절한 뱅키스 서포터즈 전용 챗봇이야."},
            {"role": "user", "content": message}
        ]
    )
    return response["choices"][0]["message"]["content"]
