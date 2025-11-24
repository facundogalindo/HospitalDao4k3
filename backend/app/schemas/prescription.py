from pydantic import BaseModel
from datetime import date
from typing import Optional

class PrescriptionBase(BaseModel):
    medical_record_id: Optional[int] = None
    medication: str
    dosage: Optional[str] = None
    frequency: Optional[str] = None
    instructions: Optional[str] = None

class PrescriptionCreate(PrescriptionBase):
    pass

class PrescriptionUpdate(BaseModel):
    medical_record_id: Optional[int] = None
    medication: Optional[str] = None
    dosage: Optional[str] = None
    frequency: Optional[str] = None
    instructions: Optional[str] = None

    class Config:
        from_attributes = True

class Prescription(PrescriptionBase):
    id: int
    issued_at: date

    class Config:
        from_attributes = True
