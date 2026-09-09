<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\AppointmentResource;
use App\Models\Appointment;
use App\Services\AuditService;
use App\Services\TableQueryService;
use Illuminate\Http\Request;

class AppointmentController extends BaseCrudController
{
    protected string $model = Appointment::class;

    protected string $resource = AppointmentResource::class;

    protected array $with = ['patient.client', 'patient.species', 'service', 'practitioner'];

    protected array $filterable = [
        'status' => 'status',
        'practitioner_id' => 'practitioner_id',
        'patient_id' => 'patient_id',
    ];

    /** La agenda se filtra y ordena por `starts_at`, no por `created_at`. */
    public function index(Request $request, TableQueryService $tables)
    {
        $request->merge([
            'date_field' => 'starts_at',
            'sort' => $request->input('sort', 'starts_at'),
            'direction' => $request->input('direction', 'asc'),
        ]);

        return parent::index($request, $tables);
    }

    public function confirm(Request $request, string $id, AuditService $audit)
    {
        return $this->transition($request, $id, $audit, from: ['scheduled'], to: 'confirmed');
    }

    public function cancel(Request $request, string $id, AuditService $audit)
    {
        return $this->transition($request, $id, $audit, from: ['scheduled', 'confirmed'], to: 'cancelled');
    }

    public function markAttended(Request $request, string $id, AuditService $audit)
    {
        return $this->transition($request, $id, $audit, from: ['scheduled', 'confirmed'], to: 'attended');
    }

    public function markNoShow(Request $request, string $id, AuditService $audit)
    {
        return $this->transition($request, $id, $audit, from: ['scheduled', 'confirmed'], to: 'no_show');
    }

    /**
     * @param  list<string>  $from
     */
    private function transition(Request $request, string $id, AuditService $audit, array $from, string $to)
    {
        $appointment = Appointment::query()
            ->where('company_id', $this->companyId($request))
            ->findOrFail($id);

        abort_unless(
            in_array($appointment->status, $from, true),
            422,
            "No se puede pasar una cita en estado '{$appointment->status}' a '{$to}'.",
        );

        $old = $appointment->getOriginal();
        $appointment->update(['status' => $to]);
        $audit->record('updated', $appointment, $request, $old);

        return new AppointmentResource($appointment->load($this->with));
    }
}
