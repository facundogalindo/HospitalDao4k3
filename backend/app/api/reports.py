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
import plotly.graph_objects as go
import base64
from io import BytesIO
from app.models.Appointment import Appointment, AppointmentStatus
from matplotlib import pyplot as plt
router = APIRouter()


#--- Listado de turnos por médico en un período

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
    # Construir query base
    query = db.query(
        Doctor.id.label('doctor_id'),
        func.concat(Doctor.first_name, ' ', Doctor.last_name).label('doctor_name'),
        func.count(Appointment.id).label('appointment_count')
    ).join(Appointment, Doctor.id == Appointment.doctor_id)

    # Aplicar filtros
    if doctor_id:
        query = query.filter(Doctor.id == doctor_id)

    if start_date:
        start_dt = datetime.strptime(start_date, "%Y-%m-%d")
        query = query.filter(Appointment.start_at >= start_dt)

    if end_date:
        end_dt = datetime.strptime(end_date, "%Y-%m-%d")
        query = query.filter(Appointment.start_at <= end_dt)

    # Agrupar por médico
    results = query.group_by(Doctor.id, Doctor.first_name, Doctor.last_name).all()

    # Construir respuesta
    response = []
    for doctor_id, doctor_name, appointment_count in results:
        # Obtener detalles de los turnos
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



#---antidad de turnos por especialidad

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
    # Query para contar turnos por especialidad
    query = db.query(
        Specialty.id.label('specialty_id'),
        Specialty.name.label('specialty_name'),
        func.count(Appointment.id).label('appointment_count')
    ).select_from(Specialty)\
     .join(DoctorSpecialty, Specialty.id == DoctorSpecialty.specialty_id)\
     .join(Doctor, DoctorSpecialty.doctor_id == Doctor.id)\
     .join(Appointment, Doctor.id == Appointment.doctor_id)

    # Aplicar filtros de fecha
    if start_date:
        start_dt = datetime.strptime(start_date, "%Y-%m-%d")
        query = query.filter(Appointment.start_at >= start_dt)

    if end_date:
        end_dt = datetime.strptime(end_date, "%Y-%m-%d")
        query = query.filter(Appointment.start_at <= end_dt)

    # Agrupar por especialidad
    results = query.group_by(Specialty.id, Specialty.name).all()

    return [
        AppointmentsBySpecialtyResponse(
            specialty_id=specialty_id,
            specialty_name=specialty_name,
            appointment_count=appointment_count
        )
        for specialty_id, specialty_name, appointment_count in results
    ]



#---Pacientes atendidos en un rango de fechas
class PatientsByDateRangeResponse(BaseModel):
    patient_id: int
    patient_name: str
    appointment_count: int
    last_appointment: Optional[str]

@router.get("/patients-by-date-range", response_model=List[PatientsByDateRangeResponse])
def get_patients_by_date_range(
    start_date: str,
    end_date: str,
    db: Session = Depends(get_db)
):
    # Query para pacientes atendidos en un rango de fechas
    query = db.query(
        Patient.id.label('patient_id'),
        func.concat(Patient.first_name, ' ', Patient.last_name).label('patient_name'),
        func.count(Appointment.id).label('appointment_count'),
        func.max(Appointment.start_at).label('last_appointment')
    ).join(Appointment, Patient.id == Appointment.patient_id)\
     .filter(
         Appointment.start_at >= datetime.strptime(start_date, "%Y-%m-%d"),
         Appointment.start_at <= datetime.strptime(end_date, "%Y-%m-%d"),
         Appointment.attended == True  # Solo pacientes que sí atendieron
     )\
     .group_by(Patient.id, Patient.first_name, Patient.last_name)

    results = query.all()

    return [
        PatientsByDateRangeResponse(
            patient_id=patient_id,
            patient_name=patient_name,
            appointment_count=appointment_count,
            last_appointment=last_appointment.isoformat() if last_appointment else None
        )
        for patient_id, patient_name, appointment_count, last_appointment in results
    ]




#--- Gráfico estadístico: asistencia vs. inasistencias (CON GRÁFICO)
class AttendanceChartResponse(BaseModel):
    chart_image: str  # Imagen base64 del gráfico

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

    # --- Contadores ---
    attended = sum(1 for app in appointments if app.attended)
    cancelled = sum(1 for app in appointments if app.status == AppointmentStatus.CANCELLED)
    not_attended = sum(
        1 for app in appointments
        if not app.attended and app.status != AppointmentStatus.CANCELLED
    )

    labels = ["Asistieron", "No asistieron", "Cancelados"]
    values = [attended, not_attended, cancelled]
    colors = ["#2ecc71", "#e74c3c", "#f39c12"]

    # --- Gráfico de barras ---
    plt.figure(figsize=(8, 5))
    bars = plt.bar(labels, values, color=colors)

    # Mostrar valores arriba de cada barra
    for bar in bars:
        y = bar.get_height()
        plt.text(
            bar.get_x() + bar.get_width() / 2,
            y + 0.1,
            f"{int(y)}",
            ha="center",
            va="bottom",
            fontsize=12
        )

    plt.title("Estadísticas de Asistencia de Pacientes")
    plt.xlabel("Categorías")
    plt.ylabel("Cantidad de turnos")
    plt.grid(axis='y', linestyle='--', alpha=0.4)

    # Exportar imagen a base64
    buffer = BytesIO()
    plt.savefig(buffer, format="png", bbox_inches="tight")
    buffer.seek(0)
    img_base64 = base64.b64encode(buffer.getvalue()).decode("utf-8")

    plt.close()

    return AttendanceChartResponse(
        chart_image=f"data:image/png;base64,{img_base64}"
    )
