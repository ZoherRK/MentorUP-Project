<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Reserva extends Model
{
    protected $table = 'reservas';

    protected $fillable = [
        'alumno_id',
        'anuncio_id',
        'fecha_clase',
        'duracion_h',
        'precio_total',
        'notas_alumno',
        'estado',   // pendiente | confirmada | completada | cancelada
    ];

    protected $casts = [
        'fecha_clase'  => 'datetime',
        'duracion_h'   => 'decimal:1',
        'precio_total' => 'decimal:2',
    ];

    public function alumno()
    {
        return $this->belongsTo(Alumno::class, 'alumno_id');
    }

    public function anuncio()
    {
        return $this->belongsTo(Anuncio::class, 'anuncio_id');
    }
}
