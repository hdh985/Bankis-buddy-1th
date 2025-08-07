from sqlalchemy import Column, Integer, String, Date
from app.databases.database import Base

class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(100), nullable=False)
    image_url = Column(String(255), nullable=True)
    link_url = Column(String(255), nullable=False)  # ✅ 추가: 이벤트 이동 URL
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
