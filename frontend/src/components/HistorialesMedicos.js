import React, { useState, useEffect } from 'react';
import {
    getPatients,
    getDoctors,
    getMedicalRecordsByPatient,
    createMedicalRecord,
    updateMedicalRecord,
    deleteMedicalRecord,
    getPrescriptionsByRecord,
    createPrescription,
    deletePrescription
} from '../api/api';

import { FaPlus, FaEdit, FaTrashAlt, FaSave, FaTimes, FaPills } from 'react-icons/fa';
import '../styles/Medicos.css'; // estilos base

export default function HistorialesMedicos() {

    // ---------------------------
    // ESTADOS
    // ---------------------------
    const [patients, setPatients] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [selectedPatientId, setSelectedPatientId] = useState('');
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Modal historial
    const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
    const [isEditingRecord, setIsEditingRecord] = useState(false);

    // Formulario historial
    const emptyRecord = {
        patient_id: '',
        doctor_id: '',
        record_date: new Date().toISOString().split("T")[0],
        summary: ""
    };
    const [recordForm, setRecordForm] = useState(emptyRecord);

    // Modal recetas
    const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false);
    const [prescriptions, setPrescriptions] = useState([]);
    const [activeRecordId, setActiveRecordId] = useState(null);

    // Formulario receta
    const emptyPrescription = {
        medical_record_id: null,
        medication: "",
        dosage: "",
        frequency: "",
        instructions: ""
    };
    const [prescriptionForm, setPrescriptionForm] = useState(emptyPrescription);

    // ---------------------------
    // CARGA INICIAL
    // ---------------------------
    useEffect(() => {
        loadInitialData();
    }, []);

    const loadInitialData = async () => {
        try {
            const [pat, doc] = await Promise.all([getPatients(), getDoctors()]);
            setPatients(pat.data);
            setDoctors(doc.data);

            if (pat.data.length > 0) {
                setSelectedPatientId(pat.data[0].id);
                loadRecords(pat.data[0].id);
            }
        } catch (err) {
            setError("No se pudieron cargar pacientes o médicos");
        } finally {
            setLoading(false);
        }
    };

    // ---------------------------
    // CARGAR HISTORIALES
    // ---------------------------
    const loadRecords = async (patientId) => {
        try {
            const res = await getMedicalRecordsByPatient(patientId);
            setRecords(res.data);
        } catch {
            setError("Error al cargar historial");
        }
    };

    // ---------------------------
    // CAMBIO DE PACIENTE
    // ---------------------------
    const handlePatientChange = (e) => {
        setSelectedPatientId(e.target.value);
        loadRecords(e.target.value);
    };

    // ---------------------------
    // FORMULARIO HISTORIAL
    // ---------------------------
    const handleRecordChange = (e) => {
        setRecordForm({
            ...recordForm,
            [e.target.name]: e.target.value
        });
    };

    const openCreateRecord = () => {
        setIsEditingRecord(false);
        setRecordForm({
            ...emptyRecord,
            patient_id: selectedPatientId,
            doctor_id: doctors.length > 0 ? doctors[0].id : ""
        });
        setIsRecordModalOpen(true);
    };

    const openEditRecord = async (record) => {
        setIsEditingRecord(true);
        setRecordForm(record);
        await openPrescriptions(record.id);
        setIsRecordModalOpen(true);
    };

    const saveRecord = async (e) => {
        e.preventDefault();
        try {
            if (isEditingRecord) {
                await updateMedicalRecord(recordForm.id, recordForm);
            } else {
                await createMedicalRecord(recordForm);
            }
            loadRecords(selectedPatientId);
            closeRecordModal();
        } catch (err) {
            setError("Error al guardar historial");
        }
    };

    const deleteRecordAction = async (id) => {
        if (!window.confirm("Eliminar este historial?")) return;
        try {
            await deleteMedicalRecord(id);
            loadRecords(selectedPatientId);
        } catch {
            setError("Error al eliminar historial");
        }
    };

    const closeRecordModal = () => {
        setIsRecordModalOpen(false);
        setRecordForm(emptyRecord);
        setPrescriptions([]);
        setActiveRecordId(null);
    };

    // ---------------------------
    // RECETAS
    // ---------------------------
    const openPrescriptions = async (recordId) => {
        setActiveRecordId(recordId);
        const res = await getPrescriptionsByRecord(recordId);
        setPrescriptions(res.data);
    };

    const handlePrescriptionChange = (e) => {
        setPrescriptionForm({
            ...prescriptionForm,
            [e.target.name]: e.target.value
        });
    };

    const savePrescription = async (e) => {
        e.preventDefault();
        try {
            await createPrescription({
                ...prescriptionForm,
                medical_record_id: activeRecordId
            });
            const res = await getPrescriptionsByRecord(activeRecordId);
            setPrescriptions(res.data);
            setPrescriptionForm(emptyPrescription);
        } catch {
            alert("Error al crear receta");
        }
    };

    const deletePrescriptionAction = async (id) => {
        if (!window.confirm("Eliminar receta?")) return;
        await deletePrescription(id);
        const res = await getPrescriptionsByRecord(activeRecordId);
        setPrescriptions(res.data);
    };

    // ---------------------------
    // RENDER
    // ---------------------------
    if (loading) return <p className="loading-message">Cargando...</p>;

    return (
        <div className="crud-container">

            {/* TÍTULO */}
            <h1 className="crud-title"><FaPills /> Historial Clínico</h1>

            {/* SELECTOR PACIENTE */}
            <div className="mb-3">
                <label style={{ fontWeight: "bold" }}>Paciente:</label>
                <select
                    value={selectedPatientId}
                    onChange={handlePatientChange}
                    className="form-control"
                    style={{ maxWidth: "300px" }}
                >
                    {patients.map(p => (
                        <option key={p.id} value={p.id}>
                            {p.last_name}, {p.first_name}
                        </option>
                    ))}
                </select>

                <button className="add-button" style={{ marginLeft: 20 }} onClick={openCreateRecord}>
                    <FaPlus /> Nuevo Registro
                </button>
            </div>

            {/* TABLA HISTORIALES */}
            <div className="table-responsive">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Fecha</th>
                            <th>Médico</th>
                            <th>Resumen</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {records.length === 0 ? (
                            <tr><td colSpan="4">No hay registros</td></tr>
                        ) : (
                            records.map(r => (
                                <tr key={r.id}>
                                    <td>{r.record_date}</td>
                                    <td>{doctors.find(d => d.id === r.doctor_id)?.last_name}</td>
                                    <td>{r.summary}</td>
                                    <td className="action-cells">
                                        <button
                                            className="action-button edit-button"
                                            onClick={() => openEditRecord(r)}
                                        >
                                            <FaEdit />
                                        </button>

                                        <button
                                            className="action-button delete-button"
                                            onClick={() => deleteRecordAction(r.id)}
                                        >
                                            <FaTrashAlt />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* MODAL HISTORIAL */}
            {isRecordModalOpen && (
                <div className="modal-backdrop">
                    <div className="modal-content">

                        <div className="modal-header">
                            <h2>{isEditingRecord ? "Editar Historial" : "Nuevo Historial"}</h2>
                            <button className="close-modal-button" onClick={closeRecordModal}><FaTimes /></button>
                        </div>

                        <form className="modal-form" onSubmit={saveRecord}>

                            <label>
                                Fecha:
                                <input name="record_date" type="date"
                                    value={recordForm.record_date}
                                    onChange={handleRecordChange}
                                    required />
                            </label>

                            <label>
                                Médico:
                                <select name="doctor_id" value={recordForm.doctor_id}
                                    onChange={handleRecordChange} required>
                                    <option value="">Seleccione</option>
                                    {doctors.map(d => (
                                        <option key={d.id} value={d.id}>
                                            {d.last_name}, {d.first_name}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <label style={{ width: "100%" }}>
                                Resumen:
                                <textarea
                                    name="summary"
                                    value={recordForm.summary}
                                    onChange={handleRecordChange}
                                    required
                                ></textarea>
                            </label>

                            <button className="submit-button"><FaSave /> Guardar</button>
                        </form>

                        {/* ===================== */}
                        {/* RECETAS (solo si editás) */}
                        {/* ===================== */}
                        {isEditingRecord && (
                            <>
                                <hr />
                                <h3><FaPills /> Recetas</h3>

                                {/* Tabla recetas */}
                                <table className="data-table small-table">
                                    <thead>
                                        <tr>
                                            <th>Medicamento</th>
                                            <th>Dosis</th>
                                            <th>Frecuencia</th>
                                            <th>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {prescriptions.map(p => (
                                            <tr key={p.id}>
                                                <td>{p.medication}</td>
                                                <td>{p.dosage}</td>
                                                <td>{p.frequency}</td>
                                                <td>
                                                    <button
                                                        className="action-button delete-button"
                                                        onClick={() => deletePrescriptionAction(p.id)}
                                                    >
                                                        <FaTrashAlt />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                {/* Nuevo receta */}
                                <h4>Agregar Receta</h4>
                                <form className="modal-form" onSubmit={savePrescription}>
                                    <label>
                                        Medicamento:
                                        <input
                                            type="text"
                                            name="medication"
                                            value={prescriptionForm.medication}
                                            onChange={handlePrescriptionChange}
                                            required />
                                    </label>

                                    <label>
                                        Dosis:
                                        <input
                                            type="text"
                                            name="dosage"
                                            value={prescriptionForm.dosage}
                                            onChange={handlePrescriptionChange} />
                                    </label>

                                    <label>
                                        Frecuencia:
                                        <input
                                            type="text"
                                            name="frequency"
                                            value={prescriptionForm.frequency}
                                            onChange={handlePrescriptionChange} />
                                    </label>

                                    <label style={{ width: "100%" }}>
                                        Instrucciones:
                                        <textarea
                                            name="instructions"
                                            value={prescriptionForm.instructions}
                                            onChange={handlePrescriptionChange}
                                        ></textarea>
                                    </label>

                                    <button className="add-button">
                                        <FaPlus /> Agregar Receta
                                    </button>
                                </form>
                            </>
                        )}
                    </div>
                </div>
            )}

        </div>
    );
}
