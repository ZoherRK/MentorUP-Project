// ============================================================
// PÁGINA: Welcome
// Pantalla de bienvenida. Simple: logo, título, descripción
// y dos botones — Iniciar sesión y Registrarse.
// La página de "Cómo funciona" sigue siendo Home.jsx (/home)
// ============================================================

import { Link } from 'react-router-dom';
import './Welcome.css';
import logoMentorUP from '../assets/logoMentorUP.png';


function Welcome() {
  return (
    <div className="welcome">

      {/* Logo arriba centrado */}
    <header className="welcome-header">
    <span className="welcome-logo">
        Mentor 
        {/*<img src={logoMentorUP} className="welcome-icon-top" />*/}
        <strong>UP</strong>
    </span>
    </header>

      {/* Contenido central */}
      <main className="welcome-main">

        <div className="welcome-card">

          {/* Icono */}
          <div className="welcome-icon"><img src={logoMentorUP}/></div>

          {/* Título y descripción */}
          <h1 className="welcome-title">Bienvenido a MentorUP</h1>
          <p className="welcome-subtitle">
            La plataforma que conecta alumnos con los mejores
            profesores de clases particulares.
          </p>

          {/* Dos botones principales */}
          <div className="welcome-buttons">
            <Link to="/login" className="btn-primary welcome-btn">
              Iniciar sesión
            </Link>
            <Link to="/registro" className="btn-outline welcome-btn">
              Crear cuenta gratis
            </Link>
          </div>

        </div>

      </main>

      {/* Footer mínimo */}
      <footer className="welcome-footer">
        <p>© 2026 MentorUP</p>
      </footer>

    </div>
  );
}

export default Welcome;
