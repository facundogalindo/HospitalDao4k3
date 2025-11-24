from sqlalchemy import Column, Integer, ForeignKey, TIMESTAMP, Boolean, Text, Enum, Index
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base
from enum import Enum

class AppointmentStatus(str, Enum):
    SCHEDULED = "SCHEDULED"
    CONFIRMED = "CONFIRMED"
    CANCELLED = "CANCELLED"
    COMPLETED = "COMPLETED"
    NO_SHOW = "NO_SHOW"
""" 
class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id", ondelete="CASCADE"), nullable=False)
    doctor_id = Column(Integer, ForeignKey("doctors.id", ondelete="CASCADE"), nullable=False)
    start_at = Column(TIMESTAMP, nullable=False)
    end_at = Column(TIMESTAMP, nullable=False)
    status = Column(Enum(AppointmentStatus), default=AppointmentStatus.SCHEDULED)
    attended = Column(Boolean, default=False)
    notes = Column(Text)
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())

    
    patient = relationship("Patient")
    doctor = relationship("Doctor")

    __table_args__ = (
        Index("idx_appointments_doctor_start", "doctor_id", "start_at"),
        Index("idx_appointments_patient_start", "patient_id", "start_at"),
    )"""
