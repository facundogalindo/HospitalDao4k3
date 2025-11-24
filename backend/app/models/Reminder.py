from sqlalchemy import Column, Integer, ForeignKey, String, TIMESTAMP, Boolean, Text
from app.database import Base

class Reminder(Base):
    __tablename__ = "reminders"

    id = Column(Integer, primary_key=True, index=True)
    appointment_id = Column(Integer, ForeignKey("appointments.id", ondelete="CASCADE"), nullable=False)
    channel = Column(String(20))  # email, sms, push
    send_at = Column(TIMESTAMP, nullable=False)
    sent = Column(Boolean, default=False)
    message = Column(Text)
