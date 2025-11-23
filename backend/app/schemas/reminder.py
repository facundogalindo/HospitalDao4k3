from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class ReminderBase(BaseModel):
    appointment_id: int
    channel: Optional[str] = None  # "email", "sms", "push"
    send_at: datetime
    payload: Optional[str] = None

class ReminderCreate(ReminderBase):
    pass

class Reminder(ReminderBase):
    id: int
    sent: bool
    
    class Config:
        from_attributes = True