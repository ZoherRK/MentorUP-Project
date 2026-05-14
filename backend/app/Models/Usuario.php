<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

/**
 * MODEL: Usuario
 *
 * Entidad base de todos los usuarios de MentorUP.
 * El rol se determina por la presencia de una fila relacionada:
 *   - alumno   → rol = 'alumno'
 *   - profesor → rol = 'profesor'
 *   - admin    → rol = 'admin'
 *
 * @property int         $id
 * @property string      $nombre
 * @property string      $apellidos
 * @property string      $email
 * @property string      $password
 * @property string|null $telefono
 * @property string|null $avatar_url
 * @property bool        $bloqueado
 */
class Usuario extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $table = 'usuarios';

    protected $fillable = [
        'nombre',
        'apellidos',
        'email',
        'password',
        'telefono',
        'avatar_url',
        'bloqueado',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'bloqueado'         => 'boolean',
        'email_verified_at' => 'datetime',
        'password'          => 'hashed',
    ];

    // ── RELATIONSHIPS ─────────────────────────────────────────────────────

    public function alumno()
    {
        return $this->hasOne(Alumno::class, 'usuario_id');
    }

    public function profesor()
    {
        return $this->hasOne(Profesor::class, 'usuario_id');
    }

    public function admin()
    {
        return $this->hasOne(Admin::class, 'usuario_id');
    }

    // ── HELPERS ───────────────────────────────────────────────────────────

    public function getRol(): string
    {
        if ($this->admin()->exists())    return 'admin';
        if ($this->profesor()->exists()) return 'profesor';
        return 'alumno';
    }

    public function toApiArray(): array
    {
        return [
            'id'         => $this->id,
            'nombre'     => $this->nombre,
            'apellidos'  => $this->apellidos,
            'email'      => $this->email,
            'telefono'   => $this->telefono,
            'avatar_url' => $this->avatar_url,
            'rol'        => $this->getRol(),
            'bloqueado'  => $this->bloqueado,
        ];
    }
}
