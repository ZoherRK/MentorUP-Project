<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('reservas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('alumno_id')->constrained('alumnos')->cascadeOnDelete();
            $table->foreignId('anuncio_id')->constrained('anuncios')->cascadeOnDelete();
            $table->dateTime('fecha_clase');
            $table->decimal('duracion_h', 4, 1)->comment('Duration in hours: 0.5, 1, 1.5, 2');
            $table->decimal('precio_total', 8, 2);
            $table->text('notas_alumno')->nullable();
            $table->enum('estado', ['pendiente', 'confirmada', 'completada', 'cancelada'])->default('pendiente');
            $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('reservas'); }
};
