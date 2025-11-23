from pydantic import BaseModel
from datetime import date
from typing import Optional

class PrescriptionBase(BaseModel):
    medical_record_id: int
    medication: str
    dosage: Optional[str] = None
    frequency: Optional[str] = None
    instructions: Optional[str] = None

class PrescriptionCreate(PrescriptionBase):
    pass

class Prescription(PrescriptionBase):
    id: int
    issued_at: date
    
    class Config:
        from_attributes = True