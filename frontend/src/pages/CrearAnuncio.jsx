// ============================================================
// PÁGINA: CrearAnuncio
// Form for profesores to publish a new class listing.
// Redirects to /mi-perfil after successful creation.
// ============================================================

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { crearAnuncio, estaLogueado, getUsuarioActual } from '../services/api';
import './Auth.css';

const NIVELES = [
  'Primaria',
  'ESO',
  'Bachillerato',
  'Universidad',
  'Adultos',
  'Todos los niveles',
];

function CrearAnuncio() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    titulo:      '',
    asignatura:  '',
    nivel:       'ESO',
    descripcion: '',
    precio_hora: '',
  });

  const [errores,  setErrores]  = useState({});
  const [cargando, setCargando] = useState(false);
  const [exito,    setExito]    = useState(false);

  // Guard: only logged-in profesores may access this page
  useEffect(() => {
    if (!estaLogueado()) {
      navigate('/login');
      return;
    }
    const usuario = getUsuarioActual();
    if (usuario?.rol !== 'profesor') {
      navigate('/mi-perfil');
    }
  }, [navigate]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errores[e.target.name]) {
      setErrores({ ...errores, [e.target.name]: '' });
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErrores({});
    setCargando(true);

    const resultado = await crearAnuncio({
      ...form,
      precio_hora: parseFloat(form.precio_hora),
    });

    setCargando(false);

    if (resultado.ok) {
      setExito(true);
      setTimeout(() => navigate('/mi-perfil'), 2000);
    } else {
      setErrores(resultado.data.errors || { general: resultado.data.mensaje });
    }
  }

  if (exito) {
    return (
      <div className="auth-page">
        <Navbar />
        <div className="auth-bg">
          <div className="auth-card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3rem' }}>✅</div>
            <h2>¡Anuncio creado!</h2>
            <p style={{ color: '#666', marginTop: '0.5rem' }}>
              Tu anuncio está pendiente de verificación por un administrador.
            </p>
            <p style={{ color: '#999', fontSize: '0.85rem', marginTop: '0.5rem' }}>
              Redirigiendo a tu perfil...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <Navbar />

      <div className="auth-bg">
        <div className="auth-card" style={{ maxWidth: 560 }}>

          <div className="auth-logo">📢</div>
          <h2 className="auth-title">Publicar nuevo anuncio</h2>
          <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '1.5rem', textAlign:'center' }}>
            Tu anuncio será revisado por un administrador antes de publicarse.
          </p>

          <form onSubmit={handleSubmit}>

            <div className="form-group">
              <label>Título del anuncio *</label>
              <input
                type="text"
                name="titulo"
                placeholder="Ej: Clases de Matemáticas para Bachillerato"
                value={form.titulo}
                onChange={handleChange}
                maxLength={200}
                required
              />
              {errores.titulo && <p className="error-msg">{errores.titulo[0]}</p>}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Asignatura *</label>
                <input
                  type="text"
                  name="asignatura"
                  placeholder="Ej: Matemáticas"
                  value={form.asignatura}
                  onChange={handleChange}
                  maxLength={100}
                  required
                />
                {errores.asignatura && <p className="error-msg">{errores.asignatura[0]}</p>}
              </div>

              <div className="form-group">
                <label>Nivel *</label>
                <select name="nivel" value={form.nivel} onChange={handleChange}>
                  {NIVELES.map(n => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Descripción *</label>
              <textarea
                name="descripcion"
                rows={4}
                placeholder="Describe tu experiencia, metodología y qué pueden esperar los alumnos..."
                value={form.descripcion}
                onChange={handleChange}
                maxLength={1000}
                required
              />
              <small style={{ color: '#999' }}>{form.descripcion.length}/1000 caracteres</small>
              {errores.descripcion && <p className="error-msg">{errores.descripcion[0]}</p>}
            </div>

            <div className="form-group">
              <label>Precio por hora (€) *</label>
              <input
                type="number"
                name="precio_hora"
                placeholder="Ej: 25"
                value={form.precio_hora}
                onChange={handleChange}
                min={1}
                max={500}
                step={0.5}
                required
              />
              {errores.precio_hora && <p className="error-msg">{errores.precio_hora[0]}</p>}
            </div>

            {errores.general && (
              <p className="error-msg" style={{ marginBottom: '1rem' }}>{errores.general}</p>
            )}

            <button type="submit" className="btn-primary auth-btn" disabled={cargando}>
              {cargando ? 'Publicando...' : 'Publicar anuncio'}
            </button>

          </form>

        </div>
      </div>
    </div>
  );
}

export default CrearAnuncio;
