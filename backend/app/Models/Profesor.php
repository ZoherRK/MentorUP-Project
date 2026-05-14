<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Profesor extends Model
{
    protected $table = 'profesores';

    protected $fillable = ['usuario_id'];

    public function usuario()
    {
        return $this->belongsTo(Usuario::class, 'usuario_id');
    }

    public function anuncios()
    {
        return $this->hasMany(Anuncio::class, 'profesor_id');
    }

    public function disponibilidad()
    {
        return $this->hasMany(DisponibilidadHoraria::class, 'profesor_id')
                    ->where('activo', true)
                    ->orderBy('dia_semana')
                    ->orderBy('hora_inicio');
    }

    public function valoraciones()
    {
        return $this->hasManyThrough(
            \App\Models\Valoracion::class,
            Anuncio::class,
            'profesor_id',
            'anuncio_id',
            'id',
            'id'
        );
    }

    public function getMediaValoracionAttribute(): float
    {
        return round($this->valoraciones()->avg('puntuacion') ?? 0, 1);
    }

    public function getTotalValoracionesAttribute(): int
    {
        return $this->valoraciones()->count();
    }

    /**
     * Check if the professor is available at a given datetime.
     */
    public function estaDisponible(\DateTime $dt): bool
    {
        foreach ($this->disponibilidad as $bloque) {
            if ($bloque->cubre($dt)) return true;
        }
        return false;
    }
}
