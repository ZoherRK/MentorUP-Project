import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import {
  apiAdminStats, apiAdminAnuncios, apiAdminVerificar, apiAdminEliminarAnuncio,
  apiAdminAlumnos, apiAdminProfesores, apiAdminBloquear, apiAdminEliminarUsuario,
  apiLogout,
} from '../services/api';

const VERIF_CONFIG = {
  aprobado:  { bg: 'var(--success-bg)', text: 'var(--success-text)', label: 'Aprobado' },
  rechazado: { bg: 'var(--danger-bg)',  text: 'var(--danger-text)',  label: 'Rechazado' },
  pendiente: { bg: 'var(--warning-bg)', text: 'var(--warning-text)', label: 'Pendiente' },
};

function StatCard({ label, value, color, icon }) {
  return (
    <div style={{ ...s.statCard, borderTop: `3px solid ${color}` }}>
      <div style={s.statIcon}>{icon}</div>
      <div style={{ ...s.statValue, color }}>{value ?? '—'}</div>
      <div style={s.statLabel}>{label}</div>
    </div>
  );
}

export default function AdminDashboard() {
  const { logout } = useAuth();
  const navigate   = useNavigate();

  const [tab,       setTab]       = useState('stats');
  const [stats,     setStats]     = useState(null);
  const [anuncios,  setAnuncios]  = useState([]);
  const [alumnos,   setAlumnos]   = useState([]);
  const [profesores,setProfesores]= useState([]);
  const [loading,   setLoading]   = useState(false);
  const [msg,       setMsg]       = useState({ type: '', text: '' });
  const [filtroV,   setFiltroV]   = useState('');

  const flash = (type, text) => {
    setMsg({ type, text });
    setTimeout(() => setMsg({ type: '', text: '' }), 3500);
  };

  const loadStats     = async () => { setLoading(true); try { const d = await apiAdminStats(); setStats(d.data); } catch (_) {} finally { setLoading(false); }};
  const loadAnuncios  = async (est = '') => { setLoading(true); try { const d = await apiAdminAnuncios(est ? { estado: est } : {}); setAnuncios(d.data?.data || d.data || []); } catch (_) {} finally { setLoading(false); }};
  const loadAlumnos   = async () => { setLoading(true); try { const d = await apiAdminAlumnos(); setAlumnos(d.data || []); } catch (_) {} finally { setLoading(false); }};
  const loadProfesores= async () => { setLoading(true); try { const d = await apiAdminProfesores(); setProfesores(d.data || []); } catch (_) {} finally { setLoading(false); }};

  useEffect(() => { loadStats(); }, []);
  useEffect(() => {
    if (tab === 'anuncios')   loadAnuncios(filtroV);
    if (tab === 'alumnos')    loadAlumnos();
    if (tab === 'profesores') loadProfesores();
  }, [tab, filtroV]);

  const verificar = async (id, accion) => {
    try { await apiAdminVerificar(id, accion); flash('ok', `Anuncio ${accion}.`); loadAnuncios(filtroV); }
    catch (e) { flash('err', e.message); }
  };
  const eliminarAnuncio = async (id) => {
    if (!window.confirm('¿Eliminar este anuncio permanentemente?')) return;
    try { await apiAdminEliminarAnuncio(id); flash('ok', 'Anuncio eliminado.'); loadAnuncios(filtroV); }
    catch (e) { flash('err', e.message); }
  };
  const bloquear = async (id, bloqueado) => {
    try { await apiAdminBloquear(id, bloqueado); flash('ok', bloqueado ? 'Usuario bloqueado.' : 'Usuario desbloqueado.'); tab === 'alumnos' ? loadAlumnos() : loadProfesores(); }
    catch (e) { flash('err', e.message); }
  };
  const eliminarUsuario = async (id) => {
    if (!window.confirm('¿Eliminar este usuario? Esta acción no se puede deshacer.')) return;
    try { await apiAdminEliminarUsuario(id); flash('ok', 'Usuario eliminado.'); tab === 'alumnos' ? loadAlumnos() : loadProfesores(); }
    catch (e) { flash('err', e.message); }
  };
  const handleLogout = async () => {
    try { await apiLogout(); } catch (_) {}
    logout();
    navigate('/admin/login');
  };

  const usuarios = tab === 'alumnos' ? alumnos : profesores;

  return (
    <div style={s.layout}>
      {/* ── Sidebar ────────────────────────────────────────────── */}
      <aside style={s.sidebar}>
        <div style={s.brand}>
          <span style={s.brandText}>Mentor<span style={{ color: 'var(--primary)' }}>UP</span></span>
          <span style={s.brandBadge}>Admin</span>
        </div>

        <nav style={s.nav}>
          {[
            { id: 'stats',      label: 'Dashboard' },
            { id: 'anuncios',   label: 'Anuncios' },
            { id: 'alumnos',    label: 'Alumnos' },
            { id: 'profesores', label: 'Profesores' },
          ].map(({ id, icon, label }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              style={tab === id ? s.navActive : s.navItem}
            >
              <span style={s.navIcon}>{icon}</span>
              {label}
              {id === 'anuncios' && stats?.anuncios_pendientes > 0 && (
                <span style={s.navBadge}>{stats.anuncios_pendientes}</span>
              )}
            </button>
          ))}
        </nav>

        <button onClick={handleLogout} style={s.logoutBtn}>
          Cerrar sesión
        </button>
      </aside>

      {/* ── Main ───────────────────────────────────────────────── */}
      <main style={s.main}>
        {/* Toast message */}
        {msg.text && (
          <div style={msg.type === 'ok' ? s.toastOk : s.toastErr}>
            {msg.type === 'ok' ? '✅' : '⚠️'} {msg.text}
          </div>
        )}

        {/* ── STATS ──────────────────────────────────────────── */}
        {tab === 'stats' && (
          <>
            <div style={s.pageHeader}>
              <h1 style={s.pageTitle}>Dashboard</h1>
              <p style={s.pageSub}>Resumen de actividad de la plataforma</p>
            </div>

            {loading ? (
              <div style={s.loadingBox}><div style={s.spinner} /> Cargando estadísticas…</div>
            ) : stats ? (
              <div style={s.statsGrid}>
                <StatCard label="Total usuarios"       value={stats.total_usuarios}       color="#6366f1" icon="👥" />
                <StatCard label="Alumnos"              value={stats.total_alumnos}        color="var(--primary)" icon="🎓" />
                <StatCard label="Profesores"           value={stats.total_profesores}     color="#0891b2" icon="👨‍🏫" />
                <StatCard label="Anuncios aprobados"   value={stats.anuncios_aprobados}   color="var(--success)" icon="✅" />
                <StatCard label="Pendientes revisión"  value={stats.anuncios_pendientes}  color="var(--warning)" icon="⏳" />
                <StatCard label="Anuncios rechazados"  value={stats.anuncios_rechazados}  color="var(--danger)"  icon="❌" />
                <StatCard label="Usuarios bloqueados"  value={stats.usuarios_bloqueados}  color="#9f1239"        icon="🚫" />
              </div>
            ) : (
              <p style={s.empty}>No se pudieron cargar las estadísticas.</p>
            )}

            {stats?.anuncios_pendientes > 0 && (
              <div style={s.pendingAlert}>
                <span style={{ fontSize: '1.25rem' }}>⚠️</span>
                <div>
                  <strong>Hay {stats.anuncios_pendientes} anuncio{stats.anuncios_pendientes > 1 ? 's' : ''} pendiente{stats.anuncios_pendientes > 1 ? 's' : ''} de revisión</strong>
                  <p style={{ color: 'var(--warning-text)', fontSize: '.875rem', marginTop: '.25rem' }}>
                    Revísalos para que los profesores puedan comenzar a recibir alumnos.
                  </p>
                </div>
                <button onClick={() => setTab('anuncios')} style={s.pendingBtn}>
                  Revisar ahora →
                </button>
              </div>
            )}
          </>
        )}

        {/* ── ANUNCIOS ───────────────────────────────────────── */}
        {tab === 'anuncios' && (
          <>
            <div style={s.pageHeader}>
              <div>
                <h1 style={s.pageTitle}>Gestión de anuncios</h1>
                <p style={s.pageSub}>{anuncios.length} anuncio{anuncios.length !== 1 ? 's' : ''}</p>
              </div>
              <select
                value={filtroV}
                onChange={e => setFiltroV(e.target.value)}
                style={s.filterSelect}
              >
                <option value="">Todos los estados</option>
                <option value="pendiente">Pendientes</option>
                <option value="aprobado">Aprobados</option>
                <option value="rechazado">Rechazados</option>
              </select>
            </div>

            {loading ? (
              <div style={s.loadingBox}><div style={s.spinner} /> Cargando…</div>
            ) : anuncios.length === 0 ? (
              <div style={s.emptyState}>
                <div style={s.emptyIcon}>📋</div>
                <p>No hay anuncios con este filtro.</p>
              </div>
            ) : (
              <div style={s.tableCard}>
                <div style={s.tableHead}>
                  <span>Anuncio</span>
                  <span>Profesor</span>
                  <span>Asignatura</span>
                  <span>Precio</span>
                  <span>Estado</span>
                  <span>Acciones</span>
                </div>
                {anuncios.map(a => {
                  const vc = VERIF_CONFIG[a.verificado] || {};
                  return (
                    <div key={a.id} style={s.tableRow}>
                      <div style={s.cellMain}>
                        <span style={s.cellTitle}>{a.titulo}</span>
                        <span style={s.cellSub}>{a.nivel}</span>
                      </div>
                      <span style={s.cellText}>{a.profesor?.usuario?.nombre || '—'}</span>
                      <span style={s.cellText}>{a.asignatura}</span>
                      <span style={{ ...s.cellText, fontWeight: 700, color: 'var(--primary)' }}>{a.precio_hora} €/h</span>
                      <span style={{ ...s.badge, background: vc.bg, color: vc.text }}>{vc.label}</span>
                      <div style={s.tableActions}>
                        {a.verificado !== 'aprobado' && (
                          <button style={s.actionBtnOk} onClick={() => verificar(a.id, 'aprobado')} title="Aprobar">✓</button>
                        )}
                        {a.verificado !== 'rechazado' && (
                          <button style={s.actionBtnWarn} onClick={() => verificar(a.id, 'rechazado')} title="Rechazar">✕</button>
                        )}
                        <button style={s.actionBtnDel} onClick={() => eliminarAnuncio(a.id)} title="Eliminar">🗑</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* ── ALUMNOS / PROFESORES ───────────────────────────── */}
        {(tab === 'alumnos' || tab === 'profesores') && (
          <>
            <div style={s.pageHeader}>
              <div>
                <h1 style={s.pageTitle}>{tab === 'alumnos' ? 'Gestión de alumnos' : 'Gestión de profesores'}</h1>
                <p style={s.pageSub}>{usuarios.length} usuario{usuarios.length !== 1 ? 's' : ''}</p>
              </div>
            </div>

            {loading ? (
              <div style={s.loadingBox}><div style={s.spinner} /> Cargando…</div>
            ) : usuarios.length === 0 ? (
              <div style={s.emptyState}>
                <div style={s.emptyIcon}>👤</div>
                <p>No hay usuarios registrados.</p>
              </div>
            ) : (
              <div style={s.tableCard}>
                <div style={{ ...s.tableHead, gridTemplateColumns: '1fr 1fr 1fr auto auto' }}>
                  <span>Usuario</span>
                  <span>Email</span>
                  <span>Teléfono</span>
                  <span>Estado</span>
                  <span>Acciones</span>
                </div>
                {usuarios.map(u => {
                  const usuario = u.usuario || u;
                  return (
                    <div key={u.id} style={{ ...s.tableRow, gridTemplateColumns: '1fr 1fr 1fr auto auto' }}>
                      <div style={s.userCell}>
                        <div style={s.userAvatar}>{usuario.nombre?.[0]?.toUpperCase()}</div>
                        <div>
                          <div style={s.cellTitle}>{usuario.nombre} {usuario.apellidos}</div>
                        </div>
                      </div>
                      <span style={s.cellText}>{usuario.email}</span>
                      <span style={s.cellText}>{usuario.telefono || '—'}</span>
                      <span style={{
                        ...s.badge,
                        background: usuario.bloqueado ? 'var(--danger-bg)' : 'var(--success-bg)',
                        color: usuario.bloqueado ? 'var(--danger-text)' : 'var(--success-text)',
                      }}>
                        {usuario.bloqueado ? 'Bloqueado' : 'Activo'}
                      </span>
                      <div style={s.tableActions}>
                        <button
                          style={usuario.bloqueado ? s.actionBtnOk : s.actionBtnWarn}
                          onClick={() => bloquear(usuario.id, !usuario.bloqueado)}
                          title={usuario.bloqueado ? 'Desbloquear' : 'Bloquear'}
                        >
                          {usuario.bloqueado ? '🔓' : '🔒'}
                        </button>
                        <button style={s.actionBtnDel} onClick={() => eliminarUsuario(usuario.id)} title="Eliminar">🗑</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

const s = {
  layout: { display: 'grid', gridTemplateColumns: '240px 1fr', minHeight: '100vh', background: 'var(--gray-50)' },
  // Sidebar
  sidebar: { background: '#0f1c1b', display: 'flex', flexDirection: 'column', padding: '1.5rem 1rem', position: 'sticky', top: 0, height: '100vh', overflowY: 'auto' },
  brand: { display: 'flex', flexDirection: 'column', gap: '.25rem', marginBottom: '2.5rem', padding: '0 .5rem' },
  brandText: { fontSize: '1.4rem', fontWeight: 900, color: '#fff' },
  brandBadge: { fontSize: '.7rem', fontWeight: 700, color: 'rgba(255,255,255,.4)', textTransform: 'uppercase', letterSpacing: '.1em' },
  nav: { display: 'flex', flexDirection: 'column', gap: '.25rem', flex: 1 },
  navItem: { background: 'none', border: 'none', color: 'rgba(255,255,255,.55)', fontWeight: 500, cursor: 'pointer', padding: '.65rem .75rem', borderRadius: 'var(--radius)', fontSize: '.9rem', display: 'flex', alignItems: 'center', gap: '.6rem', transition: 'var(--transition)', textAlign: 'left' },
  navActive: { background: 'rgba(14,165,160,.2)', border: 'none', color: 'var(--primary)', fontWeight: 700, cursor: 'pointer', padding: '.65rem .75rem', borderRadius: 'var(--radius)', fontSize: '.9rem', display: 'flex', alignItems: 'center', gap: '.6rem', textAlign: 'left' },
  navIcon: { fontSize: '1rem', width: 20, textAlign: 'center' },
  navBadge: { marginLeft: 'auto', background: 'var(--warning)', color: '#fff', fontSize: '.7rem', fontWeight: 800, padding: '1px 7px', borderRadius: 'var(--radius-full)' },
  logoutBtn: { background: 'rgba(239,68,68,.12)', border: '1px solid rgba(239,68,68,.2)', color: '#ef4444', borderRadius: 'var(--radius)', padding: '.6rem .75rem', cursor: 'pointer', fontWeight: 600, fontSize: '.875rem', marginTop: '2rem', textAlign: 'left' },
  // Main
  main: { padding: '2.5rem', minWidth: 0, overflow: 'auto' },
  pageHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' },
  pageTitle: { fontSize: '1.75rem', fontWeight: 900, color: 'var(--gray-900)', letterSpacing: '-.01em' },
  pageSub: { color: 'var(--gray-400)', marginTop: '.25rem', fontSize: '.9rem' },
  toastOk: { background: 'var(--success-bg)', color: 'var(--success-text)', padding: '.75rem 1rem', borderRadius: 'var(--radius)', marginBottom: '1.5rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '.5rem', fontSize: '.9rem' },
  toastErr: { background: 'var(--danger-bg)', color: 'var(--danger-text)', padding: '.75rem 1rem', borderRadius: 'var(--radius)', marginBottom: '1.5rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '.5rem', fontSize: '.9rem' },
  loadingBox: { display: 'flex', alignItems: 'center', gap: '.75rem', color: 'var(--gray-500)', padding: '3rem', justifyContent: 'center' },
  spinner: { width: 22, height: 22, border: '2px solid var(--gray-200)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin .7s linear infinite', flexShrink: 0 },
  // Stats
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: '1rem', marginBottom: '2rem' },
  statCard: { background: '#fff', borderRadius: 'var(--radius-md)', padding: '1.5rem', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--gray-100)' },
  statIcon: { fontSize: '1.5rem', marginBottom: '.75rem' },
  statValue: { fontSize: '2rem', fontWeight: 900, marginBottom: '.25rem', lineHeight: 1 },
  statLabel: { color: 'var(--gray-500)', fontSize: '.8rem', fontWeight: 500 },
  pendingAlert: { background: 'var(--warning-bg)', border: '1px solid rgba(245,158,11,.3)', borderRadius: 'var(--radius-md)', padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' },
  pendingBtn: { marginLeft: 'auto', background: 'var(--warning)', color: '#fff', border: 'none', borderRadius: 'var(--radius-sm)', padding: '.5rem 1.25rem', fontWeight: 700, cursor: 'pointer', fontSize: '.875rem' },
  // Table
  filterSelect: { border: '1.5px solid var(--gray-200)', borderRadius: 'var(--radius)', padding: '.5rem .9rem', fontSize: '.875rem', background: '#fff', outline: 'none', color: 'var(--gray-700)' },
  tableCard: { background: '#fff', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow)', border: '1px solid var(--gray-100)', overflow: 'hidden' },
  tableHead: { display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 1fr 1fr 1fr', gap: '1rem', padding: '.85rem 1.5rem', background: 'var(--gray-50)', borderBottom: '1px solid var(--gray-100)', fontSize: '.75rem', fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '.05em' },
  tableRow: { display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 1fr 1fr 1fr', gap: '1rem', padding: '1rem 1.5rem', borderBottom: '1px solid var(--gray-100)', alignItems: 'center', transition: 'background .15s' },
  cellMain: { display: 'flex', flexDirection: 'column', gap: '.15rem' },
  cellTitle: { fontWeight: 700, color: 'var(--gray-900)', fontSize: '.9rem' },
  cellSub: { color: 'var(--gray-400)', fontSize: '.78rem', textTransform: 'capitalize' },
  cellText: { color: 'var(--gray-600)', fontSize: '.875rem' },
  badge: { fontSize: '.73rem', fontWeight: 700, padding: '3px 10px', borderRadius: 'var(--radius-full)', display: 'inline-block', whiteSpace: 'nowrap' },
  tableActions: { display: 'flex', gap: '.4rem', alignItems: 'center' },
  actionBtnOk:   { background: 'var(--success-bg)', color: 'var(--success-text)', border: 'none', borderRadius: 'var(--radius-sm)', width: 30, height: 30, cursor: 'pointer', fontWeight: 700, fontSize: '.85rem' },
  actionBtnWarn: { background: 'var(--warning-bg)', color: 'var(--warning-text)', border: 'none', borderRadius: 'var(--radius-sm)', width: 30, height: 30, cursor: 'pointer', fontWeight: 700, fontSize: '.85rem' },
  actionBtnDel:  { background: 'var(--danger-bg)',  color: 'var(--danger-text)',  border: 'none', borderRadius: 'var(--radius-sm)', width: 30, height: 30, cursor: 'pointer', fontSize: '.85rem' },
  userCell: { display: 'flex', alignItems: 'center', gap: '.6rem' },
  userAvatar: { width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '.8rem', flexShrink: 0 },
  emptyState: { background: '#fff', borderRadius: 'var(--radius-lg)', padding: '4rem', textAlign: 'center', boxShadow: 'var(--shadow)', color: 'var(--gray-500)' },
  emptyIcon: { fontSize: '2.5rem', marginBottom: '1rem' },
  empty: { color: 'var(--gray-400)', textAlign: 'center', padding: '2rem' },
};
