from sqlalchemy import Column, Integer, ForeignKey, TIMESTAMP, Text
from sqlalchemy.sql import func
from app.database import Base
from sqlalchemy.orm import relationship
class MedicalRecord(Base):
    __tablename__ = "medical_records"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id", ondelete="CASCADE"), nullable=False)
    doctor_id = Column(Integer, ForeignKey("doctors.id", ondelete="SET NULL"))
    record_date = Column(TIMESTAMP, server_default=func.now())
    summary = Column(Text)



prescriptions = relationship(
    "Prescription",
    backref="medical_record",
    passive_deletes=True
)