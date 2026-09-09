<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\ConsultationResource;
use App\Models\Appointment;
use App\Models\Consultation;
use App\Services\AuditService;
use App\Services\TableQueryService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ConsultationController extends BaseCrudController
{
    protected string $model = Consultation::class;

    protected string $resource = ConsultationResource::class;

    protected array $with = ['patient', 'vet'];

    protected array $searchable = ['reason'];

    protected array $filterable = ['patient_id' => 'patient_id', 'vet_id' => 'vet_id'];

    /** Historia clínica: más reciente primero. */
    public function index(Request $request, TableQueryService $tables)
    {
        $request->merge([
            'date_field' => 'date',
            'sort' => $request->input('sort', 'date'),
            'direction' => $request->input('direction', 'desc'),
        ]);

        return parent::index($request, $tables);
    }

    /** Al crear una consulta desde una cita, la cita pasa a "attended". */
    public function store(Request $request, AuditService $audit)
    {
        return DB::transaction(function () use ($request, $audit) {
            $response = parent::store($request, $audit);

            $appointmentId = $request->input('appointment_id');
            if ($appointmentId) {
                $appointment = Appointment::query()
                    ->where('company_id', $this->companyId($request))
                    ->find($appointmentId);

                if ($appointment && in_array($appointment->status, ['scheduled', 'confirmed'], true)) {
                    $old = $appointment->getOriginal();
                    $appointment->update(['status' => 'attended']);
                    $audit->record('updated', $appointment, $request, $old);
                }
            }

            return $response;
        });
    }

    public function restore(Request $request, string $id, AuditService $audit)
    {
        $consultation = Consultation::onlyTrashed()
            ->where('company_id', $this->companyId($request))
            ->findOrFail($id);

        $consultation->restore();
        $audit->record('restored', $consultation, $request);

        return new ConsultationResource($consultation->load($this->with));
    }
}
