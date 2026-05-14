<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * MODEL: DisponibilidadHoraria
 *
 * Representa un bloque horario recurrente semanal de un profesor.
 *
 * @property int    $id
 * @property int    $profesor_id
 * @property int    $dia_semana   (0=Lunes … 6=Domingo)
 * @property string $hora_inicio  HH:MM
 * @property string $hora_fin     HH:MM
 * @property bool   $activo
 */
class DisponibilidadHoraria extends Model
{
    protected $table = 'disponibilidad_horaria';

    protected $fillable = [
        'profesor_id',
        'dia_semana',
        'hora_inicio',
        'hora_fin',
        'activo',
    ];

    protected $casts = [
        'activo'     => 'boolean',
        'dia_semana' => 'integer',
    ];

    public const DIAS = [
        0 => 'Lunes',
        1 => 'Martes',
        2 => 'Miércoles',
        3 => 'Jueves',
        4 => 'Viernes',
        5 => 'Sábado',
        6 => 'Domingo',
    ];

    public function profesor()
    {
        return $this->belongsTo(Profesor::class, 'profesor_id');
    }

    /** Human-readable day name */
    public function getDiaNombreAttribute(): string
    {
        return self::DIAS[$this->dia_semana] ?? 'Desconocido';
    }

    /**
     * Check if a given datetime falls within this availability block.
     * The check is day-of-week + time range only (recurring weekly).
     */
    public function cubre(\DateTime $dt): bool
    {
        if (!$this->activo) return false;

        // PHP dow: 0=Sunday…6=Saturday; convert to 0=Monday…6=Sunday
        $dow = ((int) $dt->format('N')) - 1; // N: 1=Monday…7=Sunday
        if ($dow !== $this->dia_semana) return false;

        $t = $dt->format('H:i');
        return $t >= $this->hora_inicio && $t < $this->hora_fin;
    }
}
