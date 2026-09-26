<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\ResolvesCompany;
use App\Http\Controllers\Controller;
use App\Models\Team;
use App\Services\AuditService;
use Illuminate\Http\Request;

class TeamController extends Controller
{
    use ResolvesCompany;

    public function index(Request $request)
    {
        $companyId = $this->companyId($request);
        $teams = Team::where('company_id', $companyId)
            ->withCount('students')
            ->orderBy('name')
            ->get();

        return response()->json(['data' => $teams]);
    }

    public function store(Request $request, AuditService $audit)
    {
        $companyId = $this->companyId($request);
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'category_code' => ['required', 'string', 'max:50'],
            'min_age' => ['nullable', 'integer', 'min:3'],
            'max_age' => ['nullable', 'integer', 'max:25'],
            'coach_name' => ['nullable', 'string', 'max:255'],
            'training_schedule' => ['nullable', 'string', 'max:255'],
            'monthly_fee' => ['required', 'numeric', 'min:0'],
            'status' => ['nullable', 'string', 'in:active,inactive'],
        ]);

        $team = Team::create(array_merge($data, ['company_id' => $companyId]));
        $audit->record('created', $team, $request);

        return response()->json(['message' => 'Categoría creada con éxito.', 'data' => $team], 201);
    }

    public function show(Request $request, int $id)
    {
        $companyId = $this->companyId($request);
        $team = Team::where('company_id', $companyId)
            ->with(['students.client'])
            ->findOrFail($id);

        return response()->json(['data' => $team]);
    }

    public function update(Request $request, int $id, AuditService $audit)
    {
        $companyId = $this->companyId($request);
        $team = Team::where('company_id', $companyId)->findOrFail($id);

        $data = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'category_code' => ['sometimes', 'string', 'max:50'],
            'min_age' => ['nullable', 'integer'],
            'max_age' => ['nullable', 'integer'],
            'coach_name' => ['nullable', 'string', 'max:255'],
            'training_schedule' => ['nullable', 'string', 'max:255'],
            'monthly_fee' => ['sometimes', 'numeric', 'min:0'],
            'status' => ['sometimes', 'string', 'in:active,inactive'],
        ]);

        $oldValues = $team->getAttributes();
        $team->update($data);
        $audit->record('updated', $team, $request, $oldValues);

        return response()->json(['message' => 'Categoría actualizada con éxito.', 'data' => $team]);
    }

    public function destroy(Request $request, int $id, AuditService $audit)
    {
        $companyId = $this->companyId($request);
        $team = Team::where('company_id', $companyId)->findOrFail($id);

        $oldValues = $team->getAttributes();
        $team->delete();
        $audit->record('deleted', $team, $request, $oldValues);

        return response()->json(['message' => 'Categoría eliminada con éxito.']);
    }
}
