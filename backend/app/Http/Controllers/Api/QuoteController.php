<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\QuoteResource;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Quote;
use App\Models\Warehouse;
use App\Services\AuditService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

/**
 * Cotizacion comercial. Cabecera sobre BaseCrudController; lineas y las
 * transiciones (enviar / responder / convertir a pedido) son propias.
 */
class QuoteController extends BaseCrudController
{
    protected string $model = Quote::class;

    protected string $resource = QuoteResource::class;

    protected array $with = ['client', 'deal', 'items.product'];

    protected array $filterable = ['status' => 'status', 'client_id' => 'client_id'];

    public function update(Request $request, string $id, AuditService $audit)
    {
        $this->guardDraft($request, $id);

        return parent::update($request, $id, $audit);
    }

    public function destroy(Request $request, string $id, AuditService $audit)
    {
        $this->guardDraft($request, $id);

        return parent::destroy($request, $id, $audit);
    }

    public function addItem(Request $request, Quote $quote)
    {
        $this->authorizeQuote($request, $quote);
        abort_unless($quote->status === 'draft', 422, 'Solo se editan lineas de una cotizacion en borrador.');

        $data = $request->validate([
            'product_id' => ['nullable', 'integer', Rule::exists('products', 'id')->where('company_id', $quote->company_id)],
            'description' => ['nullable', 'string', 'max:150'],
            'quantity' => ['required', 'integer', 'min:1'],
            'unit_price' => ['required', 'numeric', 'min:0'],
        ]);

        abort_if(empty($data['product_id']) && empty($data['description']), 422, 'Indica un producto o una descripcion.');

        $product = ! empty($data['product_id']) ? Product::find($data['product_id']) : null;
        $quote->items()->create($data + ['product_name' => $product?->name, 'sku' => $product?->sku]);
        $this->recalculateTotal($quote);

        return new QuoteResource($quote->load($this->with));
    }

    public function removeItem(Request $request, Quote $quote, int $item)
    {
        $this->authorizeQuote($request, $quote);
        abort_unless($quote->status === 'draft', 422, 'Solo se editan lineas de una cotizacion en borrador.');

        $quote->items()->findOrFail($item)->delete();
        $this->recalculateTotal($quote);

        return new QuoteResource($quote->load($this->with));
    }

    public function send(Request $request, Quote $quote, AuditService $audit)
    {
        $this->authorizeQuote($request, $quote);
        abort_unless($quote->status === 'draft', 422, 'La cotizacion ya fue enviada.');
        abort_if($quote->items()->count() === 0, 422, 'La cotizacion no tiene lineas.');

        $quote->update(['status' => 'sent']);
        $audit->record('updated', $quote, $request);

        return new QuoteResource($quote->load($this->with));
    }

    public function respond(Request $request, Quote $quote, AuditService $audit)
    {
        $this->authorizeQuote($request, $quote);
        abort_unless($quote->status === 'sent', 422, 'Solo se responde una cotizacion enviada.');

        $decision = $request->validate(['decision' => ['required', 'in:accepted,rejected']])['decision'];
        $quote->update(['status' => $decision]);
        $audit->record('updated', $quote, $request);

        return new QuoteResource($quote->load($this->with));
    }

    /** Convierte una cotizacion aceptada en un pedido en borrador. */
    public function convert(Request $request, Quote $quote, AuditService $audit)
    {
        $this->authorizeQuote($request, $quote);
        abort_unless($request->user()->can('orders.manage'), 403, 'Necesitas permiso para crear pedidos.');
        abort_unless($quote->status === 'accepted', 422, 'Solo se convierte una cotizacion aceptada.');
        abort_unless($quote->converted_order_id === null, 422, 'Esta cotizacion ya se convirtio en el pedido #'.$quote->converted_order_id.'.');

        $lines = $quote->items()->get();
        abort_if($lines->isEmpty(), 422, 'La cotizacion no tiene lineas para convertir.');
        // order_items.product_id es NOT NULL + RESTRICT: no se puede armar un pedido
        // con una linea cuyo producto fue eliminado. Mejor frenar que generar un
        // pedido con total distinto al de la cotizacion.
        abort_if(
            $lines->contains(fn ($line) => $line->product_id === null),
            422,
            'La cotizacion tiene lineas cuyo producto fue eliminado. Corrige la cotizacion antes de convertirla.'
        );

        $warehouse = Warehouse::where('company_id', $quote->company_id)->orderBy('id')->firstOrFail();
        $ownerId = $request->user()->id;

        $order = DB::transaction(function () use ($quote, $lines, $warehouse, $ownerId) {
            $order = Order::create([
                'company_id' => $quote->company_id,
                'owner_id' => $ownerId,
                'client_id' => $quote->client_id,
                'deal_id' => $quote->deal_id,
                'warehouse_id' => $warehouse->id,
                'status' => 'draft',
                'total' => 0,
            ]);
            $total = 0;
            foreach ($lines as $line) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $line->product_id,
                    'product_name' => $line->product_name,
                    'sku' => $line->sku,
                    'quantity' => $line->quantity,
                    'unit_price' => $line->unit_price,
                ]);
                $total += $line->quantity * (float) $line->unit_price;
            }
            $order->update(['total' => $total]);
            $quote->update(['converted_order_id' => $order->id]);

            return $order;
        });

        $audit->record('created', $order, $request);

        return (new QuoteResource($quote->load($this->with)))
            ->additional(['order_id' => $order->id])
            ->response()
            ->setStatusCode(201);
    }

    private function authorizeQuote(Request $request, Quote $quote): void
    {
        abort_unless($quote->company_id === $this->companyId($request), 404);
    }

    private function guardDraft(Request $request, string $id): void
    {
        $quote = Quote::query()->where('company_id', $this->companyId($request))->findOrFail($id);
        abort_unless($quote->status === 'draft', 422, 'La cotizacion ya no esta en borrador.');
    }

    private function recalculateTotal(Quote $quote): void
    {
        $total = $quote->items()->selectRaw('COALESCE(SUM(quantity * unit_price), 0) as total')->value('total');
        $quote->update(['total' => $total]);
    }
}
