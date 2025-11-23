from sqlalchemy.orm import Session
from app.models.Reminder import Reminder
from app.schemas.reminder import ReminderCreate

def create_reminder(db: Session, reminder: ReminderCreate):
    db_reminder = Reminder(**reminder.dict())
    db.add(db_reminder)
    db.commit()
    db.refresh(db_reminder)
    return db_reminder

def get_reminders(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Reminder).offset(skip).limit(limit).all()

def get_reminder(db: Session, reminder_id: int):
    return db.query(Reminder).filter(Reminder.id == reminder_id).first()

def get_reminders_by_appointment(db: Session, appointment_id: int):
    return db.query(Reminder).filter(Reminder.appointment_id == appointment_id).all()