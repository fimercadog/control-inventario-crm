<?php

namespace App\Enums;

enum ListingType: string
{
    case Venta = 'venta';
    case Sale = 'sale';
    case Arriendo = 'arriendo';
    case Rent = 'rent';
    case Ambos = 'ambos';
    case Both = 'both';
}
