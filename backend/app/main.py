from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime, timedelta

from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger

from app.database import engine, Base, SessionLocal

# Crear tablas
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Sistema de Turnos Médicos")

# ---------------- CORS ----------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------- SCHEDULER ----------------
scheduler = BackgroundScheduler()

def generate_automatic_reminders():
    from app.models.AppointmentStatus import Appointment
    from app.models.Reminder import Reminder
    db = SessionLocal()
    try:
        now = datetime.utcnow()
        tomorrow = now + timedelta(days=1)

        appointments = (
            db.query(Appointment)
            .filter(
                Appointment.start_at >= now,
                Appointment.start_at <= tomorrow
            )
            .all()
        )

        for appt in appointments:
            exists = db.query(Reminder).filter(Reminder.appointment_id == appt.id).first()
            if exists:
                continue

            reminder = Reminder(
                appointment_id=appt.id,
                channel="email",
                message=f"Tienes un turno el {appt.start_at}",
                send_at=appt.start_at - timedelta(hours=1),
                sent=False
            )

            db.add(reminder)

        db.commit()
    finally:
        db.close()


def send_pending_reminders():
    from app.utils.email_sender import send_email
    from app.models.Reminder import Reminder
    from app.models.AppointmentStatus import Appointment
    from app.models.Patient import Patient

    db = SessionLocal()
    try:
        now = datetime.utcnow()
        reminders = (
            db.query(Reminder)
            .filter(
                Reminder.sent == False,
                Reminder.send_at <= now
            )
            .all()
        )

        for r in reminders:
            appt = db.query(Appointment).filter(Appointment.id == r.appointment_id).first()
            if not appt:
                continue

            patient = db.query(Patient).filter(Patient.id == appt.patient_id).first()
            if not patient or not patient.email:
                continue

            subject = "Recordatorio de Turno Médico"
            message = (
                f"Hola {patient.first_name},\n\n"
                f"Te recordamos que tenés un turno programado:\n"
                f"{appt.start_at}\n\n"
                f"Saludos,\nHospital DAO"
            )

            send_email(patient.email, subject, message)
            r.sent = True

        db.commit()
    finally:
        db.close()


@app.on_event("startup")
def start_scheduler():
    scheduler.add_job(
        generate_automatic_reminders,
        IntervalTrigger(minutes=5),
        id="generate_automatic_reminders",
        replace_existing=True,
    )

    scheduler.add_job(
        send_pending_reminders,
        IntervalTrigger(minutes=1),
        id="send_pending_reminders",
        replace_existing=True,
    )

    scheduler.start()
    print("[SCHEDULER] Recordatorios ACTIVADOS.")


@app.on_event("shutdown")
def shutdown_scheduler():
    scheduler.shutdown()
    print("[SCHEDULER] Detenido.")


# ---------------- IMPORT ROUTERS ----------------
# ---------------- IMPORT ROUTERS ----------------
from app.api.patients import router as patients_router
from app.api.doctors import router as doctors_router
from app.api.specialties import router as specialties_router
from app.api.appointments import router as appointments_router
from app.api.medicalrecords import router as medicalrecords_router
from app.api.prescriptions import router as prescriptions_router
from app.api.reminders import router as reminders_router
from app.api.reports import router as reports_router
from app.api.workinghours import router as workinghours_router

# ---------------- REGISTER ROUTERS ----------------
app.include_router(patients_router)
app.include_router(doctors_router)
app.include_router(specialties_router)
app.include_router(appointments_router, prefix="/appointments", tags=["appointments"])
app.include_router(medicalrecords_router, prefix="/medical-records", tags=["medical-records"])
app.include_router(prescriptions_router, prefix="/prescriptions", tags=["prescriptions"])
app.include_router(reminders_router, prefix="/reminders", tags=["reminders"])
app.include_router(reports_router, prefix="/reports", tags=["reports"])

# 🚀 EL IMPORTANTE
app.include_router(workinghours_router, prefix="/working-hours", tags=["working-hours"])


@app.get("/")
def root():
    return {"message": "Sistema de Turnos Médicos API funcionando correctamente"}
