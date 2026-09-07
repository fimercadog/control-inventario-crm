<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Http\UploadedFile;

/**
 * Valida que el archivo subido sea una imagen real de un tipo permitido,
 * mirando el contenido (cabecera del binario) con getimagesize().
 *
 * Por que no las reglas `image` + `mimes` de Laravel: ambas terminan llamando
 * a UploadedFile::guessExtension() -> getMimeType(), que depende de la
 * extension php_fileinfo. Si fileinfo no esta disponible (o cualquier otro
 * fallo en esa ruta) Symfony lanza una excepcion que escapaba como HTTP 500
 * con informacion interna (AUD-02). getimagesize() es de ext-standard —
 * siempre presente — y ante un archivo invalido devuelve false, nunca lanza.
 */
class ImageFile implements ValidationRule
{
    /** Tipos IMAGETYPE_* aceptados: JPG, PNG, WEBP. */
    private const ALLOWED = [IMAGETYPE_JPEG, IMAGETYPE_PNG, IMAGETYPE_WEBP];

    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (! $value instanceof UploadedFile || ! $value->isValid()) {
            $fail('El archivo subido no es valido.');

            return;
        }

        try {
            $info = @getimagesize($value->getRealPath());
        } catch (\Throwable) {
            $info = false;
        }

        if ($info === false || ! in_array($info[2] ?? null, self::ALLOWED, true)) {
            $fail('El archivo debe ser una imagen JPG, PNG o WEBP valida.');
        }
    }

    /**
     * Extension del disco para un archivo ya validado por esta regla, derivada
     * del tipo real del contenido (no del nombre que manda el cliente). Devuelve
     * 'jpg' por defecto si el tipo no se pudo leer.
     */
    public static function extensionFor(UploadedFile $file): string
    {
        try {
            $type = @getimagesize($file->getRealPath())[2] ?? null;
        } catch (\Throwable) {
            $type = null;
        }

        return match ($type) {
            IMAGETYPE_PNG => 'png',
            IMAGETYPE_WEBP => 'webp',
            default => 'jpg',
        };
    }
}
