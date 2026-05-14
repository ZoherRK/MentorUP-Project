<?php

namespace Database\Seeders;

use App\Models\Admin;
use App\Models\Alumno;
use App\Models\Anuncio;
use App\Models\Profesor;
use App\Models\Usuario;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

/**
 * SEEDER: DemoDataSeeder
 *
 * Creates sample data so developers can immediately test the app.
 * Run with: php artisan db:seed  (or php artisan db:seed --class=DemoDataSeeder)
 *
 * Only runs in local/testing environments.
 */
class DemoDataSeeder extends Seeder
{
    public function run(): void
    {
        if (! app()->environment(['local', 'testing'])) {
            $this->command->warn('DemoDataSeeder skipped in non-local environment.');
            return;
        }

        // ── Demo alumno ───────────────────────────────────────────────────
        $alumnoUsuario = Usuario::firstOrCreate(
            ['email' => 'alumno@mentorup.test'],
            [
                'nombre'    => 'Ana',
                'apellidos' => 'García López',
                'password'  => Hash::make('Demo1234!'),
                'ciudad'    => 'Madrid',
                'bloqueado' => false,
            ]
        );
        Alumno::firstOrCreate(['usuario_id' => $alumnoUsuario->id]);

        // ── Demo profesor ─────────────────────────────────────────────────
        $profesorUsuario = Usuario::firstOrCreate(
            ['email' => 'profesor@mentorup.test'],
            [
                'nombre'    => 'Carlos',
                'apellidos' => 'Martínez Ruiz',
                'password'  => Hash::make('Demo1234!'),
                'ciudad'    => 'Barcelona',
                'bloqueado' => false,
            ]
        );
        $profesor = Profesor::firstOrCreate(['usuario_id' => $profesorUsuario->id]);

        // ── Demo anuncios ─────────────────────────────────────────────────
        $anuncios = [
            [
                'titulo'      => 'Matemáticas ESO y Bachillerato',
                'asignatura'  => 'Matemáticas',
                'nivel'       => 'bachillerato',
                'precio_hora' => 25.00,
                'descripcion' => 'Clases de matemáticas para ESO y Bachillerato. Álgebra, geometría, cálculo y preparación para la EBAU.',
                'verificado'  => 'aprobado',
            ],
            [
                'titulo'      => 'Inglés conversacional — todos los niveles',
                'asignatura'  => 'Inglés',
                'nivel'       => 'adultos',
                'precio_hora' => 20.00,
                'descripcion' => 'Mejora tu inglés conversacional con un método práctico y ameno. Cambridge First y Advanced.',
                'verificado'  => 'aprobado',
            ],
            [
                'titulo'      => 'Programación Python y JavaScript',
                'asignatura'  => 'Informática',
                'nivel'       => 'universidad',
                'precio_hora' => 30.00,
                'descripcion' => 'Aprende a programar desde cero o mejora tus habilidades. Proyectos reales desde el primer día.',
                'verificado'  => 'pendiente',
            ],
        ];

        foreach ($anuncios as $datos) {
            Anuncio::firstOrCreate(
                ['profesor_id' => $profesor->id, 'titulo' => $datos['titulo']],
                array_merge($datos, ['profesor_id' => $profesor->id, 'activo' => true, 'destacado' => false])
            );
        }

        $this->command->info('✅ Demo data seeded (alumno, profesor, 3 anuncios).');
        $this->command->table(
            ['Role', 'Email', 'Password'],
            [
                ['Alumno',   'alumno@mentorup.test',   'Demo1234!'],
                ['Profesor', 'profesor@mentorup.test', 'Demo1234!'],
            ]
        );
    }
}
