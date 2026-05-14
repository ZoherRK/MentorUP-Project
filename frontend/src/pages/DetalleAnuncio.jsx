import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiGetAnuncio, apiCreateReserva, apiVerificarFecha, apiCreateValoracion, apiValoracionesPendientes, apiGetSlotsLibres } from '../services/api';
import { useAuth } from '../App';
import DisponibilidadViewer from '../components/DisponibilidadViewer';

function Estrellas({ puntuacion, size = '1.2rem', interactive = false, onSelect }) {
  const [hover, setHover] = useState(0);
  const shown = interactive ? (hover || puntuacion) : puntuacion;
  return (
    <span style={{ display: 'inline-flex', gap: 2, alignItems: 'center' }}>
      {[1,2,3,4,5].map(n => (
        <span key={n}
          style={{ fontSize: size, cursor: interactive ? 'pointer' : 'default', color: n <= shown ? '#f59e0b' : '#d1d5db', transition: 'color .1s', userSelect: 'none' }}
          onClick={interactive ? () => onSelect(n) : undefined}
          onMouseEnter={interactive ? () => setHover(n) : undefined}
          onMouseLeave={interactive ? () => setHover(0) : undefined}
        >★</span>
      ))}
    </span>
  );
}

export default function DetalleAnuncio() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const { isAuth, usuario } = useAuth();

  const [anuncio,    setAnuncio]    = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [reserva,    setReserva]    = useState({ fecha_clase: '', duracion_h: '1', notas_alumno: '' });
  const [msg,        setMsg]        = useState({ type: '', text: '' });
  const [submitting, setSubmitting] = useState(false);

  // Modal state
  const [modalOpen,  setModalOpen]  = useState(false);

  // Slot picker state
  const [fechaSelec,   setFechaSelec]   = useState('');   // YYYY-MM-DD
  const [slots,        setSlots]        = useState([]);    // ['09:00', '09:30', ...]
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [horaSelec,    setHoraSelec]    = useState('');   // 'HH:MM'

  const [puedeValorar,   setPuedeValorar]   = useState(false);
  const [val,            setVal]            = useState({ puntuacion: 0, comentario: '' });
  const [valMsg,         setValMsg]         = useState({ type: '', text: '' });
  const [valSubmitting,  setValSubmitting]  = useState(false);

  useEffect(() => { loadAnuncio(); }, [id]);

  useEffect(() => {
    if (!isAuth || usuario?.rol !== 'alumno') return;
    apiValoracionesPendientes()
      .then(d => setPuedeValorar((d.data || []).some(r => r.anuncio_id === Number(id))))
      .catch(() => {});
  }, [isAuth, usuario, id]);

  const loadAnuncio = () =>
    apiGetAnuncio(id)
      .then(d => setAnuncio(d.data))
      .catch(() => navigate('/anuncios'))
      .finally(() => setLoading(false));

  // When date changes, load available slots
  const handleFechaChange = async (fecha) => {
    setFechaSelec(fecha);
    setHoraSelec('');
    setSlots([]);
    if (!fecha || !anuncio?.profesor?.id) return;
    setSlotsLoading(true);
    try {
      const res = await apiGetSlotsLibres(anuncio.profesor.id, fecha, reserva.duracion_h);
      setSlots(res.data || []);
    } catch (_) {
      setSlots([]);
    } finally {
      setSlotsLoading(false);
    }
  };

  // When duration changes, reload slots for current date
  const handleDuracionChange = async (dur) => {
    setReserva(r => ({ ...r, duracion_h: dur }));
    setHoraSelec('');
    setSlots([]);
    if (!fechaSelec || !anuncio?.profesor?.id) return;
    setSlotsLoading(true);
    try {
      const res = await apiGetSlotsLibres(anuncio.profesor.id, fechaSelec, dur);
      setSlots(res.data || []);
    } catch (_) {
      setSlots([]);
    } finally {
      setSlotsLoading(false);
    }
  };

  const handleReserva = async (e) => {
    e.preventDefault();
    if (!fechaSelec || !horaSelec) {
      setMsg({ type: 'err', text: 'Selecciona fecha y hora.' });
      return;
    }
    setMsg({ type: '', text: '' });
    setSubmitting(true);
    const fechaClase = `${fechaSelec}T${horaSelec}`;
    try {
      await apiCreateReserva({
        anuncio_id:   Number(id),
        fecha_clase:  fechaClase,
        duracion_h:   Number(reserva.duracion_h),
        notas_alumno: reserva.notas_alumno,
      });
      setMsg({ type: 'ok', text: '✅ Solicitud enviada correctamente. El profesor confirmará tu clase pronto.' });
      setModalOpen(false);
    } catch (err) {
      setMsg({ type: 'err', text: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleValoracion = async (e) => {
    e.preventDefault();
    if (!val.puntuacion) { setValMsg({ type: 'err', text: 'Selecciona una puntuación.' }); return; }
    setValMsg({ type: '', text: '' });
    setValSubmitting(true);
    try {
      await apiCreateValoracion({ anuncio_id: Number(id), puntuacion: val.puntuacion, comentario: val.comentario });
      setValMsg({ type: 'ok', text: '✅ ¡Gracias por tu valoración!' });
      setPuedeValorar(false);
      loadAnuncio();
    } catch (err) {
      setValMsg({ type: 'err', text: err.message });
    } finally { setValSubmitting(false); }
  };

  const precioTotal = anuncio ? (anuncio.precio_hora * Number(reserva.duracion_h)).toFixed(2) : '0';

  if (loading) return (
    <div style={s.loadingWrap}>
      <div style={s.spinner} />
      <span style={{ color: 'var(--gray-400)' }}>Cargando anuncio…</span>
    </div>
  );

  if (!anuncio) return null;

  const prof = anuncio.profesor?.usuario;
  const rating = anuncio.media_valoracion || 0;
  const stars  = Math.round(rating);

  return (
    <div style={s.page}>
      <div style={s.inner}>
        <button onClick={() => navigate('/anuncios')} style={s.back}>
          ← Volver al tablón
        </button>

        <div style={s.layout}>
          {/* ── LEFT ── */}
          <div style={s.main}>
            <div style={s.anuncioHeader}>
              <div style={s.tags}>
                <span style={s.tagAsig}>📚 {anuncio.asignatura}</span>
                <span style={s.tagNivel}>{anuncio.nivel}</span>
                {anuncio.destacado && <span style={s.tagDestacado}>⭐ Destacado</span>}
              </div>
              <h1 style={s.title}>{anuncio.titulo}</h1>
              <div style={s.metaRow}>
                <span style={s.precio}>{anuncio.precio_hora} €<span style={s.precioUnit}>/hora</span></span>
                {rating > 0 && (
                  <div style={s.ratingRow}>
                    <span style={s.stars}>{'★'.repeat(stars)}{'☆'.repeat(5 - stars)}</span>
                    <span style={s.ratingNum}>{rating.toFixed(1)}</span>
                    <span style={s.ratingCount}>({anuncio.valoraciones?.length || 0} reseñas)</span>
                  </div>
                )}
              </div>
            </div>

            <div style={s.section}>
              <h3 style={s.secTitle}>Descripción</h3>
              <p style={s.desc}>{anuncio.descripcion}</p>
            </div>

            {puedeValorar && (
              <div style={s.section}>
                <h3 style={s.secTitle}>⭐ Deja tu valoración</h3>
                <p style={{ color: 'var(--gray-500)', fontSize: '.9rem', marginBottom: '1rem' }}>
                  Has completado una clase con este profesor. ¿Qué te pareció?
                </p>
                {valMsg.text && (
                  <div style={valMsg.type === 'ok' ? s.alertOk : s.alertErr}>{valMsg.text}</div>
                )}
                <form onSubmit={handleValoracion}>
                  <label style={s.label}>Puntuación</label>
                  <div style={{ marginBottom: '1rem' }}>
                    <Estrellas puntuacion={val.puntuacion} size="2rem" interactive onSelect={n => setVal({ ...val, puntuacion: n })} />
                  </div>
                  <label style={s.label}>Comentario <span style={{ color: 'var(--gray-400)', textTransform: 'none', letterSpacing: 0, fontWeight: 400 }}>(opcional)</span></label>
                  <textarea
                    value={val.comentario}
                    onChange={e => setVal({ ...val, comentario: e.target.value })}
                    rows={3}
                    style={{ ...s.input, resize: 'vertical' }}
                    placeholder="Cuéntanos tu experiencia…"
                  />
                  <button type="submit" disabled={valSubmitting} style={valSubmitting ? s.btnDisabled : s.btn}>
                    {valSubmitting ? 'Enviando…' : 'Publicar valoración'}
                  </button>
                </form>
              </div>
            )}

            {anuncio.profesor?.id && (
              <div style={s.section}>
                <DisponibilidadViewer profesorId={anuncio.profesor.id} />
              </div>
            )}

            {anuncio.valoraciones?.length > 0 && (
              <div style={s.section}>
                <h3 style={s.secTitle}>
                  Reseñas <span style={s.reviewCount}>({anuncio.valoraciones.length})</span>
                </h3>
                <div style={s.reviewsList}>
                  {anuncio.valoraciones.map(v => (
                    <div key={v.id} style={s.review}>
                      <div style={s.reviewHeader}>
                        <div style={s.reviewAvatar}>
                          {v.alumno?.usuario?.nombre?.[0]?.toUpperCase() || 'A'}
                        </div>
                        <div>
                          <div style={s.reviewName}>{v.alumno?.usuario?.nombre || 'Alumno anónimo'}</div>
                          <div style={s.reviewStars}>{'★'.repeat(v.puntuacion)}{'☆'.repeat(5 - v.puntuacion)}</div>
                        </div>
                      </div>
                      {v.comentario && <p style={s.reviewComment}>{v.comentario}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── RIGHT ── */}
          <div style={s.sidebar}>
            {prof && (
              <div style={s.profCard}>
                <div style={s.profAvatar}>{prof.nombre?.[0]?.toUpperCase()}</div>
                <div style={s.profName}>{prof.nombre} {prof.apellidos}</div>
                <div style={s.profRole}>Profesor en MentorUP</div>
                {prof.telefono && <div style={s.profContact}>📞 {prof.telefono}</div>}
              </div>
            )}

            {isAuth && usuario?.rol === 'alumno' ? (
              <div style={s.bookCard}>
                <h3 style={s.bookTitle}>📅 Solicitar clase</h3>
                {msg.text && (
                  <div style={msg.type === 'ok' ? s.alertOk : s.alertErr}>{msg.text}</div>
                )}
                {msg.type !== 'ok' && (
                  <button onClick={() => { setModalOpen(true); setMsg({ type: '', text: '' }); }} style={s.btn}>
                    Solicitar clase — {anuncio.precio_hora} €/hora
                  </button>
                )}
                <p style={s.bookNote}>El profesor recibirá tu solicitud y confirmará la clase.</p>
              </div>
            ) : !isAuth ? (
              <div style={s.bookCard}>
                <div style={s.loginPrompt}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '.75rem' }}>🔐</div>
                  <h3 style={{ fontWeight: 700, marginBottom: '.5rem', color: 'var(--gray-900)' }}>
                    Inicia sesión para reservar
                  </h3>
                  <p style={{ color: 'var(--gray-500)', fontSize: '.9rem', marginBottom: '1.25rem' }}>
                    Crea una cuenta gratis o inicia sesión para solicitar esta clase.
                  </p>
                  <button onClick={() => navigate('/login')} style={s.btn}>Iniciar sesión</button>
                  <button onClick={() => navigate('/registro')} style={{ ...s.btnSecondary, marginTop: '.5rem' }}>
                    Crear cuenta gratis
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* ── MODAL ── */}
      {modalOpen && (
        <div style={s.modalOverlay} onClick={() => setModalOpen(false)}>
          <div style={s.modalBox} onClick={e => e.stopPropagation()}>
            <div style={s.modalHeader}>
              <h3 style={s.modalTitle}>📅 Solicitar clase</h3>
              <button onClick={() => setModalOpen(false)} style={s.modalClose}>✕</button>
            </div>

            {msg.text && (
              <div style={msg.type === 'ok' ? s.alertOk : s.alertErr}>{msg.text}</div>
            )}

            <form onSubmit={handleReserva} style={s.bookForm}>
              <div style={s.bookField}>
                <label style={s.label}>Duración</label>
                <select
                  value={reserva.duracion_h}
                  onChange={e => handleDuracionChange(e.target.value)}
                  style={s.input}
                >
                  {[['0.5', '30 min'], ['1', '1 hora'], ['1.5', '1,5 horas'], ['2', '2 horas']].map(([v, l]) => (
                    <option key={v} value={v}>
                      {l} — {(anuncio.precio_hora * Number(v)).toFixed(2)} €
                    </option>
                  ))}
                </select>
              </div>

              <div style={s.bookField}>
                <label style={s.label}>Fecha</label>
                <input
                  type="date"
                  value={fechaSelec}
                  onChange={e => handleFechaChange(e.target.value)}
                  min={new Date(Date.now() + 3600000).toISOString().slice(0, 10)}
                  required
                  style={s.input}
                />
              </div>

              {fechaSelec && (
                <div style={s.bookField}>
                  <label style={s.label}>Hora disponible</label>
                  {slotsLoading ? (
                    <div style={{ color: 'var(--gray-400)', fontSize: '.85rem', padding: '.5rem 0' }}>Cargando horarios…</div>
                  ) : slots.length === 0 ? (
                    <div style={{ color: 'var(--danger-text)', background: 'var(--danger-bg)', borderRadius: 'var(--radius)', padding: '.6rem .9rem', fontSize: '.85rem' }}>
                      No hay horas disponibles para este día. Prueba otra fecha.
                    </div>
                  ) : (
                    <div style={s.slotsGrid}>
                      {slots.map(h => (
                        <button
                          key={h}
                          type="button"
                          onClick={() => setHoraSelec(h)}
                          style={horaSelec === h ? s.slotActive : s.slot}
                        >
                          {h}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div style={s.bookField}>
                <label style={s.label}>Notas <span style={s.optional}>(opcional)</span></label>
                <textarea
                  value={reserva.notas_alumno}
                  onChange={e => setReserva(r => ({ ...r, notas_alumno: e.target.value }))}
                  rows={3}
                  style={{ ...s.input, resize: 'vertical' }}
                  placeholder="Cuéntale al profesor lo que necesitas…"
                />
              </div>

              {horaSelec && (
                <div style={s.priceSummary}>
                  <span style={s.priceSummaryLabel}>
                    {fechaSelec} a las {horaSelec} · {reserva.duracion_h}h
                  </span>
                  <span style={s.priceSummaryVal}>{precioTotal} €</span>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting || !horaSelec}
                style={submitting || !horaSelec ? s.btnDisabled : s.btn}
              >
                {submitting ? 'Enviando solicitud…' : `Confirmar solicitud — ${precioTotal} €`}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const s = {
  page: { background: 'var(--gray-50)', minHeight: 'calc(100vh - 68px)', paddingBottom: '4rem' },
  inner: { maxWidth: 'var(--max-width)', margin: '0 auto', padding: '2rem 1.5rem' },
  loadingWrap: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', minHeight: '50vh', color: 'var(--gray-500)' },
  spinner: { width: 32, height: 32, border: '3px solid var(--gray-200)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin .7s linear infinite' },
  back: { background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 700, cursor: 'pointer', fontSize: '.95rem', marginBottom: '1.5rem', display: 'inline-flex', alignItems: 'center', gap: '.4rem', padding: '.4rem .75rem', borderRadius: 'var(--radius)', transition: 'background .2s' },
  layout: { display: 'grid', gridTemplateColumns: '1fr 360px', gap: '1.75rem', alignItems: 'start' },
  main: { display: 'flex', flexDirection: 'column', gap: '1.5rem' },
  anuncioHeader: { background: '#fff', borderRadius: 'var(--radius-lg)', padding: '2rem', boxShadow: 'var(--shadow)', border: '1px solid var(--gray-100)' },
  tags: { display: 'flex', gap: '.5rem', flexWrap: 'wrap', marginBottom: '1rem' },
  tagAsig: { background: 'var(--primary-light)', color: 'var(--primary-dark)', fontSize: '.8rem', fontWeight: 700, padding: '4px 12px', borderRadius: 'var(--radius-full)' },
  tagNivel: { background: 'var(--gray-100)', color: 'var(--gray-600)', fontSize: '.8rem', fontWeight: 600, padding: '4px 12px', borderRadius: 'var(--radius-full)', textTransform: 'capitalize' },
  tagDestacado: { background: 'var(--warning-bg)', color: 'var(--warning-text)', fontSize: '.8rem', fontWeight: 700, padding: '4px 12px', borderRadius: 'var(--radius-full)' },
  title: { fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontWeight: 900, color: 'var(--gray-900)', marginBottom: '1rem', lineHeight: 1.2, letterSpacing: '-.01em' },
  metaRow: { display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' },
  precio: { fontSize: '2rem', fontWeight: 900, color: 'var(--primary)' },
  precioUnit: { fontSize: '.9rem', fontWeight: 500, color: 'var(--gray-400)' },
  ratingRow: { display: 'flex', alignItems: 'center', gap: '.4rem' },
  stars: { color: '#f59e0b', fontSize: '1.1rem' },
  ratingNum: { fontWeight: 800, color: 'var(--gray-800)', fontSize: '1rem' },
  ratingCount: { color: 'var(--gray-400)', fontSize: '.85rem' },
  section: { background: '#fff', borderRadius: 'var(--radius-lg)', padding: '1.75rem', boxShadow: 'var(--shadow)', border: '1px solid var(--gray-100)' },
  secTitle: { fontWeight: 800, fontSize: '1.05rem', color: 'var(--gray-900)', marginBottom: '1rem' },
  desc: { color: 'var(--gray-600)', lineHeight: 1.8, fontSize: '.95rem' },
  reviewCount: { color: 'var(--gray-400)', fontWeight: 400 },
  reviewsList: { display: 'flex', flexDirection: 'column', gap: '.75rem' },
  review: { background: 'var(--gray-50)', borderRadius: 'var(--radius-md)', padding: '1rem', border: '1px solid var(--gray-100)' },
  reviewHeader: { display: 'flex', alignItems: 'center', gap: '.75rem', marginBottom: '.5rem' },
  reviewAvatar: { width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '.9rem', flexShrink: 0 },
  reviewName: { fontWeight: 700, fontSize: '.875rem', color: 'var(--gray-800)' },
  reviewStars: { color: '#f59e0b', fontSize: '.85rem', marginTop: '.1rem' },
  reviewComment: { color: 'var(--gray-600)', fontSize: '.875rem', lineHeight: 1.6 },
  sidebar: { display: 'flex', flexDirection: 'column', gap: '1.25rem', position: 'sticky', top: 88 },
  profCard: { background: '#fff', borderRadius: 'var(--radius-lg)', padding: '1.75rem', boxShadow: 'var(--shadow)', border: '1px solid var(--gray-100)', textAlign: 'center' },
  profAvatar: { width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.5rem', margin: '0 auto .75rem' },
  profName: { fontWeight: 800, fontSize: '1.1rem', color: 'var(--gray-900)', marginBottom: '.25rem' },
  profRole: { color: 'var(--primary)', fontSize: '.85rem', fontWeight: 600 },
  profContact: { color: 'var(--gray-500)', fontSize: '.85rem', marginTop: '.5rem' },
  bookCard: { background: '#fff', borderRadius: 'var(--radius-lg)', padding: '1.75rem', boxShadow: 'var(--shadow-md)', border: '2px solid var(--primary-light)' },
  bookTitle: { fontWeight: 800, fontSize: '1.1rem', color: 'var(--gray-900)', marginBottom: '1.25rem' },
  bookForm: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  bookField: { display: 'flex', flexDirection: 'column', gap: '.35rem' },
  label: { fontWeight: 600, fontSize: '.8rem', color: 'var(--gray-700)', textTransform: 'uppercase', letterSpacing: '.04em' },
  optional: { fontWeight: 400, color: 'var(--gray-400)', textTransform: 'none', letterSpacing: 0 },
  input: { width: '100%', border: '1.5px solid var(--gray-200)', borderRadius: 'var(--radius)', padding: '.65rem .9rem', fontSize: '.9rem', outline: 'none', background: 'var(--gray-50)', color: 'var(--gray-900)', transition: 'border-color .2s', boxSizing: 'border-box' },
  checkOk:   { fontSize: '.8rem', color: 'var(--success-text)', background: 'var(--success-bg)', borderRadius: 'var(--radius-sm)', padding: '4px 8px', marginTop: '.25rem' },
  checkWarn: { fontSize: '.8rem', color: 'var(--warning-text)', background: 'var(--warning-bg)', borderRadius: 'var(--radius-sm)', padding: '4px 8px', marginTop: '.25rem' },
  priceSummary: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--primary-50)', borderRadius: 'var(--radius)', padding: '.75rem 1rem', border: '1px solid var(--primary-light)' },
  priceSummaryLabel: { fontWeight: 600, color: 'var(--gray-700)', fontSize: '.9rem' },
  priceSummaryVal: { fontWeight: 900, color: 'var(--primary)', fontSize: '1.3rem' },
  btn: { width: '100%', background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)', color: '#fff', border: 'none', borderRadius: 'var(--radius)', padding: '.85rem', fontWeight: 700, cursor: 'pointer', fontSize: '1rem', boxShadow: '0 4px 16px rgba(14,165,160,.3)', transition: 'var(--transition)' },
  btnSecondary: { width: '100%', background: 'none', border: '1.5px solid var(--gray-200)', color: 'var(--gray-600)', borderRadius: 'var(--radius)', padding: '.85rem', fontWeight: 600, cursor: 'pointer', fontSize: '.95rem' },
  btnDisabled: { width: '100%', background: 'var(--gray-200)', color: 'var(--gray-400)', border: 'none', borderRadius: 'var(--radius)', padding: '.85rem', fontWeight: 700, cursor: 'not-allowed', fontSize: '1rem' },
  bookNote: { fontSize: '.78rem', color: 'var(--gray-400)', textAlign: 'center', lineHeight: 1.5 },
  alertOk:  { background: 'var(--success-bg)', color: 'var(--success-text)', padding: '.85rem 1rem', borderRadius: 'var(--radius)', fontSize: '.9rem', fontWeight: 500, marginBottom: '.25rem' },
  alertErr: { background: 'var(--danger-bg)', color: 'var(--danger-text)', padding: '.85rem 1rem', borderRadius: 'var(--radius)', fontSize: '.9rem', fontWeight: 500, marginBottom: '.5rem' },
  loginPrompt: { textAlign: 'center', display: 'flex', flexDirection: 'column' },
  // Modal
  modalOverlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' },
  modalBox: { background: '#fff', borderRadius: 'var(--radius-lg)', padding: '2rem', width: '100%', maxWidth: 480, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,.25)' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' },
  modalTitle: { fontWeight: 800, fontSize: '1.15rem', color: 'var(--gray-900)' },
  modalClose: { background: 'var(--gray-100)', border: 'none', borderRadius: 'var(--radius-sm)', width: 32, height: 32, cursor: 'pointer', fontWeight: 700, fontSize: '1rem', color: 'var(--gray-600)' },
  slotsGrid: { display: 'flex', flexWrap: 'wrap', gap: '.45rem' },
  slot: { background: 'var(--gray-50)', border: '1.5px solid var(--gray-200)', borderRadius: 'var(--radius)', padding: '.4rem .9rem', fontSize: '.875rem', fontWeight: 600, cursor: 'pointer', color: 'var(--gray-700)', transition: 'all .15s' },
  slotActive: { background: 'var(--primary)', border: '1.5px solid var(--primary)', borderRadius: 'var(--radius)', padding: '.4rem .9rem', fontSize: '.875rem', fontWeight: 700, cursor: 'pointer', color: '#fff' },
};