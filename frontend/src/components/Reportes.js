import React, { useState, useEffect } from "react";
import {
  getDoctors,
  getSpecialties,
  getAppointmentsByDoctor,
  getAppointmentsBySpecialty,
  getAttendanceStats,
} from "../api/api";

import { FaChartBar, FaSearch, FaUserMd, FaStethoscope, FaCalendar } from "react-icons/fa";
import "../styles/Medicos.css";

export default function Reportes() {
  // -------------------------------------
  // ESTADOS
  // -------------------------------------
  const [doctors, setDoctors] = useState([]);
  const [specialties, setSpecialties] = useState([]);

  const [doctorId, setDoctorId] = useState("");
  const [specialtyId, setSpecialtyId] = useState("");

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [reportData, setReportData] = useState([]);
  const [attendanceData, setAttendanceData] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // -------------------------------------
  // CARGA INICIAL
  // -------------------------------------
  useEffect(() => {
    loadInitial();
  }, []);

  const loadInitial = async () => {
    try {
      const [docs, specs] = await Promise.all([getDoctors(), getSpecialties()]);
      setDoctors(docs.data);
      setSpecialties(specs.data);
    } catch (err) {
      console.error(err);
      setError("Error al cargar médicos o especialidades.");
    }
  };

  // -------------------------------------
  // FUNCIONES REPORTES
  // -------------------------------------
  const buscarTurnosPorDoctor = async () => {
    if (!doctorId || !fromDate || !toDate) {
      alert("Seleccione médico y rango de fechas.");
      return;
    }

    try {
      setLoading(true);
      const res = await getAppointmentsByDoctor({
        doctor_id: doctorId,
        start_date: fromDate,
        end_date: toDate,
      });

      setReportData(res.data);
      setAttendanceData(null);
    } catch (err) {
      console.error(err);
      setError("Error al obtener el reporte de turnos por médico.");
    } finally {
      setLoading(false);
    }
  };

  const buscarTurnosPorEspecialidad = async () => {
    if (!specialtyId || !fromDate || !toDate) {
      alert("Seleccione especialidad y rango de fechas.");
      return;
    }

    try {
      setLoading(true);
      const res = await getAppointmentsBySpecialty({
        specialty_id: specialtyId,
        start_date: fromDate,
        end_date: toDate,
      });

      setReportData(res.data);
      setAttendanceData(null);
    } catch (err) {
      console.error(err);
      setError("Error al obtener el reporte de turnos por especialidad.");
    } finally {
      setLoading(false);
    }
  };

  const buscarAsistencia = async () => {
    if (!fromDate || !toDate) {
      alert("Seleccione rango de fechas.");
      return;
    }

    try {
      setLoading(true);
      const res = await getAttendanceStats({
        start_date: fromDate,
        end_date: toDate,
      });

      setAttendanceData(res.data);
      setReportData([]);
    } catch (err) {
      console.error(err);
      setError("Error al obtener estadísticas de asistencia.");
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------------
  // RENDER
  // -------------------------------------
  return (
    <div className="crud-container">
      <h1 className="crud-title">
        <FaChartBar /> Reportes del Sistema
      </h1>

      {error && <div className="error-message">{error}</div>}

      {/* FILTROS GENERALES */}
      <div className="filtros-box">
        <h3><FaSearch /> Filtros</h3>

        <div className="row">
          {/* DOCTOR */}
          <div className="col">
            <label>Médico:</label>
            <select className="form-control" value={doctorId} onChange={(e) => setDoctorId(e.target.value)}>
              <option value="">Seleccione médico</option>
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.last_name}, {d.first_name}
                </option>
              ))}
            </select>
          </div>

          {/* ESPECIALIDAD */}
          <div className="col">
            <label>Especialidad:</label>
            <select className="form-control" value={specialtyId} onChange={(e) => setSpecialtyId(e.target.value)}>
              <option value="">Seleccione especialidad</option>
              {specialties.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* FECHAS */}
          <div className="col">
            <label>Desde:</label>
            <input type="date" className="form-control" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
          </div>

          <div className="col">
            <label>Hasta:</label>
            <input type="date" className="form-control" value={toDate} onChange={(e) => setToDate(e.target.value)} />
          </div>
        </div>

        {/* BOTONES DE ACCIONES */}
        <div className="acciones-reportes">
          <button className="add-button" onClick={buscarTurnosPorDoctor}>
            <FaUserMd /> Turnos por Médico
          </button>

          <button className="add-button" onClick={buscarTurnosPorEspecialidad}>
            <FaStethoscope /> Turnos por Especialidad
          </button>

          <button className="add-button" onClick={buscarAsistencia}>
            <FaCalendar /> Asistencia / Inasistencia
          </button>
        </div>
      </div>

      <hr />

      {/* TABLA DE RESULTADOS */}
      <div className="table-responsive">
        {loading ? (
          <p>Cargando reporte...</p>
        ) : attendanceData ? (
          // ------------------------------------
          // REPORTE ASISTENCIA
          // ------------------------------------
          <div className="asistencia-box">
            <h2>📊 Estadísticas de Asistencia</h2>
            <p><strong>Asistidos:</strong> {attendanceData.attended}</p>
            <p><strong>No asistieron:</strong> {attendanceData.not_attended}</p>
            <p><strong>Total:</strong> {attendanceData.total}</p>
          </div>
        ) : reportData && reportData.length > 0 ? (
          // ------------------------------------
          // TABLA TURNOS POR DOCTOR/ESPECIALIDAD
          // ------------------------------------
          <table className="data-table">
            <thead>
              <tr>
                <th>ID Turno</th>
                <th>Paciente</th>
                <th>Médico</th>
                <th>Especialidad</th>
                <th>Fecha</th>
                <th>Estado</th>
              </tr>
            </thead>

            <tbody>
              {reportData.map((t) => (
                <tr key={t.id}>
                  <td>{t.id}</td>
                  <td>{t.patient_name}</td>
                  <td>{t.doctor_name}</td>
                  <td>{t.specialty_name}</td>
                  <td>{t.start_at?.split("T")[0]}</td>
                  <td>{t.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No hay resultados para mostrar.</p>
        )}
      </div>
    </div>
  );
}
