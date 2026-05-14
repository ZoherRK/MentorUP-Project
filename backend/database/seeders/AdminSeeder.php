<?php

namespace Database\Seeders;

use App\Models\Admin;
use App\Models\Usuario;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

/**
 * SEEDER: AdminSeeder
 *
 * Creates the default administrator account.
 * Credentials are loaded from .env to avoid hardcoding secrets.
 *
 * Defaults (override in .env):
 *   ADMIN_EMAIL=admin@mentorup.test
 *   ADMIN_PASSWORD=Admin1234!
 */
class AdminSeeder extends Seeder
{
    public function run(): void
    {
        $email    = env('ADMIN_EMAIL',    'admin@mentorup.test');
        $password = env('ADMIN_PASSWORD', 'Admin1234!');

        // Idempotent: skip if admin already exists
        if (Usuario::where('email', $email)->exists()) {
            $this->command->info("Admin already exists ({$email}), skipping.");
            return;
        }

        $usuario = Usuario::create([
            'nombre'    => 'Administrador',
            'apellidos' => 'MentorUP',
            'email'     => $email,
            'password'  => Hash::make($password),
            'bloqueado' => false,
        ]);

        Admin::create(['usuario_id' => $usuario->id]);

        $this->command->info("✅ Admin created: {$email}");
    }
}
