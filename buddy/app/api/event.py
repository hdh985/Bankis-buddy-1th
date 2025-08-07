from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import date
from app.databases.models.event import Event
from app.api.shcemas.event import EventCreate, EventOut
from app.databases.database import get_db
from app.api.dependencies import get_current_admin_user  # 관리자 권한 체크

router = APIRouter()

# 관리자만 이벤트 등록
@router.post("/", response_model=EventOut)
def create_event(event: EventCreate, db: Session = Depends(get_db), user=Depends(get_current_admin_user)):
    new_event = Event(**event.dict())
    db.add(new_event)
    db.commit()
    db.refresh(new_event)
    return _to_event_out(new_event)


# 전체 이벤트 목록
@router.get("/", response_model=list[EventOut])
def list_events(db: Session = Depends(get_db)):
    events = db.query(Event).order_by(Event.end_date.desc()).all()
    return [_to_event_out(e) for e in events]


# 관리자만 이벤트 수정
@router.put("/{event_id}", response_model=EventOut)
def update_event(event_id: int, event: EventCreate, db: Session = Depends(get_db), user=Depends(get_current_admin_user)):
    db_event = db.query(Event).filter(Event.id == event_id).first()
    if not db_event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    for key, value in event.dict().items():
        setattr(db_event, key, value)
    
    db.commit()
    db.refresh(db_event)
    return _to_event_out(db_event)


# 관리자만 삭제
@router.delete("/{event_id}")
def delete_event(event_id: int, db: Session = Depends(get_db), user=Depends(get_current_admin_user)):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    db.delete(event)
    db.commit()
    return {"message": "이벤트가 성공적으로 삭제 됐습니다"}


# ✅ 이벤트 D-day 및 상태 분류 로직
def _to_event_out(event: Event) -> EventOut:
    today = date.today()
    d_day = (event.end_date - today).days
    is_ended = d_day < 0

    return EventOut(
        id=event.id,
        title=event.title,
        image_url=event.image_url,
        link_url=event.link_url,
        start_date=event.start_date,
        end_date=event.end_date,
        is_ended=is_ended,
        d_day=d_day if d_day >= 0 else 0
    )
