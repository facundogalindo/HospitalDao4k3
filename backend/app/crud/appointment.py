from sqlalchemy.orm import Session

from app.models.Appointment import Appointment, AppointmentStatus as ModelAppointmentStatus
from app.schemas.appointment import AppointmentCreate, AppointmentStatus as SchemaAppointmentStatus
from app.events.event_manager import event_manager

from sqlalchemy.orm import joinedload
from app.events.event_manager import event_manager
from app.models.Doctor import Doctor
def create_appointment(db: Session, appointment: AppointmentCreate):
    """
    Crea un turno nuevo validando solapamiento
    y luego dispara el patrón OBSERVER.
    """

    # ------------------------------------------
    # 1) VALIDACIÓN DE SOLAPAMIENTO
    # ------------------------------------------
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
        raise ValueError(
            "El médico ya tiene un turno en ese horario. "
            "Por favor elegí otro horario."
        )

    # ------------------------------------------
    # 2) CREAR EL TURNO
    # ------------------------------------------
    db_appointment = Appointment(**appointment.dict())
    db.add(db_appointment)
    db.commit()
    db.refresh(db_appointment)

    # ------------------------------------------
    # 3) RECARGAR CON JOINEDLOAD
    #    (Cargar patient, doctor y especialidades)
    # ------------------------------------------
    db_appointment = (
        db.query(Appointment)
        .options(
            joinedload(Appointment.patient),
            joinedload(Appointment.doctor).joinedload(Doctor.specialties)
        )
        .filter(Appointment.id == db_appointment.id)
        .first()
    )

    # Verificación de relaciones (debug amigable)
    print("\n[DEBUG] Turno creado:")
    print(" - Appointment ID:", db_appointment.id)
    print(" - Paciente:", db_appointment.patient.first_name, db_appointment.patient.last_name)
    print(" - Doctor:", db_appointment.doctor.first_name, db_appointment.doctor.last_name)
    print(
        " - Especialidades:",
        [s.name for s in db_appointment.doctor.specialties]
        if db_appointment.doctor.specialties else "Ninguna"
    )

    # ------------------------------------------
    # 4) NOTIFICAR A LOS OBSERVERS
    # ------------------------------------------
    event_manager.notify("appointment_created", db_appointment)

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
        db_appointment.status = status
        db.commit()
        db.refresh(db_appointment)
    return db_appointment


def delete_appointment(db: Session, appointment_id: int):
    db_appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if db_appointment:
        db.delete(db_appointment)
        db.commit()
    return db_appointment
