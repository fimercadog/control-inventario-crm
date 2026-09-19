<?php

namespace App\Enums;

enum VisitStatus: string
{
    case Pendiente = 'pendiente';
    case Pending = 'pending';
    case Programada = 'programada';
    case Scheduled = 'scheduled';
    case Confirmada = 'confirmada';
    case Confirmed = 'confirmed';
    case Realizada = 'realizada';
    case Completed = 'completed';
    case Cancelada = 'cancelada';
    case Cancelled = 'cancelled';
    case Reprogramada = 'reprogramada';
    case Rescheduled = 'rescheduled';
    case NoAsistio = 'no_asistio';
    case NoShow = 'no_show';
}
