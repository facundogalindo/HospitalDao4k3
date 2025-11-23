from pydantic import BaseModel
from typing import List, Optional
from app.schemas.specialty import Specialty
# ---------- Base ----------
class DoctorBase(BaseModel):
    first_name: str
    last_name: str
    license_number: str
    email: str


# ---------- Crear ----------
class DoctorCreate(DoctorBase):
    specialties: List[int] = []   # IDs de especialidades


# ---------- Actualizar ----------
class DoctorUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    license_number: Optional[str] = None
    email: Optional[str] = None
    specialties: Optional[List[int]] = None


# ---------- Lo que devuelve la API ----------
class Doctor(DoctorBase):
    id: int
    specialties: List[Specialty] = []

    class Config:
        orm_mode = True
