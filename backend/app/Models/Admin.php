<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * MODEL: Admin
 * Represents an administrator linked to a usuario.
 * An admin has no row in 'alumnos' or 'profesores',
 * which is how getRol() detects the 'admin' role.
 */
class Admin extends Model
{
    protected $table = 'admins';

    protected $fillable = ['usuario_id'];

    public function usuario()
    {
        return $this->belongsTo(Usuario::class, 'usuario_id');
    }
}
