import { Link } from 'react-router-dom';
import logoMentorUP from '../assets/logoMentorUP.png';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer style={s.footer}>
      <div style={s.inner}>

        {/* Brand column */}
        <div style={s.brand}>
          <div style={s.logoRow}>
            <span style={s.logoText}>Mentor</span>
            <img src={logoMentorUP} alt="UP" style={s.logoImg} />
            <span style={{ ...s.logoText, color: 'var(--gray-200)' }}>UP</span>
          </div>
          <p style={s.tagline}>Conectamos alumnos con los mejores profesores particulares.</p>
          <div style={s.social}>
            <a href="https://x.com/" target="_blank" rel="noopener noreferrer" style={s.socialIcon}>𝕏</a>
            <a href="https://linkedin.com/in/" target="_blank" rel="noopener noreferrer" style={s.socialIcon}>in</a>
            <a href="https://facebook.com/" target="_blank" rel="noopener noreferrer" style={s.socialIcon}>f</a>
          </div>
        </div>

        {/* Links columns */}
        <div style={s.col}>
          <h4 style={s.colTitle}>Plataforma</h4>
          <Link to="/anuncios" style={s.link}>Tablón de anuncios</Link>
          <Link to="/registro" style={s.link}>Crear cuenta</Link>
          <Link to="/login"    style={s.link}>Iniciar sesión</Link>
        </div>

        <div style={s.col}>
          <h4 style={s.colTitle}>Para profesores</h4>
          <Link to="/registro" style={s.link}>Publicar clases</Link>
          <Link to="/perfil"   style={s.link}>Gestionar anuncios</Link>
          <a href="#"          style={s.link}>Guía de precios</a>
        </div>

        <div style={s.col}>
          <h4 style={s.colTitle}>Soporte</h4>
          <a href="#" style={s.link}>Centro de ayuda</a>
          <a href="#" style={s.link}>Contacto</a>
          <a href="#" style={s.link}>Términos de uso</a>
          <a href="#" style={s.link}>Privacidad</a>
        </div>

      </div>

      <div style={s.bottom}>
        <p style={s.copy}>© {year} MentorUP. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
}

const s = {
  footer: {
    background: 'linear-gradient(180deg, #0f1c1b 0%, #0a1414 100%)',
    color: 'var(--gray-400)',
    marginTop: 'auto',
  },
  inner: {
    maxWidth: 'var(--max-width)',
    margin: '0 auto',
    padding: '4rem 1.5rem 3rem',
    display: 'grid',
    gridTemplateColumns: '2fr 1fr 1fr 1fr',
    gap: '2.5rem',
  },
  brand: {
    display: 'flex',
    flexDirection: 'column',
    gap: '.75rem',
  },
  logoRow: {
    display: 'flex',
    alignItems: 'center',
  },
  logoText: {
    fontSize: '1.4rem',
    fontWeight: 800,
    color: '#fff',
  },
  logoImg: {
    height: '44px',
    width: 'auto',
    marginLeft: '-6px',
    marginRight: '-6px',
    filter: 'brightness(0) invert(1)',
    opacity: 0.9,
  },
  tagline: {
    fontSize: '.9rem',
    lineHeight: 1.6,
    color: 'var(--gray-500)',
    maxWidth: 240,
  },
  social: {
    display: 'flex',
    gap: '.5rem',
    marginTop: '.25rem',
  },
  socialIcon: {
    width: 32,
    height: 32,
    borderRadius: 'var(--radius-sm)',
    background: 'rgba(255,255,255,.06)',
    color: 'var(--gray-400)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '.9rem',
    fontWeight: 700,
    transition: 'var(--transition)',
    textDecoration: 'none',
    border: '1px solid rgba(255,255,255,.08)',
  },
  col: {
    display: 'flex',
    flexDirection: 'column',
    gap: '.6rem',
  },
  colTitle: {
    color: '#fff',
    fontWeight: 700,
    fontSize: '.9rem',
    marginBottom: '.25rem',
    letterSpacing: '.04em',
    textTransform: 'uppercase',
  },
  link: {
    color: 'var(--gray-500)',
    textDecoration: 'none',
    fontSize: '.9rem',
    transition: 'color .2s',
    display: 'inline-block',
  },
  bottom: {
    borderTop: '1px solid rgba(255,255,255,.06)',
    padding: '1.5rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '1rem',
    maxWidth: 'var(--max-width)',
    margin: '0 auto',
    width: '100%',
  },
  copy: {
    fontSize: '.85rem',
    color: 'var(--gray-600)',
  },
  badges: {
    display: 'flex',
    gap: '.75rem',
    flexWrap: 'wrap',
  },
  badgePill: {
    fontSize: '.8rem',
    color: 'var(--gray-500)',
    background: 'rgba(255,255,255,.04)',
    border: '1px solid rgba(255,255,255,.08)',
    borderRadius: 'var(--radius-full)',
    padding: '3px 10px',
  },
};
