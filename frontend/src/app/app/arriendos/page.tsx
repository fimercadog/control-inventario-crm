"use client";

import { useState } from "react";
import { Building2, DollarSign, Eye, FileText, Handshake, Plus } from "lucide-react";
import { CrudField } from "@/components/crud/crud-modal";
import { ModuleTablePage } from "@/components/module-table-page";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { StatusBadge } from "@/components/ui/status-badge";
import { api } from "@/lib/api";
import { AppColumnDef } from "@/lib/table-types";

interface PropertyLease {
  id: number;
  contract_number: string;
  monthly_rent: number;
  deposit_amount: number;
  start_date: string;
  end_date: string;
  payment_day: number;
  status: "ACTIVO" | "PENDIENTE" | "FINALIZADO" | "CANCELADO";
  notes?: string;
  property?: {
    id: number;
    title: string;
    code: string;
    city: string;
  };
  tenant?: {
    id: number;
    name: string;
    email: string;
    phone: string;
  };
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(amount || 0);

const columns: AppColumnDef<PropertyLease>[] = [
  { accessorKey: "contract_number", header: "N° Contrato" },
  {
    header: "Inmueble",
    cell: ({ row }) => (
      <div>
        <div className="font-semibold text-xs">{row.original.property?.title ?? "Inmueble N/A"}</div>
        <div className="text-[10px] text-muted-foreground">{row.original.property?.city} ({row.original.property?.code})</div>
      </div>
    ),
  },
  {
    header: "Arrendatario",
    cell: ({ row }) => (
      <div>
        <div className="font-medium text-xs">{row.original.tenant?.name ?? "Cliente N/A"}</div>
        <div className="text-[10px] text-muted-foreground">{row.original.tenant?.phone}</div>
      </div>
    ),
  },
  {
    header: "Canon Mensual",
    cell: ({ row }) => <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(row.original.monthly_rent)}</span>,
  },
  {
    header: "Día Pago",
    cell: ({ row }) => <span className="font-mono text-xs">Día {row.original.payment_day} de c/mes</span>,
  },
  {
    header: "Vigencia",
    cell: ({ row }) => (
      <span className="text-xs font-mono">
        {row.original.start_date} al {row.original.end_date}
      </span>
    ),
  },
  {
    header: "Estado",
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
];

const fields: CrudField[] = [
  { name: "property_id", label: "ID Inmueble", type: "number", required: true, hint: "ID de la propiedad a arrendar" },
  { name: "client_id", label: "ID Cliente (Arrendatario)", type: "number", required: true, hint: "ID del cliente que arrienda" },
  { name: "monthly_rent", label: "Canon de Arrendamiento Mensual ($)", type: "number", required: true, min: 0 },
  { name: "deposit_amount", label: "Depósito / Garantía ($)", type: "number", min: 0 },
  { name: "start_date", label: "Fecha Inicio Contrato", type: "date", required: true },
  { name: "end_date", label: "Fecha Fin Contrato", type: "date", required: true },
  { name: "payment_day", label: "Día Límite de Pago Mensual", type: "number", min: 1, max: 31, hint: "Ej. 5 para cobrar cada día 5" },
  { name: "notes", label: "Observaciones / Cláusulas", hint: "Notas sobre la póliza o condiciones" },
];

export default function ArriendosPage() {
  const [selectedLease, setSelectedLease] = useState<PropertyLease | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [collectOpen, setCollectOpen] = useState(false);
  const [rentAmount, setRentAmount] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<string>("cash");
  const [loading, setLoading] = useState(false);

  const handleCollectRentSubmit = async (refresh: () => void) => {
    if (!selectedLease) return;
    try {
      setLoading(true);
      await api.post(`/property-leases/${selectedLease.id}/collect-rent`, {
        amount: parseFloat(rentAmount) || selectedLease.monthly_rent,
        payment_method: paymentMethod,
      });
      alert(`Canon recaudado e ingresado a la caja ERP exitosamente`);
      setCollectOpen(false);
      refresh();
    } catch (err: any) {
      alert(err.response?.data?.message || "Error al registrar recaudo de canon");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ModuleTablePage
        title="Contratos de Arrendamiento"
        description="Gestión integral de inmuebles arrendados, vencimientos y recaudo de cánones integrados al ERP."
        resource="/property-leases"
        exportResource="property-leases"
        columns={columns}
        fields={fields}
        actionLabel="Nuevo Contrato Arriendo"
        modalDescription="Registra un nuevo contrato de arrendamiento vinculando el inmueble y el arrendatario."
        extraRowActions={(row, refresh) => (
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="ghost"
              className="h-8 px-2"
              onClick={() => {
                setSelectedLease(row);
                setDetailsOpen(true);
              }}
            >
              <Eye className="mr-1 h-3.5 w-3.5" /> Ver
            </Button>

            {row.status === "ACTIVO" && (
              <Button
                size="sm"
                variant="default"
                className="h-8 bg-emerald-600 hover:bg-emerald-700"
                onClick={() => {
                  setSelectedLease(row);
                  setRentAmount(row.monthly_rent.toString());
                  setCollectOpen(true);
                }}
              >
                <DollarSign className="mr-1 h-3.5 w-3.5" /> Recaudar Canon
              </Button>
            )}
          </div>
        )}
      />

      {/* Diálogo de Recaudo ERP */}
      <Dialog open={collectOpen} onOpenChange={setCollectOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-bold">
              <DollarSign className="h-5 w-5 text-emerald-600" />
              Recaudar Canon de Arrendamiento
            </DialogTitle>
          </DialogHeader>

          {selectedLease && (
            <div className="space-y-4 text-sm">
              <div className="p-3 bg-muted/40 rounded-lg border">
                <div className="font-semibold">{selectedLease.property?.title}</div>
                <div className="text-xs text-muted-foreground">Contrato {selectedLease.contract_number} • Arrendatario: {selectedLease.tenant?.name}</div>
              </div>

              <div>
                <label className="text-xs font-semibold block mb-1">Monto a Recaudar ($)</label>
                <input
                  type="number"
                  className="w-full h-9 px-3 rounded-md border text-sm font-mono"
                  value={rentAmount}
                  onChange={(e) => setRentAmount(e.target.value)}
                />
              </div>

              <div>
                <label className="text-xs font-semibold block mb-1">Método de Pago ERP</label>
                <select
                  className="w-full h-9 px-3 rounded-md border text-sm"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  <option value="cash">Efectivo / Caja Principal</option>
                  <option value="transfer">Transferencia Bancaria</option>
                  <option value="card">Tarjeta Débito / Crédito</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={() => setCollectOpen(false)}>Cancelar</Button>
                <Button
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700"
                  disabled={loading}
                  onClick={() => handleCollectRentSubmit(() => {})}
                >
                  Confirmar Recaudo & Ingreso ERP
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Diálogo de Detalles */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-bold">
              <FileText className="h-5 w-5 text-indigo-600" />
              Contrato {selectedLease?.contract_number}
            </DialogTitle>
          </DialogHeader>

          {selectedLease && (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-muted/40 border">
                <div>
                  <span className="text-xs text-muted-foreground block">Inmueble</span>
                  <span className="font-semibold">{selectedLease.property?.title}</span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">Arrendatario</span>
                  <span className="font-semibold">{selectedLease.tenant?.name}</span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">Canon Mensual</span>
                  <span className="font-bold text-emerald-600">{formatCurrency(selectedLease.monthly_rent)}</span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">Garantía / Depósito</span>
                  <span className="font-semibold">{formatCurrency(selectedLease.deposit_amount)}</span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">Período Contrato</span>
                  <span className="font-mono text-xs">{selectedLease.start_date} al {selectedLease.end_date}</span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">Estado</span>
                  <StatusBadge status={selectedLease.status} />
                </div>
              </div>

              {selectedLease.notes && (
                <div>
                  <span className="text-xs text-muted-foreground block font-semibold">Notas y Observaciones:</span>
                  <p className="text-xs p-2 rounded bg-muted/20 border">{selectedLease.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
