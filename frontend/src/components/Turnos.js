import React, { useState, useEffect } from 'react';
import moment from 'moment';
import { 
    getAppointments, 
    createAppointment,
    updateAppointmentStatus,
    deleteAppointment,
    getPatients,
    getDoctors
} from '../api/api';

import { 
    FaTrashAlt, 
    FaPlus, 
    FaTimes, 
    FaSave, 
    FaCalendarCheck, 
    FaCheck, 
    FaTimesCircle 
} from 'react-icons/fa';

import '../styles/Medicos.css';

// Estados posibles
const STATUS_MAP = {
    SCHEDULED: "Programado",
    CONFIRMED: "Confirmado",
    COMPLETED: "Completado",
    CANCELLED: "Cancelado",
    NO_SHOW: "Ausente",
};

const initialFormData = {
    patient_id: "",
    doctor_id: "",
    start_at: "",
    end_at: "",
    notes: "",
    status: "SCHEDULED",
    attended: false,
};

const Turnos = () => {
    const [appointments, setAppointments] = useState([]);
    const [patients, setPatients] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [formData, setFormData] = useState(initialFormData);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Cargar datos
    const fetchData = async () => {
        setLoading(true);
        try {
            const [appRes, patRes, docRes] = await Promise.all([
                getAppointments(),
                getPatients(),
                getDoctors()
            ]);

            const patientMap = patRes.data.reduce(
                (acc, p) => ({ ...acc, [p.id]: `${p.first_name} ${p.last_name}` }),
                {}
            );

            const doctorMap = docRes.data.reduce(
                (acc, d) => ({ ...acc, [d.id]: `${d.first_name} ${d.last_name}` }),
                {}
            );

            const appointmentsWithNames = appRes.data.map(app => ({
                ...app,
                patient_name: patientMap[app.patient_id] || "Paciente",
                doctor_name: doctorMap[app.doctor_id] || "Médico",
            }));

            setPatients(patRes.data);
            setDoctors(docRes.data);
            setAppointments(appointmentsWithNames);
        } catch (err) {
            setError("Error al cargar datos.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const openCreateModal = () => {
        setFormData(initialFormData);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setFormData(initialFormData);
    };

    // Crear turno
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null); // limpiamos errores
        try {
            await createAppointment({
                ...formData,
                patient_id: parseInt(formData.patient_id),
                doctor_id: parseInt(formData.doctor_id),
            });

            fetchData();
            closeModal();
        } catch (err) {
            if (err.response?.status === 400) {
                const errorData = err.response.data;
                
                // Si el backend envía errores detallados por campo
                if (typeof errorData === 'object' && errorData.details) {
                    const errorMessages = Object.values(errorData.details).flat();
                    setError(`Errores de validación: ${errorMessages.join(', ')}`);
                } 
                // Si el backend envía un mensaje general
                else if (errorData.detail) {
                    setError(errorData.detail);
                }
                // Si el backend envía un array de errores
                else if (Array.isArray(errorData)) {
                    setError(errorData.map(err => err.msg || err.message).join(', '));
                }
                // Mensaje por defecto
                else {
                    setError("Datos inválidos. Por favor, verifique la información ingresada.");
                }
            } else {
                setError(err.response?.data?.detail || "Error al crear turno.");
            }
        }
    };

    // Cambio de estado desde el select
    const handleStatusSelect = async (app, newStatus) => {
        try {
            let attended =
                newStatus === "COMPLETED"
                    ? true
                    : newStatus === "CANCELLED" || newStatus === "NO_SHOW"
                    ? false
                    : app.attended;

            await updateAppointmentStatus(app.id, newStatus, attended);

            fetchData();
        } catch (err) {
            alert("Error al actualizar el estado");
            console.error(err);
        }
    };

    const handleDelete = async (id, patientName) => {
        if (!window.confirm(`¿Eliminar el turno de ${patientName}?`)) return;

        try {
            await deleteAppointment(id);
            fetchData();
        } catch (err) {
            alert("Error al eliminar");
        }
    };

    if (loading) return <p>Cargando...</p>;

    return (
        <div className="crud-container">
            <h1 className="crud-title">
                <FaCalendarCheck /> Gestión de Turnos Médicos
            </h1>

            {error && <div className="error-message">{error}</div>}

            <button className="add-button" onClick={openCreateModal}>
                <FaPlus /> Nuevo Turno
            </button>

            {/* TABLA DE TURNOS */}
            <div className="table-responsive">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Paciente</th>
                            <th>Médico</th>
                            <th>Inicio</th>
                            <th>Duración</th>
                            <th>Estado</th>
                            <th>Asistió</th>
                            <th>Eliminar</th>
                        </tr>
                    </thead>

                    <tbody>
                        {appointments.map(app => (
                            <tr key={app.id}>
                                <td>{app.id}</td>
                                <td>{app.patient_name}</td>
                                <td>{app.doctor_name}</td>

                                <td>{moment(app.start_at).format("DD/MM/YYYY HH:mm")}</td>

                                <td>
                                    {moment
                                        .duration(moment(app.end_at).diff(moment(app.start_at)))
                                        .asMinutes()}{" "}
                                    min
                                </td>

                                {/* SELECT DE ESTADOS */}
                                <td>
                                    <select
                                        className="form-control"
                                        value={app.status}
                                        onChange={(e) =>
                                            handleStatusSelect(app, e.target.value)
                                        }
                                    >
                                        <option value="SCHEDULED">Programado</option>
                                        <option value="CONFIRMED">Confirmado</option>
                                        <option value="COMPLETED">Completado</option>
                                        <option value="CANCELLED">Cancelado</option>
                                        <option value="NO_SHOW">Ausente</option>
                                    </select>
                                </td>

                                {/* ICONO ASISTIÓ */}
                                <td>
                                    {app.attended ? (
                                        <FaCheck style={{ color: "green" }} />
                                    ) : (
                                        <FaTimesCircle style={{ color: "red" }} />
                                    )}
                                </td>

                                {/* ELIMINAR */}
                                <td>
                                    <button
                                        className="action-button delete-button"
                                        onClick={() =>
                                            handleDelete(app.id, app.patient_name)
                                        }
                                        style={{ color: "#e74c3c" }}
                                    >
                                        <FaTrashAlt />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* MODAL CREAR TURNO */}
            {isModalOpen && (
                <div className="modal-backdrop">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>Nuevo Turno</h2>
                            <button className="close-modal-button" onClick={closeModal}>
                                <FaTimes />
                            </button>
                        </div>

                        <form className="modal-form" onSubmit={handleSubmit}>
                            <label>
                                Paciente:
                                <select
                                    name="patient_id"
                                    value={formData.patient_id}
                                    onChange={(e) =>
                                        setFormData({ ...formData, patient_id: e.target.value })
                                    }
                                    required
                                >
                                    <option value="">Seleccione</option>
                                    {patients.map((p) => (
                                        <option key={p.id} value={p.id}>
                                            {p.first_name} {p.last_name}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <label>
                                Médico:
                                <select
                                    name="doctor_id"
                                    value={formData.doctor_id}
                                    onChange={(e) =>
                                        setFormData({ ...formData, doctor_id: e.target.value })
                                    }
                                    required
                                >
                                    <option value="">Seleccione</option>
                                    {doctors.map((d) => (
                                        <option key={d.id} value={d.id}>
                                            {d.first_name} {d.last_name}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <label>
                                Inicio:
                                <input
                                    type="datetime-local"
                                    required
                                    value={formData.start_at}
                                    onChange={(e) =>
                                        setFormData({ ...formData, start_at: e.target.value })
                                    }
                                />
                            </label>

                            <label>
                                Fin:
                                <input
                                    type="datetime-local"
                                    required
                                    value={formData.end_at}
                                    onChange={(e) =>
                                        setFormData({ ...formData, end_at: e.target.value })
                                    }
                                />
                            </label>

                            <label>
                                Notas:
                                <textarea
                                    value={formData.notes}
                                    onChange={(e) =>
                                        setFormData({ ...formData, notes: e.target.value })
                                    }
                                />
                            </label>

                            <button className="submit-button" type="submit">
                                <FaSave /> Crear Turno
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Turnos;
