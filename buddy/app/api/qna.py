from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.databases.database import get_db
from app.databases.models.qna import Qna
import openai
from fastapi import Request

router = APIRouter()

class QnaPostRequest(BaseModel):
    title: str
    content: str
    author_id: str
    category: str  # type → 예약어 피함

class QnaUpdateRequest(BaseModel):
    title: str
    content: str
    category: str




# ✅ Moderation 검사 API
@router.post("/moderation")
async def moderate_qna(request: QnaPostRequest):
    check_text = f"{request.title}\n{request.content}"

    moderation = openai.Moderation.create(input=check_text)
    flagged = moderation["results"][0]["flagged"]

    if flagged:
        return {
            "flagged": True,
            "message": "⚠️ 부적절한 내용이 감지되었습니다. 수정 후 다시 시도해주세요."
        }

    return {
        "flagged": False,
        "message": "✅ 정상적인 게시글로 확인되었습니다."
    }

# ✅ QnA 등록 API
@router.post("/")
async def create_qna(request: QnaPostRequest, db: Session = Depends(get_db)):
    new_qna = Qna(
        title=request.title,
        content=request.content,
        author_id=request.state.user_id,
        category=request.category
    )
    db.add(new_qna)
    db.commit()
    db.refresh(new_qna)

    return {
        "message": "질문이 성공적으로 등록되었습니다.",
        "qna_id": new_qna.id
    }


# ✅ QnA 게시글 단건 조회
@router.get("/{qna_id}")
async def get_qna(qna_id: int, db: Session = Depends(get_db)):
    qna = db.query(Qna).filter(Qna.id == qna_id).first()
    if not qna:
        raise HTTPException(status_code=404, detail="게시글을 찾을 수 없습니다.")
    return qna


# ✅ QnA 게시글 수정 (Moderation 포함)
@router.put("/{qna_id}")
async def update_qna(qna_id: int, request: QnaUpdateRequest, db: Session = Depends(get_db)):
    qna = db.query(Qna).filter(Qna.id == qna_id).first()
    if not qna:
        raise HTTPException(status_code=404, detail="게시글을 찾을 수 없습니다.")

    # Moderation 필터링
    check_text = f"{request.title}\n{request.content}"
    moderation = openai.Moderation.create(input=check_text)
    flagged = moderation["results"][0]["flagged"]

    if flagged:
        return {
            "flagged": True,
            "message": "⚠️ 수정된 내용에 부적절한 표현이 포함되어 있습니다. 수정 후 다시 시도해주세요."
        }

    # 수정 반영
    qna.title = request.title
    qna.content = request.content
    qna.category = request.category
    db.commit()
    db.refresh(qna)

    return {
        "message": "게시글이 성공적으로 수정되었습니다.",
        "updated_qna": qna
    }



@router.delete("/{qna_id}")
async def delete_qna(qna_id: int, request: Request, db: Session = Depends(get_db)):
    # 로그인된 사용자 ID 추출 (예: 세션 or 토큰에서)
    user_id = request.state.user_id  # ← 예시

    qna = db.query(Qna).filter(Qna.id == qna_id).first()
    if not qna:
        raise HTTPException(status_code=404, detail="게시글을 찾을 수 없습니다.")

    # 본인 또는 관리자만 삭제 허용
    if qna.author_id != user_id and not request.state.is_admin:
        raise HTTPException(status_code=403, detail="게시글을 삭제할 권한이 없습니다.")

    db.delete(qna)
    db.commit()
    return {"message": "게시글이 삭제되었습니다."}