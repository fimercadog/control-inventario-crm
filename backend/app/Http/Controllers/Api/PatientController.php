<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\StorePatientPhotoRequest;
use App\Http\Resources\PatientResource;
use App\Models\Patient;
use App\Rules\ImageFile;
use App\Services\AuditService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class PatientController extends BaseCrudController
{
    protected string $model = Patient::class;

    protected string $resource = PatientResource::class;

    protected array $with = ['client', 'species', 'breed'];

    protected array $searchable = ['name', 'microchip'];

    protected array $filterable = ['status' => 'status', 'client_id' => 'client_id', 'species_id' => 'species_id'];

    /** Restaura un paciente soft-deleteado. */
    public function restore(Request $request, string $id, AuditService $audit)
    {
        $patient = Patient::onlyTrashed()
            ->where('company_id', $this->companyId($request))
            ->findOrFail($id);

        $patient->restore();
        $audit->record('restored', $patient, $request);

        return new PatientResource($patient->load($this->with));
    }

    /** Foto del paciente. Reemplaza la anterior si era propia (patrón ProductController::image). */
    public function photo(StorePatientPhotoRequest $request, string $id, AuditService $audit)
    {
        $companyId = $this->companyId($request);
        $patient = Patient::query()->where('company_id', $companyId)->findOrFail($id);

        $old = $patient->getOriginal();
        $previous = $this->ownStoragePath($patient->photo_url, $companyId);

        $file = $request->file('photo');
        $name = Str::random(40).'.'.ImageFile::extensionFor($file);
        $path = $file->storeAs('patients/'.$companyId, $name, 'public');

        $patient->forceFill(['photo_url' => Storage::disk('public')->url($path)])->save();
        $audit->record('updated', $patient, $request, $old);

        if ($previous && $previous !== $path) {
            Storage::disk('public')->delete($previous);
        }

        return new PatientResource($patient->load($this->with));
    }

    /** Ruta interna del disco `public` para una foto que servimos nosotros y que
     *  pertenece a esta empresa, o null. Solo dentro de patients/{companyId}/. */
    private function ownStoragePath(?string $photoUrl, int $companyId): ?string
    {
        if (! $photoUrl || ! Str::contains($photoUrl, '/storage/')) {
            return null;
        }

        $path = Str::afterLast($photoUrl, '/storage/');
        $prefix = 'patients/'.$companyId.'/';

        return (str_starts_with($path, $prefix) && ! str_contains($path, '..')) ? $path : null;
    }
}
