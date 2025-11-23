from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from enum import Enum

class AppointmentStatus(str, Enum):
    SCHEDULED = "SCHEDULED"
    CONFIRMED = "CONFIRMED" 
    CANCELLED = "CANCELLED"
    COMPLETED = "COMPLETED"
    NO_SHOW = "NO_SHOW"

class AppointmentBase(BaseModel):
    patient_id: int
    doctor_id: int
    start_at: datetime
    end_at: datetime
    status: Optional[AppointmentStatus] = AppointmentStatus.SCHEDULED
    notes: Optional[str] = None

class AppointmentCreate(AppointmentBase):
    pass

class AppointmentStatusUpdate(BaseModel):
    status: AppointmentStatus

class Appointment(AppointmentBase):
    id: int
    attended: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True