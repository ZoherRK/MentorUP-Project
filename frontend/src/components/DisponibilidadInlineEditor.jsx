import { useState, useEffect } from 'react';

/**
 * DisponibilidadInlineEditor
 *
 * Versión compacta del editor de disponibilidad para incrustar
 * dentro del formulario de creación/edición de anuncios.
 *
 * Props:
 *   - value:    array de bloques actuales (estado controlado por el padre)
 *   - onChange: callback(bloques) llamado cada vez que cambia la lista
 *
 * No hace llamadas a la API directamente; delega el guardado al padre.
 */

const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

// Franjas cada 30 min de 07:00 a 22:00
const HORAS = Array.from({ length: 31 }, (_, i) => {
  const h = Math.floor(i / 2) + 7;
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
        aria-label="Día de la semana"
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
        aria-label="Hora de inicio"
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
        aria-label="Hora de fin"
      >
        {HORAS.filter(h => h > bloque.hora_inicio).map(h => (
          <option key={h} value={h}>{h}</option>
        ))}
      </select>

      <button
        type="button"
        onClick={onDelete}
        style={s.btnDelete}
        title="Eliminar franja"
        aria-label="Eliminar franja horaria"
      >
        ✕
      </button>
    </div>
  );
}

export default function DisponibilidadInlineEditor({ value = [], onChange }) {
  // Detecta solapamientos en tiempo real para mostrar advertencia
  const [overlap, setOverlap] = useState(false);

  useEffect(() => {
    const bloques = value;
    let found = false;
    outer: for (let i = 0; i < bloques.length; i++) {
      for (let j = i + 1; j < bloques.length; j++) {
        if (bloques[i].dia_semana !== bloques[j].dia_semana) continue;
        if (
          bloques[i].hora_inicio < bloques[j].hora_fin &&
          bloques[j].hora_inicio < bloques[i].hora_fin
        ) {
          found = true;
          break outer;
        }
      }
    }
    setOverlap(found);
  }, [value]);

  const addBloque = () => {
    onChange([
      ...value,
      { dia_semana: 0, hora_inicio: '09:00', hora_fin: '11:00' },
    ]);
  };

  const updateBloque = (idx, updated) => {
    onChange(value.map((b, i) => (i === idx ? updated : b)));
  };

  const deleteBloque = (idx) => {
    onChange(value.filter((_, i) => i !== idx));
  };

  // Resumen visual agrupado por día
  const byDay = DIAS.map((dia, i) => ({
    dia,
    idx: i,
    bloques: value.filter(b => b.dia_semana === i),
  }));

  return (
    <div style={s.wrap}>
      <div style={s.header}>
        <div>
          <span style={s.label}>Disponibilidad horaria</span>
          <p style={s.hint}>
            Define cuándo puedes dar clases. Los alumnos solo podrán reservar en estas franjas.
            {value.length === 0 && (
              <span style={s.hintOpt}> (opcional — si no configuras nada, los alumnos podrán proponer cualquier horario)</span>
            )}
          </p>
        </div>
        <button type="button" onClick={addBloque} style={s.btnAdd}>
          + Añadir franja
        </button>
      </div>

      {overlap && (
        <div style={s.overlapWarn}>
          ⚠️ Hay franjas solapadas en el mismo día. Por favor, corrígelas antes de guardar.
        </div>
      )}

      {value.length === 0 ? (
        <div style={s.empty}>
          <span style={s.emptyIcon}>🗓️</span>
          <span style={s.emptyText}>Sin franjas configuradas</span>
          <button type="button" onClick={addBloque} style={s.btnAddEmpty}>
            + Añadir primera franja
          </button>
        </div>
      ) : (
        <>
          <div style={s.list}>
            {value.map((bloque, idx) => (
              <BloqueRow
                key={idx}
                bloque={bloque}
                onUpdate={(updated) => updateBloque(idx, updated)}
                onDelete={() => deleteBloque(idx)}
              />
            ))}
          </div>

          {/* Resumen visual semanal compacto */}
          <div style={s.weekRow}>
            {byDay.map(({ dia, idx: dayIdx, bloques: bls }) => (
              <div
                key={dayIdx}
                style={{ ...s.dayPill, ...(bls.length ? s.dayPillActive : {}) }}
                title={bls.map(b => `${b.hora_inicio}–${b.hora_fin}`).join(', ') || 'No disponible'}
              >
                <span style={s.dayAbrev}>{dia.slice(0, 3)}</span>
                {bls.length > 0 && (
                  <span style={s.dayCount}>{bls.length}</span>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// Estilos siguiendo el mismo design system (variables CSS) del proyecto
const s = {
  wrap: {
    border: '1.5px solid var(--gray-200)',
    borderRadius: 'var(--radius)',
    padding: '1rem',
    background: 'var(--gray-50)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '1rem',
    marginBottom: '.75rem',
    flexWrap: 'wrap',
  },
  label: {
    fontWeight: 600,
    fontSize: '.8rem',
    color: 'var(--gray-700)',
    textTransform: 'uppercase',
    letterSpacing: '.04em',
    display: 'block',
    marginBottom: '.25rem',
  },
  hint: {
    fontSize: '.8rem',
    color: 'var(--gray-500)',
    margin: 0,
    maxWidth: 420,
    lineHeight: 1.5,
  },
  hintOpt: {
    fontStyle: 'italic',
    color: 'var(--gray-400)',
  },
  btnAdd: {
    background: 'var(--primary-light)',
    color: 'var(--primary)',
    border: 'none',
    borderRadius: 'var(--radius)',
    padding: '.4rem .9rem',
    fontWeight: 700,
    cursor: 'pointer',
    fontSize: '.8rem',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  overlapWarn: {
    background: 'var(--warning-bg)',
    color: 'var(--warning-text)',
    borderRadius: 'var(--radius-sm)',
    padding: '.5rem .75rem',
    fontSize: '.8rem',
    fontWeight: 500,
    marginBottom: '.75rem',
  },
  empty: {
    display: 'flex',
    alignItems: 'center',
    gap: '.75rem',
    color: 'var(--gray-400)',
    fontSize: '.875rem',
    padding: '.5rem 0',
    flexWrap: 'wrap',
  },
  emptyIcon: { fontSize: '1.2rem' },
  emptyText: { flex: 1 },
  btnAddEmpty: {
    background: 'none',
    border: '1.5px dashed var(--gray-300)',
    color: 'var(--primary)',
    borderRadius: 'var(--radius)',
    padding: '.35rem .85rem',
    fontWeight: 600,
    cursor: 'pointer',
    fontSize: '.8rem',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '.5rem',
    marginBottom: '.75rem',
  },
  bloqueRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '.5rem',
    flexWrap: 'wrap',
    background: '#fff',
    borderRadius: 'var(--radius-sm)',
    padding: '.5rem .75rem',
    border: '1.5px solid var(--gray-200)',
  },
  select: {
    border: '1.5px solid var(--gray-200)',
    borderRadius: 'var(--radius-sm)',
    padding: '.35rem .5rem',
    fontSize: '.8rem',
    background: '#fff',
    outline: 'none',
    color: 'var(--gray-800)',
    cursor: 'pointer',
  },
  rowLabel: {
    fontSize: '.8rem',
    color: 'var(--gray-400)',
    fontWeight: 500,
  },
  btnDelete: {
    background: 'var(--danger-bg)',
    color: 'var(--danger)',
    border: 'none',
    borderRadius: 'var(--radius-sm)',
    width: 26,
    height: 26,
    cursor: 'pointer',
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '.75rem',
    marginLeft: 'auto',
    flexShrink: 0,
  },
  // Resumen semanal compacto
  weekRow: {
    display: 'flex',
    gap: '.35rem',
    flexWrap: 'wrap',
  },
  dayPill: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '2px',
    background: 'var(--gray-100)',
    border: '1.5px solid var(--gray-200)',
    borderRadius: 'var(--radius-sm)',
    padding: '.35rem .5rem',
    minWidth: 40,
    cursor: 'default',
  },
  dayPillActive: {
    background: 'var(--primary-light)',
    border: '1.5px solid var(--primary)',
  },
  dayAbrev: {
    fontSize: '.7rem',
    fontWeight: 700,
    color: 'var(--gray-600)',
  },
  dayCount: {
    fontSize: '.65rem',
    fontWeight: 800,
    color: 'var(--primary)',
    background: '#fff',
    borderRadius: 'var(--radius-full)',
    width: 16,
    height: 16,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
};
