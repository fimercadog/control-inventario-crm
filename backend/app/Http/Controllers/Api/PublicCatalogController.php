<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\ResolvesCompany;
use App\Http\Controllers\Controller;
use App\Http\Requests\StorePublicQuoteRequest;
use App\Http\Resources\PublicProductResource;
use App\Models\Category;
use App\Models\Client;
use App\Models\Product;
use App\Models\Quote;
use App\Services\AuditService;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * Catalogo publico del sitio de marketing. Sin auth (throttle en las rutas).
 * Solo expone productos con `is_public` y `status = active`; la solicitud de
 * cotizacion entra al CRM como Cliente + Quote en borrador (`source = catalog`).
 */
class PublicCatalogController extends Controller
{
    use ResolvesCompany;

    public function products(Request $request)
    {
        $products = $this->publicProducts($request)
            ->with(['category', 'brand', 'unit'])
            ->when($request->filled('category_id'), fn ($q) => $q->where('category_id', $request->integer('category_id')))
            ->when($request->filled('q'), function ($q) use ($request) {
                // Escapar %/_ para que no actuen como comodines del LIKE.
                $term = '%'.addcslashes((string) $request->string('q'), '%_\\').'%';
                $q->where(fn ($sub) => $sub->where('name', 'like', $term)->orWhere('sku', 'like', $term));
            })
            ->orderBy('name')
            ->orderBy('id')
            ->paginate(max(1, min($request->integer('per_page', 12), 24)));

        return PublicProductResource::collection($products);
    }

    public function product(Request $request, int $id)
    {
        $product = $this->publicProducts($request)
            ->with(['category', 'brand', 'unit'])
            ->findOrFail($id);

        return new PublicProductResource($product);
    }

    public function categories(Request $request)
    {
        return Category::query()
            ->where('company_id', $this->companyId($request))
            ->whereHas('products', fn (Builder $q) => $q->where('is_public', true)->where('status', 'active'))
            ->orderBy('name')
            ->get(['id', 'name']);
    }

    public function storeQuoteRequest(StorePublicQuoteRequest $request, AuditService $audit)
    {
        $companyId = $this->companyId($request);
        $data = $request->validated();

        $productsById = Product::query()
            ->where('company_id', $companyId)
            ->whereIn('id', collect($data['items'])->pluck('product_id'))
            ->get()
            ->keyBy('id');

        // Todos los productos deben seguir disponibles antes de crear nada (uno
        // pudo borrarse entre la validacion `exists` y aca): 422 controlado.
        foreach ($data['items'] as $item) {
            abort_unless($productsById->has($item['product_id']), 422, 'Un producto de la solicitud ya no esta disponible.');
        }

        // Cliente: get-or-create FUERA de la transaccion de la cotizacion.
        //  - AUD-04: un contacto nuevo del catalogo entra como `inactive`
        //    (prospecto); no cuenta como cliente activo hasta que el equipo le da
        //    seguimiento. Si el correo ya es de un cliente, firstOrCreate lo
        //    devuelve sin tocar su estado ni sus datos.
        //  - Concurrencia: dos envios casi simultaneos con el mismo correo -> el
        //    perdedor del unique(company_id, email) recupera la fila via el
        //    createOrFirst interno de firstOrCreate (Laravel 12). Tiene que
        //    correr fuera de la transaccion: dentro, esa relectura quedaria
        //    atrapada en el snapshot REPEATABLE READ de MySQL/MariaDB y lanzaria.
        $client = Client::firstOrCreate(
            ['company_id' => $companyId, 'email' => $data['email']],
            [
                'name' => $data['name'],
                'company_name' => $data['company_name'] ?? null,
                'phone' => $data['phone'] ?? null,
                'status' => 'inactive',
            ],
        );

        $quote = DB::transaction(function () use ($data, $companyId, $client, $productsById) {
            $noteLines = array_filter([
                $data['message'] ?? null,
                'Solicitud desde el catalogo publico.',
                'Contacto: '.$data['name'].($data['phone'] ?? null ? ' · Tel: '.$data['phone'] : ''),
                ($data['company_name'] ?? null) ? 'Empresa: '.$data['company_name'] : null,
            ]);

            $quote = Quote::create([
                'company_id' => $companyId,
                'client_id' => $client->id,
                'title' => 'Solicitud web — '.$data['name'],
                'status' => 'draft',
                'source' => 'catalog',
                'notes' => implode("\n", $noteLines),
                'total' => 0,
            ]);

            $total = 0;
            foreach ($data['items'] as $item) {
                $product = $productsById->get($item['product_id']); // disponibilidad ya verificada arriba
                $quote->items()->create([
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'sku' => $product->sku,
                    'quantity' => $item['quantity'],
                    'unit_price' => $product->unit_price,
                ]);
                $total += $item['quantity'] * (float) $product->unit_price;
            }
            $quote->update(['total' => $total]);

            return $quote;
        });

        $audit->record('created', $quote, $request);

        return response()->json([
            'message' => 'Recibimos tu solicitud de cotizacion. Te contactaremos pronto.',
        ], 201);
    }

    /** Query base de todo lo publico: tenant + is_public + activo. */
    private function publicProducts(Request $request): Builder
    {
        return Product::query()
            ->where('company_id', $this->companyId($request))
            ->where('is_public', true)
            ->where('status', 'active');
    }
}
