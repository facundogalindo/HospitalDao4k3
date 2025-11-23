- ================================================
-- SCHEMA: Sistema de Turnos Médicos
-- Base de datos: turnos_medico
-- ================================================

-- Limpieza previa (para desarrollo)
DROP TABLE IF EXISTS reminders CASCADE;
DROP TABLE IF EXISTS prescriptions CASCADE;
DROP TABLE IF EXISTS medical_records CASCADE;
DROP TABLE IF EXISTS appointments CASCADE;
DROP TABLE IF EXISTS working_hours CASCADE;
DROP TABLE IF EXISTS doctor_specialties CASCADE;
DROP TABLE IF EXISTS specialties CASCADE;
DROP TABLE IF EXISTS doctors CASCADE;
DROP TABLE IF EXISTS patients CASCADE;

-- ================================================
-- TABLA: PATIENTS
-- ================================================
CREATE TABLE patients (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(80) NOT NULL,
    last_name VARCHAR(80) NOT NULL,
    birth_date DATE,
    gender VARCHAR(20),
    email VARCHAR(200),
    phone VARCHAR(50),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ================================================
-- TABLA: DOCTORS
-- ================================================
CREATE TABLE doctors (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(80) NOT NULL,
    last_name VARCHAR(80) NOT NULL,
    license_number VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(200),
    phone VARCHAR(50),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ================================================
-- TABLA: SPECIALTIES
-- ================================================
CREATE TABLE specialties (
    id SERIAL PRIMARY KEY,
    name VARCHAR(120) UNIQUE NOT NULL,
    description TEXT
);

-- ================================================
-- TABLA INTERMEDIA: DOCTOR_SPECIALTIES
-- ================================================
CREATE TABLE doctor_specialties (
    id SERIAL PRIMARY KEY,
    doctor_id INT NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    specialty_id INT NOT NULL REFERENCES specialties(id) ON DELETE CASCADE,
    UNIQUE (doctor_id, specialty_id)
);

-- ================================================
-- TABLA: WORKING_HOURS
-- ================================================
CREATE TABLE working_hours (
    id SERIAL PRIMARY KEY,
    doctor_id INT NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    weekday VARCHAR(10) NOT NULL,   -- e.g. MON, TUE, WED
    start_time TIME NOT NULL,
    end_time TIME NOT NULL
);

-- ================================================
-- TABLA: APPOINTMENTS
-- ================================================
CREATE TYPE appointment_status AS ENUM ('SCHEDULED', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'NO_SHOW');

CREATE TABLE appointments (
    id SERIAL PRIMARY KEY,
    patient_id INT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id INT NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    start_at TIMESTAMP NOT NULL,
    end_at TIMESTAMP NOT NULL,
    status appointment_status DEFAULT 'SCHEDULED',
    attended BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_appointments_doctor_start ON appointments(doctor_id, start_at);
CREATE INDEX idx_appointments_patient_start ON appointments(patient_id, start_at);

-- ================================================
-- TABLA: MEDICAL_RECORDS
-- ================================================
CREATE TABLE medical_records (
    id SERIAL PRIMARY KEY,
    patient_id INT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id INT REFERENCES doctors(id) ON DELETE SET NULL,
    record_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    summary TEXT
);

-- ================================================
-- TABLA: PRESCRIPTIONS
-- ================================================
CREATE TABLE prescriptions (
    id SERIAL PRIMARY KEY,
    medical_record_id INT NOT NULL REFERENCES medical_records(id) ON DELETE CASCADE,
    medication VARCHAR(255) NOT NULL,
    dosage VARCHAR(255),
    frequency VARCHAR(255),
    instructions TEXT,
    issued_at DATE DEFAULT CURRENT_DATE
);

-- ================================================
-- TABLA: REMINDERS
-- ================================================
CREATE TABLE reminders (
    id SERIAL PRIMARY KEY,
    appointment_id INT NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
    channel VARCHAR(20), -- email, sms, push
    send_at TIMESTAMP NOT NULL,
    sent BOOLEAN DEFAULT FALSE,
    payload TEXT
);

-- ================================================
-- DATOS DE EJEMPLO
-- ================================================

-- Pacientes
INSERT INTO patients (first_name, last_name, birth_date, gender, email, phone)
VALUES 
('Juan', 'Pérez', '1985-04-12', 'M', 'juan.perez@example.com', '351-1112222'),
('María', 'López', '1990-07-25', 'F', 'maria.lopez@example.com', '351-3334444');

-- Médicos
INSERT INTO doctors (first_name, last_name, license_number, email, phone)
VALUES 
('Ana', 'García', 'MED12345', 'ana.garcia@hospital.com', '351-5556666'),
('Luis', 'Rodríguez', 'MED67890', 'luis.rodriguez@hospital.com', '351-7778888');

-- Especialidades
INSERT INTO specialties (name, description)
VALUES 
('Cardiología', 'Especialidad en enfermedades del corazón'),
('Clínica Médica', 'Atención general y diagnóstico clínico');

-- Asociación Médico-Especialidad
INSERT INTO doctor_specialties (doctor_id, specialty_id)
VALUES 
(1, 1), -- Ana García - Cardiología
(2, 2); -- Luis Rodríguez - Clínica Médica

-- Horarios de trabajo
INSERT INTO working_hours (doctor_id, weekday, start_time, end_time)
VALUES 
(1, 'MON', '09:00', '17:00'),
(1, 'WED', '09:00', '13:00'),
(2, 'TUE', '10:00', '18:00'),
(2, 'THU', '10:00', '18:00');

-- Turnos
INSERT INTO appointments (patient_id, doctor_id, start_at, end_at, status, attended, notes)
VALUES 
(1, 1, '2025-10-21 09:00', '2025-10-21 09:30', 'CONFIRMED', TRUE, 'Chequeo general.'),
(2, 1, '2025-10-21 09:30', '2025-10-21 10:00', 'SCHEDULED', FALSE, NULL),
(1, 2, '2025-10-22 10:30', '2025-10-22 11:00', 'COMPLETED', TRUE, 'Consulta de seguimiento.');

-- Historial médico
INSERT INTO medical_records (patient_id, doctor_id, summary)
VALUES 
(1, 1, 'Paciente con antecedentes leves de hipertensión.'),
(2, 1, 'Chequeo inicial, sin hallazgos relevantes.');

-- Recetas
INSERT INTO prescriptions (medical_record_id, medication, dosage, frequency, instructions)
VALUES 
(1, 'Losartán', '50 mg', '1 vez al día', 'Tomar después del desayuno'),
(2, 'Paracetamol', '500 mg', 'Cada 8 horas', 'Tomar con agua');

-- Recordatorios
INSERT INTO reminders (appointment_id, channel, send_at, sent, payload)
VALUES 
(2, 'email', '2025-10-20 09:30', FALSE, 'Recordatorio de turno para mañana 9:30 con Dra. García');

