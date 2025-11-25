import React, { useState, useEffect } from 'react';
// Importamos las funciones CRUD para especialidades
import { getSpecialties, createSpecialty, updateSpecialty, deleteSpecialty } from '../api/api';
import { FaEdit, FaTrashAlt, FaPlus, FaTimes, FaSave, FaStethoscope } from 'react-icons/fa';
import '../styles/Medicos.css'; // Reutilizamos los estilos CRUD
import BotonVolverFlotante from './BotonFlotante';

const initialFormData = {
    name: '',
    description: '',
};


const Especialidades = () => {
    const [specialties, setSpecialties] = useState([]);
    const [formData, setFormData] = useState(initialFormData);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // -------------------
    // 1. Carga de Datos (READ)
    // -------------------
    const fetchSpecialties = async () => {
        setLoading(true);
        try {
            const response = await getSpecialties();
            setSpecialties(response.data);
            setError(null);
        } catch (err) {
            console.error("Error al obtener especialidades:", err);
            setError("Error al cargar la lista de especialidades. Intente de nuevo.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSpecialties();
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

    const openEditModal = (specialty) => {
        setIsEditing(true);
        setFormData(specialty);
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
            // Quitamos la descripción si está vacía para evitar errores de validación de pydantic si la espera
            const dataToSend = {
                name: formData.name,
                description: formData.description || null, 
            };
            
            if (isEditing) {
                // Actualizar (PUT)
                await updateSpecialty(formData.id, dataToSend);
            } else {
                // Crear (POST)
                await createSpecialty(dataToSend);
            }
            fetchSpecialties(); // Recargar la lista
            closeModal();
        } catch (err) {
            console.error("Error al guardar especialidad:", err);
            setError(`Error al guardar: ${err.response?.data?.detail || 'Hubo un error en la conexión.'}`);
        }
    };

    // -------------------
    // 4. Eliminar (DELETE)
    // -------------------
    const handleDelete = async (id, name) => {
        if (window.confirm(`¿Estás seguro de eliminar la especialidad ${name}? Esto afectará a los médicos asociados.`)) {
            try {
                await deleteSpecialty(id);
                fetchSpecialties();
            } catch (err) {
                console.error("Error al eliminar especialidad:", err);
                setError(`Error al eliminar: ${err.response?.data?.detail || 'Hubo un error.'}`);
            }
        }
    };

    if (loading) return <p className="loading-message">Cargando especialidades...</p>;
    
    // -------------------
    // 5. Renderizado
    // -------------------
    return (
        <div className="crud-container">
            <h1 className="crud-title">
                <FaStethoscope /> Gestión de Especialidades
            </h1>

            <BotonVolverFlotante />

            {error && <div className="error-message">{error}</div>}

            <button className="add-button" onClick={openCreateModal}>
                <FaPlus /> Nueva Especialidad
            </button>

            {/* TABLA DE ESPECIALIDADES */}
            <div className="table-responsive">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nombre</th>
                            <th>Descripción</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {specialties.map(specialty => (
                            <tr key={specialty.id}>
                                <td>{specialty.id}</td>
                                <td>{specialty.name}</td>
                                <td>{specialty.description || 'N/A'}</td>
                                <td className="action-cells">
                                    <button 
                                        className="action-button edit-button" 
                                        onClick={() => openEditModal(specialty)}
                                        title="Editar"
                                    >
                                        <FaEdit />
                                    </button>
                                    <button 
                                        className="action-button delete-button" 
                                        onClick={() => handleDelete(specialty.id, specialty.name)}
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

            {/* MODAL PARA CREAR/EDITAR ESPECIALIDAD */}
            {isModalOpen && (
                <div className="modal-backdrop">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>{isEditing ? 'Editar Especialidad' : 'Nueva Especialidad'}</h2>
                            <button className="close-modal-button" onClick={closeModal}>
                                <FaTimes />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="modal-form">
                            <label>
                                Nombre:
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                />
                            </label>
                            <label>
                                Descripción (Opcional):
                                <textarea
                                    name="description"
                                    value={formData.description || ''}
                                    onChange={handleInputChange}
                                ></textarea>
                            </label>
                            
                            <button type="submit" className="submit-button">
                                <FaSave /> {isEditing ? 'Guardar Cambios' : 'Crear Especialidad'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Especialidades;