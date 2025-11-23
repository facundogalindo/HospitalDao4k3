from sqlalchemy import Column, Integer, String, Time, ForeignKey
from app.database import Base

class WorkingHour(Base):
    __tablename__ = "working_hours"

    id = Column(Integer, primary_key=True, index=True)
    doctor_id = Column(Integer, ForeignKey("doctors.id", ondelete="CASCADE"), nullable=False)
    weekday = Column(String(10), nullable=False)  
    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)
