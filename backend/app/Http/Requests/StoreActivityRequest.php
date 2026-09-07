<?php

namespace App\Http\Requests;

use Illuminate\Validation\Rule;

class StoreActivityRequest extends ApiFormRequest
{
    public function rules(): array
    {
        $companyId = $this->user()?->company_id;

        return [
            'client_id' => ['nullable', 'integer', Rule::exists('clients', 'id')->where('company_id', $companyId)],
            'deal_id' => ['nullable', 'integer', Rule::exists('deals', 'id')->where('company_id', $companyId)],
            'type' => ['required', 'in:call,meeting,email,note,task,followup'],
            'subject' => ['required', 'string', 'max:150'],
            'notes' => ['nullable', 'string', 'max:2000'],
            'due_date' => ['nullable', 'date'],
            'completed' => ['boolean'],
        ];
    }
}
