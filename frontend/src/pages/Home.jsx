import { Link } from 'react-router-dom';
import { useAuth } from '../App';

export default function Home() {
  const { isAuth } = useAuth();

  return (
    <div>
      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section style={s.hero}>
        <div style={s.heroGlow1} />
        <div style={s.heroGlow2} />
        <div style={s.heroBg} />

        <div style={s.heroInner}>
          <div style={s.heroPill}> Profesores verificados y de confianza</div>
          <h1 style={s.heroTitle}>
            Aprende con los mejores
            <span style={s.heroGradient}> profesores particulares</span>
          </h1>
          <p style={s.heroSub}>
            Clases personalizadas, precios transparentes y resultados reales.
            Conectamos alumnos con profesores expertos en más de 50 materias.
          </p>
          <div style={s.heroBtns}>
            <Link to="/anuncios" style={s.btnPrimary}>
               Explorar profesores
            </Link>
            {isAuth ? (
              <Link to="/perfil" style={s.btnOutline}>Mi panel →</Link>
            ) : (
              <Link to="/registro" style={s.btnOutline}>Empezar gratis →</Link>
            )}
          </div>

          
          
        </div>
      </section>

      {/* ── STATS ────────────────────────────────────────────────────── */}
      <section style={s.statsSection}>
        <div style={s.statsInner}>
          {[
            ['500+', 'Profesores activos', '👨‍🏫'],
            ['2.000+', 'Alumnos satisfechos', '🎓'],
            ['98%', 'Tasa de satisfacción', '⭐'],
            ['50+', 'Materias disponibles', '📚'],
          ].map(([n, l, icon]) => (
            <div key={l} style={s.stat}>
              <span style={s.statIcon}>{icon}</span>
              <strong style={s.statNum}>{n}</strong>
              <span style={s.statLabel}>{l}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────── */}
      <section style={s.section}>
        <div style={s.sectionHead}>
          <div style={s.sectionTag}>Proceso</div>
          <h2 style={s.sectionTitle}>Empieza en 3 pasos</h2>
          <p style={s.sectionSub}>Sin complicaciones, sin compromisos ocultos</p>
        </div>
        <div style={s.steps}>
          {[
            { n: '01', t: 'Crea tu cuenta', d: 'Regístrate gratis como alumno o profesor en menos de 2 minutos.' },
            { n: '02', t: 'Encuentra tu profesor', d: 'Filtra por materia, nivel, precio y horario disponible.' },
            { n: '03', t: 'Reserva y aprende', d: 'Solicita la clase, elige el horario y empieza tu aprendizaje.' },
          ].map(({ n, icon, t, d }) => (
            <div key={n} style={s.step}>
              <div style={s.stepHeader}>
                <div style={s.stepIcon}>{icon}</div>
                <span style={s.stepNum}>{n}</span>
              </div>
              <h3 style={s.stepTitle}>{t}</h3>
              <p style={s.stepDesc}>{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────────────────── */}
      <section style={s.featuresSection}>
        <div style={s.sectionHead}>
          <div style={s.sectionTag}>Ventajas</div>
          <h2 style={s.sectionTitle}>¿Por qué MentorUP?</h2>
        </div>
        <div style={s.features}>
          {[
            {t: 'Profesores verificados', d: 'Todos los profesores pasan por un proceso de verificación manual.' },
            {t: 'Precios transparentes', d: 'Sin comisiones ocultas. El precio que ves es el que pagas.' },
            {t: 'Horarios flexibles', d: 'Reserva clases según la disponibilidad real del profesor.' },
            {t: 'Valoraciones reales', d: 'Lee reseñas auténticas de otros alumnos antes de elegir.' },
            {t: 'Gestión online', d: 'Gestiona tus clases, reservas y pagos desde cualquier dispositivo.' },
            {t: 'Protección garantizada', d: 'Sistema de reservas con confirmación y política de cancelación.' },
          ].map(({ icon, t, d }) => (
            <div key={t} style={s.feature}>
              <div style={s.featureIcon}>{icon}</div>
              <h3 style={s.featureTitle}>{t}</h3>
              <p style={s.featureDesc}>{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── PROFILES ─────────────────────────────────────────────────── */}
      {!isAuth && (
        <section style={s.section}>
          <div style={s.sectionHead}>
            <h2 style={s.sectionTitle}>Una plataforma, dos roles</h2>
            <p style={s.sectionSub}>Tanto si quieres aprender como enseñar, MentorUP es para ti</p>
          </div>
          <div style={s.profiles}>
            <div style={s.profileCard}>
              <h3 style={s.profileTitle}>Soy alumno</h3>
              <p style={s.profileDesc}>Encuentra el profesor perfecto para cada materia. Filtra por precio, horario y valoraciones de otros alumnos.</p>
              <ul style={s.profileList}>
                <li>✓ Acceso a 500+ profesores</li>
                <li>✓ Reservas en tiempo real</li>
                <li>✓ Valoraciones verificadas</li>
              </ul>
              <Link to="/registro" style={s.profileBtn}>Buscar profesor →</Link>
            </div>
            <div style={{ ...s.profileCard, ...s.profileCardHighlight }}>
              <div style={s.profileBadge}>Más popular</div>
              <h3 style={s.profileTitle}>Soy profesor</h3>
              <p style={s.profileDesc}>Publica tus clases, fija tu precio y llega a miles de alumnos que buscan tu especialidad.</p>
              <ul style={s.profileList}>
                <li>✓ Define tu disponibilidad</li>
                <li>✓ Gestiona tus reservas</li>
                <li>✓ Cobra lo que mereces</li>
              </ul>
              <Link to="/registro" style={s.profileBtnHighlight}>Empezar a enseñar →</Link>
            </div>
          </div>
        </section>
      )}

      {/* ── CTA ──────────────────────────────────────────────────────── */}
      <section style={s.cta}>
        <div style={s.ctaInner}>
          <h2 style={s.ctaTitle}>¿Listo para empezar?</h2>
          <p style={s.ctaSub}>Únete a miles de alumnos y profesores que ya usan MentorUP</p>
          <div style={s.ctaBtns}>
            <Link to={isAuth ? '/anuncios' : '/registro'} style={s.ctaBtn}>
              {isAuth ? '🔍 Explorar profesores' : 'Crear cuenta gratis'}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────
const s = {
  // Hero
  hero: { position: 'relative', overflow: 'hidden', background: 'linear-gradient(135deg, #0b1e1e 0%, #0f2e2c 50%, #0d2522 100%)', minHeight: '85vh', display: 'flex', alignItems: 'center' },
  heroBg: { position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(14,165,160,.35) 0%, transparent 70%)', pointerEvents: 'none' },
  heroGlow1: { position: 'absolute', top: '20%', left: '10%', width: 500, height: 500, borderRadius: '50%', background: 'rgba(14,165,160,.08)', filter: 'blur(80px)', pointerEvents: 'none' },
  heroGlow2: { position: 'absolute', bottom: '10%', right: '10%', width: 400, height: 400, borderRadius: '50%', background: 'rgba(99,102,241,.06)', filter: 'blur(80px)', pointerEvents: 'none' },
  heroInner: { position: 'relative', maxWidth: 'var(--max-width)', margin: '0 auto', padding: '5rem 1.5rem', textAlign: 'center' },
  heroPill: { display: 'inline-block', background: 'rgba(14,165,160,.2)', border: '1px solid rgba(14,165,160,.4)', color: '#5ee7e2', fontSize: '.85rem', fontWeight: 600, padding: '.4rem 1rem', borderRadius: 'var(--radius-full)', marginBottom: '1.5rem', letterSpacing: '.02em' },
  heroTitle: { fontSize: 'clamp(2rem, 6vw, 3.75rem)', fontWeight: 900, color: '#fff', lineHeight: 1.1, marginBottom: '1.5rem', letterSpacing: '-.02em' },
  heroGradient: { display: 'block', background: 'linear-gradient(90deg, #0ea5a0 0%, #5ee7e2 50%, #a5f3fc 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  heroSub: { fontSize: 'clamp(1rem, 2vw, 1.2rem)', color: 'rgba(255,255,255,.7)', maxWidth: 580, margin: '0 auto 2.5rem', lineHeight: 1.7 },
  heroBtns: { display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '2rem' },
  btnPrimary: { background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)', color: '#fff', padding: '.85rem 2rem', borderRadius: 'var(--radius-md)', textDecoration: 'none', fontWeight: 700, fontSize: '1.05rem', boxShadow: '0 8px 32px rgba(14,165,160,.4)', transition: 'var(--transition)' },
  btnOutline: { border: '1.5px solid rgba(255,255,255,.3)', color: '#fff', padding: '.85rem 2rem', borderRadius: 'var(--radius-md)', textDecoration: 'none', fontWeight: 600, fontSize: '1.05rem', background: 'rgba(255,255,255,.05)', transition: 'var(--transition)' },
  trustRow: { display: 'flex', gap: '1.5rem', justifyContent: 'center', flexWrap: 'wrap' },
  trustBadge: { color: 'rgba(255,255,255,.55)', fontSize: '.85rem', fontWeight: 500 },

  // Stats
  statsSection: { background: '#fff', borderBottom: '1px solid var(--gray-100)' },
  statsInner: { maxWidth: 'var(--max-width)', margin: '0 auto', padding: '3rem 1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '2rem' },
  stat: { textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '.4rem' },
  statIcon: { fontSize: '1.75rem' },
  statNum: { display: 'block', fontSize: '2.25rem', fontWeight: 900, color: 'var(--primary)', lineHeight: 1.1 },
  statLabel: { color: 'var(--gray-500)', fontSize: '.9rem', fontWeight: 500 },

  // Sections
  section: { padding: '5rem 1.5rem', maxWidth: 'var(--max-width)', margin: '0 auto' },
  sectionHead: { textAlign: 'center', marginBottom: '3rem' },
  sectionTag: { display: 'inline-block', background: 'var(--primary-light)', color: 'var(--primary)', fontSize: '.8rem', fontWeight: 700, padding: '.3rem .9rem', borderRadius: 'var(--radius-full)', marginBottom: '.75rem', letterSpacing: '.06em', textTransform: 'uppercase' },
  sectionTitle: { fontSize: 'clamp(1.6rem, 4vw, 2.25rem)', fontWeight: 900, color: 'var(--gray-900)', marginBottom: '.5rem', letterSpacing: '-.01em' },
  sectionSub: { color: 'var(--gray-500)', fontSize: '1.05rem' },

  // Steps
  steps: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' },
  step: { background: '#fff', borderRadius: 'var(--radius-lg)', padding: '2rem', boxShadow: 'var(--shadow)', border: '1px solid var(--gray-100)', transition: 'var(--transition)' },
  stepHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' },
  stepIcon: { fontSize: '2rem' },
  stepNum: { fontSize: '.75rem', fontWeight: 900, color: 'var(--gray-300)', letterSpacing: '.1em' },
  stepTitle: { fontSize: '1.1rem', fontWeight: 700, color: 'var(--gray-900)', marginBottom: '.6rem' },
  stepDesc: { color: 'var(--gray-500)', fontSize: '.9rem', lineHeight: 1.7 },

  // Features
  featuresSection: { background: 'linear-gradient(180deg, var(--gray-50) 0%, #fff 100%)', padding: '5rem 1.5rem' },
  features: { maxWidth: 'var(--max-width)', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' },
  feature: { background: '#fff', borderRadius: 'var(--radius-md)', padding: '1.75rem', border: '1px solid var(--gray-100)', boxShadow: 'var(--shadow-sm)', transition: 'var(--transition)' },
  featureIcon: { fontSize: '1.75rem', marginBottom: '1rem' },
  featureTitle: { fontSize: '1rem', fontWeight: 700, color: 'var(--gray-900)', marginBottom: '.5rem' },
  featureDesc: { fontSize: '.875rem', color: 'var(--gray-500)', lineHeight: 1.6 },

  // Profiles
  profiles: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', maxWidth: 750, margin: '0 auto' },
  profileCard: { background: '#fff', borderRadius: 'var(--radius-lg)', padding: '2.25rem', border: '1px solid var(--gray-200)', boxShadow: 'var(--shadow)', position: 'relative' },
  profileCardHighlight: { border: '2px solid var(--primary)', boxShadow: 'var(--shadow-md)' },
  profileBadge: { position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: 'var(--primary)', color: '#fff', fontSize: '.75rem', fontWeight: 700, padding: '3px 14px', borderRadius: 'var(--radius-full)' },
  profileEmoji: { fontSize: '2.5rem', marginBottom: '1rem' },
  profileTitle: { fontSize: '1.2rem', fontWeight: 800, marginBottom: '.75rem', color: 'var(--gray-900)' },
  profileDesc: { color: 'var(--gray-500)', fontSize: '.9rem', lineHeight: 1.6, marginBottom: '1rem' },
  profileList: { listStyle: 'none', color: 'var(--gray-600)', fontSize: '.875rem', lineHeight: 2, marginBottom: '1.5rem' },
  profileBtn: { display: 'block', textAlign: 'center', border: '2px solid var(--primary)', color: 'var(--primary)', borderRadius: 'var(--radius)', padding: '.65rem', fontWeight: 700, textDecoration: 'none' },
  profileBtnHighlight: { display: 'block', textAlign: 'center', background: 'var(--primary)', color: '#fff', borderRadius: 'var(--radius)', padding: '.65rem', fontWeight: 700, textDecoration: 'none' },

  // CTA
  cta: { background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)', padding: '5rem 1.5rem', textAlign: 'center' },
  ctaInner: { maxWidth: 600, margin: '0 auto' },
  ctaTitle: { fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 900, color: '#fff', marginBottom: '.75rem', letterSpacing: '-.01em' },
  ctaSub: { color: 'rgba(255,255,255,.8)', fontSize: '1.1rem', marginBottom: '2rem' },
  ctaBtns: { display: 'flex', justifyContent: 'center' },
  ctaBtn: { background: '#fff', color: 'var(--primary)', padding: '.9rem 2.5rem', borderRadius: 'var(--radius-md)', fontWeight: 800, fontSize: '1.05rem', textDecoration: 'none', boxShadow: '0 8px 32px rgba(0,0,0,.15)', transition: 'var(--transition)' },
};
