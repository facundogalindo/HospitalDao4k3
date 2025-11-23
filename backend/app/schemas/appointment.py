from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from app.models.AppointmentStatus import AppointmentStatus

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
