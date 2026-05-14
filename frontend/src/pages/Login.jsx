import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiLogin } from '../services/api';
import { useAuth } from '../App';
import logoMentorUP from '../assets/logoMentorUP.png';

export default function Login() {
  const { login }    = useAuth();
  const navigate     = useNavigate();
  const [form, setForm]       = useState({ email: '', password: '' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await apiLogin(form);
      login(data.token, data.usuario);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.page}>
      <div style={s.left}>
        <div style={s.leftInner}>
          <div style={s.logoRow}>
            <span style={s.logoText}>Mentor</span>
            <img src={logoMentorUP} alt="UP" style={s.logoImg} />
            <span style={{ ...s.logoText, color: 'var(--gray-900)' }}>UP</span>
          </div>
          <h1 style={s.title}>Bienvenido de vuelta</h1>
          <p style={s.sub}>Inicia sesión para acceder a tu cuenta</p>

          {error && (
            <div style={s.errorBox}>
              <span>⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={s.form}>
            <div style={s.field}>
              <label style={s.label}>Correo electrónico</label>
              <div style={s.inputWrap}>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  style={s.input}
                  placeholder="tu@email.com"
                />
              </div>
            </div>

            <div style={s.field}>
              <div style={s.labelRow}>
                <label style={s.label}>Contraseña</label>
                <a href="#" style={s.forgotLink}>¿Olvidaste la contraseña?</a>
              </div>
              <div style={s.inputWrap}>
                <input
                  name="password"
                  type={showPwd ? 'text' : 'password'}
                  value={form.password}
                  onChange={handleChange}
                  required
                  style={s.input}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  style={s.eyeBtn}
                >
                  {showPwd ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} style={loading ? s.btnDisabled : s.btn}>
              {loading ? (
                <span style={s.loadingSpinner}>⟳ Iniciando sesión…</span>
              ) : (
                'Iniciar sesión →'
              )}
            </button>
          </form>

          <p style={s.footer}>
            ¿No tienes cuenta?{' '}
            <Link to="/registro" style={s.link}>Crear cuenta gratis</Link>
          </p>
        </div>
      </div>

      {/* Right panel — decorative */}
      <div style={s.right}>
        <div style={s.rightContent}>
          <div style={s.quoteIcon}>"</div>
          <p style={s.quote}>
            Gracias a MentorUP encontré el profesor perfecto para mis clases de matemáticas.
            ¡Aprobé selectividad!
          </p>
          <div style={s.quoter}>
            <div style={s.quoterAvatar}>M</div>
            <div>
              <div style={s.quoterName}>María García</div>
              <div style={s.quoterRole}>Alumna, Bachillerato</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const s = {
  page: { display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: 'calc(100vh - 68px)' },
  left: { display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem 2rem', background: '#fff' },
  leftInner: { width: '100%', maxWidth: 420 },
  logoRow: { display: 'flex', alignItems: 'center', marginBottom: '2.5rem' },
  logoText: { fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary)' },
  logoImg: { height: 48, marginLeft: -6, marginRight: -6 },
  title: { fontSize: '1.9rem', fontWeight: 900, color: 'var(--gray-900)', marginBottom: '.4rem', letterSpacing: '-.01em' },
  sub: { color: 'var(--gray-500)', marginBottom: '2rem' },
  errorBox: { background: 'var(--danger-bg)', color: 'var(--danger-text)', padding: '.75rem 1rem', borderRadius: 'var(--radius)', marginBottom: '1.5rem', fontSize: '.9rem', display: 'flex', alignItems: 'center', gap: '.5rem' },
  form: { display: 'flex', flexDirection: 'column', gap: '1.25rem' },
  field: { display: 'flex', flexDirection: 'column', gap: '.4rem' },
  labelRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  label: { fontWeight: 600, fontSize: '.875rem', color: 'var(--gray-700)' },
  forgotLink: { fontSize: '.8rem', color: 'var(--primary)', fontWeight: 500, textDecoration: 'none' },
  inputWrap: { position: 'relative', display: 'flex', alignItems: 'center' },
  inputIcon: { position: 'absolute', left: '.85rem', fontSize: '.9rem', userSelect: 'none', pointerEvents: 'none' },
  input: { width: '100%', border: '1.5px solid var(--gray-200)', borderRadius: 'var(--radius)', padding: '.7rem .9rem', fontSize: '.95rem', outline: 'none', transition: 'border-color .2s', background: 'var(--gray-50)', color: 'var(--gray-900)' },
  eyeBtn: { position: 'absolute', right: '.75rem', background: 'none', border: 'none', cursor: 'pointer', fontSize: '.9rem', padding: '.25rem' },
  btn: { background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)', color: '#fff', border: 'none', borderRadius: 'var(--radius)', padding: '.85rem', fontSize: '1rem', fontWeight: 700, cursor: 'pointer', transition: 'var(--transition)', boxShadow: '0 4px 16px rgba(14,165,160,.3)', marginTop: '.25rem' },
  btnDisabled: { background: 'var(--gray-200)', color: 'var(--gray-400)', border: 'none', borderRadius: 'var(--radius)', padding: '.85rem', fontSize: '1rem', fontWeight: 700, cursor: 'not-allowed', marginTop: '.25rem' },
  loadingSpinner: { display: 'inline-block' },
  footer: { textAlign: 'center', color: 'var(--gray-500)', fontSize: '.9rem', marginTop: '1.75rem' },
  link: { color: 'var(--primary)', fontWeight: 700, textDecoration: 'none' },
  // Right panel
  right: { background: 'linear-gradient(135deg, #0b1e1e 0%, #0f2e2c 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem', position: 'relative', overflow: 'hidden' },
  rightContent: { position: 'relative', zIndex: 1, maxWidth: 380 },
  quoteIcon: { fontSize: '5rem', color: 'rgba(14,165,160,.3)', lineHeight: .8, marginBottom: '1.5rem', fontFamily: 'Georgia, serif' },
  quote: { fontSize: '1.2rem', color: 'rgba(255,255,255,.9)', lineHeight: 1.7, fontStyle: 'italic', marginBottom: '2rem' },
  quoter: { display: 'flex', alignItems: 'center', gap: '1rem' },
  quoterAvatar: { width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.1rem' },
  quoterName: { color: '#fff', fontWeight: 700 },
  quoterRole: { color: 'rgba(255,255,255,.5)', fontSize: '.85rem' },
};
