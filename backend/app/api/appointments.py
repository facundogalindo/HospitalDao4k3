from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
import app.crud.appointment as crud
from app.schemas.appointment import Appointment, AppointmentCreate, AppointmentStatusUpdate

router = APIRouter()


@router.post("/", response_model=Appointment)
def create_appointment(appointment: AppointmentCreate, db: Session = Depends(get_db)):
    try:
        return crud.create_appointment(db=db, appointment=appointment)
    except ValueError as e:
        # Error de solapamiento u otra validación de negocio
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/", response_model=list[Appointment])
def read_appointments(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    appointments = crud.get_appointments(db, skip=skip, limit=limit)
    return appointments


@router.get("/{appointment_id}", response_model=Appointment)
def read_appointment(appointment_id: int, db: Session = Depends(get_db)):
    db_appointment = crud.get_appointment(db, appointment_id=appointment_id)
    if db_appointment is None:
        raise HTTPException(status_code=404, detail="Turno no encontrado")
    return db_appointment


@router.get("/doctor/{doctor_id}", response_model=list[Appointment])
def read_appointments_by_doctor(doctor_id: int, db: Session = Depends(get_db)):
    appointments = crud.get_appointments_by_doctor(db, doctor_id=doctor_id)
    return appointments


@router.get("/patient/{patient_id}", response_model=list[Appointment])
def read_appointments_by_patient(patient_id: int, db: Session = Depends(get_db)):
    appointments = crud.get_appointments_by_patient(db, patient_id=patient_id)
    return appointments


@router.patch("/{appointment_id}/status", response_model=Appointment)
def update_status(
    appointment_id: int,
    status_update: AppointmentStatusUpdate,
    db: Session = Depends(get_db),
):
    db_appointment = crud.update_appointment_status(
        db, appointment_id=appointment_id, status=status_update.status
    )
    if db_appointment is None:
        raise HTTPException(status_code=404, detail="Turno no encontrado")
    return db_appointment


@router.delete("/{appointment_id}")
def delete_appointment(appointment_id: int, db: Session = Depends(get_db)):
    db_appointment = crud.delete_appointment(db, appointment_id=appointment_id)
    if db_appointment is None:
        raise HTTPException(status_code=404, detail="Turno no encontrado")
    return {"message": "Turno eliminado correctamente"}
