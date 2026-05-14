import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiRegister } from '../services/api';
import { useAuth } from '../App';

export default function Registro() {
  const { login }   = useAuth();
  const navigate    = useNavigate();
  const [form, setForm]       = useState({
    nombre: '', apellidos: '', email: '',
    password: '', password_confirmation: '',
    rol: 'alumno', telefono: '',
  });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep]       = useState(1); // 1 = datos personales, 2 = credenciales

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleNext = (e) => {
    e.preventDefault();
    if (!form.nombre || !form.apellidos) { setError('Por favor completa nombre y apellidos.'); return; }
    setError('');
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.password_confirmation) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    setLoading(true);
    try {
      const data = await apiRegister(form);
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
      <div style={s.card}>

        {/* Header */}
        <div style={s.header}>
          <h1 style={s.title}>Crear cuenta</h1>
          <p style={s.sub}>Únete a MentorUP hoy mismo — es gratis</p>
        </div>

        {/* Role selector */}
        <div style={s.roleGrid}>
          {[
            { val: 'alumno',   icon: '🎓', label: 'Alumno',   desc: 'Quiero encontrar profesor' },
            { val: 'profesor', icon: '👨‍🏫', label: 'Profesor', desc: 'Quiero dar clases' },
          ].map(({ val, icon, label, desc }) => (
            <button
              key={val}
              type="button"
              onClick={() => setForm({ ...form, rol: val })}
              style={form.rol === val ? s.roleActive : s.role}
            >
              <span style={s.roleIcon}>{icon}</span>
              <span style={s.roleLabel}>{label}</span>
              <span style={s.roleDesc}>{desc}</span>
              {form.rol === val && <span style={s.roleCheck}>✓</span>}
            </button>
          ))}
        </div>

        {/* Steps indicator */}
        <div style={s.steps}>
          {['Datos personales', 'Acceso'].map((label, i) => (
            <div key={i} style={s.stepItem}>
              <div style={step > i ? s.stepDone : step === i + 1 ? s.stepActive : s.stepPending}>
                {step > i + 1 ? '✓' : i + 1}
              </div>
              <span style={step === i + 1 ? s.stepLabelActive : s.stepLabel}>{label}</span>
            </div>
          ))}
          <div style={s.stepLine} />
        </div>

        {error && (
          <div style={s.errorBox}>
            <span>⚠️</span> {error}
          </div>
        )}

        {/* Step 1: Personal data */}
        {step === 1 && (
          <form onSubmit={handleNext} style={s.form}>
            <div style={s.row}>
              <div style={s.field}>
                <label style={s.label}>Nombre *</label>
                <input name="nombre" value={form.nombre} onChange={handleChange} required style={s.input} placeholder="Ana" />
              </div>
              <div style={s.field}>
                <label style={s.label}>Apellidos *</label>
                <input name="apellidos" value={form.apellidos} onChange={handleChange} required style={s.input} placeholder="García López" />
              </div>
            </div>
            <div style={s.field}>
              <label style={s.label}>Teléfono <span style={s.optional}>(opcional)</span></label>
              <input name="telefono" type="tel" value={form.telefono} onChange={handleChange} style={s.input} placeholder="+34 600 000 000" />
            </div>
            <button type="submit" style={s.btn}>
              Continuar →
            </button>
          </form>
        )}

        {/* Step 2: Credentials */}
        {step === 2 && (
          <form onSubmit={handleSubmit} style={s.form}>
            <div style={s.field}>
              <label style={s.label}>Correo electrónico *</label>
              <input name="email" type="email" value={form.email} onChange={handleChange} required style={s.input} placeholder="tu@email.com" />
            </div>
            <div style={s.field}>
              <label style={s.label}>Contraseña * <span style={s.optional}>(mín. 8 caracteres)</span></label>
              <input name="password" type="password" value={form.password} onChange={handleChange} required style={s.input} placeholder="••••••••" />
            </div>
            <div style={s.field}>
              <label style={s.label}>Confirmar contraseña *</label>
              <input name="password_confirmation" type="password" value={form.password_confirmation} onChange={handleChange} required style={s.input} placeholder="••••••••" />
            </div>

            {/* Password strength hint */}
            {form.password && (
              <div style={s.strengthBar}>
                {[...Array(4)].map((_, i) => (
                  <div key={i} style={{
                    ...s.strengthSegment,
                    background: form.password.length >= (i + 1) * 2
                      ? form.password.length >= 8 ? 'var(--success)' : 'var(--warning)'
                      : 'var(--gray-200)',
                  }} />
                ))}
              </div>
            )}

            <div style={s.backAndSubmit}>
              <button type="button" onClick={() => setStep(1)} style={s.btnBack}>
                ← Atrás
              </button>
              <button type="submit" disabled={loading} style={loading ? s.btnDisabled : s.btn}>
                {loading ? 'Creando cuenta…' : '🚀 Crear cuenta gratis'}
              </button>
            </div>

            <p style={s.terms}>
              Al registrarte aceptas nuestros <a href="#" style={s.link}>Términos de uso</a> y{' '}
              <a href="#" style={s.link}>Política de privacidad</a>.
            </p>
          </form>
        )}

        <p style={s.footer}>
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" style={s.link}>Iniciar sesión</Link>
        </p>
      </div>
    </div>
  );
}

const s = {
  page: { minHeight: 'calc(100vh - 68px)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--gray-50)', padding: '2rem 1rem' },
  card: { background: '#fff', borderRadius: 'var(--radius-xl)', padding: '2.5rem', width: '100%', maxWidth: 540, boxShadow: 'var(--shadow-lg)', border: '1px solid var(--gray-100)' },
  header: { textAlign: 'center', marginBottom: '1.75rem' },
  title: { fontSize: '1.9rem', fontWeight: 900, color: 'var(--gray-900)', letterSpacing: '-.01em', marginBottom: '.3rem' },
  sub: { color: 'var(--gray-500)', fontSize: '.95rem' },
  roleGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.75rem', marginBottom: '1.75rem' },
  role: { background: 'var(--gray-50)', border: '2px solid var(--gray-200)', borderRadius: 'var(--radius-md)', padding: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '.25rem', cursor: 'pointer', position: 'relative', transition: 'var(--transition)' },
  roleActive: { background: 'var(--primary-light)', border: '2px solid var(--primary)', borderRadius: 'var(--radius-md)', padding: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '.25rem', cursor: 'pointer', position: 'relative', transition: 'var(--transition)' },
  roleIcon: { fontSize: '1.75rem' },
  roleLabel: { fontWeight: 700, fontSize: '.95rem', color: 'var(--gray-800)' },
  roleDesc: { fontSize: '.78rem', color: 'var(--gray-500)', textAlign: 'center' },
  roleCheck: { position: 'absolute', top: 8, right: 10, color: 'var(--primary)', fontWeight: 900, fontSize: '.85rem' },
  steps: { display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.5rem', position: 'relative', justifyContent: 'center' },
  stepLine: { position: 'absolute', top: 14, left: '25%', right: '25%', height: 2, background: 'var(--gray-200)', zIndex: 0 },
  stepItem: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '.35rem', position: 'relative', zIndex: 1 },
  stepActive: { width: 28, height: 28, borderRadius: '50%', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.8rem', fontWeight: 800 },
  stepDone: { width: 28, height: 28, borderRadius: '50%', background: 'var(--success)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.8rem', fontWeight: 800 },
  stepPending: { width: 28, height: 28, borderRadius: '50%', background: 'var(--gray-200)', color: 'var(--gray-400)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.8rem', fontWeight: 700 },
  stepLabel: { fontSize: '.75rem', color: 'var(--gray-400)', fontWeight: 500 },
  stepLabelActive: { fontSize: '.75rem', color: 'var(--primary)', fontWeight: 700 },
  errorBox: { background: 'var(--danger-bg)', color: 'var(--danger-text)', padding: '.75rem 1rem', borderRadius: 'var(--radius)', marginBottom: '1rem', fontSize: '.875rem', display: 'flex', alignItems: 'center', gap: '.5rem' },
  form: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  row: { display: 'flex', gap: '1rem' },
  field: { display: 'flex', flexDirection: 'column', gap: '.35rem', flex: 1 },
  label: { fontWeight: 600, fontSize: '.875rem', color: 'var(--gray-700)' },
  optional: { color: 'var(--gray-400)', fontWeight: 400, fontSize: '.8rem' },
  input: { border: '1.5px solid var(--gray-200)', borderRadius: 'var(--radius)', padding: '.7rem .9rem', fontSize: '.95rem', background: 'var(--gray-50)', outline: 'none', transition: 'border-color .2s', color: 'var(--gray-900)' },
  strengthBar: { display: 'flex', gap: '.35rem', height: 4 },
  strengthSegment: { flex: 1, borderRadius: 2, transition: 'background .2s' },
  backAndSubmit: { display: 'flex', gap: '.75rem', marginTop: '.25rem' },
  btn: { flex: 1, background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)', color: '#fff', border: 'none', borderRadius: 'var(--radius)', padding: '.8rem', fontSize: '1rem', fontWeight: 700, cursor: 'pointer', transition: 'var(--transition)', boxShadow: '0 4px 16px rgba(14,165,160,.3)' },
  btnBack: { background: 'var(--gray-100)', color: 'var(--gray-600)', border: 'none', borderRadius: 'var(--radius)', padding: '.8rem 1.2rem', fontWeight: 600, cursor: 'pointer' },
  btnDisabled: { flex: 1, background: 'var(--gray-200)', color: 'var(--gray-400)', border: 'none', borderRadius: 'var(--radius)', padding: '.8rem', fontSize: '1rem', fontWeight: 700, cursor: 'not-allowed' },
  terms: { fontSize: '.8rem', color: 'var(--gray-400)', textAlign: 'center', lineHeight: 1.5 },
  footer: { textAlign: 'center', color: 'var(--gray-500)', fontSize: '.9rem', marginTop: '1.5rem', borderTop: '1px solid var(--gray-100)', paddingTop: '1.5rem' },
  link: { color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' },
};
