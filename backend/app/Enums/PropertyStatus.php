<?php

namespace App\Enums;

enum PropertyStatus: string
{
    case Borrador = 'borrador';
    case Draft = 'draft';
    case Disponible = 'disponible';
    case Published = 'published';
    case Reservado = 'reservado';
    case Reserved = 'reserved';
    case Vendido = 'vendido';
    case Sold = 'sold';
    case Arrendado = 'arrendado';
    case Rented = 'rented';
    case Inactivo = 'inactivo';
    case Inactive = 'inactive';
}
