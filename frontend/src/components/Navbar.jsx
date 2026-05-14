import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../App';
import { apiLogout } from '../services/api';
import logoMentorUP from '../assets/logoMentorUP.png';

export default function Navbar() {
  const { isAuth, usuario, logout } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const [open, setOpen]       = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Shadow on scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setOpen(false); }, [location.pathname]);

  const handleLogout = async () => {
    try { await apiLogout(); } catch (_) {}
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav style={{ ...s.nav, ...(scrolled ? s.navScrolled : {}) }}>
      <div style={s.inner}>

        {/* Logo */}
        <Link to="/" style={s.logo}>
          <span style={s.logoText}>Mentor</span>
          <img src={logoMentorUP} alt="UP" style={s.logoImg} />
          <span style={{ ...s.logoText, color: 'var(--gray-900)' }}>UP</span>
        </Link>

        {/* Desktop nav */}
        <div style={s.desktopLinks}>
          <Link to="/anuncios" style={isActive('/anuncios') ? s.linkActive : s.link}>
            Tablón
          </Link>

          {isAuth ? (
            <>
              <Link to="/perfil" style={isActive('/perfil') ? s.linkActive : s.link}>
                Mi perfil
              </Link>
              {usuario?.rol === 'admin' && (
                <Link to="/admin/dashboard" style={isActive('/admin/dashboard') ? s.linkActive : s.link}>
                  Admin
                </Link>
              )}
              <div style={s.divider} />
              <div style={s.userChip}>
                <div style={s.avatar}>{usuario?.nombre?.[0]?.toUpperCase()}</div>
                <span style={s.userName}>{usuario?.nombre}</span>
                <span style={s.rolBadge}>{usuario?.rol}</span>
              </div>
              <button onClick={handleLogout} style={s.btnOutline}>
                Salir
              </button>
            </>
          ) : (
            <>
              <Link to="/login"    style={s.btnGhost}>Iniciar sesión</Link>
              <Link to="/registro" style={s.btnPrimary}>Crear cuenta</Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button style={s.hamburger} onClick={() => setOpen(!open)} aria-label="Menu">
          <span style={{ ...s.bar, transform: open ? 'rotate(45deg) translate(5px,5px)' : 'none' }} />
          <span style={{ ...s.bar, opacity: open ? 0 : 1 }} />
          <span style={{ ...s.bar, transform: open ? 'rotate(-45deg) translate(5px,-5px)' : 'none' }} />
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div style={s.mobileMenu}>
          <Link to="/anuncios" style={s.mobileLink}>Tablón de anuncios</Link>
          {isAuth ? (
            <>
              <Link to="/perfil" style={s.mobileLink}>Mi perfil</Link>
              {usuario?.rol === 'admin' && (
                <Link to="/admin/dashboard" style={s.mobileLink}>Panel Admin</Link>
              )}
              <div style={s.mobileDivider} />
              <div style={s.mobileUser}>
                <div style={s.avatar}>{usuario?.nombre?.[0]?.toUpperCase()}</div>
                <div>
                  <div style={{ fontWeight: 600 }}>{usuario?.nombre} {usuario?.apellidos}</div>
                  <div style={{ fontSize: '.8rem', color: 'var(--gray-500)' }}>{usuario?.rol}</div>
                </div>
              </div>
              <button onClick={handleLogout} style={s.mobileLinkDanger}>
                Cerrar sesión
              </button>
            </>
          ) : (
            <>
              <Link to="/login"    style={s.mobileLink}>Iniciar sesión</Link>
              <Link to="/registro" style={{ ...s.mobileLink, color: 'var(--primary)', fontWeight: 700 }}>
                Crear cuenta gratis
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}

const s = {
  nav: {
    background: 'rgba(255,255,255,0.95)',
    backdropFilter: 'blur(12px)',
    borderBottom: '1px solid var(--gray-100)',
    position: 'sticky',
    top: 0,
    zIndex: 200,
    transition: 'box-shadow .2s',
  },
  navScrolled: {
    boxShadow: '0 4px 24px rgba(0,0,0,.08)',
  },
  inner: {
    maxWidth: 'var(--max-width)',
    margin: '0 auto',
    padding: '0 1.5rem',
    height: '68px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '1rem',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: 0,
    textDecoration: 'none',
    flexShrink: 0,
  },
  logoText: {
    fontSize: '1.35rem',
    fontWeight: 800,
    color: 'var(--primary)',
    letterSpacing: '-.01em',
  },
  logoImg: {
    height: '52px',
    width: 'auto',
    marginLeft: '-8px',
    marginRight: '-8px',
  },
  desktopLinks: {
    display: 'flex',
    alignItems: 'center',
    gap: '.75rem',
    '@media(max-width:768px)': { display: 'none' },
  },
  link: {
    color: 'var(--gray-600)',
    fontWeight: 500,
    fontSize: '.95rem',
    padding: '.3rem .6rem',
    borderRadius: 'var(--radius-sm)',
    transition: 'var(--transition)',
    textDecoration: 'none',
  },
  linkActive: {
    color: 'var(--primary)',
    fontWeight: 600,
    fontSize: '.95rem',
    padding: '.3rem .6rem',
    borderRadius: 'var(--radius-sm)',
    background: 'var(--primary-light)',
    textDecoration: 'none',
  },
  divider: {
    width: 1,
    height: 24,
    background: 'var(--gray-200)',
    margin: '0 .25rem',
  },
  userChip: {
    display: 'flex',
    alignItems: 'center',
    gap: '.5rem',
    background: 'var(--gray-100)',
    borderRadius: 'var(--radius-full)',
    padding: '.3rem .75rem .3rem .4rem',
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '.8rem',
    fontWeight: 700,
    flexShrink: 0,
  },
  userName: {
    fontWeight: 600,
    fontSize: '.9rem',
    color: 'var(--gray-800)',
  },
  rolBadge: {
    fontSize: '.7rem',
    fontWeight: 700,
    color: 'var(--primary)',
    background: 'var(--primary-light)',
    padding: '1px 7px',
    borderRadius: 'var(--radius-full)',
    textTransform: 'capitalize',
  },
  btnGhost: {
    border: 'none',
    background: 'none',
    color: 'var(--gray-600)',
    fontWeight: 600,
    fontSize: '.95rem',
    padding: '.4rem .9rem',
    borderRadius: 'var(--radius)',
    cursor: 'pointer',
    textDecoration: 'none',
    transition: 'var(--transition)',
  },
  btnOutline: {
    border: '1.5px solid var(--gray-300)',
    background: 'none',
    color: 'var(--gray-600)',
    fontWeight: 600,
    fontSize: '.9rem',
    padding: '.4rem .9rem',
    borderRadius: 'var(--radius)',
    cursor: 'pointer',
    transition: 'var(--transition)',
  },
  btnPrimary: {
    background: 'var(--primary)',
    color: '#fff',
    fontWeight: 700,
    fontSize: '.95rem',
    padding: '.45rem 1.1rem',
    borderRadius: 'var(--radius)',
    textDecoration: 'none',
    transition: 'var(--transition)',
    display: 'inline-flex',
    alignItems: 'center',
  },
  hamburger: {
    display: 'none',
    flexDirection: 'column',
    gap: 5,
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
    '@media(max-width:768px)': { display: 'flex' },
  },
  bar: {
    display: 'block',
    width: 22,
    height: 2,
    background: 'var(--gray-700)',
    borderRadius: 2,
    transition: 'var(--transition)',
  },
  mobileMenu: {
    background: '#fff',
    borderTop: '1px solid var(--gray-100)',
    padding: '1rem 1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '.25rem',
    boxShadow: '0 8px 24px rgba(0,0,0,.08)',
  },
  mobileLink: {
    display: 'block',
    color: 'var(--gray-700)',
    fontWeight: 500,
    fontSize: '.95rem',
    padding: '.6rem .5rem',
    borderRadius: 'var(--radius-sm)',
    textDecoration: 'none',
  },
  mobileLinkDanger: {
    display: 'block',
    background: 'none',
    border: 'none',
    color: 'var(--danger)',
    fontWeight: 600,
    fontSize: '.95rem',
    padding: '.6rem .5rem',
    textAlign: 'left',
    cursor: 'pointer',
    width: '100%',
    borderRadius: 'var(--radius-sm)',
    marginTop: '.25rem',
  },
  mobileDivider: {
    height: 1,
    background: 'var(--gray-100)',
    margin: '.5rem 0',
  },
  mobileUser: {
    display: 'flex',
    alignItems: 'center',
    gap: '.75rem',
    padding: '.5rem',
  },
};
