# crud/workinghour.py (Versión COMPLETA y SIMPLE)

from sqlalchemy.orm import Session
from app.models.WorkingHour import WorkingHour
# Necesitas crear este esquema si no lo tienes: WorkingHourUpdate
from app.schemas.workinghour import WorkingHourCreate, WorkingHourUpdate

def create_working_hour(db: Session, working_hour: WorkingHourCreate):
    db_working_hour = WorkingHour(**working_hour.dict())
    db.add(db_working_hour)
    db.commit()
    db.refresh(db_working_hour)
    return db_working_hour

def get_working_hours(db: Session, skip: int = 0, limit: int = 100):
    return db.query(WorkingHour).offset(skip).limit(limit).all()

# 🔥 FUNCIÓN AGREGADA: Leer por ID
def get_working_hour(db: Session, working_hour_id: int):
    """Obtiene un horario específico por ID."""
    # Retorna el objeto ORM o None, simple y directo.
    return db.query(WorkingHour).filter(WorkingHour.id == working_hour_id).first()

def get_working_hours_by_doctor(db: Session, doctor_id: int):
    return db.query(WorkingHour).filter(WorkingHour.doctor_id == doctor_id).all()

# 🔥 FUNCIÓN AGREGADA: Actualizar
def update_working_hour(db: Session, working_hour_id: int, working_hour: WorkingHourUpdate):
    """Actualiza un horario de trabajo existente."""
    db_hour = get_working_hour(db, working_hour_id)
    if db_hour:
        # Esto permite actualizar solo los campos que se envían (exclude_unset=True)
        update_data = working_hour.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_hour, field, value)
        db.commit()
        db.refresh(db_hour)
    return db_hour

# 🔥 FUNCIÓN AGREGADA: Eliminar
def delete_working_hour(db: Session, working_hour_id: int):
    """Elimina un horario de trabajo."""
    db_hour = get_working_hour(db, working_hour_id)
    if db_hour:
        db.delete(db_hour)
        db.commit()
    return db_hour # Retornamos el objeto eliminado o None