// ============================================================
// COMPONENTE: AnuncioCard
// Tarjeta que muestra la información de un anuncio de profesor.
// Se usa en la página de listado de anuncios.
//
// Props (datos que recibe de fuera):
//   - anuncio: objeto con los datos del anuncio
// ============================================================

import { Link } from 'react-router-dom';
import './AnuncioCard.css';

function AnuncioCard({ anuncio }) {
  // Accedemos a los datos del profesor a través de la relación
  const profesor = anuncio.profesor?.usuario;

  // Generamos las iniciales del nombre para el avatar (ej: "Carlos M." → "CM")
  const iniciales = profesor
    ? `${profesor.nombre[0]}${profesor.apellidos[0]}`
    : '?';

  return (
    <div className={`anuncio-card ${anuncio.destacado ? 'anuncio-card--destacado' : ''}`}>

      {/* Badge de DESTACADO */}
      {anuncio.destacado && (
        <span className="badge badge-destacado">⭐ Destacado</span>
      )}

      {/* Cabecera con avatar y nombre del profesor */}
      <div className="anuncio-card__header">
        <div className="anuncio-card__avatar">{iniciales}</div>
        <div>
          <h3 className="anuncio-card__profesor">
            {profesor ? `${profesor.nombre} ${profesor.apellidos}` : 'Profesor'}
          </h3>
          <p className="anuncio-card__asignatura">{anuncio.asignatura}</p>
        </div>
      </div>

      {/* Título del anuncio */}
      <h4 className="anuncio-card__titulo">{anuncio.titulo}</h4>

      {/* Chips de nivel */}
      <div className="anuncio-card__chips">
        <span className="chip">{anuncio.nivel}</span>
        {profesor?.ciudad && <span className="chip">📍 {profesor.ciudad}</span>}
      </div>

      {/* Pie de tarjeta: precio y botón */}
      <div className="anuncio-card__footer">
        <div className="anuncio-card__precio">
          <strong>{anuncio.precio_hora}€</strong>
          <span>/hora</span>
        </div>

        {/* Link a la página de detalle del anuncio */}
        <Link to={`/anuncios/${anuncio.id}`} className="btn-primary">
          Solicitar →
        </Link>
      </div>

    </div>
  );
}

export default AnuncioCard;
