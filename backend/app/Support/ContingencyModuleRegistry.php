<?php

namespace App\Support;

/**
 * Modulos elegibles para operar en modo contingencia.
 *
 * La elegibilidad es una decision de arquitectura, no un toggle de settings.
 * Lo que el admin elige en tiempo de ejecucion es cuales habilitar para una
 * activacion concreta. Productos y Oportunidades soportan alta idempotente
 * (`client_uuid`) y deteccion de conflicto en la edicion (`base_snapshot`).
 */
class ContingencyModuleRegistry
{
    /**
     * @return list<array{key: string, label: string, description: string, resource: string}>
     */
    public static function all(): array
    {
        return [
            [
                'key' => 'products',
                'label' => 'Productos',
                'description' => 'Crear y editar productos sin conexion. Se sincronizan uno por uno al volver la conexion.',
                'resource' => '/products',
            ],
            [
                'key' => 'deals',
                'label' => 'Oportunidades',
                'description' => 'Crear y editar oportunidades sin conexion. Se sincronizan uno por uno al volver la conexion.',
                'resource' => '/deals',
            ],
        ];
    }

    /**
     * @return list<string>
     */
    public static function keys(): array
    {
        return array_column(self::all(), 'key');
    }
}
