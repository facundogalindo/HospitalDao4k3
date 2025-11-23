# schemas/workinghour.py (Asegúrate que se vea así)

from pydantic import BaseModel
from datetime import time
from typing import Optional


class WorkingHourBase(BaseModel):
    doctor_id: int
    weekday: str
    start_time: time
    end_time: time


class WorkingHourCreate(WorkingHourBase):
    pass


# 🔥 Esquema AGREGADO: Para actualizar, hacemos todos los campos opcionales
class WorkingHourUpdate(BaseModel):
    doctor_id: Optional[int] = None
    weekday: Optional[str] = None
    start_time: Optional[time] = None
    end_time: Optional[time] = None


class WorkingHour(WorkingHourBase):
    id: int

    class Config:
        from_attributes = True