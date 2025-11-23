from sqlalchemy.orm import Session

from app.models.Appointment import Appointment, AppointmentStatus as ModelAppointmentStatus
from app.schemas.appointment import AppointmentCreate, AppointmentStatus as SchemaAppointmentStatus


def create_appointment(db: Session, appointment: AppointmentCreate):
    """
    Crea un turno nuevo validando que el médico NO tenga solapamientos
    en el horario indicado (para estados que no sean CANCELLED).
    """

    # Validar solapamiento de turnos para el mismo médico
    conflict = (
        db.query(Appointment)
        .filter(
            Appointment.doctor_id == appointment.doctor_id,
            Appointment.status != ModelAppointmentStatus.CANCELLED,
            Appointment.start_at < appointment.end_at,
            appointment.start_at < Appointment.end_at,
        )
        .first()
    )

    if conflict:
        # No levantamos HTTPException acá para mantener el CRUD
        # independiente de FastAPI. Usamos ValueError y que la API lo
        # traduzca a un 400.
        raise ValueError(
            "El médico ya tiene un turno en ese horario. "
            "Por favor elegí otro horario."
        )

    db_appointment = Appointment(**appointment.dict())
    db.add(db_appointment)
    db.commit()
    db.refresh(db_appointment)



    return db_appointment


def get_appointments(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Appointment).offset(skip).limit(limit).all()


def get_appointment(db: Session, appointment_id: int):
    return db.query(Appointment).filter(Appointment.id == appointment_id).first()


def get_appointments_by_doctor(db: Session, doctor_id: int):
    return db.query(Appointment).filter(Appointment.doctor_id == doctor_id).all()


def get_appointments_by_patient(db: Session, patient_id: int):
    return db.query(Appointment).filter(Appointment.patient_id == patient_id).all()


def update_appointment_status(
    db: Session,
    appointment_id: int,
    status: SchemaAppointmentStatus,
):
    """
    Actualiza el estado del turno usando el Enum del MODELO,
    mapeando desde el Enum del SCHEMA.
    """
    db_appointment = (
        db.query(Appointment).filter(Appointment.id == appointment_id).first()
    )

    if db_appointment:
        # status es el Enum del schema. Guardamos el Enum del modelo.
        db_appointment.status = ModelAppointmentStatus(status.value)
        db.commit()
        db.refresh(db_appointment)
    return db_appointment


def delete_appointment(db: Session, appointment_id: int):
    db_appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if db_appointment:
        db.delete(db_appointment)
        db.commit()
    return db_appointment
