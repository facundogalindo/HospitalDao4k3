// En src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';

// Importaciones de Módulos de Gestión
import Medicos from './components/Medicos';
import Pacientes from './components/Pacientes'; 
import Especialidades from './components/Especialidades';
import HorariosTrabajo from './components/HorariosTrabajo'; 
import  HistorialesMedicos  from './components/HistorialesMedicos'; // <-- NUEVA IMPORTACIÓN CLAVE
import Turnos from './components/Turnos'; 
import Reportes from "./components/Reportes";
import Recetas from "./components/Recetas";
function App() {
  return (
    <Router>
      <Routes>
        {/* Pantalla principal */}
        <Route path="/" element={<Dashboard />} />
        
        {/* Gestión de Módulos */}
        <Route path="/medicos" element={<Medicos />} />
        <Route path="/pacientes" element={<Pacientes />} />
        <Route path="/especialidades" element={<Especialidades />} />
        <Route path="/horarios" element={<HorariosTrabajo />} />
        
        {/* NUEVA RUTA: Historiales Clínicos */}
        <Route path="/historiales" element={<HistorialesMedicos />} /> 
        <Route path="/reportes" element={<Reportes />} />

        <Route path="/turnos" element={<Turnos />} />
        <Route path="/recetas" element={<Recetas />} />
        {/* ... otras rutas ... */}
      </Routes>
    </Router>
  );
}

export default App;