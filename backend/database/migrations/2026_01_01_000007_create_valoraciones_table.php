<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('valoraciones', function (Blueprint $table) {
            $table->id();
            $table->foreignId('alumno_id')->constrained('alumnos')->cascadeOnDelete();
            $table->foreignId('anuncio_id')->constrained('anuncios')->cascadeOnDelete();
            $table->tinyInteger('puntuacion')->unsigned()->comment('1 to 5 stars');
            $table->text('comentario')->nullable();
            $table->timestamps();

            // One review per alumno per anuncio
            $table->unique(['alumno_id', 'anuncio_id']);
        });
    }
    public function down(): void { Schema::dropIfExists('valoraciones'); }
};
