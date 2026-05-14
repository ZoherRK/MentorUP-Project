<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('anuncios', function (Blueprint $table) {
            $table->id();
            $table->foreignId('profesor_id')->constrained('profesores')->cascadeOnDelete();
            $table->string('titulo', 200);
            $table->string('asignatura', 100);
            $table->enum('nivel', ['primaria', 'eso', 'bachillerato', 'universidad', 'adultos', 'otro']);
            $table->decimal('precio_hora', 6, 2);
            $table->text('descripcion');
            $table->enum('verificado', ['pendiente', 'aprobado', 'rechazado'])->default('pendiente');
            $table->boolean('activo')->default(true);
            $table->boolean('destacado')->default(false);
            $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('anuncios'); }
};
