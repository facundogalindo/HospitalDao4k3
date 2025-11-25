import React, { useState, useEffect } from "react";
import jsPDF from "jspdf";
import {
  getDoctors,
  getSpecialties,
  getAppointmentsByDoctor,
  getAppointmentsBySpecialty,
  getAttendanceStats,
  getPatientsAttended,
} from "../api/api";

import {
  FaChartBar,
  FaSearch,
  FaUserMd,
  FaStethoscope,
  FaCalendar,
} from "react-icons/fa";

import "../styles/Medicos.css";

import BotonVolverFlotante from "./BotonFlotante";

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
  const [patientsData, setPatientsData] = useState([]);

  const [reportType, setReportType] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // PAGINACIÓN
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;

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
  // FUNCIONES REPORTES
  // -------------------------------------

  // ✔ Turnos por médico
  const buscarTurnosPorDoctor = async () => {
    if (!doctorId) {
      alert("Seleccione un médico.");
      return;
    }

    try {
      setLoading(true);
      setReportType("doctor");

      const res = await getAppointmentsByDoctor(doctorId, fromDate, toDate);

      if (res.data && res.data.length > 0) {
        const doctorData = res.data[0];
        setReportData(doctorData.appointments || []);
      } else {
        setReportData([]);
      }

      setAttendanceData(null);
      setPatientsData([]);

    } catch (err) {
      console.error(err);
      setError("Error al obtener el reporte de turnos por médico.");
    } finally {
      setLoading(false);
    }
  };

  // ✔ Turnos por especialidad
  const buscarTurnosPorEspecialidad = async () => {
    if (!specialtyId) {
      alert("Seleccione una especialidad.");
      return;
    }

    try {
      setLoading(true);
      setReportType("specialty");

      const res = await getAppointmentsBySpecialty(fromDate, toDate);

      setReportData(res.data || []);
      setAttendanceData(null);
      setPatientsData([]);

    } catch (err) {
      console.error(err);
      setError("Error al obtener el reporte de turnos por especialidad.");
    } finally {
      setLoading(false);
    }
  };

  // ✔ Asistencia / inasistencia
  const buscarAsistencia = async () => {
    try {
      setLoading(true);
      setReportType("attendance");

      const res = await getAttendanceStats(fromDate, toDate);

      setAttendanceData(res.data);
      setReportData([]);
      setPatientsData([]);

    } catch (err) {
      console.error(err);
      setError("Error al obtener estadísticas de asistencia.");
    } finally {
      setLoading(false);
    }
  };

  // ✔ ✔ ✔ NUEVO REPORTE — PACIENTES ATENDIDOS (+ PAGINACIÓN)
  const buscarPacientesAtendidos = async (pageNumber = 1) => {
    if (!fromDate || !toDate) {
      alert("Debe seleccionar un rango de fechas.");
      return;
    }

    try {
      setLoading(true);
      setReportType("patients");

      const res = await getPatientsAttended(
        fromDate,
        toDate,
        pageNumber,
        pageSize
      );

      setPatientsData(res.data.data);
      setPage(res.data.current_page);
      setTotalPages(res.data.total_pages);

      setReportData([]);
      setAttendanceData(null);

    } catch (err) {
      console.error(err);
      setError("Error al obtener pacientes atendidos.");
    } finally {
      setLoading(false);
    }
  };

  const nextPage = () => {
    if (page < totalPages) buscarPacientesAtendidos(page + 1);
  };

  const prevPage = () => {
    if (page > 1) buscarPacientesAtendidos(page - 1);
  };

  // -------------------------------------
  // RENDER
  // -------------------------------------
  return (
    <div className="crud-container">
      <h1 className="crud-title">
        <FaChartBar /> Reportes del Sistema
      </h1>

      <BotonVolverFlotante />

      {error && <div className="error-message">{error}</div>}

      {/* FILTROS */}
      <div className="filtros-box">
        <h3>
          <FaSearch /> Filtros
        </h3>

        <div className="row">

          <div className="col">
            <label>Médico:</label>
            <select
              className="form-control"
              value={doctorId}
              onChange={(e) => setDoctorId(e.target.value)}
            >
              <option value="">Seleccione médico</option>
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.last_name}, {d.first_name}
                </option>
              ))}
            </select>
          </div>

          <div className="col">
            <label>Especialidad:</label>
            <select
              className="form-control"
              value={specialtyId}
              onChange={(e) => setSpecialtyId(e.target.value)}
            >
              <option value="">Todas</option>
              {specialties.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div className="col">
            <label>Desde:</label>
            <input
              type="date"
              className="form-control"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </div>

          <div className="col">
            <label>Hasta:</label>
            <input
              type="date"
              className="form-control"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </div>
        </div>

        {/* BOTONES */}
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

          <button
            className="add-button"
            onClick={() => buscarPacientesAtendidos(1)}
          >
            🧑‍⚕️ Pacientes atendidos
          </button>
        </div>
      </div>

      <hr />

      {/* RESULTADOS */}
      <div className="table-responsive">
        {loading ? (
          <p>Cargando reporte...</p>
        ) : attendanceData ? (
          // --- REPORTE ASISTENCIA ---
          <div className="asistencia-box">
            <h2>📊 Estadísticas de Asistencia</h2>

            {attendanceData.chart_image && (
              <div style={{ textAlign: "center" }}>
                <img
                  src={attendanceData.chart_image}
                  alt="Gráfico"
                  style={{
                    maxWidth: "600px",
                    border: "1px solid #ccc",
                  }}
                />

                <button
                  onClick={() => {
                    const link = document.createElement("a");
                    link.href = attendanceData.chart_image;
                    link.download = "estadisticas_asistencia.png";
                    link.click();
                  }}
                  className="add-button"
                >
                  Descargar PNG
                </button>

                <button
                  onClick={() => {
                    const pdf = new jsPDF();
                    pdf.text("Estadísticas de Asistencia", 20, 20);
                    pdf.addImage(
                      attendanceData.chart_image,
                      "PNG",
                      15,
                      40,
                      500,
                      400
                    );
                    pdf.save("estadisticas_asistencia.pdf");
                  }}
                  className="add-button"
                >
                  Descargar PDF
                </button>
              </div>
            )}
          </div>

        ) : reportType === "patients" && patientsData.length > 0 ? (
          // --- REPORTE PACIENTES ATENDIDOS ---
          <div>
            <h3>🧑‍⚕️ Pacientes atendidos</h3>

            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Paciente</th>
                  <th>Cantidad de Turnos</th>
                  <th>Último Turno</th>
                </tr>
              </thead>
              <tbody>
                {patientsData.map((p) => (
                  <tr key={p.patient_id}>
                    <td>{p.patient_id}</td>
                    <td>{p.patient_name}</td>
                    <td>{p.appointment_count}</td>
                    <td>
                      {p.last_appointment
                        ? new Date(p.last_appointment).toLocaleString()
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* PAGINACIÓN */}
            <div style={{ marginTop: "20px", textAlign: "center" }}>
              <button
                className="add-button"
                disabled={page === 1}
                onClick={prevPage}
              >
                ⬅ Anterior
              </button>

              <span style={{ margin: "0 15px" }}>
                Página {page} de {totalPages}
              </span>

              <button
                className="add-button"
                disabled={page === totalPages}
                onClick={nextPage}
              >
                Siguiente ➡
              </button>
            </div>
          </div>

        ) : reportType === "doctor" && reportData.length > 0 ? (
          // --- REPORTE POR DOCTOR ---
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
                    <td>{t.attended ? "Sí" : "No"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        ) : reportType === "specialty" && reportData.length > 0 ? (
          // --- REPORTE POR ESPECIALIDAD ---
          <div>
            <h3>🏥 Turnos por Especialidad</h3>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Especialidad</th>
                  <th>Cantidad</th>
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
          <p>No hay resultados. Ajuste los filtros.</p>
        )}
      </div>
    </div>
  );
}
