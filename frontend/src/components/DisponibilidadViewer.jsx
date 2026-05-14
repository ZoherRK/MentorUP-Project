import { useState, useEffect } from 'react';
import { apiGetDisponibilidadProfesor } from '../services/api';

const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

export default function DisponibilidadViewer({ profesorId }) {
  const [data,    setData]    = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profesorId) return;
    apiGetDisponibilidadProfesor(profesorId)
      .then(d => setData(d.data || []))
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, [profesorId]);

  if (loading) return (
    <div style={s.loading}>
      <div style={s.spinner} />
    </div>
  );

  if (data.length === 0) return (
    <div style={s.empty}>
      <span>El profesor no ha configurado su disponibilidad horaria.</span>
    </div>
  );

  // Group by day
  const byDay = DIAS.map((dia, i) => ({
    dia,
    idx: i,
    bloques: data.filter(b => b.dia_semana === i),
  })).filter(d => d.bloques.length > 0);

  return (
    <div style={s.wrap}>
      <h4 style={s.title}>Disponibilidad horaria</h4>
      <div style={s.grid}>
        {byDay.map(({ dia, bloques }) => (
          <div key={dia} style={s.dayRow}>
            <div style={s.dayName}>{dia}</div>
            <div style={s.chips}>
              {bloques.map((b, i) => (
                <span key={i} style={s.chip}>
                  {b.hora_inicio} – {b.hora_fin}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const s = {
  wrap: { background: 'var(--primary-50)', border: '1.5px solid var(--primary-light)', borderRadius: 'var(--radius-md)', padding: '1.25rem' },
  title: { fontWeight: 700, fontSize: '.95rem', color: 'var(--primary-dark)', marginBottom: '.875rem' },
  grid: { display: 'flex', flexDirection: 'column', gap: '.5rem' },
  dayRow: { display: 'flex', alignItems: 'center', gap: '.75rem', flexWrap: 'wrap' },
  dayName: { fontSize: '.85rem', fontWeight: 700, color: 'var(--gray-700)', minWidth: 90 },
  chips: { display: 'flex', flexWrap: 'wrap', gap: '.35rem' },
  chip: { background: '#fff', border: '1.5px solid var(--primary)', color: 'var(--primary)', fontSize: '.8rem', fontWeight: 700, padding: '3px 10px', borderRadius: 'var(--radius-full)' },
  loading: { display: 'flex', justifyContent: 'center', padding: '1.5rem' },
  spinner: { width: 22, height: 22, border: '2px solid var(--gray-200)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin .7s linear infinite' },
  empty: { display: 'flex', alignItems: 'center', gap: '.5rem', color: 'var(--gray-500)', fontSize: '.875rem', padding: '.75rem', background: 'var(--gray-50)', borderRadius: 'var(--radius)', border: '1px solid var(--gray-200)' },
};
