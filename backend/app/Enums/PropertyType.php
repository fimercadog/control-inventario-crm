<?php

namespace App\Enums;

enum PropertyType: string
{
    case Apartamento = 'apartamento';
    case Apartment = 'apartment';
    case Casa = 'casa';
    case House = 'house';
    case Oficina = 'oficina';
    case Office = 'office';
    case Local = 'local';
    case CommercialPremises = 'commercial_premises';
    case Lote = 'lote';
    case Land = 'land';
    case Bodega = 'bodega';
    case Warehouse = 'warehouse';
    case Finca = 'finca';
    case Farm = 'farm';
    case Otro = 'otro';
    case Other = 'other';
}
