<?php

namespace App\Http\Requests;

use App\Rules\ImageFile;

class StorePatientPhotoRequest extends ApiFormRequest
{
    public function rules(): array
    {
        return [
            'photo' => ['required', 'file', 'max:2048', new ImageFile],
        ];
    }

    public function messages(): array
    {
        return parent::messages() + [
            'photo.required' => 'Selecciona una foto.',
            'photo.file' => 'El archivo subido no es valido.',
            'photo.max' => 'La foto no puede pesar mas de 2 MB.',
        ];
    }
}
