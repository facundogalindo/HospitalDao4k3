from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
import app.crud.workinghour as crud
from app.schemas.workinghour import WorkingHour, WorkingHourCreate, WorkingHourUpdate

# TAGS PARA SWAGGER
router = APIRouter(tags=["working-hours"])

# --- CREAR ---
@router.post("/", response_model=WorkingHour)
def create_working_hour(working_hour: WorkingHourCreate, db: Session = Depends(get_db)):
    return crud.create_working_hour(db=db, working_hour=working_hour)

# --- LISTAR TODOS ---
@router.get("/", response_model=List[WorkingHour])
def read_working_hours(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_working_hours(db, skip=skip, limit=limit)

# --- LISTAR POR MÉDICO ---
@router.get("/doctor/{doctor_id}", response_model=List[WorkingHour])
def read_working_hours_by_doctor(doctor_id: int, db: Session = Depends(get_db)):
    return crud.get_working_hours_by_doctor(db, doctor_id)

# --- LEER POR ID ---
@router.get("/{working_hour_id}", response_model=WorkingHour)
def read_working_hour(working_hour_id: int, db: Session = Depends(get_db)):
    db_hour = crud.get_working_hour(db, working_hour_id=working_hour_id)
    if not db_hour:
        raise HTTPException(status_code=404, detail="Horario no encontrado")
    return db_hour

# --- ACTUALIZAR ---
@router.put("/{working_hour_id}", response_model=WorkingHour)
def update_working_hour(working_hour_id: int, working_hour: WorkingHourUpdate, db: Session = Depends(get_db)):
    db_hour = crud.update_working_hour(db, working_hour_id, working_hour)
    if not db_hour:
        raise HTTPException(status_code=404, detail="Horario no encontrado")
    return db_hour

# --- ELIMINAR ---
@router.delete("/{working_hour_id}")
def delete_working_hour(working_hour_id: int, db: Session = Depends(get_db)):
    db_hour = crud.delete_working_hour(db, working_hour_id)
    if not db_hour:
        raise HTTPException(status_code=404, detail="Horario no encontrado")
    return {"message": "Horario eliminado correctamente"}
