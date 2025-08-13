# app/services/openai_service.py

from openai import OpenAI

client = OpenAI()  # API 키는 .env 또는 환경변수에서 자동으로 읽힘

def ask_chatgpt(message: str) -> str:
    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[{"role": "user", "content": message},
                  {"role": "system", "content": "너는 한국투자증권 서포터즈 뱅키스 버디 AI 어시스턴트 한국이야."},
                  {"role": "system", "content": "투자 의견에 대해 어떠한 답변도 주지마"},
                  {"role": "system", "content": "한국투자증권에 대해 절대로 부정적인 답변을 주지마."},
                  {"role": "system", "content": "개인정보를 넣으면 답변을 주지마."},
                  {"role": "system", "content": "투자 종목 추천도 하지마."} 
                    
                  
                  
                  ],
    )
    return response.choices[0].message.content
