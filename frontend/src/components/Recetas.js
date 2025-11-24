import React, { useState, useEffect } from "react";
import {
    getPatients,
    getMedicalRecordsByPatient,
    getPrescriptionsByRecord,
    createPrescription,
    updatePrescription,
    deletePrescription
} from "../api/api";

import { FaPills, FaPlus, FaEdit, FaTrashAlt, FaSave, FaTimes } from "react-icons/fa";
import "../styles/Medicos.css";

export default function Recetas() {
    const [patients, setPatients] = useState([]);
    const [records, setRecords] = useState([]);
    const [prescriptions, setPrescriptions] = useState([]);

    const [selectedPatientId, setSelectedPatientId] = useState("");
    const [selectedRecordId, setSelectedRecordId] = useState(null);  // 🔥 NUNCA VACÍO

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const emptyForm = {
        medical_record_id: "",
        medication: "",
        dosage: "",
        frequency: "",
        instructions: ""
    };

    const [formData, setFormData] = useState(emptyForm);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    // ---------------------------------------------------------
    // CARGA INICIAL
    // ---------------------------------------------------------
    useEffect(() => {
        loadPatients();
    }, []);

    const loadPatients = async () => {
        try {
            const res = await getPatients();
            setPatients(res.data);

            if (res.data.length > 0) {
                const firstId = res.data[0].id;
                setSelectedPatientId(firstId);
                loadRecords(firstId);
            }
        } catch {
            setError("Error cargando pacientes");
        } finally {
            setLoading(false);
        }
    };

    // ---------------------------------------------------------
    // CARGAR HISTORIALES
    // ---------------------------------------------------------
    const loadRecords = async (patientId) => {
        const res = await getMedicalRecordsByPatient(patientId);
        setRecords(res.data);

        if (res.data.length > 0) {
            const firstRecordId = res.data[0].id;
            setSelectedRecordId(firstRecordId);
            loadPrescriptions(firstRecordId);
        } else {
            setSelectedRecordId(null);      // 🔥 FIX
            setPrescriptions([]);
        }
    };

    // ---------------------------------------------------------
    // CARGAR RECETAS
    // ---------------------------------------------------------
    const loadPrescriptions = async (recordId) => {
        console.log("loadPrescriptions() → recordId =", recordId);

        if (!recordId) {
            setPrescriptions([]);
            return;
        }

        try {
            const res = await getPrescriptionsByRecord(recordId);
            setPrescriptions(res.data);
        } catch (error) {
            console.error("Error al cargar recetas:", error);
            setPrescriptions([]);
        }
    };

    // ---------------------------------------------------------
    // CAMBIAR PACIENTE / HISTORIAL
    // ---------------------------------------------------------
    const handlePatientChange = (e) => {
        const id = e.target.value;
        setSelectedPatientId(id);
        loadRecords(id);
    };

    const handleRecordChange = (e) => {
        const id = e.target.value || null;    // 🔥 FIX
        setSelectedRecordId(id);
        loadPrescriptions(id);
    };

    // ---------------------------------------------------------
    // FORMULARIO (CREAR / EDITAR)
    // ---------------------------------------------------------
    const openCreate = () => {
        setIsEditing(false);
        setFormData({
            ...emptyForm,
            medical_record_id: ""         // 🔥 usuario selecciona historial en modal
        });
        setIsModalOpen(true);
    };

    const openEdit = (p) => {
        setIsEditing(true);
        setFormData(p);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setFormData(emptyForm);
        setError(null);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    // ---------------------------------------------------------
    // GUARDAR RECETA
    // ---------------------------------------------------------
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.medical_record_id) {
            setError("Debe seleccionar un historial médico.");
            return;
        }

        try {
            if (isEditing) {
                await updatePrescription(formData.id, formData);
            } else {
                await createPrescription(formData);
            }

            loadPrescriptions(formData.medical_record_id);
            closeModal();

        } catch (err) {
            setError(err.response?.data?.detail || "Error guardando receta");
        }
    };

    // ---------------------------------------------------------
    // ELIMINAR RECETA
    // ---------------------------------------------------------
    const handleDelete = async (id) => {
        if (!window.confirm("¿Eliminar esta receta?")) return;

        await deletePrescription(id);
        loadPrescriptions(selectedRecordId);
    };

    // ---------------------------------------------------------
    // RENDER
    // ---------------------------------------------------------
    if (loading) return <p>Cargando...</p>;

    return (
        <div className="crud-container">
            <h1 className="crud-title"><FaPills /> Recetas</h1>

            {/* SELECT PACIENTE Y HISTORIAL */}
            <div className="row mb-3">
                
                <div className="col">
                    <label>Paciente:</label>
                    <select className="form-control"
                        value={selectedPatientId}
                        onChange={handlePatientChange}>

                        {patients.map(p => (
                            <option key={p.id} value={p.id}>
                                {p.last_name}, {p.first_name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="col">
                    <label>Historial:</label>
                    <select className="form-control"
                        value={selectedRecordId || ""}
                        onChange={handleRecordChange}>

                        {records.length === 0 ? (
                            <option value="">No hay historiales</option>
                        ) : (
                            records.map(r => (
                                <option key={r.id} value={r.id}>
                                    {r.record_date} - {r.summary.substring(0, 20)}...
                                </option>
                            ))
                        )}
                    </select>
                </div>

                <div className="col-auto d-flex align-items-end">
                    <button className="add-button" onClick={openCreate}>
                        <FaPlus /> Nueva Receta
                    </button>
                </div>
            </div>

            {/* TABLA */}
            <table className="data-table">
                <thead>
                    <tr>
                        <th>Medicamento</th>
                        <th>Dosis</th>
                        <th>Frecuencia</th>
                        <th>Acciones</th>
                    </tr>
                </thead>

                <tbody>
                    {prescriptions.length === 0 ? (
                        <tr><td colSpan="4">No hay recetas registradas</td></tr>
                    ) : (
                        prescriptions.map(p => (
                            <tr key={p.id}>
                                <td>{p.medication}</td>
                                <td>{p.dosage}</td>
                                <td>{p.frequency}</td>
                                <td className="action-cells">
                                    <button className="action-button edit-button" onClick={() => openEdit(p)}>
                                        <FaEdit />
                                    </button>
                                    <button className="action-button delete-button" onClick={() => handleDelete(p.id)}>
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
                            <h2>{isEditing ? "Editar Receta" : "Nueva Receta"}</h2>
                            <button className="close-modal-button" onClick={closeModal}><FaTimes /></button>
                        </div>

                        <form className="modal-form" onSubmit={handleSubmit}>

                            <label>
                                Historial Médico:
                                <select
                                    name="medical_record_id"
                                    value={formData.medical_record_id || ""}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="">Seleccione un historial…</option>
                                    {records.map(r => (
                                        <option key={r.id} value={r.id}>
                                            {r.record_date} - {r.summary.substring(0, 25)}...
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <label>
                                Medicamento:
                                <input
                                    type="text"
                                    name="medication"
                                    value={formData.medication}
                                    onChange={handleInputChange}
                                    required
                                />
                            </label>

                            <label>
                                Dosis:
                                <input
                                    type="text"
                                    name="dosage"
                                    value={formData.dosage}
                                    onChange={handleInputChange}
                                />
                            </label>

                            <label>
                                Frecuencia:
                                <input
                                    type="text"
                                    name="frequency"
                                    value={formData.frequency}
                                    onChange={handleInputChange}
                                />
                            </label>

                            <label style={{ width: "100%" }}>
                                Instrucciones:
                                <textarea
                                    name="instructions"
                                    value={formData.instructions}
                                    onChange={handleInputChange}
                                ></textarea>
                            </label>

                            {error && <div className="error-message">{error}</div>}

                            <button className="submit-button"><FaSave /> Guardar</button>
                        </form>

                    </div>
                </div>
            )}
        </div>
    );
}
