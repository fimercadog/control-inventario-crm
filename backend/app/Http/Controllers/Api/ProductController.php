<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\StoreProductImageRequest;
use App\Http\Resources\ProductResource;
use App\Models\Product;
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
        $product = Product::query()
            ->where('company_id', $this->companyId($request))
            ->findOrFail($id);

        $old = $product->getOriginal();
        $previous = $this->ownStoragePath($product->image_url);

        // Guarda primero: si el store falla, la imagen anterior sigue sirviendo.
        $path = $request->file('image')->store('products', 'public');
        $product->update(['image_url' => Storage::url($path)]);
        $audit->record('updated', $product, $request, $old);

        if ($previous && $previous !== $path) {
            Storage::disk('public')->delete($previous);
        }

        return new ProductResource($product->load($this->with));
    }

    /**
     * Ruta interna del disco `public` para una imagen que servimos nosotros, o
     * null. `image_url` es texto libre (puede apuntar a un CDN externo): solo se
     * acepta borrar dentro de `products/` y sin salto de directorio.
     */
    private function ownStoragePath(?string $imageUrl): ?string
    {
        if (! $imageUrl || ! Str::contains($imageUrl, '/storage/')) {
            return null;
        }

        $path = Str::afterLast($imageUrl, '/storage/');

        // Solo se borra dentro de products/, sin salto de directorio: aunque
        // image_url sea texto libre, no puede alcanzar otra ruta del disco.
        return (str_starts_with($path, 'products/') && ! str_contains($path, '..')) ? $path : null;
    }
}
