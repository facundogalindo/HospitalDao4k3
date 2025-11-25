import React, { useState, useEffect } from "react";
import {
    getDoctors,
    getWorkingHoursByDoctor,
    createWorkingHour,
    updateWorkingHour,
    deleteWorkingHour
} from "../api/api";

import { FaClock, FaPlus, FaEdit, FaTrashAlt, FaSave, FaTimes } from "react-icons/fa";
import "../styles/Medicos.css";

import BotonVolverFlotante from "./BotonFlotante";

const WEEKDAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

export default function HorariosTrabajo() {

    const [doctors, setDoctors] = useState([]);
    const [doctorId, setDoctorId] = useState("");   // SIEMPRE se guardará un número limpio

    const [workingHours, setWorkingHours] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const emptyForm = {
        doctor_id: "",
        weekday: "",
        start_time: "08:00",
        end_time: "12:00"
    };

    const [formData, setFormData] = useState(emptyForm);

    // --------------------------
    // CARGA INICIAL
    // --------------------------
    useEffect(() => {
        loadDoctors();
    }, []);

    const loadDoctors = async () => {
        try {
            const res = await getDoctors();
            setDoctors(res.data);

            if (res.data.length > 0) {
                const firstId = parseInt(res.data[0].id);
                setDoctorId(firstId);
                loadWorkingHours(firstId);
            }
        } catch (err) {
            setError("Error cargando médicos");
        } finally {
            setLoading(false);
        }
    };

    // --------------------------
    // CARGAR HORARIOS
    // --------------------------
    const loadWorkingHours = async (id) => {
        try {
            const cleanId = parseInt(id);

            const res = await getWorkingHoursByDoctor(cleanId);

            setWorkingHours(res.data);
        } catch (err) {
            console.log("API ERROR:", err);
            setError("Error cargando horarios");
        }
    };

    // --------------------------
    // CAMBIO DE MÉDICO
    // --------------------------
    const handleDoctorChange = (e) => {
        const cleanId = parseInt(e.target.value);   // ← ACÁ SE SOLUCIONA
        setDoctorId(cleanId);
        loadWorkingHours(cleanId);
    };

    // --------------------------
    // FORMULARIO
    // --------------------------
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
        setError(null);
    };

    const openCreate = () => {
        setIsEditing(false);
        setFormData({
            ...emptyForm,
            doctor_id: doctorId
        });
        setIsModalOpen(true);
    };

    const openEdit = (wh) => {
        setIsEditing(true);
        setFormData({
            doctor_id: wh.doctor_id,
            weekday: wh.weekday,
            start_time: wh.start_time.substring(0, 5),
            end_time: wh.end_time.substring(0, 5),
            id: wh.id
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setFormData(emptyForm);
        setError(null);
    };

    // --------------------------
    // GUARDAR HORARIO
    // --------------------------
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.weekday) {
            setError("Seleccione un día.");
            return;
        }
        if (formData.start_time >= formData.end_time) {
            setError("La hora de inicio debe ser menor a la hora fin.");
            return;
        }

        const payload = {
            doctor_id: parseInt(doctorId),
            weekday: formData.weekday,
            start_time: formData.start_time + ":00",
            end_time: formData.end_time + ":00",
        };

        try {
            if (isEditing) {
                await updateWorkingHour(formData.id, payload);
            } else {
                await createWorkingHour(payload);
            }

            loadWorkingHours(doctorId);
            closeModal();

        } catch (err) {
            const apiMsg = err.response?.data?.detail || "Error al guardar horario";
            setError(apiMsg);
        }
    };

    // --------------------------
    // ELIMINAR
    // --------------------------
    const handleDelete = async (id) => {
        if (!window.confirm("¿Eliminar este horario de trabajo?")) return;

        try {
            await deleteWorkingHour(id);
            loadWorkingHours(doctorId);
        } catch {
            setError("No se pudo eliminar el horario.");
        }
    };

    // --------------------------
    // RENDER
    // --------------------------
    if (loading) return <p className="loading-message">Cargando...</p>;

    return (
        <div className="crud-container">

            <h1 className="crud-title">
                <FaClock /> Horarios de Trabajo
            </h1>

            <BotonVolverFlotante />

            {error && <div className="error-message">{error}</div>}

            {/* SELECT MÉDICO */}
            <div className="mb-3">
                <label>Médico:</label>
                <select
                    className="form-control"
                    value={doctorId}
                    onChange={handleDoctorChange}
                    style={{ width: "300px" }}
                >
                    {doctors.map(d => (
                        <option key={d.id} value={parseInt(d.id)}>
                            {d.last_name}, {d.first_name}
                        </option>
                    ))}
                </select>

                <button className="add-button" style={{ marginLeft: 20 }} onClick={openCreate}>
                    <FaPlus /> Nuevo Horario
                </button>
            </div>

            {/* TABLA */}
            <table className="data-table">
                <thead>
                    <tr>
                        <th>Día</th>
                        <th>Inicio</th>
                        <th>Fin</th>
                        <th>Acciones</th>
                    </tr>
                </thead>

                <tbody>
                    {workingHours.length === 0 ? (
                        <tr>
                            <td colSpan="4">No hay horarios configurados</td>
                        </tr>
                    ) : (
                        workingHours.map(wh => (
                            <tr key={wh.id}>
                                <td>{wh.weekday}</td>
                                <td>{wh.start_time.substring(0, 5)}</td>
                                <td>{wh.end_time.substring(0, 5)}</td>

                                <td className="action-cells">
                                    <button className="action-button edit-button" onClick={() => openEdit(wh)}>
                                        <FaEdit />
                                    </button>

                                    <button className="action-button delete-button" onClick={() => handleDelete(wh.id)}>
                                        <FaTrashAlt />
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>

            {/* MODAL */}
            {isModalOpen && (
                <div className="modal-backdrop">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>{isEditing ? "Editar Horario" : "Nuevo Horario"}</h2>
                            <button className="close-modal-button" onClick={closeModal}>
                                <FaTimes />
                            </button>
                        </div>

                        <form className="modal-form" onSubmit={handleSubmit}>
                            <label>
                                Día:
                                <select
                                    name="weekday"
                                    value={formData.weekday}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="">Seleccione</option>
                                    {WEEKDAYS.map(d => (
                                        <option key={d} value={d}>{d}</option>
                                    ))}
                                </select>
                            </label>

                            <label>
                                Hora inicio:
                                <input
                                    type="time"
                                    name="start_time"
                                    value={formData.start_time}
                                    onChange={handleInputChange}
                                    required
                                />
                            </label>

                            <label>
                                Hora fin:
                                <input
                                    type="time"
                                    name="end_time"
                                    value={formData.end_time}
                                    onChange={handleInputChange}
                                    required
                                />
                            </label>

                            {error && <p className="error-message">{error}</p>}

                            <button className="submit-button"><FaSave /> Guardar</button>
                        </form>

                    </div>
                </div>
            )}

        </div>
    );
}
