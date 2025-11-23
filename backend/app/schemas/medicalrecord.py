from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class MedicalRecordBase(BaseModel):
    patient_id: int
    doctor_id: Optional[int] = None
    summary: str

class MedicalRecordCreate(MedicalRecordBase):
    pass

class MedicalRecord(MedicalRecordBase):
    id: int
    record_date: datetime
    
    class Config:
        from_attributes = True