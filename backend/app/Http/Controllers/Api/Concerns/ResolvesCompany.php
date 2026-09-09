<?php

namespace App\Http\Controllers\Api\Concerns;

use App\Models\Company;
use Illuminate\Http\Request;

/**
 * Resuelve la empresa (tenant) del request.
 *
 * Modelo actual: **un deploy por cliente** = una sola empresa por instalación.
 * Ver `docs/multitenancy.md` para qué cambiar si se pasa a SaaS multiempresa.
 */
trait ResolvesCompany
{
    protected function companyId(Request $request): int
    {
        // Autenticado: SIEMPRE la empresa del usuario. Es la única fuente de
        // verdad para un request con sesión.
        $companyId = $request->user()?->company_id;
        if ($companyId !== null) {
            return (int) $companyId;
        }

        // Sin empresa resoluble desde el usuario:
        //  - request público (catálogo público, formulario de leads), o
        //  - usuario sin `company_id` (dato incompleto).
        // En un deploy de una sola empresa usamos esa. El `?? 1` anterior era
        // peligroso: con la tabla vacía inventaba un id inexistente y la escritura
        // terminaba huérfana o pegada a una empresa creada después. Si no hay
        // ninguna empresa, la instalación está rota (falta el seeder) -> 500, no
        // una adivinanza. Es permanente, no transitorio: no invita a reintentar.
        $onlyCompanyId = Company::query()->orderBy('id')->value('id');
        abort_if($onlyCompanyId === null, 500, 'El sistema no tiene una empresa configurada.');

        return (int) $onlyCompanyId;
    }
}
