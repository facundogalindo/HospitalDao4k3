from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
import app.crud.reminder as crud
from app.schemas.reminder import Reminder, ReminderCreate

router = APIRouter()

@router.post("/", response_model=Reminder)
def create_reminder(reminder: ReminderCreate, db: Session = Depends(get_db)):
    return crud.create_reminder(db=db, reminder=reminder)

@router.get("/", response_model=list[Reminder])
def read_reminders(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    reminders = crud.get_reminders(db, skip=skip, limit=limit)
    return reminders

@router.get("/{reminder_id}", response_model=Reminder)
def read_reminder(reminder_id: int, db: Session = Depends(get_db)):
    db_reminder = crud.get_reminder(db, reminder_id=reminder_id)
    if db_reminder is None:
        raise HTTPException(status_code=404, detail="Recordatorio no encontrado")
    return db_reminder

@router.get("/appointment/{appointment_id}", response_model=list[Reminder])
def read_reminders_by_appointment(appointment_id: int, db: Session = Depends(get_db)):
    reminders = crud.get_reminders_by_appointment(db, appointment_id=appointment_id)
    return reminders