import React from 'react';
import { Link } from 'react-router-dom';
// Íconos de Font Awesome (usando 'fa' que ya instalaste)
import { 
    FaUserMd, // Médico
    FaUserInjured, // Paciente
    FaFileMedical, // Historial
    FaFilePrescription, // Recetas
    FaCalendarAlt, // Turnos
    FaClock, // Horarios
    FaHospitalAlt, // Especialidades
    FaChartBar // Reportes
} from 'react-icons/fa';
import '../styles/Dashboard.css'; // Importa el archivo de estilos

// Estructura de las secciones del menú
const menuItems = [
    { title: 'Médicos', icon: FaUserMd, path: '/medicos', color: '#3498db' },
    { title: 'Pacientes', icon: FaUserInjured, path: '/pacientes', color: '#2ecc71' },
    { title: 'Turnos', icon: FaCalendarAlt, path: '/turnos', color: '#f39c12' },
    { title: 'Historiales Médicos', icon: FaFileMedical, path: '/historiales', color: '#e74c3c' },
    { title: 'Recetas', icon: FaFilePrescription, path: '/recetas', color: '#9b59b6' },
    { title: 'Especialidades', icon: FaHospitalAlt, path: '/especialidades', color: '#1abc9c' },
    { title: 'Horarios de Trabajo', icon: FaClock, path: '/horarios', color: '#d35400' },
    { title: 'Reportes', icon: FaChartBar, path: '/reportes', color: '#34495e' },
];

const Dashboard = () => {
    return (
        <div className="dashboard-container">
            <h1 className="dashboard-title">
                Panel de Administración Hospitalaria
            </h1>
            <div className="dashboard-grid">
                {menuItems.map((item, index) => (
                    <DashboardCard 
                        key={index}
                        title={item.title}
                        Icon={item.icon}
                        path={item.path}
                        color={item.color}
                    />
                ))}
            </div>
        </div>
    );
};

// Componente individual de la tarjeta de menú
const DashboardCard = ({ title, Icon, path, color }) => {
    return (
        <Link to={path} className="dashboard-card" style={{ '--card-color': color }}>
            <div className="card-icon-wrapper">
                <Icon size={48} className="card-icon" />
            </div>
            <h2 className="card-title">{title}</h2>
        </Link>
    );
};

export default Dashboard;