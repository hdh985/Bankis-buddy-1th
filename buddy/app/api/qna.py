from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.databases.database import get_db
from app.databases.models.qna import Qna
from app.databases.models.user import User
from app.api.dependencies import get_current_user
from datetime import datetime

router = APIRouter()

class QnaPostRequest(BaseModel):
    title: str
    content: str
    category: str

class QnaUpdateRequest(BaseModel):
    title: str
    content: str
    category: str

@router.post("/")
async def create_qna(request: QnaPostRequest, db: Session = Depends(get_db)):
    qna = Qna(
        title=request.title,
        content=request.content,
        author_id=1,
        category=request.category,
        updated_at=datetime.utcnow()
    )
    db.add(qna)
    db.commit()
    db.refresh(qna)
    return {"message": "QnA created", "qna_id": qna.id}

@router.get("/")
def list_qnas(db: Session = Depends(get_db)):
    return db.query(Qna).all()

@router.get("/{qna_id}")
async def get_qna(qna_id: int, db: Session = Depends(get_db)):
    qna = db.query(Qna).filter(Qna.id == qna_id).first()
    if not qna:
        raise HTTPException(status_code=404, detail="게시글을 찾을 수 없습니다.")
    return qna

@router.put("/{qna_id}")
async def update_qna(
    qna_id: int,
    request: QnaUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    qna = db.query(Qna).filter(Qna.id == qna_id).first()
    if not qna:
        raise HTTPException(status_code=404, detail="게시글을 찾을 수 없습니다.")
    if qna.author_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="수정 권한이 없습니다.")
    qna.title = request.title
    qna.content = request.content
    qna.category = request.category
    db.commit()
    db.refresh(qna)
    return {"message": "수정 완료", "updated_qna": qna}

@router.delete("/{qna_id}")
async def delete_qna(
    qna_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    qna = db.query(Qna).filter(Qna.id == qna_id).first()
    if not qna:
        raise HTTPException(status_code=404, detail="게시글을 찾을 수 없습니다.")
    if qna.author_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="삭제 권한이 없습니다.")
    db.delete(qna)
    db.commit()
    return {"message": "게시글이 삭제되었습니다."}
