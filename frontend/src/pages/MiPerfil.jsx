import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import {
  apiGetReservas, apiCancelarReserva, apiConfirmarReserva, apiCompletarReserva,
  apiGetAnuncios, apiCreateAnuncio, apiDeleteAnuncio, apiSaveDisponibilidad,
  apiValoracionesPendientes, apiCreateValoracion,
} from '../services/api';
import DisponibilidadEditor from '../components/DisponibilidadEditor';
import DisponibilidadInlineEditor from '../components/DisponibilidadInlineEditor';

function StarPicker({ value, onChange }) {
  const [hover, setHover] = useState(0);
  return (
    <span style={{ display: 'inline-flex', gap: 3 }}>
      {[1,2,3,4,5].map(n => (
        <span key={n}
          style={{ fontSize: '1.8rem', cursor: 'pointer', color: n <= (hover || value) ? '#f59e0b' : '#d1d5db', transition: 'color .1s', userSelect: 'none' }}
          onClick={() => onChange(n)}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
        >★</span>
      ))}
    </span>
  );
}

const ESTADO_CONFIG = {
  pendiente:  { bg: 'var(--warning-bg)',  text: 'var(--warning-text)', label: 'Pendiente' },
  confirmada: { bg: 'var(--success-bg)',  text: 'var(--success-text)', label: 'Confirmada' },
  completada: { bg: 'var(--info-bg)',     text: 'var(--info-text)',    label: 'Completada' },
  cancelada:  { bg: 'var(--danger-bg)',   text: 'var(--danger-text)', label: 'Cancelada' },
};

const NIVELES = ['primaria', 'eso', 'bachillerato', 'universidad', 'adultos', 'otro'];

function ReservaCard({ r, usuario, onAccion }) {
  const est = ESTADO_CONFIG[r.estado] || {};
  const isProfesor = usuario?.rol === 'profesor';

  return (
    <div style={s.reservaCard}>
      <div style={s.reservaHeader}>
        <div style={s.reservaTitle}>
          <h4 style={s.reservaTitulo}>{r.anuncio?.titulo || '—'}</h4>
          {isProfesor && (
            <span style={s.reservaAlumno}>
              👤 {r.alumno?.usuario?.nombre} {r.alumno?.usuario?.apellidos}
            </span>
          )}
        </div>
        <span style={{ ...s.estadoBadge, background: est.bg, color: est.text }}>
          {est.label}
        </span>
      </div>
      <div style={s.reservaMeta}>
        <span>📅 {new Date(r.fecha_clase).toLocaleString('es-ES', { dateStyle: 'medium', timeStyle: 'short' })}</span>
        <span>⏱ {r.duracion_h}h</span>
        <span style={s.reservaPrecio}>💶 {r.precio_total} €</span>
      </div>
      {r.notas_alumno && (
        <div style={s.reservaNotas}>💬 {r.notas_alumno}</div>
      )}
      <div style={s.reservaActions}>
        {(r.estado === 'pendiente' || r.estado === 'confirmada') && (
          <button style={s.btnDanger} onClick={() => onAccion(apiCancelarReserva, r.id)}>
            Cancelar
          </button>
        )}
        {isProfesor && r.estado === 'pendiente' && (
          <button style={s.btnSuccess} onClick={() => onAccion(apiConfirmarReserva, r.id)}>
            ✓ Confirmar
          </button>
        )}
        {isProfesor && r.estado === 'confirmada' && (
          <button style={s.btnInfo} onClick={() => onAccion(apiCompletarReserva, r.id)}>
            ✓ Completada
          </button>
        )}
      </div>
    </div>
  );
}

function AnuncioCard({ a, onEliminar }) {
  const verif = {
    aprobado:  { bg: 'var(--success-bg)', text: 'var(--success-text)', label: 'Aprobado' },
    rechazado: { bg: 'var(--danger-bg)',  text: 'var(--danger-text)',  label: 'Rechazado' },
    pendiente: { bg: 'var(--warning-bg)', text: 'var(--warning-text)', label: 'En revisión' },
  }[a.verificado] || {};

  return (
    <div style={s.anuncioCard}>
      <div style={s.anuncioHeader}>
        <div style={s.anuncioInfo}>
          <h4 style={s.anuncioTitulo}>{a.titulo}</h4>
          <span style={s.anuncioMeta}>{a.asignatura} · {a.nivel} · {a.precio_hora} €/h</span>
        </div>
        <span style={{ ...s.estadoBadge, background: verif.bg, color: verif.text }}>
          {verif.label}
        </span>
      </div>
      {a.verificado === 'rechazado' && (
        <div style={s.anuncioRechazado}>Este anuncio ha sido rechazado por el administrador.</div>
      )}
      <button style={s.btnDanger} onClick={() => onEliminar(a.id)}>
        Desactivar anuncio
      </button>
    </div>
  );
}

export default function MiPerfil() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  const isProfesor = usuario?.rol === 'profesor';
  const tabs = [
    { id: 'reservas',       label: isProfesor ? 'Solicitudes' : 'Mis clases' },
    ...(isProfesor ? [
      { id: 'anuncios',       label: 'Mis anuncios' },
      { id: 'disponibilidad', label: 'Disponibilidad' },
    ] : []),
  ];

  const [tab,      setTab]      = useState('reservas');
  const [reservas, setReservas] = useState([]);
  const [anuncios, setAnuncios] = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [msg,      setMsg]      = useState('');
  const [form,     setForm]     = useState({
    titulo: '', asignatura: '', nivel: 'eso', precio_hora: '', descripcion: '',
  });
  const [showForm,         setShowForm]         = useState(false);
  // Bloques de disponibilidad que se guardarán junto con el nuevo anuncio
  const [formDisponibilidad, setFormDisponibilidad] = useState([]);

  // Valoraciones pendientes (alumnos)
  const [pendientesVal, setPendientesVal] = useState([]);
  const [valForms,      setValForms]      = useState({});
  const [valMsgs,       setValMsgs]       = useState({});

  const loadPendientesVal = async () => {
    if (usuario?.rol !== 'alumno') return;
    try {
      const d = await apiValoracionesPendientes();
      const lista = d.data || [];
      setPendientesVal(lista);
      const forms = {};
      lista.forEach(r => { forms[r.anuncio_id] = { puntuacion: 0, comentario: '' }; });
      setValForms(forms);
    } catch (_) {}
  };

  const enviarValoracion = async (anuncioId) => {
    const f = valForms[anuncioId];
    if (!f?.puntuacion) {
      setValMsgs(m => ({ ...m, [anuncioId]: { type: 'err', text: 'Selecciona una puntuación.' } }));
      return;
    }
    try {
      await apiCreateValoracion({ anuncio_id: anuncioId, puntuacion: f.puntuacion, comentario: f.comentario });
      setValMsgs(m => ({ ...m, [anuncioId]: { type: 'ok', text: '✅ ¡Valoración publicada!' } }));
      setTimeout(() => setPendientesVal(prev => prev.filter(r => r.anuncio_id !== anuncioId)), 1500);
    } catch (e) {
      setValMsgs(m => ({ ...m, [anuncioId]: { type: 'err', text: e.message } }));
    }
  };

  const loadReservas = async () => {
    setLoading(true);
    try { const d = await apiGetReservas(); setReservas(d.data || []); } catch (_) {}
    finally { setLoading(false); }
  };

  const loadAnuncios = async () => {
    setLoading(true);
    try { const d = await apiGetAnuncios(); setAnuncios(d.data?.data || d.data || []); } catch (_) {}
    finally { setLoading(false); }
  };

  useEffect(() => { loadReservas(); loadPendientesVal(); }, []);
  useEffect(() => { if (tab === 'anuncios') loadAnuncios(); }, [tab]);

  const accionReserva = async (fn, id) => {
    try { await fn(id); loadReservas(); }
    catch (e) { setMsg(e.message); }
  };

  const crearAnuncio = async (e) => {
    e.preventDefault();
    try {
      await apiCreateAnuncio({ ...form, precio_hora: Number(form.precio_hora) });

      // Si el profesor configuró disponibilidad en el formulario, guardarla/actualizarla
      if (formDisponibilidad.length > 0) {
        await apiSaveDisponibilidad(formDisponibilidad);
      }

      setMsg('✅ Anuncio creado. Pendiente de aprobación del administrador.');
      setForm({ titulo: '', asignatura: '', nivel: 'eso', precio_hora: '', descripcion: '' });
      setFormDisponibilidad([]);
      setShowForm(false);
      loadAnuncios();
    } catch (e) { setMsg(e.message); }
  };

  const eliminarAnuncio = async (id) => {
    if (!window.confirm('¿Desactivar este anuncio? Dejará de ser visible para los alumnos.')) return;
    try { await apiDeleteAnuncio(id); loadAnuncios(); }
    catch (e) { setMsg(e.message); }
  };

  return (
    <div style={s.page}>
      <div style={s.inner}>

        {/* Profile header */}
        <div style={s.profileHeader}>
          <div style={s.profileLeft}>
            <div style={s.bigAvatar}>
              {usuario?.nombre?.[0]?.toUpperCase()}
            </div>
            <div>
              <h1 style={s.profileName}>{usuario?.nombre} {usuario?.apellidos}</h1>
              <div style={s.profileMeta}>
                <span style={s.rolChip}>{usuario?.rol}</span>
                <span style={s.profileEmail}>{usuario?.email}</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => { logout(); navigate('/login'); }}
            style={s.logoutBtn}
          >
            Cerrar sesión
          </button>
        </div>

        {/* Stats row (profesores) */}
        {isProfesor && (
          <div style={s.statsRow}>
            {[
              { label: 'Anuncios activos',   val: anuncios.filter(a => a.activo && a.verificado === 'aprobado').length || reservas.length > 0 ? '—' : '0' },
              { label: 'Solicitudes recibidas', val: reservas.length },
              { label: 'Clases completadas',  val: reservas.filter(r => r.estado === 'completada').length },
            ].map(({ label, val }) => (
              <div key={label} style={s.statCard}>
                <div style={s.statVal}>{val}</div>
                <div style={s.statLabel}>{label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div style={s.tabBar}>
          {tabs.map(t => (
            <button
              key={t.id}
              style={tab === t.id ? s.tabActive : s.tab}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {msg && (
          <div
            style={msg.startsWith('✅') ? s.alertSuccess : s.alertError}
            onClick={() => setMsg('')}
          >
            {msg} <span style={{ opacity: .6, fontSize: '.8rem' }}>clic para cerrar</span>
          </div>
        )}

        {/* Banner: valoraciones pendientes (alumnos) */}
        {usuario?.rol === 'alumno' && pendientesVal.length > 0 && (
          <div style={s.valBanner}>
            <h3 style={s.valBannerTitle}>⭐ Tienes {pendientesVal.length} clase{pendientesVal.length > 1 ? 's' : ''} por valorar</h3>
            <p style={{ color: '#92400e', fontSize: '.9rem', marginBottom: '1rem' }}>Comparte tu experiencia para ayudar a otros alumnos.</p>
            {pendientesVal.map(r => (
              <div key={r.anuncio_id} style={s.valCard}>
                <p style={{ fontWeight: 700, marginBottom: '.25rem' }}>{r.anuncio?.titulo || 'Clase'}</p>
                <p style={{ fontSize: '.85rem', color: 'var(--gray-500)', marginBottom: '.75rem' }}>
                  👤 {r.anuncio?.profesor?.usuario?.nombre} {r.anuncio?.profesor?.usuario?.apellidos}
                  &nbsp;·&nbsp;📅 {new Date(r.fecha_clase).toLocaleDateString('es-ES')}
                </p>
                {valMsgs[r.anuncio_id]?.text && (
                  <div style={valMsgs[r.anuncio_id].type === 'ok' ? s.valAlertOk : s.valAlertErr}>
                    {valMsgs[r.anuncio_id].text}
                  </div>
                )}
                <div style={{ marginBottom: '.75rem' }}>
                  <StarPicker
                    value={valForms[r.anuncio_id]?.puntuacion || 0}
                    onChange={n => setValForms(f => ({ ...f, [r.anuncio_id]: { ...f[r.anuncio_id], puntuacion: n } }))}
                  />
                </div>
                <textarea
                  placeholder="Comentario (opcional)…"
                  rows={2}
                  value={valForms[r.anuncio_id]?.comentario || ''}
                  onChange={e => setValForms(f => ({ ...f, [r.anuncio_id]: { ...f[r.anuncio_id], comentario: e.target.value } }))}
                  style={{ width: '100%', border: '1.5px solid var(--gray-200)', borderRadius: 'var(--radius)', padding: '.5rem .75rem', fontSize: '.875rem', resize: 'vertical', marginBottom: '.5rem', boxSizing: 'border-box', outline: 'none' }}
                />
                <button style={s.valSubmitBtn} onClick={() => enviarValoracion(r.anuncio_id)}>Enviar valoración</button>
              </div>
            ))}
          </div>
        )}

        {/* ── RESERVAS TAB ──────────────────────────────────────── */}
        {tab === 'reservas' && (
          loading ? (
            <div style={s.loadingBox}><div style={s.spinner} /> Cargando…</div>
          ) : reservas.length === 0 ? (
            <div style={s.emptyState}>
              <div style={s.emptyIcon}>📭</div>
              <h3 style={s.emptyTitle}>No hay solicitudes todavía</h3>
              <p style={s.emptyText}>
                {isProfesor
                  ? 'Cuando un alumno solicite una de tus clases, aparecerá aquí.'
                  : 'Explora el tablón y solicita tu primera clase.'}
              </p>
              {!isProfesor && (
                <button onClick={() => navigate('/anuncios')} style={s.emptyBtn}>
                  🔍 Buscar profesor
                </button>
              )}
            </div>
          ) : (
            <div style={s.list}>
              {reservas.map(r => (
                <ReservaCard key={r.id} r={r} usuario={usuario} onAccion={accionReserva} />
              ))}
            </div>
          )
        )}

        {/* ── ANUNCIOS TAB (profesores) ───────────────────────── */}
        {tab === 'anuncios' && isProfesor && (
          <>
            <div style={s.anunciosTop}>
              <h3 style={s.sectionTitle}>Mis anuncios publicados</h3>
              <button style={s.btnNew} onClick={() => {
                setShowForm(!showForm);
                if (showForm) setFormDisponibilidad([]); // reset al cerrar
              }}>
                {showForm ? '✕ Cancelar' : '+ Nuevo anuncio'}
              </button>
            </div>

            {showForm && (
              <div style={s.formCard}>
                <h4 style={s.formTitle}>Publicar nuevo anuncio</h4>
                <form onSubmit={crearAnuncio} style={s.formGrid}>
                  <div style={s.formField}>
                    <label style={s.formLabel}>Título *</label>
                    <input
                      placeholder="Ej: Clases de Matemáticas para selectividad"
                      value={form.titulo}
                      onChange={e => setForm({ ...form, titulo: e.target.value })}
                      required
                      style={s.formInput}
                    />
                  </div>
                  <div style={s.formRow}>
                    <div style={s.formField}>
                      <label style={s.formLabel}>Asignatura *</label>
                      <input
                        placeholder="Ej: Matemáticas"
                        value={form.asignatura}
                        onChange={e => setForm({ ...form, asignatura: e.target.value })}
                        required
                        style={s.formInput}
                      />
                    </div>
                    <div style={s.formField}>
                      <label style={s.formLabel}>Precio €/h *</label>
                      <input
                        type="number"
                        min="1"
                        placeholder="Ej: 25"
                        value={form.precio_hora}
                        onChange={e => setForm({ ...form, precio_hora: e.target.value })}
                        required
                        style={s.formInput}
                      />
                    </div>
                    <div style={s.formField}>
                      <label style={s.formLabel}>Nivel *</label>
                      <select
                        value={form.nivel}
                        onChange={e => setForm({ ...form, nivel: e.target.value })}
                        style={s.formInput}
                      >
                        {NIVELES.map(n => (
                          <option key={n} value={n}>{n.charAt(0).toUpperCase() + n.slice(1)}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div style={s.formField}>
                    <label style={s.formLabel}>Descripción *</label>
                    <textarea
                      placeholder="Describe tu metodología, experiencia y qué aprenderán los alumnos…"
                      value={form.descripcion}
                      onChange={e => setForm({ ...form, descripcion: e.target.value })}
                      required
                      rows={4}
                      style={{ ...s.formInput, resize: 'vertical' }}
                    />
                  </div>

                  {/* ── Disponibilidad horaria opcional al crear el anuncio ── */}
                  <div style={s.formField}>
                    <DisponibilidadInlineEditor
                      value={formDisponibilidad}
                      onChange={setFormDisponibilidad}
                    />
                  </div>

                  <div style={s.formActions}>
                    <button type="button" onClick={() => { setShowForm(false); setFormDisponibilidad([]); }} style={s.btnCancel}>
                      Cancelar
                    </button>
                    <button type="submit" style={s.btnSubmit}>
                      Publicar anuncio
                    </button>
                  </div>
                </form>
                <p style={s.formNote}>
                  📌 Tu anuncio quedará pendiente de revisión por el administrador antes de ser visible.
                  {formDisponibilidad.length > 0 && (
                    <> · ✅ Se guardarán <strong>{formDisponibilidad.length}</strong> franja{formDisponibilidad.length > 1 ? 's' : ''} de disponibilidad.</>
                  )}
                </p>
              </div>
            )}

            {loading ? (
              <div style={s.loadingBox}><div style={s.spinner} /> Cargando…</div>
            ) : anuncios.length === 0 ? (
              <div style={s.emptyState}>
                <div style={s.emptyIcon}>📝</div>
                <h3 style={s.emptyTitle}>Sin anuncios publicados</h3>
                <p style={s.emptyText}>Crea tu primer anuncio para empezar a recibir alumnos.</p>
              </div>
            ) : (
              <div style={s.list}>
                {anuncios.map(a => (
                  <AnuncioCard key={a.id} a={a} onEliminar={eliminarAnuncio} />
                ))}
              </div>
            )}
          </>
        )}

        {/* ── DISPONIBILIDAD TAB (profesores) ─────────────────── */}
        {tab === 'disponibilidad' && isProfesor && (
          <DisponibilidadEditor />
        )}
      </div>
    </div>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────
const s = {
  page: { background: 'var(--gray-50)', minHeight: 'calc(100vh - 68px)', paddingBottom: '4rem' },
  inner: { maxWidth: 900, margin: '0 auto', padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' },
  // Profile header
  profileHeader: { background: '#fff', borderRadius: 'var(--radius-lg)', padding: '1.75rem 2rem', boxShadow: 'var(--shadow)', border: '1px solid var(--gray-100)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' },
  profileLeft: { display: 'flex', alignItems: 'center', gap: '1.25rem' },
  bigAvatar: { width: 60, height: 60, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.5rem', flexShrink: 0 },
  profileName: { fontSize: '1.4rem', fontWeight: 800, color: 'var(--gray-900)', letterSpacing: '-.01em' },
  profileMeta: { display: 'flex', alignItems: 'center', gap: '.75rem', marginTop: '.25rem', flexWrap: 'wrap' },
  rolChip: { background: 'var(--primary-light)', color: 'var(--primary)', fontSize: '.78rem', fontWeight: 700, padding: '2px 10px', borderRadius: 'var(--radius-full)', textTransform: 'capitalize' },
  profileEmail: { color: 'var(--gray-400)', fontSize: '.875rem' },
  logoutBtn: { border: '1.5px solid var(--gray-200)', color: 'var(--gray-500)', background: 'none', borderRadius: 'var(--radius)', padding: '.45rem 1rem', cursor: 'pointer', fontWeight: 600, fontSize: '.875rem', transition: 'var(--transition)' },
  // Stats
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' },
  statCard: { background: '#fff', borderRadius: 'var(--radius-md)', padding: '1.25rem', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--gray-100)', textAlign: 'center' },
  statVal: { fontSize: '1.75rem', fontWeight: 900, color: 'var(--primary)', marginBottom: '.25rem' },
  statLabel: { fontSize: '.8rem', color: 'var(--gray-500)', fontWeight: 500 },
  // Tabs
  tabBar: { display: 'flex', gap: '.5rem', background: '#fff', borderRadius: 'var(--radius-md)', padding: '.4rem', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--gray-100)', flexWrap: 'wrap' },
  tab: { background: 'none', border: 'none', color: 'var(--gray-500)', fontWeight: 600, cursor: 'pointer', padding: '.55rem 1.1rem', borderRadius: 'var(--radius-sm)', fontSize: '.9rem', transition: 'var(--transition)' },
  tabActive: { background: 'var(--primary)', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer', padding: '.55rem 1.1rem', borderRadius: 'var(--radius-sm)', fontSize: '.9rem', boxShadow: '0 2px 8px rgba(14,165,160,.3)' },
  // Alerts
  alertSuccess: { background: 'var(--success-bg)', color: 'var(--success-text)', padding: '.75rem 1rem', borderRadius: 'var(--radius)', cursor: 'pointer', fontSize: '.875rem', fontWeight: 500 },
  alertError: { background: 'var(--danger-bg)', color: 'var(--danger-text)', padding: '.75rem 1rem', borderRadius: 'var(--radius)', cursor: 'pointer', fontSize: '.875rem', fontWeight: 500 },
  loadingBox: { display: 'flex', alignItems: 'center', gap: '.75rem', color: 'var(--gray-500)', padding: '2rem', justifyContent: 'center' },
  spinner: { width: 20, height: 20, border: '2px solid var(--gray-200)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin .7s linear infinite' },
  list: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  // Reserva card
  reservaCard: { background: '#fff', borderRadius: 'var(--radius-md)', padding: '1.35rem', boxShadow: 'var(--shadow)', border: '1px solid var(--gray-100)' },
  reservaHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '.75rem', gap: '1rem', flexWrap: 'wrap' },
  reservaTitle: { flex: 1 },
  reservaTitulo: { fontWeight: 700, color: 'var(--gray-900)', marginBottom: '.2rem' },
  reservaAlumno: { color: 'var(--gray-500)', fontSize: '.875rem' },
  estadoBadge: { fontSize: '.75rem', fontWeight: 700, padding: '3px 12px', borderRadius: 'var(--radius-full)', whiteSpace: 'nowrap', flexShrink: 0 },
  reservaMeta: { display: 'flex', gap: '1.25rem', flexWrap: 'wrap', color: 'var(--gray-500)', fontSize: '.875rem', marginBottom: '.5rem' },
  reservaPrecio: { fontWeight: 700, color: 'var(--primary)' },
  reservaNotas: { background: 'var(--gray-50)', borderRadius: 'var(--radius-sm)', padding: '.5rem .75rem', fontSize: '.85rem', color: 'var(--gray-600)', marginTop: '.5rem', marginBottom: '.5rem' },
  reservaActions: { display: 'flex', gap: '.6rem', marginTop: '.75rem', flexWrap: 'wrap' },
  btnSuccess: { background: 'var(--success-bg)', color: 'var(--success-text)', border: 'none', borderRadius: 'var(--radius-sm)', padding: '.4rem 1rem', fontWeight: 700, cursor: 'pointer', fontSize: '.85rem' },
  btnInfo:    { background: 'var(--info-bg)', color: 'var(--info-text)', border: 'none', borderRadius: 'var(--radius-sm)', padding: '.4rem 1rem', fontWeight: 700, cursor: 'pointer', fontSize: '.85rem' },
  btnDanger:  { background: 'var(--danger-bg)', color: 'var(--danger-text)', border: 'none', borderRadius: 'var(--radius-sm)', padding: '.4rem 1rem', fontWeight: 700, cursor: 'pointer', fontSize: '.85rem' },
  // Anuncio card
  anunciosTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' },
  sectionTitle: { fontWeight: 800, fontSize: '1.05rem', color: 'var(--gray-900)' },
  btnNew: { background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: 'var(--radius)', padding: '.5rem 1.1rem', fontWeight: 700, cursor: 'pointer', fontSize: '.875rem' },
  anuncioCard: { background: '#fff', borderRadius: 'var(--radius-md)', padding: '1.35rem', boxShadow: 'var(--shadow)', border: '1px solid var(--gray-100)', display: 'flex', flexDirection: 'column', gap: '.75rem' },
  anuncioHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' },
  anuncioInfo: { flex: 1 },
  anuncioTitulo: { fontWeight: 700, color: 'var(--gray-900)', marginBottom: '.25rem' },
  anuncioMeta: { color: 'var(--gray-500)', fontSize: '.875rem' },
  anuncioRechazado: { background: 'var(--danger-bg)', color: 'var(--danger-text)', borderRadius: 'var(--radius-sm)', padding: '.5rem .75rem', fontSize: '.85rem' },
  // Form
  formCard: { background: '#fff', borderRadius: 'var(--radius-lg)', padding: '1.75rem', boxShadow: 'var(--shadow)', border: '2px solid var(--primary-light)', animation: 'fadeIn .25s ease' },
  formTitle: { fontWeight: 800, fontSize: '1.05rem', color: 'var(--gray-900)', marginBottom: '1.25rem' },
  formGrid: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  formRow: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' },
  formField: { display: 'flex', flexDirection: 'column', gap: '.35rem' },
  formLabel: { fontWeight: 600, fontSize: '.8rem', color: 'var(--gray-700)', textTransform: 'uppercase', letterSpacing: '.04em' },
  formInput: { border: '1.5px solid var(--gray-200)', borderRadius: 'var(--radius)', padding: '.65rem .9rem', fontSize: '.9rem', background: 'var(--gray-50)', outline: 'none', transition: 'border-color .2s', color: 'var(--gray-900)', width: '100%', boxSizing: 'border-box' },
  formActions: { display: 'flex', gap: '.75rem', justifyContent: 'flex-end' },
  btnCancel: { background: 'var(--gray-100)', color: 'var(--gray-600)', border: 'none', borderRadius: 'var(--radius)', padding: '.6rem 1.25rem', fontWeight: 600, cursor: 'pointer' },
  btnSubmit: { background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: 'var(--radius)', padding: '.6rem 1.5rem', fontWeight: 700, cursor: 'pointer' },
  formNote: { color: 'var(--gray-400)', fontSize: '.8rem', marginTop: '.75rem' },
  // Valoraciones pending banner
  valBanner:      { background: '#fef3c7', border: '2px solid #f59e0b', borderRadius: 'var(--radius-lg)', padding: '1.5rem', marginBottom: '.5rem' },
  valBannerTitle: { fontWeight: 800, color: '#92400e', marginBottom: '.25rem', fontSize: '1.05rem' },
  valCard:        { background: '#fff', borderRadius: 'var(--radius-md)', padding: '1rem', marginBottom: '1rem', boxShadow: 'var(--shadow-sm)' },
  valAlertOk:     { background: 'var(--success-bg)', color: 'var(--success-text)', padding: '.6rem .9rem', borderRadius: 'var(--radius)', marginBottom: '.75rem', fontSize: '.875rem' },
  valAlertErr:    { background: 'var(--danger-bg)', color: 'var(--danger-text)', padding: '.6rem .9rem', borderRadius: 'var(--radius)', marginBottom: '.75rem', fontSize: '.875rem' },
  valSubmitBtn:   { background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: 'var(--radius)', padding: '.45rem 1rem', cursor: 'pointer', fontWeight: 700, fontSize: '.875rem' },
  // Empty state
  emptyState: { background: '#fff', borderRadius: 'var(--radius-lg)', padding: '3.5rem 2rem', textAlign: 'center', boxShadow: 'var(--shadow)', border: '1px solid var(--gray-100)' },
  emptyIcon: { fontSize: '3rem', marginBottom: '.75rem' },
  emptyTitle: { fontWeight: 700, fontSize: '1.1rem', color: 'var(--gray-800)', marginBottom: '.4rem' },
  emptyText: { color: 'var(--gray-500)', fontSize: '.9rem', marginBottom: '1.25rem' },
  emptyBtn: { background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: 'var(--radius)', padding: '.65rem 1.5rem', fontWeight: 700, cursor: 'pointer' },
};
