import React, { useState, useEffect } from "react";
import jsPDF from "jspdf";
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
  const [reportType, setReportType] = useState(""); // "doctor", "specialty", "attendance"

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
      setDoctors(docs.data || docs);
      setSpecialties(specs.data || specs);
    } catch (err) {
      console.error(err);
      setError("Error al cargar médicos o especialidades.");
    }
  };

  // -------------------------------------
  // FUNCIONES REPORTES - MODIFICADAS
  // -------------------------------------
  const buscarTurnosPorDoctor = async () => {
    if (!doctorId) {
      alert("Seleccione un médico.");
      return;
    }

    try {
      setLoading(true);
      setReportType("doctor");
      const res = await getAppointmentsByDoctor(doctorId, fromDate, toDate);
      
      // La API devuelve un array de objetos con appointments dentro
      if (res.data && res.data.length > 0) {
        const doctorData = res.data[0]; // Tomamos el primer médico
        setReportData(doctorData.appointments || []);
      } else {
        setReportData([]);
      }
      setAttendanceData(null);
    } catch (err) {
      console.error(err);
      setError("Error al obtener el reporte de turnos por médico.");
    } finally {
      setLoading(false);
    }
  };

  const buscarTurnosPorEspecialidad = async () => {
    if (!specialtyId) {
      alert("Seleccione una especialidad.");
      return;
    }

    try {
      setLoading(true);
      setReportType("specialty");
      const res = await getAppointmentsBySpecialty(fromDate, toDate);
      
      // La API devuelve array de especialidades con counts
      setReportData(res.data || []);
      setAttendanceData(null);
    } catch (err) {
      console.error(err);
      setError("Error al obtener el reporte de turnos por especialidad.");
    } finally {
      setLoading(false);
    }
  };

  const buscarAsistencia = async () => {
    try {
      setLoading(true);
      setReportType("attendance");
      const res = await getAttendanceStats(fromDate, toDate);
      
      // La API devuelve { chart_image } con la imagen base64
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
  // RENDER - MODIFICADO
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
          {/* DOCTOR - OBLIGATORIO SOLO PARA TURNOS POR MÉDICO */}
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

          {/* ESPECIALIDAD - OPCIONAL */}
          <div className="col">
            <label>Especialidad:</label>
            <select className="form-control" value={specialtyId} onChange={(e) => setSpecialtyId(e.target.value)}>
              <option value="">Todas las especialidades</option>
              {specialties.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* FECHAS - OPCIONALES */}
          <div className="col">
            <label>Desde (opcional):</label>
            <input type="date" className="form-control" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
          </div>

          <div className="col">
            <label>Hasta (opcional):</label>
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
          // REPORTE ASISTENCIA
          <div className="asistencia-box">
            <h2>📊 Estadísticas de Asistencia</h2>
{attendanceData.chart_image && (
  <div style={{ textAlign: "center" }}>
    {/* Mostrar imagen */}
    <img
      id="asistencia-img"
      src={`${attendanceData.chart_image}?cacheBust=${Date.now()}`}
      alt="Estadísticas de asistencia"
      style={{
        maxWidth: "600px",
        height: "auto",
        border: "1px solid #ddd",
        marginBottom: "20px",
      }}
    />

    {/* Botón descargar PNG */}
    <button
      onClick={() => {
        const link = document.createElement("a");
        link.href = attendanceData.chart_image;
        link.download = "estadisticas_asistencia.png";
        link.click();
      }}
      className="add-button"
      style={{ marginRight: "10px" }}
    >
      📥 Descargar imagen PNG
    </button>

    {/* Botón descargar PDF */}
    <button
      onClick={() => {
        const pdf = new jsPDF({
          orientation: "portrait",
          unit: "pt",
          format: "a4",
        });

        pdf.setFontSize(20);
        pdf.text("Estadísticas de Asistencia", 40, 40);

        pdf.setFontSize(12);
        pdf.text(`Generado: ${new Date().toLocaleString()}`, 40, 70);

        // Agregar imagen al PDF (centrada, tamaño automático)
        const imgWidth = 500;
        const imgHeight = 500;

        pdf.addImage(
          attendanceData.chart_image,
          "PNG",
          50,
          100,
          imgWidth,
          imgHeight
        );

        pdf.save("estadisticas_asistencia.pdf");
      }}
      className="add-button"
    >
      📄 Descargar PDF
    </button>
  </div>
)}
          </div>
        ) : reportType === "doctor" && reportData.length > 0 ? (
          // TABLA TURNOS POR DOCTOR
          <div>
            <h3>📋 Turnos por Médico</h3>
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID Turno</th>
                  <th>Paciente</th>
                  <th>Fecha Inicio</th>
                  <th>Fecha Fin</th>
                  <th>Estado</th>
                  <th>Asistió</th>
                </tr>
              </thead>
              <tbody>
                {reportData.map((t) => (
                  <tr key={t.id}>
                    <td>{t.id}</td>
                    <td>{t.patient_name}</td>
                    <td>{new Date(t.start_at).toLocaleString()}</td>
                    <td>{new Date(t.end_at).toLocaleString()}</td>
                    <td>{t.status}</td>
                    <td>{t.attended ? 'Sí' : 'No'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : reportType === "specialty" && reportData.length > 0 ? (
          // TABLA TURNOS POR ESPECIALIDAD
          <div>
            <h3>🏥 Turnos por Especialidad</h3>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Especialidad</th>
                  <th>Cantidad de Turnos</th>
                </tr>
              </thead>
              <tbody>
                {reportData.map((item) => (
                  <tr key={item.specialty_id}>
                    <td>{item.specialty_name}</td>
                    <td>{item.appointment_count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>No hay resultados para mostrar. Use los filtros arriba.</p>
        )}
      </div>
    </div>
  );
}