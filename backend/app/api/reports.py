from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel
from app.models.Doctor import Doctor
from app.models.Specialty import Specialty
from app.models.DoctorSpecialty import DoctorSpecialty
from app.models.Patient import Patient
import base64
from io import BytesIO
from app.models.Appointment import Appointment, AppointmentStatus
import matplotlib.pyplot as plt

router = APIRouter()

# ---------------------------------------------------------
#   🔵 Turnos por médico
# ---------------------------------------------------------

class AppointmentByDoctorResponse(BaseModel):
    doctor_id: int
    doctor_name: str
    appointment_count: int
    appointments: List[dict]

@router.get("/appointments-by-doctor", response_model=List[AppointmentByDoctorResponse])
def get_appointments_by_doctor(
    doctor_id: Optional[int] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(
        Doctor.id.label("doctor_id"),
        func.concat(Doctor.first_name, " ", Doctor.last_name).label("doctor_name"),
        func.count(Appointment.id).label("appointment_count")
    ).join(Appointment, Doctor.id == Appointment.doctor_id)

    if doctor_id:
        query = query.filter(Doctor.id == doctor_id)

    if start_date:
        start_dt = datetime.strptime(start_date, "%Y-%m-%d")
        query = query.filter(Appointment.start_at >= start_dt)

    if end_date:
        end_dt = datetime.strptime(end_date, "%Y-%m-%d")
        query = query.filter(Appointment.start_at <= end_dt)

    results = query.group_by(Doctor.id).all()

    response = []
    for doctor_id, doctor_name, appointment_count in results:
        appointments_query = db.query(Appointment).filter(Appointment.doctor_id == doctor_id)

        if start_date:
            appointments_query = appointments_query.filter(Appointment.start_at >= start_dt)
        if end_date:
            appointments_query = appointments_query.filter(Appointment.start_at <= end_dt)

        appointments = appointments_query.all()

        appointment_details = [
            {
                "id": app.id,
                "patient_id": app.patient_id,
                "patient_name": f"{app.patient.first_name} {app.patient.last_name}"
                if app.patient else "Desconocido",
                "start_at": app.start_at.isoformat(),
                "end_at": app.end_at.isoformat(),
                "status": app.status.value if app.status else None,
                "attended": app.attended
            }
            for app in appointments
        ]

        response.append(AppointmentByDoctorResponse(
            doctor_id=doctor_id,
            doctor_name=doctor_name,
            appointment_count=appointment_count,
            appointments=appointment_details
        ))

    return response


# ---------------------------------------------------------
#   🏥 Turnos por especialidad
# ---------------------------------------------------------

class AppointmentsBySpecialtyResponse(BaseModel):
    specialty_id: int
    specialty_name: str
    appointment_count: int

@router.get("/appointments-by-specialty", response_model=List[AppointmentsBySpecialtyResponse])
def get_appointments_by_specialty(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(
        Specialty.id.label("specialty_id"),
        Specialty.name.label("specialty_name"),
        func.count(Appointment.id).label("appointment_count")
    ).select_from(Specialty)\
     .join(DoctorSpecialty, Specialty.id == DoctorSpecialty.specialty_id)\
     .join(Doctor, DoctorSpecialty.doctor_id == Doctor.id)\
     .join(Appointment, Doctor.id == Appointment.doctor_id)

    if start_date:
        start_dt = datetime.strptime(start_date, "%Y-%m-%d")
        query = query.filter(Appointment.start_at >= start_dt)

    if end_date:
        end_dt = datetime.strptime(end_date, "%Y-%m-%d")
        query = query.filter(Appointment.start_at <= end_dt)

    results = query.group_by(Specialty.id).all()

    return [
        AppointmentsBySpecialtyResponse(
            specialty_id=specialty_id,
            specialty_name=specialty_name,
            appointment_count=appointment_count
        )
        for specialty_id, specialty_name, appointment_count in results
    ]


# ---------------------------------------------------------
#   👥 Pacientes atendidos (PAGINADO)
# ---------------------------------------------------------

class PatientsPaginatedResponse(BaseModel):
    data: list
    current_page: int
    total_pages: int

@router.get("/patients-attended", response_model=PatientsPaginatedResponse)
def get_patients_attended(
    start_date: str,
    end_date: str,
    page: int = 1,
    page_size: int = 10,
    db: Session = Depends(get_db)
):
    # --- Parseo seguro de fechas ---
    start_dt = datetime.strptime(start_date, "%Y-%m-%d")
    # Para incluir TODO el día final
    end_dt = datetime.strptime(end_date, "%Y-%m-%d")
    end_dt = end_dt.replace(hour=23, minute=59, second=59)

    # --- Query base (solo COMPLETED) ---
    base_query = db.query(
        Patient.id.label("patient_id"),

        # Compatible con PostgreSQL
        (Patient.first_name + " " + Patient.last_name).label("patient_name"),

        func.count(Appointment.id).label("appointment_count"),
        func.max(Appointment.start_at).label("last_appointment")
    ).join(Appointment, Appointment.patient_id == Patient.id) \
     .filter(
         Appointment.status == "COMPLETED",
         Appointment.start_at >= start_dt,
         Appointment.start_at <= end_dt
     ) \
     .group_by(Patient.id)

    # -------- PAGINACIÓN REAL (PostgreSQL) --------
    # NO usar .count() sobre el query con GROUP BY
    total_records = db.query(func.count()).select_from(base_query.subquery()).scalar()
    total_pages = (total_records + page_size - 1) // page_size

    # -------- APLICAR OFFSET + LIMIT --------
    results = (
        base_query
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )

    # -------- FORMATEO ESTÁNDAR --------
    data = [
        {
            "patient_id": r.patient_id,
            "patient_name": r.patient_name,
            "appointment_count": r.appointment_count,
            "last_appointment": r.last_appointment.isoformat() if r.last_appointment else None
        }
        for r in results
    ]

    return PatientsPaginatedResponse(
        data=data,
        current_page=page,
        total_pages=total_pages
    )




# ---------------------------------------------------------
#   📊 Asistencia (gráfico de barras)
# ---------------------------------------------------------

class AttendanceChartResponse(BaseModel):
    chart_image: str

@router.get("/attendance-chart", response_model=AttendanceChartResponse)
def get_attendance_chart(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Appointment)

    if start_date:
        start_dt = datetime.strptime(start_date, "%Y-%m-%d")
        query = query.filter(Appointment.start_at >= start_dt)

    if end_date:
        end_dt = datetime.strptime(end_date, "%Y-%m-%d")
        query = query.filter(Appointment.start_at <= end_dt)

    appointments = query.all()

    states = {
        "SCHEDULED": 0,
        "CONFIRMED": 0,
        "COMPLETED": 0,
        "CANCELLED": 0,
        "NO_SHOW": 0
    }

    for app in appointments:
        if app.status:
            states[app.status.value] += 1

    labels = list(states.keys())
    values = list(states.values())
    colors = ["blue", "orange", "green", "red", "gray"]

    plt.figure(figsize=(8, 5))
    bars = plt.bar(labels, values, color=colors)

    for bar in bars:
        y = bar.get_height()
        plt.text(bar.get_x() + bar.get_width()/2, y + 0.1, f"{y}", ha="center")

    plt.title("Estados de Turnos")
    buffer = BytesIO()
    plt.savefig(buffer, format="png", bbox_inches="tight")
    buffer.seek(0)

    img_base64 = base64.b64encode(buffer.getvalue()).decode("utf-8")
    plt.close()

    return AttendanceChartResponse(chart_image=f"data:image/png;base64,{img_base64}")
