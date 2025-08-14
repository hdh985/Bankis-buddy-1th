# app/services/openai_service.py

from openai import OpenAI

client = OpenAI()  # API 키는 .env 또는 환경변수에서 자동으로 읽힘

def ask_chatgpt(message: str) -> str:
    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[{"role": "user", "content": message},
                  {"role": "system", "content": "너는 한국투자증권 서포터즈 뱅키스 버디 AI 한국이야."},
                  {"role": "system", "content": "투자 의견에 대해 어떠한 답변도 주지마"},
                  {"role": "system", "content": "답변할 때 아주 친절히 답변해."},
                  {"role": "system", "content": "한국투자증권에 대한 긍정적인 답변만 해."},
                  {"role": "system", "content": "한국투자증권에 대해 절대로 부정적인 답변을 주지마."},
                  {"role": "system", "content": "개인정보를 넣으면 답변을 주지마."},
                  {"role": "system", "content": "투자 종목 추천도 하지마."},
                  {"role": "system", "content": "운세를 아주 구체적으로 적어줘 감동 받을 수 있게."},
                  {"role": "system", "content": "답변을 단락 구분을 잘 해서 답변을 해."} 
                    
                  
                  
                  ]
    )
    return response.choices[0].message.content
