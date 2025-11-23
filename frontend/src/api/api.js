// En src/api/api.js

import axios from "axios";

const api = axios.create({
    baseURL: "http://127.0.0.1:8000",
});

// -------------------------------------------------------------
// PACIENTES
// -------------------------------------------------------------
export const getPatients = () => api.get("/patients");
export const getPatient = (id) => api.get(`/patients/${id}`);
export const createPatient = (data) => api.post("/patients", data);
export const updatePatient = (id, data) => api.put(`/patients/${id}`, data);
export const deletePatient = (id) => api.delete(`/patients/${id}`);

// -------------------------------------------------------------
// DOCTORES
// -------------------------------------------------------------
export const getDoctors = () => api.get("/doctors");
export const getDoctor = (id) => api.get(`/doctors/${id}`);
export const createDoctor = (data) => api.post("/doctors", data);
export const updateDoctor = (id, data) => api.put(`/doctors/${id}`, data);
export const deleteDoctor = (id) => api.delete(`/doctors/${id}`);

// -------------------------------------------------------------
// ESPECIALIDADES
// -------------------------------------------------------------
export const getSpecialties = () => api.get("/specialties");
export const getSpecialty = (id) => api.get(`/specialties/${id}`);
export const createSpecialty = (data) => api.post("/specialties", data);
export const updateSpecialty = (id, data) => api.put(`/specialties/${id}`, data);
export const deleteSpecialty = (id) => api.delete(`/specialties/${id}`);

// -------------------------------------------------------------
// TURNOS
// -------------------------------------------------------------
export const getAppointments = () => api.get("/appointments");
export const getAppointment = (id) => api.get(`/appointments/${id}`);
export const createAppointment = (data) => api.post("/appointments", data);
export const deleteAppointment = (id) => api.delete(`/appointments/${id}`);

// PATCH – ACTUALIZAR ESTADO DEL TURNO (100% CORRECTO)
export const updateAppointmentStatus = (id, newStatus) =>
    api.patch(`/appointments/${id}/status`, {
        status: newStatus,   // 👈 SIEMPRE debe ir así
    });

// -------------------------------------------------------------
// HISTORIALES MÉDICOS
// -------------------------------------------------------------
export const getMedicalRecords = () => api.get("/medical-records");
export const getMedicalRecord = (id) => api.get(`/medical-records/${id}`);
export const createMedicalRecord = (data) => api.post("/medical-records", data);
export const updateMedicalRecord = (id, data) =>
    api.put(`/medical-records/${id}`, data);
export const deleteMedicalRecord = (id) =>
    api.delete(`/medical-records/${id}`);

export const getMedicalRecordsByPatient = (patientId) =>
    api.get(`/medical-records/patient/${patientId}`);

// -------------------------------------------------------------
// HORARIOS DE TRABAJO
// -------------------------------------------------------------
export const getWorkingHours = () => api.get("/working-hours");

export const getWorkingHoursByDoctor = (doctorId) =>
    api.get(`/working-hours/doctor/${doctorId}`);

export const createWorkingHour = (data) =>
    api.post("/working-hours", data);

export const updateWorkingHour = (id, data) =>
    api.put(`/working-hours/${id}`, data);

export const deleteWorkingHour = (id) =>
    api.delete(`/working-hours/${id}`);

// -------------------------------------------------------------
// RECETAS
// -------------------------------------------------------------
export const getPrescriptions = () => api.get("/prescriptions");
export const getPrescription = (id) => api.get(`/prescriptions/${id}`);
export const createPrescription = (data) => api.post("/prescriptions", data);

export const getPrescriptionsByRecord = (medicalRecordId) =>
    api.get(`/prescriptions/medical-record/${medicalRecordId}`);

export const deletePrescription = (id) =>
    api.delete(`/prescriptions/${id}`);

export const updatePrescription = (id, data) =>
    api.put(`/prescriptions/${id}`, data);

// -------------------------------------------------------------
// RECORDATORIOS
// -------------------------------------------------------------
export const getReminders = () => api.get("/reminders");
export const getReminder = (id) => api.get(`/reminders/${id}`);
export const createReminder = (data) => api.post("/reminders", data);

// -------------------------------------------------------------
// REPORTES
// -------------------------------------------------------------
// ------------------------------------------------------------------
// --- REPORTES (GET con filtros) 📊 - SOLO AGREGAR ESTAS
// ------------------------------------------------------------------

// Turnos por médico
export const getAppointmentsByDoctor = (doctorId, startDate, endDate) =>
    api.get("/reports/appointments-by-doctor", { 
        params: { 
            doctor_id: doctorId,
            start_date: startDate,
            end_date: endDate
        } 
    });

// Turnos por especialidad  
export const getAppointmentsBySpecialty = (startDate, endDate) =>
    api.get("/reports/appointments-by-specialty", { 
        params: {
            start_date: startDate,
            end_date: endDate
        } 
    });

// Gráfico de asistencia
export const getAttendanceStats = (startDate, endDate) =>
    api.get("/reports/attendance-chart", { 
        params: {
            start_date: startDate,
            end_date: endDate
        } 
    });

// Pacientes por rango de fechas
export const getPatientsByDateRange = (startDate, endDate) =>
    api.get("/reports/patients-by-date-range", {
        params: {
            start_date: startDate,
            end_date: endDate
        }
    });





/*
export const getAppointmentsBySpecialty = (params) =>
    api.get("/reports/appointments-by-specialty", { params });

export const getAppointmentsByDoctor = (params) =>
    api.get("/reports/appointments-by-doctor", { params });

export const getAttendanceStats = (params) =>
    api.get("/reports/attendance-stats", { params });
*/
export default api;
