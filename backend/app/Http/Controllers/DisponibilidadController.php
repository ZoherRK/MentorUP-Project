<?php

namespace App\Http\Controllers;

use App\Models\DisponibilidadHoraria;
use App\Models\Profesor;
use App\Models\Reserva;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class DisponibilidadController extends Controller
{
    // ─────────────────────────────────────────────────────────────────────
    // INDEX — disponibilidad del profesor autenticado
    // ─────────────────────────────────────────────────────────────────────

    public function index(Request $request): JsonResponse
    {
        $usuario = $request->user();

        if ($usuario->getRol() !== 'profesor') {
            return response()->json(['ok' => false, 'mensaje' => 'Solo los profesores tienen disponibilidad horaria.'], 403);
        }

        $profesor = Profesor::where('usuario_id', $usuario->id)->firstOrFail();
        $disponibilidad = DisponibilidadHoraria::where('profesor_id', $profesor->id)
            ->orderBy('dia_semana')
            ->orderBy('hora_inicio')
            ->get();

        return response()->json(['ok' => true, 'data' => $disponibilidad]);
    }

    // ─────────────────────────────────────────────────────────────────────
    // SAVE — guarda/reemplaza la disponibilidad completa
    // ─────────────────────────────────────────────────────────────────────

    public function save(Request $request): JsonResponse
    {
        $usuario = $request->user();

        if ($usuario->getRol() !== 'profesor') {
            return response()->json(['ok' => false, 'mensaje' => 'Solo los profesores pueden configurar su disponibilidad.'], 403);
        }

        $data = $request->validate([
            'bloques'               => 'required|array|max:50',
            'bloques.*.dia_semana'  => 'required|integer|between:0,6',
            'bloques.*.hora_inicio' => 'required|string',
            'bloques.*.hora_fin'    => 'required|string',
        ]);

        $bloques = $data['bloques'];

        // Validar formato y valores de hora
        foreach ($bloques as $idx => $bloque) {
            foreach (['hora_inicio', 'hora_fin'] as $campo) {
                $partes = explode(':', $bloque[$campo]);
                if (count($partes) !== 2) {
                    return response()->json(['ok' => false, 'mensaje' => "Formato de hora inválido en bloque $idx ($campo)."], 422);
                }
                $h = (int)$partes[0];
                $m = (int)$partes[1];
                if ($h < 0 || $h > 23 || ($m !== 0 && $m !== 30)) {
                    return response()->json(['ok' => false, 'mensaje' => "Hora inválida en bloque $idx ($campo): {$bloque[$campo]}"], 422);
                }
            }

            // Comparar como minutos totales para evitar problemas con strings
            $inicioMin = (int)explode(':', $bloque['hora_inicio'])[0] * 60 + (int)explode(':', $bloque['hora_inicio'])[1];
            $finMin    = (int)explode(':', $bloque['hora_fin'])[0] * 60 + (int)explode(':', $bloque['hora_fin'])[1];

            if ($finMin <= $inicioMin) {
                return response()->json(['ok' => false, 'mensaje' => 'La hora de fin debe ser posterior a la hora de inicio.'], 422);
            }
        }

        $profesor = Profesor::where('usuario_id', $usuario->id)->firstOrFail();

        // Validar solapamientos dentro de los bloques enviados
        foreach ($bloques as $i => $b1) {
            foreach ($bloques as $j => $b2) {
                if ($i >= $j) continue;
                if ($b1['dia_semana'] !== $b2['dia_semana']) continue;

                $b1InicioMin = (int)explode(':', $b1['hora_inicio'])[0] * 60 + (int)explode(':', $b1['hora_inicio'])[1];
                $b1FinMin    = (int)explode(':', $b1['hora_fin'])[0] * 60 + (int)explode(':', $b1['hora_fin'])[1];
                $b2InicioMin = (int)explode(':', $b2['hora_inicio'])[0] * 60 + (int)explode(':', $b2['hora_inicio'])[1];
                $b2FinMin    = (int)explode(':', $b2['hora_fin'])[0] * 60 + (int)explode(':', $b2['hora_fin'])[1];

                if ($b1InicioMin < $b2FinMin && $b2InicioMin < $b1FinMin) {
                    return response()->json([
                        'ok'      => false,
                        'mensaje' => 'Hay bloques horarios solapados en el mismo día. Por favor, revisa tu disponibilidad.',
                    ], 422);
                }
            }
        }

        // Reemplazar toda la disponibilidad
        DisponibilidadHoraria::where('profesor_id', $profesor->id)->delete();

        foreach ($bloques as $bloque) {
            DisponibilidadHoraria::create([
                'profesor_id' => $profesor->id,
                'dia_semana'  => $bloque['dia_semana'],
                'hora_inicio' => $bloque['hora_inicio'],
                'hora_fin'    => $bloque['hora_fin'],
                'activo'      => true,
            ]);
        }

        $nueva = DisponibilidadHoraria::where('profesor_id', $profesor->id)
            ->orderBy('dia_semana')->orderBy('hora_inicio')
            ->get();

        return response()->json([
            'ok'      => true,
            'mensaje' => 'Disponibilidad guardada correctamente.',
            'data'    => $nueva,
        ]);
    }

    // ─────────────────────────────────────────────────────────────────────
    // PUBLIC — disponibilidad visible para alumnos al reservar
    // ─────────────────────────────────────────────────────────────────────

    public function publicShow(int $profesorId): JsonResponse
    {
        $profesor = Profesor::find($profesorId);

        if (!$profesor) {
            return response()->json(['ok' => false, 'mensaje' => 'Profesor no encontrado.'], 404);
        }

        $disponibilidad = DisponibilidadHoraria::where('profesor_id', $profesorId)
            ->where('activo', true)
            ->orderBy('dia_semana')
            ->orderBy('hora_inicio')
            ->get(['dia_semana', 'hora_inicio', 'hora_fin']);

        return response()->json(['ok' => true, 'data' => $disponibilidad]);
    }

    // ─────────────────────────────────────────────────────────────────────
    // VERIFY DATE — comprueba si una fecha es válida para reservar
    // ─────────────────────────────────────────────────────────────────────

    public function verificarFecha(Request $request, int $profesorId): JsonResponse
    {
        $data = $request->validate([
            'fecha_clase' => 'required|date|after:now',
        ]);

        $profesor = Profesor::with('disponibilidad')->find($profesorId);

        if (!$profesor) {
            return response()->json(['ok' => false, 'mensaje' => 'Profesor no encontrado.'], 404);
        }

        $dt         = new \DateTime($data['fecha_clase']);
        $disponible = $profesor->estaDisponible($dt);

        return response()->json([
            'ok'          => true,
            'disponible'  => $disponible,
            'mensaje'     => $disponible
                ? 'El profesor está disponible en esta franja horaria.'
                : 'El profesor no está disponible en esta franja horaria. Consulta su disponibilidad.',
        ]);
    }

    // ─────────────────────────────────────────────────────────────────────
    // SLOTS LIBRES — devuelve los slots disponibles de un día concreto
    // GET /api/profesores/{id}/slots?fecha=YYYY-MM-DD&duracion=1
    // ─────────────────────────────────────────────────────────────────────

    public function slotsLibres(Request $request, int $profesorId): JsonResponse
    {
        $data = $request->validate([
            'fecha'    => 'required|date_format:Y-m-d',
            'duracion' => 'nullable|numeric|in:0.5,1,1.5,2',
        ]);

        $profesor = Profesor::with('disponibilidad')->find($profesorId);
        if (!$profesor) {
            return response()->json(['ok' => false, 'mensaje' => 'Profesor no encontrado.'], 404);
        }

        $fecha    = $data['fecha'];
        $duracion = (float) ($data['duracion'] ?? 1);

        // día de semana 0=Lunes…6=Domingo
        $dt  = new \DateTime($fecha);
        $dow = ((int) $dt->format('N')) - 1;

        // bloques del profesor para ese día de la semana
        $bloques = $profesor->disponibilidad->filter(fn($b) => $b->dia_semana === $dow);

        if ($bloques->isEmpty()) {
            return response()->json(['ok' => true, 'data' => []]);
        }

        // Reservas activas (pendiente|confirmada) de ese profesor en esa fecha
        $reservasDelDia = Reserva::whereHas('anuncio', fn($q) => $q->where('profesor_id', $profesorId))
            ->whereIn('estado', ['pendiente', 'confirmada'])
            ->whereDate('fecha_clase', $fecha)
            ->get(['fecha_clase', 'duracion_h']);

        // Construir lista de slots de 30 min ocupados
        $slotsOcupados = [];
        foreach ($reservasDelDia as $r) {
            $inicio = new \DateTime($r->fecha_clase);
            $fin    = clone $inicio;
            $fin->modify('+' . ((int)($r->duracion_h * 60)) . ' minutes');
            $cur = clone $inicio;
            while ($cur < $fin) {
                $slotsOcupados[] = $cur->format('G:i');
                $cur->modify('+30 minutes');
            }
        }

        // Generar slots disponibles para la duración solicitada
        $slotsLibres = [];
        foreach ($bloques as $bloque) {
            $cur       = new \DateTime($fecha . ' ' . $bloque->hora_inicio);
            $finBloque = new \DateTime($fecha . ' ' . $bloque->hora_fin);

            while (true) {
                $finSlot = clone $cur;
                $finSlot->modify('+' . ((int)($duracion * 60)) . ' minutes');

                if ($finSlot > $finBloque) break;

                $libre = true;
                $check = clone $cur;
                while ($check < $finSlot) {
                    if (in_array($check->format('G:i'), $slotsOcupados)) {
                        $libre = false;
                        break;
                    }
                    $check->modify('+30 minutes');
                }

                if ($libre) {
                    $slotsLibres[] = $cur->format('G:i');
                }

                $cur->modify('+30 minutes');
            }
        }

        sort($slotsLibres);

        return response()->json(['ok' => true, 'data' => $slotsLibres]);
    }
}