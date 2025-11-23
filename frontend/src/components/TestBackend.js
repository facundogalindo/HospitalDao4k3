import React, { useEffect, useState } from "react";
import { getPatients } from "../api/api";

export default function TestBackend() {
  const [patients, setPatients] = useState([]);

  useEffect(() => {
    getPatients()
      .then((res) => {
        console.log("Respuesta del backend:", res.data);
        setPatients(res.data);
      })
      .catch((err) => console.error("Error:", err));
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h2>Conexión con Backend OK</h2>

      {patients.length === 0 ? (
        <p>No hay pacientes cargados</p>
      ) : (
        <ul>
          {patients.map((p) => (
            <li key={p.id}>
              {p.first_name} {p.last_name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
