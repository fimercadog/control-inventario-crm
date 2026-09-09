<?php

namespace App\Http\Requests;

use App\Rules\ImageFile;

class StoreProcedureImageRequest extends ApiFormRequest
{
    public function rules(): array
    {
        return [
            'document' => ['required', 'file', 'max:2048', new ImageFile],
        ];
    }

    public function messages(): array
    {
        return parent::messages() + [
            'document.required' => 'Selecciona un documento.',
            'document.max' => 'El documento no puede pesar mas de 2 MB.',
        ];
    }
}
