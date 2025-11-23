import React, { useState, useEffect } from 'react';
import moment from 'moment';
import { 
    getAppointments, 
    createAppointment, 
    updateAppointmentStatus, // Usaremos esta función para cambiar estado y attended
    deleteAppointment,
    getPatients,
    getDoctors
} from '../api/api';
import { FaEdit, FaTrashAlt, FaPlus, FaTimes, FaSave, FaCalendarCheck, FaCheck, FaTimesCircle } from 'react-icons/fa';
import '../styles/Medicos.css'; // Mantenemos el mismo estilo

// Constantes
const initialFormData = {
    patient_id: '',
    doctor_id: '',
    start_at: '', // Formato ISO para backend
    end_at: '',   // Formato ISO para backend
    notes: '',
    status: 'SCHEDULED',
    attended: false,
};

// Mapeo de estados del turno para mostrar en la interfaz
const STATUS_MAP = {
    SCHEDULED: 'Programado',
    CONFIRMED: 'Confirmado',
    COMPLETED: 'Completado',
    CANCELLED: 'Cancelado',
    NO_SHOW: 'Ausente',
};

const Turnos = () => {
    const [appointments, setAppointments] = useState([]);
    const [patients, setPatients] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [formData, setFormData] = useState(initialFormData);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // -------------------
    // 1. Carga de Datos y Catálogos
    // -------------------
    const fetchData = async () => {
        setLoading(true);
        try {
            const [appRes, patRes, docRes] = await Promise.all([
                getAppointments(), 
                getPatients(), 
                getDoctors()
            ]);
            
            // Asumiendo que el backend nos devuelve el nombre del paciente y médico
            // Si no, tendremos que hacer un mapeo aquí, pero por simplicidad,
            // asumimos que el backend proporciona un campo 'patient' y 'doctor' con nombres.
            // Si no es el caso, el mapeo de abajo ayudará a mostrar el nombre.
            
            const patientMap = patRes.data.reduce((acc, p) => ({ ...acc, [p.id]: `${p.first_name} ${p.last_name}` }), {});
            const doctorMap = docRes.data.reduce((acc, d) => ({ ...acc, [d.id]: `${d.first_name} ${d.last_name}` }), {});
            
            setPatients(patRes.data);
            setDoctors(docRes.data);
            
            const appointmentsWithNames = appRes.data.map(app => ({
                ...app,
                patient_name: patientMap[app.patient_id] || 'Paciente Desconocido',
                doctor_name: doctorMap[app.doctor_id] || 'Médico Desconocido',
            }));
            
            setAppointments(appointmentsWithNames);
            setError(null);
        } catch (err) {
            console.error("Error al obtener datos:", err);
            setError("Error al cargar los datos necesarios (Turnos, Pacientes o Médicos).");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // -------------------
    // 2. Manejo de Formularios y Modales
    // -------------------
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ 
            ...prev, 
            [name]: type === 'checkbox' ? checked : value 
        }));
    };
    
    // Función para obtener la fecha y hora en formato local para el input
    const toLocalDatetime = (isoString) => {
        return moment(isoString).format('YYYY-MM-DDTHH:mm');
    };

    const openCreateModal = () => {
        setIsEditing(false);
        setFormData(initialFormData);
        setIsModalOpen(true);
    };

    // La edición de turnos es compleja (debería ser PATCH en vez de PUT). 
    // Por simplicidad en este CRUD, solo permitiremos la creación y el cambio de estado.
    // Para una edición completa (cambiar hora, paciente, médico), se haría un PUT completo.
    const openEditModal = (appointment) => {
        setIsEditing(true);
        setFormData({
            ...appointment,
            // Convertir las fechas ISO del backend al formato local para el input datetime-local
            start_at: toLocalDatetime(appointment.start_at),
            end_at: toLocalDatetime(appointment.end_at),
            
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setFormData(initialFormData);
        setIsEditing(false);
    };

    // -------------------
    // 3. Crear / Actualizar Estado (CREATE / UPDATE)
    // -------------------
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Convertir a int los IDs
            const dataToSend = {
                ...formData,
                patient_id: parseInt(formData.patient_id),
                doctor_id: parseInt(formData.doctor_id),
                // Los campos de fecha ya deben estar en formato ISO para el backend (gracias a toLocalDatetime y moment)
            };
            
            // Para la edición, solo permitiremos cambiar el estado (status)
            if (isEditing) {
                // El backend tiene un endpoint PATCH para estado.
                // Usaremos esta función si solo queremos cambiar el status/attended.
                // Si la edición fuera completa (cambiar hora), necesitaríamos un PUT.
                // Aquí, usamos la función de creación (POST) si se editan los campos principales.
                
                // Opción 1: Si solo editamos status, usamos PATCH
                // await updateAppointmentStatus(formData.id, formData.status);

                // Opción 2: Si el formulario de edición permite cambiar datos principales, 
                // necesitarías un endpoint PUT completo en FastAPI que tome AppointmentUpdate.
                // Como no lo tenemos, y para evitar borrar datos, lanzamos un error o solo permitimos la creación.
                // Por ahora, asumiremos que si editamos, enviamos un POST/PUT completo (lo que sea que espere tu API).
                // **Nota:** Si tu API de turnos no tiene un PUT, esta parte fallará.
                // La solución más limpia es tener un PUT/PATCH para edición de data, y un PATCH para solo status.
                
                // **ASUMO que tu API tiene un endpoint PUT en /appointments/{id}**
                // Si no es el caso, déjame saber.
                // await updateAppointment(formData.id, dataToSend); 
                
                // Por ahora, solo permitiremos crear para evitar complejidad de PUT/PATCH.
                throw new Error("La edición completa de Turnos no está implementada completamente en este frontend. Por favor, cancela y crea uno nuevo.");


            } else {
                // Crear (POST)
                await createAppointment(dataToSend);
            }
            fetchData(); // Recargar la lista
            closeModal();
        } catch (err) {
            console.error("Error al guardar turno:", err);
            // El backend debe devolver un error 400 con el mensaje de solapamiento
            const message = err.response?.data?.detail || err.message || 'Hubo un error al guardar el turno. Revisa la consola para más detalles.';
            setError(message);
        }
    };

    // Función para cambiar solo el estado (CANCELADO o COMPLETADO/AUSENTE)
    const handleStatusChange = async (appointment, newStatus, attended) => {
        if (!window.confirm(`¿Estás seguro de cambiar el estado del turno de ${appointment.patient_name} a ${STATUS_MAP[newStatus]}?`)) {
            return;
        }

        try {
            // Llama al endpoint PATCH /appointments/{id}/status que tienes en FastAPI
            await updateAppointmentStatus(appointment.id, newStatus, attended);
            fetchData();
        } catch (err) {
            console.error("Error al cambiar estado:", err);
            setError(`Error al cambiar estado: ${err.response?.data?.detail || 'Hubo un error en la conexión.'}`);
        }
    };

    // -------------------
    // 4. Eliminar (DELETE)
    // -------------------
    const handleDelete = async (id, patientName) => {
        if (window.confirm(`¿Estás seguro de eliminar el turno de ${patientName}?`)) {
            try {
                await deleteAppointment(id);
                fetchData();
            } catch (err) {
                console.error("Error al eliminar turno:", err);
                setError(`Error al eliminar: ${err.response?.data?.detail || 'Hubo un error.'}`);
            }
        }
    };

    if (loading) return <p className="loading-message">Cargando turnos...</p>;
    
    // -------------------
    // 5. Renderizado
    // -------------------
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
                            <th>Fecha/Hora Inicio</th>
                            <th>Duración</th>
                            <th>Estado</th>
                            <th>Asistió</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {appointments.map(app => (
                            <tr key={app.id}>
                                <td>{app.id}</td>
                                <td>{app.patient_name}</td>
                                <td>{app.doctor_name}</td>
                                <td>{moment(app.start_at).format('DD/MM/YYYY HH:mm')}</td>
                                <td>
                                    {moment.duration(moment(app.end_at).diff(moment(app.start_at))).asMinutes()} min
                                </td>
                                <td>{STATUS_MAP[app.status] || app.status}</td>
                                <td>
                                    {app.attended ? <FaCheck style={{ color: 'green' }} /> : <FaTimesCircle style={{ color: 'red' }} />}
                                </td>
                                <td className="action-cells">
                                    {/* Botones de acción contextuales */}
                                    {app.status === 'SCHEDULED' || app.status === 'CONFIRMED' ? (
                                        <>
                                            <button 
                                                className="action-button edit-button" 
                                                onClick={() => handleStatusChange(app, 'COMPLETED', true)}
                                                title="Marcar como Atendido"
                                                style={{ color: '#2ecc71' }}
                                            >
                                                <FaCheck />
                                            </button>
                                            <button 
                                                className="action-button delete-button" 
                                                onClick={() => handleStatusChange(app, 'CANCELLED', false)}
                                                title="Cancelar Turno"
                                            >
                                                <FaTimes />
                                            </button>
                                        </>
                                    ) : (
                                        <span style={{ color: '#aaa', fontSize: '0.9em' }}>Finalizado</span>
                                    )}
                                    
                                    <button 
                                        className="action-button delete-button" 
                                        onClick={() => handleDelete(app.id, app.patient_name)}
                                        title="Eliminar registro"
                                        style={{ color: '#e74c3c', marginLeft: '10px' }}
                                    >
                                        <FaTrashAlt />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* MODAL PARA CREAR TURNO */}
            {isModalOpen && (
                <div className="modal-backdrop">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>{isEditing ? 'Editar Turno' : 'Nuevo Turno'}</h2>
                            <button className="close-modal-button" onClick={closeModal}>
                                <FaTimes />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="modal-form">
                            
                            <label>
                                Paciente:
                                <select
                                    name="patient_id"
                                    value={formData.patient_id}
                                    onChange={handleInputChange}
                                    required
                                    disabled={isEditing}
                                >
                                    <option value="">Seleccione Paciente</option>
                                    {patients.map(p => (
                                        <option key={p.id} value={p.id}>{p.first_name} {p.last_name} (ID: {p.id})</option>
                                    ))}
                                </select>
                            </label>

                            <label>
                                Médico:
                                <select
                                    name="doctor_id"
                                    value={formData.doctor_id}
                                    onChange={handleInputChange}
                                    required
                                    disabled={isEditing}
                                >
                                    <option value="">Seleccione Médico</option>
                                    {doctors.map(d => (
                                        <option key={d.id} value={d.id}>{d.first_name} {d.last_name} ({d.license_number})</option>
                                    ))}
                                </select>
                            </label>

                            <label>
                                Fecha y Hora de Inicio:
                                <input
                                    type="datetime-local"
                                    name="start_at"
                                    value={formData.start_at}
                                    onChange={handleInputChange}
                                    required
                                    disabled={isEditing}
                                />
                            </label>

                            <label>
                                Fecha y Hora de Fin:
                                <input
                                    type="datetime-local"
                                    name="end_at"
                                    value={formData.end_at}
                                    onChange={handleInputChange}
                                    required
                                    disabled={isEditing}
                                />
                                <small>La duración mínima recomendada es de 15 minutos.</small>
                            </label>

                            <label>
                                Notas:
                                <textarea
                                    name="notes"
                                    value={formData.notes || ''}
                                    onChange={handleInputChange}
                                    rows="3"
                                ></textarea>
                            </label>
                            
                            {/* Los campos de estado y attended se manejan con los botones de acción para simplificar la interfaz. 
                                En la creación se usa el default 'SCHEDULED' / false.
                            */}
                            
                            <button type="submit" className="submit-button">
                                <FaSave /> {isEditing ? 'Guardar Cambios (Solo si la API lo permite)' : 'Crear Turno'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Turnos;