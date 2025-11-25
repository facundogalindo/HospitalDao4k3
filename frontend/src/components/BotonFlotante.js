import React from 'react';
import { useNavigate } from 'react-router-dom';

const BotonVolverFlotante = () => {
  const navigate = useNavigate();

  // Definimos los estilos aquí para mantener el código limpio
  const estiloBoton = {
    // Posición fija para que se quede abajo a la izquierda
    position: 'fixed',
    bottom: '20px',
    left: '20px',
    zIndex: 1000, // Asegura que flote sobre otros elementos
    
    // Estilos visuales (copiando tu botón verde)
    backgroundColor: '#2ecc71', // Un verde similar al de tu imagen
    color: 'white',
    padding: '10px 20px',
    border: 'none',
    borderRadius: '5px', // Bordes redondeados
    fontSize: '16px',
    cursor: 'pointer',
    boxShadow: '0 2px 5px rgba(0,0,0,0.2)', // Sombra suave
    display: 'flex',
    alignItems: 'center',
    gap: '8px' // Espacio entre icono y texto
  };

  return (
    <button 
      style={estiloBoton} 
      onClick={() => navigate('/')}
      onMouseOver={(e) => e.target.style.backgroundColor = '#27ae60'} // Efecto hover
      onMouseOut={(e) => e.target.style.backgroundColor = '#2ecc71'}
    >
      {/* Icono de flecha simple (SVG) para que se vea profesional */}
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="19" y1="12" x2="5" y2="12"></line>
        <polyline points="12 19 5 12 12 5"></polyline>
      </svg>
      Volver al Inicio
    </button>
  );
};

export default BotonVolverFlotante;