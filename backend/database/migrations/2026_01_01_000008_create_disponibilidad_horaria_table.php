<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * MIGRATION: disponibilidad_horaria
 *
 * Almacena la disponibilidad semanal de cada profesor.
 * Cada fila representa un bloque horario recurrente:
 *   - dia_semana: 0=Lunes … 6=Domingo
 *   - hora_inicio / hora_fin: formato HH:MM
 *
 * Esto permite que los alumnos vean qué días y horas está disponible
 * un profesor antes de crear una reserva.
 */
return new class extends Migration {
    public function up(): void
    {
        Schema::create('disponibilidad_horaria', function (Blueprint $table) {
            $table->id();
            $table->foreignId('profesor_id')
                  ->constrained('profesores')
                  ->cascadeOnDelete();
            $table->tinyInteger('dia_semana')
                  ->comment('0=Lunes, 1=Martes, 2=Miércoles, 3=Jueves, 4=Viernes, 5=Sábado, 6=Domingo');
            $table->time('hora_inicio');
            $table->time('hora_fin');
            $table->boolean('activo')->default(true);
            $table->timestamps();

            // Un profesor no puede tener dos bloques solapados del mismo día
            // (validación extra en el controller/model)
            $table->index(['profesor_id', 'dia_semana']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('disponibilidad_horaria');
    }
};
