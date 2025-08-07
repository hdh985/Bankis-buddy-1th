from pydantic import BaseModel, HttpUrl
from datetime import date


class EventCreate(BaseModel):
    title: str
    image_url: HttpUrl
    link_url: HttpUrl
    start_date: date
    end_date: date


class EventOut(EventCreate):
    id: int
    is_ended: bool
    d_day: int

    class Config:
        orm_mode = True  # SQLAlchemy 객체 → Pydantic 자동 변환
