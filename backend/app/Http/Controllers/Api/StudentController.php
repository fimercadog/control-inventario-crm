<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\ResolvesCompany;
use App\Http\Controllers\Controller;
use App\Models\Client;
use App\Models\Student;
use App\Services\AuditService;
use Illuminate\Http\Request;

class StudentController extends Controller
{
    use ResolvesCompany;

    public function index(Request $request)
    {
        $companyId = $this->companyId($request);
        $query = Student::where('company_id', $companyId)
            ->with(['client', 'team'])
            ->orderBy('last_name')
            ->orderBy('first_name');

        if ($request->filled('team_id')) {
            $query->where('team_id', $request->integer('team_id'));
        }

        if ($request->filled('search')) {
            $search = $request->string('search');
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%")
                    ->orWhere('identification_number', 'like', "%{$search}%");
            });
        }

        return response()->json(['data' => $query->get()]);
    }

    public function store(Request $request, AuditService $audit)
    {
        $companyId = $this->companyId($request);
        $data = $request->validate([
            'client_id' => ['required', 'integer', 'exists:clients,id'],
            'team_id' => ['nullable', 'integer', 'exists:teams,id'],
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'birth_date' => ['nullable', 'date'],
            'identification_number' => ['nullable', 'string', 'max:50'],
            'position' => ['nullable', 'string', 'max:100'],
            'shirt_number' => ['nullable', 'integer'],
            'shirt_size' => ['nullable', 'string', 'max:20'],
            'rh_factor' => ['nullable', 'string', 'max:10'],
            'eps_health' => ['nullable', 'string', 'max:100'],
            'medical_notes' => ['nullable', 'string'],
            'status' => ['nullable', 'string', 'in:active,inactive,suspended'],
        ]);

        // Verify client belongs to company
        $client = Client::where('company_id', $companyId)->findOrFail($data['client_id']);

        $student = Student::create(array_merge($data, ['company_id' => $companyId]));
        $audit->record('created', $student, $request);

        return response()->json(['message' => 'Alumno registrado con éxito.', 'data' => $student->load(['client', 'team'])], 201);
    }

    public function show(Request $request, int $id)
    {
        $companyId = $this->companyId($request);
        $student = Student::where('company_id', $companyId)
            ->with(['client', 'team', 'enrollments.team', 'attendances'])
            ->findOrFail($id);

        return response()->json(['data' => $student]);
    }

    public function update(Request $request, int $id, AuditService $audit)
    {
        $companyId = $this->companyId($request);
        $student = Student::where('company_id', $companyId)->findOrFail($id);

        $data = $request->validate([
            'client_id' => ['sometimes', 'integer', 'exists:clients,id'],
            'team_id' => ['nullable', 'integer', 'exists:teams,id'],
            'first_name' => ['sometimes', 'string', 'max:255'],
            'last_name' => ['sometimes', 'string', 'max:255'],
            'birth_date' => ['nullable', 'date'],
            'identification_number' => ['nullable', 'string', 'max:50'],
            'position' => ['nullable', 'string', 'max:100'],
            'shirt_number' => ['nullable', 'integer'],
            'shirt_size' => ['nullable', 'string', 'max:20'],
            'rh_factor' => ['nullable', 'string', 'max:10'],
            'eps_health' => ['nullable', 'string', 'max:100'],
            'medical_notes' => ['nullable', 'string'],
            'status' => ['sometimes', 'string', 'in:active,inactive,suspended'],
        ]);

        $oldValues = $student->getAttributes();
        $student->update($data);
        $audit->record('updated', $student, $request, $oldValues);

        return response()->json(['message' => 'Alumno actualizado con éxito.', 'data' => $student->load(['client', 'team'])]);
    }

    public function destroy(Request $request, int $id, AuditService $audit)
    {
        $companyId = $this->companyId($request);
        $student = Student::where('company_id', $companyId)->findOrFail($id);

        $oldValues = $student->getAttributes();
        $student->delete();
        $audit->record('deleted', $student, $request, $oldValues);

        return response()->json(['message' => 'Alumno eliminado con éxito.']);
    }
}
