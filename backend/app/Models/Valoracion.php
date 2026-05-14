<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Valoracion extends Model
{
    protected $table = 'valoraciones';

    protected $fillable = [
        'alumno_id',
        'anuncio_id',
        'puntuacion',
        'comentario',
    ];

    protected $casts = [
        'puntuacion' => 'integer',
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
