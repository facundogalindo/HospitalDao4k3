import React, { useState, useEffect } from 'react';
// Importamos las funciones CRUD para pacientes
import { getPatients, createPatient, updatePatient, deletePatient } from '../api/api';
import { FaEdit, FaTrashAlt, FaPlus, FaTimes, FaSave, FaUserInjured } from 'react-icons/fa';
import '../styles/Medicos.css'; // Reutilizamos los estilos base de gestión de tablas
import BotonVolverFlotante from './BotonFlotante';
const initialFormData = {
    first_name: '',
    last_name: '',
    birth_date: '', // Formato 'YYYY-MM-DD'
    gender: 'Masculino',
    email: '',
    phone: '',
    address: '',
};

const Pacientes = () => {
    const [patients, setPatients] = useState([]);
    const [formData, setFormData] = useState(initialFormData);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // -------------------
    // 1. Carga de Datos (READ)
    // -------------------
    const fetchPatients = async () => {
        setLoading(true);
        try {
            const response = await getPatients();
            setPatients(response.data);
            setError(null);
        } catch (err) {
            console.error("Error al obtener pacientes:", err);
            setError("Error al cargar la lista de pacientes. Intente de nuevo.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPatients();
    }, []);

    // -------------------
    // 2. Manejo de Formularios y Modales
    // -------------------
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const openCreateModal = () => {
        setIsEditing(false);
        setFormData(initialFormData);
        setIsModalOpen(true);
    };

    const openEditModal = (patient) => {
        setIsEditing(true);
        // Prepara los datos para la edición. La fecha debe estar en formato YYYY-MM-DD.
        const formattedDate = patient.birth_date ? new Date(patient.birth_date).toISOString().split('T')[0] : '';
        setFormData({
            ...patient,
            birth_date: formattedDate,
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setFormData(initialFormData);
        setIsEditing(false);
    };

    // -------------------
    // 3. Crear / Actualizar (CREATE / UPDATE)
    // -------------------
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                // Actualizar (PUT)
                await updatePatient(formData.id, formData);
            } else {
                // Crear (POST)
                await createPatient(formData);
            }
            fetchPatients(); // Recargar la lista
            closeModal();
        } catch (err) {
            console.error("Error al guardar paciente:", err);
            setError(`Error al guardar: ${err.response?.data?.detail || 'Hubo un error en la conexión.'}`);
        }
    };

    // -------------------
    // 4. Eliminar (DELETE)
    // -------------------
    const handleDelete = async (id, name) => {
        if (window.confirm(`¿Estás seguro de eliminar al paciente ${name}?`)) {
            try {
                await deletePatient(id);
                fetchPatients();
            } catch (err) {
                console.error("Error al eliminar paciente:", err);
                setError(`Error al eliminar: ${err.response?.data?.detail || 'Hubo un error.'}`);
            }
        }
    };

    if (loading) return <p className="loading-message">Cargando pacientes...</p>;
    
    // -------------------
    // 5. Renderizado
    // -------------------
    return (
        <div className="crud-container">
            <h1 className="crud-title">
                <FaUserInjured /> Gestión de Pacientes
            </h1>

            <BotonVolverFlotante />

            {error && <div className="error-message">{error}</div>}

            <button className="add-button" onClick={openCreateModal}>
                <FaPlus /> Nuevo Paciente
            </button>

            {/* TABLA DE PACIENTES */}
            <div className="table-responsive">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nombre Completo</th>
                            <th>Email</th>
                            <th>Teléfono</th>
                            <th>Fecha Nac.</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {patients.map(patient => (
                            <tr key={patient.id}>
                                <td>{patient.id}</td>
                                <td>{patient.first_name} {patient.last_name}</td>
                                <td>{patient.email}</td>
                                <td>{patient.phone}</td>
                                <td>{patient.birth_date}</td>
                                <td className="action-cells">
                                    <button 
                                        className="action-button edit-button" 
                                        onClick={() => openEditModal(patient)}
                                        title="Editar"
                                    >
                                        <FaEdit />
                                    </button>
                                    <button 
                                        className="action-button delete-button" 
                                        onClick={() => handleDelete(patient.id, `${patient.first_name} ${patient.last_name}`)}
                                        title="Eliminar"
                                    >
                                        <FaTrashAlt />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* MODAL PARA CREAR/EDITAR PACIENTE */}
            {isModalOpen && (
                <div className="modal-backdrop">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>{isEditing ? 'Editar Paciente' : 'Nuevo Paciente'}</h2>
                            <button className="close-modal-button" onClick={closeModal}>
                                <FaTimes />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="modal-form">
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
                                Fecha de Nacimiento:
                                <input
                                    type="date"
                                    name="birth_date"
                                    value={formData.birth_date}
                                    onChange={handleInputChange}
                                    required
                                />
                            </label>
                            <label>
                                Género:
                                <select
                                    name="gender"
                                    value={formData.gender}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="Masculino">Masculino</option>
                                    <option value="Femenino">Femenino</option>
                                    <option value="Otro">Otro</option>
                                </select>
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
                                Teléfono:
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    required
                                />
                            </label>
                            <label>
                                Dirección:
                                <textarea
                                    name="address"
                                    value={formData.address || ''}
                                    onChange={handleInputChange}
                                ></textarea>
                            </label>
                            
                            <button type="submit" className="submit-button">
                                <FaSave /> {isEditing ? 'Guardar Cambios' : 'Crear Paciente'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Pacientes;