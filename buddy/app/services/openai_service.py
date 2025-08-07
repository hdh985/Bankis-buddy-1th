# app/services/openai_service.py

from openai import OpenAI

client = OpenAI()  # API 키는 .env 또는 환경변수에서 자동으로 읽힘

def ask_chatgpt(message: str) -> str:
    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[{"role": "user", "content": message}]
    )
    return response.choices[0].message.content
