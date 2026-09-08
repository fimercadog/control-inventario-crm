<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\StoreProductImageRequest;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use App\Rules\ImageFile;
use App\Services\AuditService;
use App\Services\TableQueryService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ProductController extends BaseCrudController
{
    protected string $model = Product::class;

    protected string $resource = ProductResource::class;

    protected array $with = ['category', 'brand', 'unit'];

    protected array $searchable = ['sku', 'name'];

    protected array $filterable = ['status' => 'status', 'category_id' => 'category_id', 'brand_id' => 'brand_id'];

    /** Igual al index generico, mas `stock_on_hand` (suma de movimientos) por fila. */
    public function index(Request $request, TableQueryService $tables)
    {
        $query = Product::query()
            ->where('company_id', $this->companyId($request))
            ->with($this->with)
            ->withSum('stockMovements as stock_on_hand', 'quantity');

        $tables->apply($request, $query, $this->searchable, $this->filterable);

        return ProductResource::collection($query->paginate(min((int) $request->input('per_page', 10), 100)));
    }

    /** Sube la imagen del producto (catalogo publico). Reemplaza la anterior si era propia. */
    public function image(StoreProductImageRequest $request, string $id, AuditService $audit)
    {
        $companyId = $this->companyId($request);

        $product = Product::query()
            ->where('company_id', $companyId)
            ->findOrFail($id);

        $old = $product->getOriginal();
        $previous = $this->ownStoragePath($product->image_url, $companyId);

        // Nombre generado por el servidor; extension derivada del contenido real
        // (no de guessExtension() -> fileinfo, que podia lanzar -> 500). La imagen
        // vive en la carpeta propia de la empresa: products/{companyId}/. Guarda
        // primero: si el store falla, la imagen anterior sigue sirviendo.
        $file = $request->file('image');
        $name = Str::random(40).'.'.ImageFile::extensionFor($file);
        $path = $file->storeAs('products/'.$companyId, $name, 'public');
        // URL del disco `public` (APP_URL + /storage/...), absoluta a proposito:
        // el frontend vive en otro dominio que la API, un `/storage/...` relativo
        // apuntaria al dominio del front y daria 404. forceFill: `image_url` no es
        // fillable (no se fija por el payload); aca lo escribe el servidor.
        $product->forceFill(['image_url' => Storage::disk('public')->url($path)])->save();
        $audit->record('updated', $product, $request, $old);

        if ($previous && $previous !== $path) {
            Storage::disk('public')->delete($previous);
        }

        return new ProductResource($product->load($this->with));
    }

    /**
     * Ruta interna del disco `public` para una imagen que servimos nosotros Y
     * que pertenece a esta empresa, o null. `image_url` es texto libre (puede
     * apuntar a un CDN externo, o venir manipulado en el payload de un producto):
     * el borrado solo se acepta dentro de `products/{companyId}/`, sin salto de
     * directorio. Asi, un `image_url` apuntando al archivo de otra empresa
     * (`products/{otraEmpresa}/...` o la ruta plana vieja `products/...`) nunca
     * llega a `Storage::delete`.
     */
    private function ownStoragePath(?string $imageUrl, int $companyId): ?string
    {
        if (! $imageUrl || ! Str::contains($imageUrl, '/storage/')) {
            return null;
        }

        $path = Str::afterLast($imageUrl, '/storage/');
        $prefix = 'products/'.$companyId.'/';

        return (str_starts_with($path, $prefix) && ! str_contains($path, '..')) ? $path : null;
    }
}
