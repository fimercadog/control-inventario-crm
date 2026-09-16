<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\InvoiceResource;
use App\Models\Client;
use App\Models\Invoice;
use App\Models\Order;
use App\Services\AuditService;
use App\Services\InvoiceService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Response;
use Illuminate\Validation\Rule;

class InvoiceController extends BaseCrudController
{
    protected string $model = Invoice::class;

    protected string $resource = InvoiceResource::class;

    protected array $with = ['client', 'warehouse', 'items', 'receivable'];

    protected array $searchable = ['number', 'notes'];

    protected array $filterable = ['status' => 'status', 'client_id' => 'client_id'];

    public function update(Request $request, string $id, AuditService $audit)
    {
        $invoice = Invoice::query()->where('company_id', $this->companyId($request))->findOrFail($id);
        abort_unless($invoice->status === 'draft', 422, 'Solo se puede editar una factura en borrador.');

        return parent::update($request, $id, $audit);
    }

    public function destroy(Request $request, string $id, AuditService $audit)
    {
        $invoice = Invoice::query()->where('company_id', $this->companyId($request))->findOrFail($id);
        abort_unless($invoice->status === 'draft', 422, 'Solo se puede eliminar una factura en borrador.');

        return parent::destroy($request, $id, $audit);
    }

    public function store(Request $request, AuditService $audit)
    {
        $service = app(InvoiceService::class);
        $companyId = $this->companyId($request);
        $data = $request->validate([
            'client_id' => ['required', Rule::exists('clients', 'id')->where('company_id', $companyId)],
            'order_id' => ['nullable', Rule::exists('orders', 'id')->where('company_id', $companyId)],
            'warehouse_id' => ['nullable', Rule::exists('warehouses', 'id')->where('company_id', $companyId)],
            'number' => ['nullable', 'string', 'max:50'],
            'issue_date' => ['nullable', 'date'],
            'due_date' => ['nullable', 'date'],
            'notes' => ['nullable', 'string'],
            'idempotency_key' => ['nullable', 'string', 'max:255'],
            'items' => ['required_without:order_id', 'array'],
            'items.*.product_id' => ['nullable', Rule::exists('products', 'id')->where('company_id', $companyId)],
            'items.*.product_name' => ['nullable', 'string', 'max:255'],
            'items.*.quantity' => ['required_with:items', 'integer', 'min:1'],
            'items.*.unit_price' => ['nullable', 'numeric', 'min:0'],
            'items.*.discount' => ['nullable', 'numeric', 'min:0'],
            'items.*.tax' => ['nullable', 'numeric', 'min:0'],
        ]);

        if (! empty($data['order_id'])) {
            $order = Order::query()->where('company_id', $companyId)->with('items.product')->findOrFail($data['order_id']);
            $data['client_id'] = $order->client_id;
            $data['warehouse_id'] ??= $order->warehouse_id;
            $data['items'] = $order->items->map(fn ($item) => [
                'product_id' => $item->product_id,
                'product_name' => $item->product_name,
                'quantity' => $item->quantity,
                'unit_price' => $item->unit_price,
            ])->all();
        }

        abort_if(! Client::where('company_id', $companyId)->whereKey($data['client_id'])->exists(), 404);
        $invoice = $service->createDraft($data, $companyId, $request->user()->id);
        $audit->record('invoice.created', $invoice, $request);

        return (new InvoiceResource($invoice->load($this->with)))->response()->setStatusCode(201);
    }

    public function issue(Request $request, Invoice $invoice, AuditService $audit, InvoiceService $service)
    {
        abort_unless($invoice->company_id === $this->companyId($request), 404);
        $invoice = $service->issue($invoice, $request->user()->id);
        $audit->record('invoice.issued', $invoice, $request);

        return new InvoiceResource($invoice->load($this->with));
    }

    public function void(Request $request, Invoice $invoice, AuditService $audit)
    {
        abort_unless($invoice->company_id === $this->companyId($request), 404);
        abort_unless($invoice->status === 'draft', 422, 'Solo se puede anular una factura en borrador.');
        $invoice->update(['status' => 'void']);
        $audit->record('invoice.voided', $invoice, $request);

        return new InvoiceResource($invoice->load($this->with));
    }

    public function print(Request $request, Invoice $invoice)
    {
        abort_unless($invoice->company_id === $this->companyId($request), 404);
        $invoice->load('client', 'items');
        $lines = $invoice->items->map(fn ($item) => "{$item->quantity} x {$item->product_name}: {$item->line_total}")->implode("\n");
        $body = "FACTURA INTERNA / ADMINISTRATIVA\nNo es factura electronica DIAN\n\nFactura: {$invoice->number}\nCliente: {$invoice->client?->name}\nTotal: {$invoice->total}\n\n{$lines}\n";

        return Response::make($body, 200, ['Content-Type' => 'text/plain; charset=UTF-8']);
    }
}
