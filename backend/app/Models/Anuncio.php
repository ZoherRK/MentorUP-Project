<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Anuncio extends Model
{
    protected $table = 'anuncios';

    protected $fillable = [
        'profesor_id',
        'titulo',
        'asignatura',
        'nivel',
        'precio_hora',
        'descripcion',
        'verificado',   // 'pendiente' | 'aprobado' | 'rechazado'
        'activo',
        'destacado',
    ];

    protected $casts = [
        'activo'      => 'boolean',
        'destacado'   => 'boolean',
        'precio_hora' => 'decimal:2',
    ];

    public function profesor()
    {
        return $this->belongsTo(Profesor::class, 'profesor_id');
    }

    public function valoraciones()
    {
        return $this->hasMany(Valoracion::class, 'anuncio_id');
    }

    public function reservas()
    {
        return $this->hasMany(Reserva::class, 'anuncio_id');
    }

    /** Average rating (0 if no ratings) */
    public function getMediaValoracionAttribute(): float
    {
        return round($this->valoraciones()->avg('puntuacion') ?? 0, 1);
    }
}
