from sqlalchemy import Column, Integer, ForeignKey, String, Text, Date
from sqlalchemy.sql import func
from app.database import Base

class Prescription(Base):
    __tablename__ = "prescriptions"

    id = Column(Integer, primary_key=True, index=True)
    medical_record_id = Column(Integer, ForeignKey("medical_records.id", ondelete="CASCADE"), nullable=False)
    medication = Column(String(255), nullable=False)
    dosage = Column(String(255))
    frequency = Column(String(255))
    instructions = Column(Text)
    issued_at = Column(Date, server_default=func.current_date())
