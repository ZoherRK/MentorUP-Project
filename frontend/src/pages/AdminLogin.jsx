import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiLogin } from '../services/api';
import { useAuth } from '../App';

export default function AdminLogin() {
  const { login }     = useAuth();
  const navigate      = useNavigate();
  const [form, setForm]       = useState({ email: '', password: '' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await apiLogin(form);
      if (data.usuario.rol !== 'admin') {
        setError('Acceso denegado. Esta área es exclusiva para administradores.');
        return;
      }
      login(data.token, data.usuario);
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.page}>
      {/* Background decoration */}
      <div style={s.bgGlow} />

      <div style={s.card}>
        <div style={s.lockIcon}>🔐</div>
        <h1 style={s.title}>Panel de administración</h1>
        <p style={s.sub}>MentorUP — Acceso restringido a administradores</p>

        {error && (
          <div style={s.error}>
            <span>⚠️</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={s.form}>
          <div style={s.field}>
            <label style={s.label}>Email de administrador</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              required
              style={s.input}
              placeholder="admin@mentorup.es"
              autoComplete="email"
            />
          </div>
          <div style={s.field}>
            <label style={s.label}>Contraseña</label>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              required
              style={s.input}
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>
          <button type="submit" disabled={loading} style={loading ? s.btnDisabled : s.btn}>
            {loading ? '⟳ Verificando…' : 'Acceder al panel →'}
          </button>
        </form>

        <div style={s.securityNote}>
          🛡️ Conexión segura · Solo personal autorizado
        </div>
      </div>
    </div>
  );
}

const s = {
  page: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #0a0f0f 0%, #0b1e1e 50%, #0d2522 100%)', padding: '2rem', position: 'relative', overflow: 'hidden' },
  bgGlow: { position: 'absolute', top: '30%', left: '50%', transform: 'translate(-50%, -50%)', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(14,165,160,.12) 0%, transparent 70%)', pointerEvents: 'none' },
  card: { position: 'relative', background: '#fff', borderRadius: 'var(--radius-xl)', padding: '3rem 2.5rem', width: '100%', maxWidth: 420, boxShadow: '0 32px 80px rgba(0,0,0,.5)', textAlign: 'center', border: '1px solid rgba(255,255,255,.1)' },
  lockIcon: { fontSize: '2.75rem', marginBottom: '1rem' },
  title: { fontSize: '1.65rem', fontWeight: 900, color: 'var(--gray-900)', marginBottom: '.3rem', letterSpacing: '-.01em' },
  sub: { color: 'var(--gray-400)', fontSize: '.875rem', marginBottom: '2rem', lineHeight: 1.5 },
  error: { background: 'var(--danger-bg)', color: 'var(--danger-text)', padding: '.75rem 1rem', borderRadius: 'var(--radius)', marginBottom: '1.25rem', fontSize: '.875rem', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '.5rem' },
  form: { display: 'flex', flexDirection: 'column', gap: '1.1rem' },
  field: { display: 'flex', flexDirection: 'column', gap: '.35rem', textAlign: 'left' },
  label: { fontWeight: 600, fontSize: '.8rem', color: 'var(--gray-700)', textTransform: 'uppercase', letterSpacing: '.05em' },
  input: { border: '1.5px solid var(--gray-200)', borderRadius: 'var(--radius)', padding: '.7rem .9rem', fontSize: '.95rem', outline: 'none', background: 'var(--gray-50)', color: 'var(--gray-900)', transition: 'border-color .2s' },
  btn: { background: 'linear-gradient(135deg, #0b1e1e 0%, #0d2522 100%)', color: '#fff', border: 'none', borderRadius: 'var(--radius)', padding: '.85rem', fontSize: '1rem', fontWeight: 700, cursor: 'pointer', marginTop: '.25rem', boxShadow: '0 4px 16px rgba(0,0,0,.2)', transition: 'var(--transition)' },
  btnDisabled: { background: 'var(--gray-200)', color: 'var(--gray-400)', border: 'none', borderRadius: 'var(--radius)', padding: '.85rem', fontSize: '1rem', fontWeight: 700, cursor: 'not-allowed', marginTop: '.25rem' },
  securityNote: { marginTop: '2rem', color: 'var(--gray-300)', fontSize: '.78rem', fontWeight: 500 },
};
