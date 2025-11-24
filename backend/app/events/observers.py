# app/events/observers.py

from datetime import timedelta
from app.database import SessionLocal
from app.models.Reminder import Reminder
from app.utils.email_sender import send_email

from datetime import datetime
import locale

# Para mostrar días y meses en español
try:
    locale.setlocale(locale.LC_TIME, "es_ES.UTF-8")
except:
    locale.setlocale(locale.LC_TIME, "es_AR.UTF-8")


class ReminderCreator:
    """Crea un recordatorio cuando se crea un turno."""

    def update(self, appointment):
        print("\n=== OBSERVER: ReminderCreator ACTIVADO ===")
        print("Appointment ID:", appointment.id)

        db = SessionLocal()

        reminder = Reminder(
            appointment_id=appointment.id,
            message=f"Tienes un turno el {appointment.start_at}",
            send_at=appointment.start_at - timedelta(hours=1),
            sent=False
        )

        db.add(reminder)
        try:
            db.commit()
            print("✅ Recordatorio creado correctamente")
        except Exception as e:
            print("❌ ERROR al guardar recordatorio:", e)
            db.rollback()

        db.close()
        print("=== FIN OBSERVER ReminderCreator ===\n")





class EmailNotifier:
    """Envía un email real cuando se crea un turno."""

    def update(self, appointment):
        print("\n=== OBSERVER: EmailNotifier ACTIVADO ===")

        patient = appointment.patient
        doctor = appointment.doctor

        # Validaciones básicas
        if not patient or not patient.email:
            print("❌ ERROR: paciente sin email")
            return

        if not doctor:
            print("❌ ERROR: turno sin doctor cargado")
            return

        # Especialidad (tomamos la primera)
        if doctor.specialties and len(doctor.specialties) > 0:
            specialty = doctor.specialties[0].name
        else:
            specialty = "especialidad"

        fecha = appointment.start_at

        # -------------------------------
        # Formateo en español
        # -------------------------------
        dia_semana = fecha.strftime("%A").capitalize()       # Ej: Martes
        fecha_larga = fecha.strftime("%d de %B")             # Ej: 10 de noviembre
        hora = fecha.strftime("%H:%M")                       # Ej: 09:00

        # -------------------------------
        # Mensaje final
        # -------------------------------
        subject = "Confirmación de turno médico"

        message = (
            f"Hola {patient.first_name},\n\n"
            f"Tu turno con el doctor {doctor.first_name} {doctor.last_name} "
            f"de {specialty} fue confirmado para el día {dia_semana}, "
            f"{fecha_larga} a las {hora} horas.\n\n"
            f"¡Te esperamos!\n"
            f"Hospital DAO"
        )

        print("📤 Enviando email real a:", patient.email)

        try:
            ok = send_email(patient.email, subject, message)
            if ok:
                print("✅ EMAIL ENVIADO CORRECTAMENTE")
            else:
                print("❌ ERROR: send_email devolvió False")
        except Exception as e:
            print("❌ EXCEPCIÓN al enviar email:", e)

        print("=== FIN OBSERVER EmailNotifier ===\n")