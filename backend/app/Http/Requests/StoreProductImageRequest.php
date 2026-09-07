<?php

namespace App\Http\Requests;

class StoreProductImageRequest extends ApiFormRequest
{
    public function rules(): array
    {
        return [
            'image' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
        ];
    }

    public function messages(): array
    {
        return parent::messages() + [
            'image.image' => 'El archivo debe ser una imagen.',
            'image.mimes' => 'Formatos aceptados: JPG, PNG o WEBP.',
            'image.max' => 'La imagen no puede pesar mas de 2 MB.',
        ];
    }
}
