from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.schemas.doctor import Doctor, DoctorCreate, DoctorUpdate
import app.crud.doctor as crud_doctor

router = APIRouter(prefix="/doctors", tags=["doctors"])

@router.post("/", response_model=Doctor)
def create_doctor(doctor: DoctorCreate, db: Session = Depends(get_db)):
    db_doctor = crud_doctor.create_doctor(db=db, doctor=doctor)
    if db_doctor is None:
        raise HTTPException(status_code=400, detail="Ya existe un médico con esa matrícula")
    return db_doctor

@router.get("/", response_model=List[Doctor])
def read_doctors(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    doctors = crud_doctor.get_doctors(db, skip=skip, limit=limit)
    return doctors

@router.get("/{doctor_id}", response_model=Doctor)
def read_doctor(doctor_id: int, db: Session = Depends(get_db)):
    db_doctor = crud_doctor.get_doctor(db, doctor_id=doctor_id)
    if db_doctor is None:
        raise HTTPException(status_code=404, detail="Doctor no encontrado")
    return db_doctor

@router.put("/{doctor_id}", response_model=Doctor)
def update_doctor(doctor_id: int, doctor: DoctorUpdate, db: Session = Depends(get_db)):
    db_doctor = crud_doctor.update_doctor(db, doctor_id=doctor_id, doctor=doctor)
    if db_doctor is None:
        raise HTTPException(status_code=404, detail="Doctor no encontrado")
    return db_doctor

@router.delete("/{doctor_id}")
def delete_doctor(doctor_id: int, db: Session = Depends(get_db)):
    db_doctor = crud_doctor.delete_doctor(db, doctor_id=doctor_id)
    if db_doctor is None:
        raise HTTPException(status_code=404, detail="Doctor no encontrado")
    return {"message": "Doctor eliminado correctamente"}