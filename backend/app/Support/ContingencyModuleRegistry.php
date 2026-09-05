<?php

namespace App\Support;

/**
 * Modulos elegibles para operar en modo contingencia.
 *
 * La elegibilidad es una decision de arquitectura, no un toggle de settings:
 * un modulo solo entra aqui si tiene una ruta de escritura offline segura
 * (puramente aditiva: crea filas, nunca modifica ni depende del estado actual
 * de otro registro). Lo que el admin elige en tiempo de ejecucion es cuales de
 * estos habilitar para una activacion concreta.
 */
class ContingencyModuleRegistry
{
    /**
     * @return list<array{key: string, label: string, description: string}>
     */
    public static function all(): array
    {
        // Sin modulos elegibles todavia: el pivote a CRM + Inventario no definio
        // un flujo de escritura offline propio para esos dominios. La
        // infraestructura de contingencia queda activa, solo vacia.
        return [];
    }

    /**
     * @return list<string>
     */
    public static function keys(): array
    {
        return array_column(self::all(), 'key');
    }
}
