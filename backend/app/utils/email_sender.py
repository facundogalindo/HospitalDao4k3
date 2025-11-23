import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

# --------------------------------------------------------
# CONFIGURACIÓN GMAIL SMTP
# --------------------------------------------------------
# ⚠️ IMPORTANTE:
#  - Usar SOLO contraseña de aplicación de 16 caracteres.
#  - NO usar contraseña normal de Gmail.
# --------------------------------------------------------

GMAIL_USER = "hospitaldedao4k3@gmail.com"
GMAIL_PASSWORD = "lszayaxmjfyiojio"   # tu contraseña de aplicación (sin espacios)


def send_email(to, subject, message):
    """
    Envía un correo real usando Gmail SMTP.
    Retorna True si se envió correctamente, False si falló.
    """

    try:
        # Construcción del email
        msg = MIMEMultipart()
        msg["From"] = GMAIL_USER
        msg["To"] = to
        msg["Subject"] = subject

        msg.attach(MIMEText(message, "plain"))

        # Conexión SMTP
        server = smtplib.SMTP("smtp.gmail.com", 587)
        server.starttls()

        # Login con Gmail
        server.login(GMAIL_USER, GMAIL_PASSWORD)

        # Enviar
        server.sendmail(GMAIL_USER, to, msg.as_string())
        server.quit()

        print(f"[EMAIL REAL] Enviado a {to}")
        return True

    except Exception as e:
        print("[EMAIL ERROR]", e)
        return False
