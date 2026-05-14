<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Alumno extends Model
{
    protected $table = 'alumnos';

    protected $fillable = ['usuario_id'];

    public function usuario()
    {
        return $this->belongsTo(Usuario::class, 'usuario_id');
    }

    public function reservas()
    {
        return $this->hasMany(Reserva::class, 'alumno_id');
    }

    public function valoraciones()
    {
        return $this->hasMany(Valoracion::class, 'alumno_id');
    }
}
