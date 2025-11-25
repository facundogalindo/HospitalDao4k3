import React, { useEffect, useState } from "react";
import {
    getDoctors,
    getSpecialties,
    createDoctor,
    updateDoctor,
    deleteDoctor
} from "../api/api";

import { FaUserMd, FaPlus, FaEdit, FaTrashAlt, FaSave, FaTimes } from "react-icons/fa";
import "../styles/Medicos.css";

import BotonVolverFlotante from "./BotonFlotante";

export default function Medicos() {
    const [doctors, setDoctors] = useState([]);
    const [specialties, setSpecialties] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const emptyForm = {
        first_name: "",
        last_name: "",
        license_number: "",
        email: "",
        specialties: []
    };

    const [formData, setFormData] = useState(emptyForm);

    // -----------------------------
    // CARGA INICIAL
    // -----------------------------
    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [docs, specs] = await Promise.all([
                getDoctors(),
                getSpecialties()
            ]);

            setDoctors(docs.data);
            setSpecialties(specs.data);
        } catch (err) {
            setError("Error cargando médicos o especialidades");
        } finally {
            setLoading(false);
        }
    };

    // -----------------------------
    // FORMULARIO
    // -----------------------------
    const handleInputChange = (e) => {
        const { name, value } = e.target;

        if (name === "specialties") {
            const selected = Array.from(
                e.target.selectedOptions,
                (opt) => parseInt(opt.value)
            );

            setFormData({ ...formData, specialties: selected });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const openCreate = () => {
        setFormData(emptyForm);
        setIsEditing(false);
        setIsModalOpen(true);
        setError(null);
    };

    const openEdit = (doctor) => {
        setFormData({
            id: doctor.id,
            first_name: doctor.first_name,
            last_name: doctor.last_name,
            license_number: doctor.license_number,
            email: doctor.email,
            specialties: doctor.specialties_ids || []
        });
        setIsEditing(true);
        setIsModalOpen(true);
        setError(null);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setFormData(emptyForm);
        setError(null);
    };

    // -----------------------------
    // GUARDAR
    // -----------------------------
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            if (isEditing) {
                await updateDoctor(formData.id, formData);
            } else {
                await createDoctor(formData);
            }

            loadData();
            closeModal();
        } catch (err) {
            setError(err.response?.data?.detail || "Error al guardar médico");
        }
    };

    // -----------------------------
    // ELIMINAR
    // -----------------------------
    const handleDelete = async (id) => {
        if (!window.confirm("¿Eliminar este médico?")) return;

        try {
            await deleteDoctor(id);
            loadData();
        } catch {
            alert("Error eliminando médico");
        }
    };

    // -----------------------------
    // RENDER
    // -----------------------------
    if (loading) return <p>Cargando...</p>;

    return (
        <div className="crud-container">

            <h1 className="crud-title">
                <FaUserMd /> Gestión de Médicos
            </h1>

            <BotonVolverFlotante />

            <button className="add-button" onClick={openCreate}>
                <FaPlus /> Agregar Médico
            </button>

            <table className="data-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nombre completo</th>
                        <th>Matrícula</th>
                        <th>Email</th>
                        <th>Especialidades</th>
                        <th>Acciones</th>
                    </tr>
                </thead>

                <tbody>
                    {doctors.length === 0 ? (
                        <tr>
                            <td colSpan="6">No hay médicos registrados</td>
                        </tr>
                    ) : (
                        doctors.map((doc) => (
                            <tr key={doc.id}>
                                <td>{doc.id}</td>
                                <td>{doc.first_name} {doc.last_name}</td>
                                <td>{doc.license_number}</td>
                                <td>{doc.email}</td>

                                {/* ⭐⭐ ACÁ ESTÁ LA PARTE CORRECTA ⭐⭐ */}
                                <td className="specialties-cell">
                                    {doc.specialties && doc.specialties.length > 0
                                        ? doc.specialties.map(s => s.name).join(", ")
                                        : "—"}
                                </td>

                                <td className="action-cells">
                                    <button
                                        className="action-button edit-button"
                                        onClick={() => openEdit(doc)}
                                    >
                                        <FaEdit />
                                    </button>

                                    <button
                                        className="action-button delete-button"
                                        onClick={() => handleDelete(doc.id)}
                                    >
                                        <FaTrashAlt />
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>

            {/* ---------------- MODAL ---------------- */}

            {isModalOpen && (
                <div className="modal-backdrop">
                    <div className="modal-content">

                        <div className="modal-header">
                            <h2>{isEditing ? "Editar Médico" : "Nuevo Médico"}</h2>
                            <button className="close-modal-button" onClick={closeModal}>
                                <FaTimes />
                            </button>
                        </div>

                        <form className="modal-form" onSubmit={handleSubmit}>

                            <label>
                                Nombre:
                                <input
                                    type="text"
                                    name="first_name"
                                    value={formData.first_name}
                                    onChange={handleInputChange}
                                    required
                                />
                            </label>

                            <label>
                                Apellido:
                                <input
                                    type="text"
                                    name="last_name"
                                    value={formData.last_name}
                                    onChange={handleInputChange}
                                    required
                                />
                            </label>

                            <label>
                                Matrícula:
                                <input
                                    type="text"
                                    name="license_number"
                                    value={formData.license_number}
                                    onChange={handleInputChange}
                                    required
                                />
                            </label>

                            <label>
                                Email:
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    required
                                />
                            </label>

                            <label>
                                Especialidades:
                                <select
                                    name="specialties"
                                    multiple
                                    value={formData.specialties}
                                    onChange={handleInputChange}
                                    className="multi-select"
                                >
                                    {specialties.map((s) => (
                                        <option key={s.id} value={s.id}>
                                            {s.name}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            {error && <div className="error-message">{error}</div>}

                            <button className="submit-button">
                                <FaSave /> Guardar
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
