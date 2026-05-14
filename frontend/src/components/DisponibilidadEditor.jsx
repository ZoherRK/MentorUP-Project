import { useState, useEffect } from 'react';
import { apiGetDisponibilidad, apiSaveDisponibilidad } from '../services/api';

const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

const HORAS = Array.from({ length: 29 }, (_, i) => {
  const h = Math.floor(i / 2) + 8;  // 08:00 – 22:00
  const m = i % 2 === 0 ? '00' : '30';
  return `${String(h).padStart(2, '0')}:${m}`;
});

function BloqueRow({ bloque, onUpdate, onDelete }) {
  return (
    <div style={s.bloqueRow}>
      <select
        value={bloque.dia_semana}
        onChange={e => onUpdate({ ...bloque, dia_semana: Number(e.target.value) })}
        style={s.select}
      >
        {DIAS.map((d, i) => (
          <option key={i} value={i}>{d}</option>
        ))}
      </select>
      <span style={s.rowLabel}>de</span>
      <select
        value={bloque.hora_inicio}
        onChange={e => onUpdate({ ...bloque, hora_inicio: e.target.value })}
        style={s.select}
      >
        {HORAS.filter(h => h < bloque.hora_fin).map(h => (
          <option key={h} value={h}>{h}</option>
        ))}
      </select>
      <span style={s.rowLabel}>a</span>
      <select
        value={bloque.hora_fin}
        onChange={e => onUpdate({ ...bloque, hora_fin: e.target.value })}
        style={s.select}
      >
        {HORAS.filter(h => h > bloque.hora_inicio).map(h => (
          <option key={h} value={h}>{h}</option>
        ))}
      </select>
      <button onClick={onDelete} style={s.btnDelete} title="Eliminar bloque">
        ✕
      </button>
    </div>
  );
}

export default function DisponibilidadEditor() {
  const [bloques, setBloques]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [saving,  setSaving]    = useState(false);
  const [msg, setMsg]           = useState({ type: '', text: '' });

  useEffect(() => {
    apiGetDisponibilidad()
      .then(d => setBloques(d.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const addBloque = () => {
    setBloques(prev => [
      ...prev,
      { dia_semana: 0, hora_inicio: '09:00', hora_fin: '11:00' },
    ]);
  };

  const updateBloque = (idx, updated) => {
    setBloques(prev => prev.map((b, i) => (i === idx ? updated : b)));
  };

  const deleteBloque = (idx) => {
    setBloques(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSave = async () => {
    setSaving(true);
    setMsg({ type: '', text: '' });
    try {
      await apiSaveDisponibilidad(bloques);
      setMsg({ type: 'success', text: '✅ Disponibilidad guardada correctamente.' });
    } catch (e) {
      setMsg({ type: 'error', text: e.message });
    } finally {
      setSaving(false);
    }
  };

  // Group bloques by day for summary view
  const byDay = DIAS.map((dia, i) => ({
    dia,
    idx: i,
    bloques: bloques.filter(b => b.dia_semana === i),
  }));

  if (loading) return (
    <div style={s.loading}>
      <div style={s.spinner} />
      <span>Cargando disponibilidad…</span>
    </div>
  );

  return (
    <div style={s.wrap}>
      <div style={s.header}>
        <div>
          <h3 style={s.title}>Horario de disponibilidad</h3>
          <p style={s.subtitle}>
            Define cuándo estás disponible para dar clases. Los alumnos solo podrán reservar dentro de estos horarios.
          </p>
        </div>
        <button onClick={addBloque} style={s.btnAdd}>
          + Añadir franja horaria
        </button>
      </div>

      {msg.text && (
        <div style={{ ...s.alert, ...(msg.type === 'success' ? s.alertSuccess : s.alertError) }}>
          {msg.text}
        </div>
      )}

      {bloques.length === 0 ? (
        <div style={s.empty}>
          <div style={s.emptyIcon}>🗓️</div>
          <h4 style={s.emptyTitle}>Sin disponibilidad configurada</h4>
          <p style={s.emptyText}>
            Aún no has definido tu horario. Si no configuras disponibilidad, los alumnos podrán reservar cualquier fecha.
          </p>
          <button onClick={addBloque} style={s.btnAddAlt}>
            + Añadir primera franja
          </button>
        </div>
      ) : (
        <>
          {/* Grid editor */}
          <div style={s.editorGrid}>
            {bloques.map((bloque, idx) => (
              <BloqueRow
                key={idx}
                bloque={bloque}
                onUpdate={(updated) => updateBloque(idx, updated)}
                onDelete={() => deleteBloque(idx)}
              />
            ))}
          </div>

          {/* Weekly summary */}
          <div style={s.summaryTitle}>Resumen semanal</div>
          <div style={s.weekGrid}>
            {byDay.map(({ dia, bloques: bls }) => (
              <div key={dia} style={{ ...s.dayCell, ...(bls.length ? s.dayCellActive : {}) }}>
                <div style={s.dayName}>{dia.slice(0, 3)}</div>
                {bls.length ? (
                  bls.map((b, i) => (
                    <div key={i} style={s.timeChip}>
                      {b.hora_inicio}–{b.hora_fin}
                    </div>
                  ))
                ) : (
                  <div style={s.dayOff}>No disponible</div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {bloques.length > 0 && (
        <div style={s.actions}>
          <button onClick={handleSave} disabled={saving} style={s.btnSave}>
            {saving ? 'Guardando…' : 'Guardar disponibilidad'}
          </button>
        </div>
      )}
    </div>
  );
}

const s = {
  wrap: { background: '#fff', borderRadius: 'var(--radius-lg)', padding: '1.75rem', boxShadow: 'var(--shadow)' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '1.25rem', flexWrap: 'wrap' },
  title: { fontSize: '1.1rem', fontWeight: 700, color: 'var(--gray-900)', marginBottom: '.25rem' },
  subtitle: { fontSize: '.875rem', color: 'var(--gray-500)', maxWidth: 400 },
  btnAdd: { background: 'var(--primary-light)', color: 'var(--primary)', border: 'none', borderRadius: 'var(--radius)', padding: '.5rem 1.1rem', fontWeight: 700, cursor: 'pointer', fontSize: '.9rem', whiteSpace: 'nowrap' },
  btnAddAlt: { background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: 'var(--radius)', padding: '.6rem 1.4rem', fontWeight: 700, cursor: 'pointer', fontSize: '.95rem', marginTop: '.75rem' },
  alert: { padding: '.75rem 1rem', borderRadius: 'var(--radius)', marginBottom: '1rem', fontSize: '.9rem', fontWeight: 500 },
  alertSuccess: { background: 'var(--success-bg)', color: 'var(--success-text)' },
  alertError: { background: 'var(--danger-bg)', color: 'var(--danger-text)' },
  loading: { display: 'flex', alignItems: 'center', gap: '.75rem', color: 'var(--gray-500)', padding: '2rem' },
  spinner: { width: 20, height: 20, border: '2px solid var(--gray-200)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin .7s linear infinite' },
  empty: { textAlign: 'center', padding: '3rem 1rem' },
  emptyIcon: { fontSize: '3rem', marginBottom: '.75rem' },
  emptyTitle: { fontWeight: 700, fontSize: '1.05rem', color: 'var(--gray-800)', marginBottom: '.5rem' },
  emptyText: { color: 'var(--gray-500)', fontSize: '.9rem', maxWidth: 380, margin: '0 auto' },
  editorGrid: { display: 'flex', flexDirection: 'column', gap: '.6rem', marginBottom: '1.5rem' },
  bloqueRow: { display: 'flex', alignItems: 'center', gap: '.6rem', flexWrap: 'wrap', background: 'var(--gray-50)', borderRadius: 'var(--radius)', padding: '.6rem .9rem', border: '1.5px solid var(--gray-200)' },
  select: { border: '1.5px solid var(--gray-200)', borderRadius: 'var(--radius-sm)', padding: '.4rem .6rem', fontSize: '.875rem', background: '#fff', outline: 'none', color: 'var(--gray-800)' },
  rowLabel: { fontSize: '.85rem', color: 'var(--gray-500)', fontWeight: 500 },
  btnDelete: { background: 'var(--danger-bg)', color: 'var(--danger)', border: 'none', borderRadius: 'var(--radius-sm)', width: 28, height: 28, cursor: 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.85rem', marginLeft: 'auto' },
  summaryTitle: { fontSize: '.85rem', fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: '.75rem' },
  weekGrid: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '.5rem', marginBottom: '1.5rem' },
  dayCell: { borderRadius: 'var(--radius)', padding: '.6rem .4rem', textAlign: 'center', background: 'var(--gray-50)', border: '1.5px solid var(--gray-100)', minHeight: 80 },
  dayCellActive: { background: 'var(--primary-light)', border: '1.5px solid var(--primary)' },
  dayName: { fontSize: '.75rem', fontWeight: 700, color: 'var(--gray-600)', marginBottom: '.4rem' },
  timeChip: { fontSize: '.7rem', fontWeight: 600, background: 'var(--primary)', color: '#fff', borderRadius: 'var(--radius-sm)', padding: '2px 4px', marginBottom: '.25rem' },
  dayOff: { fontSize: '.7rem', color: 'var(--gray-400)' },
  actions: { display: 'flex', justifyContent: 'flex-end' },
  btnSave: { background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: 'var(--radius)', padding: '.65rem 1.75rem', fontWeight: 700, cursor: 'pointer', fontSize: '.95rem', transition: 'var(--transition)' },
};
