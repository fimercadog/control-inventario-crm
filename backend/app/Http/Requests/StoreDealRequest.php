<?php

namespace App\Http\Requests;

use Illuminate\Validation\Rule;

class StoreDealRequest extends ApiFormRequest
{
    protected function prepareForValidation(): void
    {
        if (! $this->filled('owner_id') && $this->isMethod('post')) {
            $this->merge(['owner_id' => $this->user()?->id]);
        }
    }

    public function rules(): array
    {
        $companyId = $this->user()?->company_id;

        return [
            'client_id' => ['required', Rule::exists('clients', 'id')->where('company_id', $companyId)],
            'owner_id' => ['nullable', 'integer', Rule::exists('users', 'id')->where('company_id', $companyId)],
            'title' => ['required', 'string', 'max:150'],
            'amount' => ['required', 'numeric', 'min:0'],
            'stage' => ['required', 'in:prospecting,qualification,proposal,negotiation,won,lost'],
            'expected_close_date' => ['nullable', 'date'],
        ];
    }
}
