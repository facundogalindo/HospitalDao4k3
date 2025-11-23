// En src/api/api.js

import axios from "axios";

const api = axios.create({
    baseURL: "http://127.0.0.1:8000", // tu backend FastAPI
});

// ------------------------------------------------------------------
// --- PACIENTES (CRUD Completo) 👨‍🦱
// ------------------------------------------------------------------

export const getPatients = () => api.get("/patients");
export const getPatient = (id) => api.get(`/patients/${id}`);
export const createPatient = (data) => api.post("/patients", data);
export const updatePatient = (id, data) => api.put(`/patients/${id}`, data);
export const deletePatient = (id) => api.delete(`/patients/${id}`);

// ------------------------------------------------------------------
// --- MÉDICOS (CRUD Completo) 🩺
// ------------------------------------------------------------------

export const getDoctors = () => api.get("/doctors");
export const getDoctor = (id) => api.get(`/doctors/${id}`);
export const createDoctor = (data) => api.post("/doctors", data);
export const updateDoctor = (id, data) => api.put(`/doctors/${id}`, data);
export const deleteDoctor = (id) => api.delete(`/doctors/${id}`);

// ------------------------------------------------------------------
// --- ESPECIALIDADES (CRUD Completo) 🏥
// ------------------------------------------------------------------

export const getSpecialties = () => api.get("/specialties");
export const getSpecialty = (id) => api.get(`/specialties/${id}`);
export const createSpecialty = (data) => api.post("/specialties", data);
export const updateSpecialty = (id, data) => api.put(`/specialties/${id}`, data);
export const deleteSpecialty = (id) => api.delete(`/specialties/${id}`);

// ------------------------------------------------------------------
// --- TURNOS (GET, POST, DELETE + PATCH para estado) 📅
// ------------------------------------------------------------------

export const getAppointments = () => api.get("/appointments");
export const getAppointment = (id) => api.get(`/appointments/${id}`);
export const createAppointment = (data) => api.post("/appointments", data);
export const updateAppointmentStatus = (id, statusData) =>
  api.patch(`/appointments/${id}/status`, statusData);
export const deleteAppointment = (id) => api.delete(`/appointments/${id}`);

// ------------------------------------------------------------------
// --- HISTORIAL (CRUD REQUERIDO POR EL FRONT) 📄
// ------------------------------------------------------------------

export const getMedicalRecords = () => api.get("/medical-records");
export const getMedicalRecord = (id) => api.get(`/medical-records/${id}`);
export const createMedicalRecord = (data) => api.post("/medical-records", data);
// Faltaban para la edición/eliminación en el componente HistorialesMedicos.jsx
export const updateMedicalRecord = (id, data) => api.put(`/medical-records/${id}`, data);
export const deleteMedicalRecord = (id) => api.delete(`/medical-records/${id}`);

export const getMedicalRecordsByPatient = (patientId) => 
    api.get(`/medical-records/patient/${patientId}`);


// ------------------------------------------------------------------
// --- HORARIOS DE TRABAJO (CRUD Básico) ⏳
// ------------------------------------------------------------------

// ------------------------------------------------------------------
// --- HORARIOS DE TRABAJO (CRUD Básico) ⏳
// ------------------------------------------------------------------

// HORARIOS DE TRABAJO (rutas correctas)
// HORARIOS DE TRABAJO (rutas correctas)
export const getWorkingHours = () => api.get("/working-hours");

export const getWorkingHoursByDoctor = (doctorId) =>
    api.get(`/working-hours/doctor/${doctorId}`);

export const createWorkingHour = (data) =>
    api.post("/working-hours", data);

export const updateWorkingHour = (id, data) =>
    api.put(`/working-hours/${id}`, data);

export const deleteWorkingHour = (id) =>
    api.delete(`/working-hours/${id}`);





// ------------------------------------------------------------------
// --- RECETAS (CRUD Básico REQUERIDO POR EL FRONT) 💊
// ------------------------------------------------------------------

export const getPrescriptions = () => api.get("/prescriptions");
export const getPrescription = (id) => api.get(`/prescriptions/${id}`);
export const createPrescription = (data) => api.post("/prescriptions", data);
// Nombre corregido: se llamaba 'getPrescriptionsByMedicalRecord' y el componente esperaba 'getPrescriptionsByRecord'
export const getPrescriptionsByRecord = (medicalRecordId) => 
    api.get(`/prescriptions/medical-record/${medicalRecordId}`);
// Faltaba para la eliminación de recetas
export const deletePrescription = (id) => api.delete(`/prescriptions/${id}`);

export const updatePrescription = (id, data) =>
    api.put(`/prescriptions/${id}`, data);


// ------------------------------------------------------------------
// --- RECORDATORIOS (GET/POST) 🔔
// ------------------------------------------------------------------

export const getReminders = () => api.get("/reminders");
export const getReminder = (id) => api.get(`/reminders/${id}`);
export const createReminder = (data) => api.post("/reminders", data);


// ------------------------------------------------------------------
// --- REPORTES (GET con filtros) 📊
// ------------------------------------------------------------------

// Faltaba en tu archivo
export const getAppointmentsBySpecialty = (params) =>
    api.get("/reports/appointments-by-specialty", { params });

export const getAppointmentsByDoctor = (params) =>
    api.get("/reports/appointments-by-doctor", { params });

// Nombre ajustado: el componente espera 'getAttendanceStats'
export const getAttendanceStats = (params) =>
    api.get("/reports/attendance-stats", { params }); 


export default api;