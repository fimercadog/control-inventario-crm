<?php

namespace App\Support\Plan;

/**
 * Modulos que un plan puede no incluir. Mapa central feature -> tier minimo:
 * evita condicionales de plan sueltos por controlador (FASE 8 del brief
 * low-ticket). Usado por EnsurePlanFeature y por PlanService::has().
 */
enum Feature: string
{
    // Seguimiento comercial: Leads, Contactos, Segmentos, Notas, Deals,
    // Actividades, Tareas, Seguimientos, Calendario.
    case CrmPro = 'crm_pro';
    // Inventario avanzado: Marcas, Unidades, Bodegas, Proveedores,
    // Transferencias, Alertas de stock, Ordenes de compra.
    case InventoryPro = 'inventory_pro';
    // Reportes y reportes comerciales.
    case Analytics = 'analytics';
    // Mas de un usuario por empresa.
    case Team = 'team';
    // Contingencia, Asistente IA, Auditoria, Roles.
    case Premium = 'premium';

    public function minTier(): PlanTier
    {
        return match ($this) {
            self::CrmPro, self::InventoryPro, self::Analytics, self::Team => PlanTier::Pro,
            self::Premium => PlanTier::Premium,
        };
    }
}
