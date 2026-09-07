<?php

namespace App\Http\Requests;

use App\Rules\ImageFile;

class StoreProductImageRequest extends ApiFormRequest
{
    public function rules(): array
    {
        // `file` + `max` no tocan fileinfo. La validacion de imagen/contenido la
        // hace ImageFile mirando la cabecera del binario (ver esa clase: las
        // reglas `image`/`mimes` podian devolver 500 si fileinfo no estaba).
        return [
            'image' => ['required', 'file', 'max:2048', new ImageFile],
        ];
    }

    public function messages(): array
    {
        return parent::messages() + [
            'image.required' => 'Selecciona una imagen.',
            'image.file' => 'El archivo subido no es valido.',
            'image.max' => 'La imagen no puede pesar mas de 2 MB.',
        ];
    }
}
