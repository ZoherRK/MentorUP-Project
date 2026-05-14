import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiGetAnuncios } from '../services/api';

const NIVELES = ['primaria', 'eso', 'bachillerato', 'universidad', 'adultos', 'otro'];

function AnuncioCard({ anuncio, onClick }) {
  const a = anuncio;
  const rating = a.media_valoracion || 0;
  const stars  = Math.round(rating);

  return (
    <div style={s.card} onClick={onClick}>
      {a.destacado && (
        <div style={s.cardBadgeWrap}>
          <span style={s.badgeDestacado}>⭐ Destacado</span>
        </div>
      )}
      <div style={s.cardHeader}>
        <div style={s.profesorAvatar}>
          {a.profesor?.usuario?.nombre?.[0]?.toUpperCase() || '?'}
        </div>
        <div style={s.profesorInfo}>
          <span style={s.profesorName}>
            {a.profesor?.usuario?.nombre} {a.profesor?.usuario?.apellidos}
          </span>
          {rating > 0 && (
            <div style={s.ratingRow}>
              {'★'.repeat(stars)}{'☆'.repeat(5 - stars)}
              <span style={s.ratingNum}>{rating.toFixed(1)}</span>
            </div>
          )}
        </div>
        <div style={s.priceTag}>{a.precio_hora}€<span style={s.priceUnit}>/h</span></div>
      </div>

      <h3 style={s.cardTitle}>{a.titulo}</h3>

      <div style={s.tags}>
        <span style={s.tagAsig}> {a.asignatura}</span>
        <span style={s.tagNivel}>{a.nivel}</span>
      </div>

      <p style={s.cardDesc}>{a.descripcion?.slice(0, 110)}{a.descripcion?.length > 110 ? '…' : ''}</p>

      <div style={s.cardFooter}>
        <span style={s.verMas}>Ver detalles →</span>
      </div>
    </div>
  );
}

export default function Anuncios() {
  const navigate = useNavigate();
  const [anuncios, setAnuncios] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filters, setFilters]   = useState({ asignatura: '', precio_max: '', nivel: '' });
  const [applied, setApplied]   = useState({});

  const fetchAnuncios = async (params = {}) => {
    setLoading(true);
    try {
      const data = await apiGetAnuncios(params);
      setAnuncios(data.data?.data || data.data || []);
    } catch (_) {
      setAnuncios([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAnuncios(); }, []);

  const handleFilter = (e) => {
    e.preventDefault();
    setApplied(filters);
    fetchAnuncios(filters);
  };

  const handleReset = () => {
    const empty = { asignatura: '', precio_max: '', nivel: '' };
    setFilters(empty);
    setApplied({});
    fetchAnuncios({});
  };

  const hasFilters = Object.values(applied).some(v => v !== '' && v != null);

  return (
    <div style={s.page}>
      {/* Page header */}
      <div style={s.header}>
        <div style={s.headerInner}>
          <h1 style={s.title}>Tablón de anuncios</h1>
          <p style={s.sub}>Encuentra al profesor ideal para ti entre nuestros docentes verificados</p>
        </div>
      </div>

      <div style={s.body}>
        {/* Sidebar filters */}
        <aside style={s.sidebar}>
          <div style={s.filterBox}>
            <div style={s.filterHead}>
              <h3 style={s.filterTitle}>Filtros</h3>
              {hasFilters && (
                <button onClick={handleReset} style={s.resetBtn}>Limpiar</button>
              )}
            </div>
            <form onSubmit={handleFilter} style={s.filterForm}>
              <div style={s.filterField}>
                <label style={s.filterLabel}>Asignatura</label>
                <input
                  placeholder="Ej: Matemáticas, Inglés…"
                  value={filters.asignatura}
                  onChange={e => setFilters({ ...filters, asignatura: e.target.value })}
                  style={s.filterInput}
                />
              </div>
              <div style={s.filterField}>
                <label style={s.filterLabel}>Precio máximo (€/h)</label>
                <input
                  type="number"
                  min="0"
                  placeholder="Ej: 30"
                  value={filters.precio_max}
                  onChange={e => setFilters({ ...filters, precio_max: e.target.value })}
                  style={s.filterInput}
                />
              </div>
              <div style={s.filterField}>
                <label style={s.filterLabel}>Nivel educativo</label>
                <select
                  value={filters.nivel}
                  onChange={e => setFilters({ ...filters, nivel: e.target.value })}
                  style={s.filterInput}
                >
                  <option value="">Todos los niveles</option>
                  {NIVELES.map(n => (
                    <option key={n} value={n}>{n.charAt(0).toUpperCase() + n.slice(1)}</option>
                  ))}
                </select>
              </div>
              <button type="submit" style={s.filterBtn}>
                Aplicar filtros
              </button>
            </form>

            {/* Quick filter chips */}
            <div style={s.quickFilters}>
              <div style={s.quickLabel}>Búsquedas populares:</div>
              {['Matemáticas', 'Inglés', 'Física', 'Programación'].map(t => (
                <button
                  key={t}
                  style={filters.asignatura === t ? s.chipActive : s.chip}
                  onClick={() => {
                    const f = { ...filters, asignatura: filters.asignatura === t ? '' : t };
                    setFilters(f);
                    setApplied(f);
                    fetchAnuncios(f);
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Main grid */}
        <main style={s.main}>
          {/* Results bar */}
          <div style={s.resultsBar}>
            <span style={s.resultsCount}>
              {loading ? 'Cargando…' : `${anuncios.length} profesor${anuncios.length !== 1 ? 'es' : ''} encontrado${anuncios.length !== 1 ? 's' : ''}`}
            </span>
            {hasFilters && (
              <div style={s.activeFilters}>
                {applied.asignatura && <span style={s.filterTag}>{applied.asignatura} ✕</span>}
                {applied.nivel && <span style={s.filterTag}>{applied.nivel} ✕</span>}
                {applied.precio_max && <span style={s.filterTag}>Máx. {applied.precio_max}€ ✕</span>}
              </div>
            )}
          </div>

          {loading ? (
            <div style={s.gridSkeleton}>
              {[...Array(6)].map((_, i) => (
                <div key={i} style={s.skeletonCard}>
                  <div style={{ ...s.skeletonLine, width: '40%', height: 14, marginBottom: 12 }} className="skeleton" />
                  <div style={{ ...s.skeletonLine, width: '80%', height: 20, marginBottom: 8 }} className="skeleton" />
                  <div style={{ ...s.skeletonLine, width: '100%', height: 60 }} className="skeleton" />
                </div>
              ))}
            </div>
          ) : anuncios.length === 0 ? (
            <div style={s.empty}>
              <div style={s.emptyIcon}>🔍</div>
              <h3 style={s.emptyTitle}>No se encontraron anuncios</h3>
              <p style={s.emptyText}>Prueba a cambiar los filtros de búsqueda.</p>
              <button onClick={handleReset} style={s.emptyBtn}>Ver todos los profesores</button>
            </div>
          ) : (
            <div style={s.grid}>
              {anuncios.map(a => (
                <AnuncioCard
                  key={a.id}
                  anuncio={a}
                  onClick={() => navigate(`/anuncios/${a.id}`)}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

const s = {
  page: { background: 'var(--gray-50)', minHeight: 'calc(100vh - 68px)' },
  header: { background: 'linear-gradient(135deg, #0b1e1e 0%, #0f2e2c 100%)', padding: '3.5rem 1.5rem' },
  headerInner: { maxWidth: 'var(--max-width)', margin: '0 auto', textAlign: 'center' },
  title: { fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 900, color: '#fff', marginBottom: '.5rem', letterSpacing: '-.01em' },
  sub: { color: 'rgba(255,255,255,.65)', fontSize: '1.05rem' },
  body: { maxWidth: 'var(--max-width)', margin: '0 auto', padding: '2rem 1.5rem', display: 'grid', gridTemplateColumns: '280px 1fr', gap: '2rem', alignItems: 'start' },
  // Sidebar
  sidebar: { position: 'sticky', top: 88 },
  filterBox: { background: '#fff', borderRadius: 'var(--radius-lg)', padding: '1.5rem', boxShadow: 'var(--shadow)', border: '1px solid var(--gray-100)' },
  filterHead: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' },
  filterTitle: { fontWeight: 800, fontSize: '1rem', color: 'var(--gray-900)' },
  resetBtn: { background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 600, fontSize: '.8rem', cursor: 'pointer' },
  filterForm: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  filterField: { display: 'flex', flexDirection: 'column', gap: '.35rem' },
  filterLabel: { fontWeight: 600, fontSize: '.8rem', color: 'var(--gray-600)', textTransform: 'uppercase', letterSpacing: '.04em' },
  filterInput: { border: '1.5px solid var(--gray-200)', borderRadius: 'var(--radius)', padding: '.6rem .85rem', fontSize: '.9rem', outline: 'none', background: 'var(--gray-50)', transition: 'border-color .2s', color: 'var(--gray-800)' },
  filterBtn: { background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: 'var(--radius)', padding: '.7rem', fontWeight: 700, cursor: 'pointer', fontSize: '.95rem', marginTop: '.25rem' },
  quickFilters: { marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid var(--gray-100)' },
  quickLabel: { fontSize: '.75rem', fontWeight: 600, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: '.6rem' },
  chip: { display: 'inline-block', margin: '0 .35rem .35rem 0', background: 'var(--gray-100)', color: 'var(--gray-600)', border: 'none', borderRadius: 'var(--radius-full)', padding: '.3rem .8rem', fontSize: '.8rem', fontWeight: 600, cursor: 'pointer', transition: 'var(--transition)' },
  chipActive: { display: 'inline-block', margin: '0 .35rem .35rem 0', background: 'var(--primary-light)', color: 'var(--primary)', border: 'none', borderRadius: 'var(--radius-full)', padding: '.3rem .8rem', fontSize: '.8rem', fontWeight: 700, cursor: 'pointer' },
  // Main
  main: { minWidth: 0 },
  resultsBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '.5rem' },
  resultsCount: { fontWeight: 700, color: 'var(--gray-700)', fontSize: '.95rem' },
  activeFilters: { display: 'flex', gap: '.5rem', flexWrap: 'wrap' },
  filterTag: { background: 'var(--primary-light)', color: 'var(--primary)', fontSize: '.78rem', fontWeight: 700, padding: '3px 10px', borderRadius: 'var(--radius-full)', cursor: 'pointer' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '1.25rem' },
  gridSkeleton: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '1.25rem' },
  skeletonCard: { background: '#fff', borderRadius: 'var(--radius-lg)', padding: '1.5rem', boxShadow: 'var(--shadow)' },
  skeletonLine: { borderRadius: 'var(--radius-sm)' },
  // Cards
  card: { background: '#fff', borderRadius: 'var(--radius-lg)', padding: '1.5rem', boxShadow: 'var(--shadow)', cursor: 'pointer', transition: 'transform .2s, box-shadow .2s', border: '1px solid var(--gray-100)', position: 'relative', display: 'flex', flexDirection: 'column', gap: '.75rem' },
  cardBadgeWrap: { position: 'absolute', top: -1, right: 16 },
  badgeDestacado: { background: 'var(--warning-bg)', color: 'var(--warning-text)', fontSize: '.72rem', fontWeight: 700, padding: '3px 10px', borderRadius: '0 0 var(--radius-sm) var(--radius-sm)', border: '1px solid rgba(245,158,11,.3)' },
  cardHeader: { display: 'flex', alignItems: 'center', gap: '.75rem' },
  profesorAvatar: { width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.1rem', flexShrink: 0 },
  profesorInfo: { flex: 1, minWidth: 0 },
  profesorName: { fontWeight: 600, fontSize: '.875rem', color: 'var(--gray-800)', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  ratingRow: { color: '#f59e0b', fontSize: '.8rem', display: 'flex', alignItems: 'center', gap: '.25rem', marginTop: '.1rem' },
  ratingNum: { color: 'var(--gray-500)', fontSize: '.75rem', fontWeight: 600 },
  priceTag: { fontSize: '1.35rem', fontWeight: 900, color: 'var(--primary)', flexShrink: 0 },
  priceUnit: { fontSize: '.7rem', fontWeight: 600, color: 'var(--gray-400)' },
  cardTitle: { fontSize: '1rem', fontWeight: 700, color: 'var(--gray-900)', lineHeight: 1.3 },
  tags: { display: 'flex', gap: '.4rem', flexWrap: 'wrap' },
  tagAsig: { background: 'var(--primary-light)', color: 'var(--primary-dark)', fontSize: '.78rem', fontWeight: 700, padding: '3px 10px', borderRadius: 'var(--radius-full)' },
  tagNivel: { background: 'var(--gray-100)', color: 'var(--gray-600)', fontSize: '.78rem', fontWeight: 600, padding: '3px 10px', borderRadius: 'var(--radius-full)', textTransform: 'capitalize' },
  cardDesc: { color: 'var(--gray-500)', fontSize: '.875rem', lineHeight: 1.6, flex: 1 },
  cardFooter: { display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--gray-100)', paddingTop: '.75rem', marginTop: 'auto' },
  verMas: { color: 'var(--primary)', fontWeight: 700, fontSize: '.85rem' },
  // Empty
  empty: { background: '#fff', borderRadius: 'var(--radius-lg)', padding: '4rem 2rem', textAlign: 'center', boxShadow: 'var(--shadow)' },
  emptyIcon: { fontSize: '3rem', marginBottom: '1rem' },
  emptyTitle: { fontSize: '1.2rem', fontWeight: 700, color: 'var(--gray-800)', marginBottom: '.5rem' },
  emptyText: { color: 'var(--gray-500)', marginBottom: '1.5rem' },
  emptyBtn: { background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: 'var(--radius)', padding: '.65rem 1.5rem', fontWeight: 700, cursor: 'pointer' },
};
