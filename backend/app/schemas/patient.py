from pydantic import BaseModel, EmailStr
from datetime import date, datetime
from typing import Optional

# Esquema base
class PatientBase(BaseModel):
    first_name: str
    last_name: str
    birth_date: date
    gender: str
    email: EmailStr
    phone: str
    address: Optional[str] = None  # ← Agregar este campo

# Esquema para crear (sin ID)
class PatientCreate(PatientBase):
    pass

# Esquema para actualizar (todos los campos opcionales)
class PatientUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    birth_date: Optional[date] = None
    gender: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    address: Optional[str] = None  # ← Agregar este campo

# Esquema para respuesta (con ID y timestamps)
class Patient(PatientBase):
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True  # Para compatibilidad con ORM