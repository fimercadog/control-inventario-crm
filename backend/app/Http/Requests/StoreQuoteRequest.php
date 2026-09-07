<?php

namespace App\Http\Requests;

use Illuminate\Validation\Rule;

class StoreQuoteRequest extends ApiFormRequest
{
    public function rules(): array
    {
        $companyId = $this->user()?->company_id;

        return [
            'client_id' => ['required', 'integer', Rule::exists('clients', 'id')->where('company_id', $companyId)],
            'deal_id' => ['nullable', 'integer', Rule::exists('deals', 'id')->where('company_id', $companyId)],
            'title' => ['required', 'string', 'max:150'],
            'valid_until' => ['nullable', 'date'],
            'notes' => ['nullable', 'string', 'max:2000'],
        ];
    }
}
