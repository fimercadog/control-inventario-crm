"use client";

import { useState } from "react";
import { Calculator, CheckCircle2, DollarSign, Eye, Lock, Receipt } from "lucide-react";
import { CrudField } from "@/components/crud/crud-modal";
import { ModuleTablePage } from "@/components/module-table-page";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { StatusBadge } from "@/components/ui/status-badge";
import { api } from "@/lib/api";
import { AppColumnDef } from "@/lib/table-types";

interface PayrollDetail {
  id: number;
  employee_id: number;
  employee?: {
    first_name: string;
    last_name: string;
    employee_code: string;
  };
  base_salary: number;
  worked_days: number;
  transport_subsidy: number;
  total_accrued: number;
  health_deduction: number;
  pension_deduction: number;
  total_deductions: number;
  net_payable: number;
  status: string;
}

interface Payroll {
  id: number;
  payroll_code: string;
  period_start: string;
  period_end: string;
  payroll_type: string;
  status: "BORRADOR" | "CALCULADA" | "APROBADA" | "PAGADA" | "CERRADA";
  total_accrued: number;
  total_deductions: number;
  total_net: number;
  notes?: string;
  details?: PayrollDetail[];
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(amount || 0);

const columns: AppColumnDef<Payroll>[] = [
  { accessorKey: "payroll_code", header: "Código Período" },
  {
    header: "Período",
    cell: ({ row }) => (
      <span className="text-xs font-mono">
        {row.original.period_start} al {row.original.period_end}
      </span>
    ),
  },
  { accessorKey: "payroll_type", header: "Frecuencia" },
  {
    header: "Devengado",
    cell: ({ row }) => <span className="font-mono text-emerald-600 dark:text-emerald-400">{formatCurrency(row.original.total_accrued)}</span>,
  },
  {
    header: "Deducciones",
    cell: ({ row }) => <span className="font-mono text-rose-600 dark:text-rose-400">{formatCurrency(row.original.total_deductions)}</span>,
  },
  {
    header: "Neto a Pagar",
    cell: ({ row }) => <span className="font-mono font-bold">{formatCurrency(row.original.total_net)}</span>,
  },
  {
    header: "Estado ERP",
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
];

const fields: CrudField[] = [
  { name: "period_start", label: "Fecha Inicio Período", type: "date", required: true },
  { name: "period_end", label: "Fecha Fin Período", type: "date", required: true },
  {
    name: "payroll_type",
    label: "Tipo de Nómina",
    type: "select",
    required: true,
    options: [
      { label: "Mensual", value: "mensual" },
      { label: "Quincenal", value: "quincenal" },
    ],
  },
  { name: "notes", label: "Notas / Observaciones", hint: "Ej. Nómina ordinaria de fin de mes" },
];

export default function NominaPage() {
  const [selectedPayroll, setSelectedPayroll] = useState<Payroll | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);

  const handleAction = async (id: number, endpoint: string, refresh: () => void) => {
    try {
      setLoadingAction(true);
      await api.post(`/payrolls/${id}/${endpoint}`);
      refresh();
    } catch (err: any) {
      alert(err.response?.data?.message || `Error al procesar ${endpoint}`);
    } finally {
      setLoadingAction(false);
    }
  };

  const handleViewDetails = async (id: number) => {
    try {
      const res = await api.get<{ data: Payroll }>(`/payrolls/${id}`);
      setSelectedPayroll(res.data.data);
      setDetailsDialogOpen(true);
    } catch (err: any) {
      alert("Error al cargar desprendibles de nómina");
    }
  };

  return (
    <>
      <ModuleTablePage
        title="Nómina Transaccional ERP"
        description="Gestión completa de nómina colombiana integrada con Cuentas por Pagar (CXP) y Egresos de Caja ERP."
        resource="/payrolls"
        exportResource="payrolls"
        columns={columns}
        fields={fields}
        actionLabel="Nuevo Período de Nómina"
        modalDescription="Abre un nuevo período de liquidación laboral."
        extraRowActions={(row, refresh) => (
          <div className="flex items-center gap-1">
            <Button size="sm" variant="ghost" className="h-8 px-2" onClick={() => handleViewDetails(row.id)}>
              <Eye className="mr-1 h-3.5 w-3.5" /> Ver
            </Button>

            {row.status === "BORRADOR" && (
              <Button
                size="sm"
                variant="outline"
                className="h-8 border-indigo-500/30 text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400"
                disabled={loadingAction}
                onClick={() => handleAction(row.id, "calculate", refresh)}
              >
                <Calculator className="mr-1 h-3.5 w-3.5" /> Calcular
              </Button>
            )}

            {row.status === "CALCULADA" && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 border-indigo-500/30 text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400"
                  disabled={loadingAction}
                  onClick={() => handleAction(row.id, "calculate", refresh)}
                >
                  <Calculator className="mr-1 h-3.5 w-3.5" /> Recalcular
                </Button>
                <Button
                  size="sm"
                  variant="default"
                  className="h-8 bg-blue-600 hover:bg-blue-700"
                  disabled={loadingAction}
                  onClick={() => handleAction(row.id, "approve", refresh)}
                >
                  <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Aprobar & CXP
                </Button>
              </>
            )}

            {row.status === "APROBADA" && (
              <Button
                size="sm"
                variant="default"
                className="h-8 bg-emerald-600 hover:bg-emerald-700"
                disabled={loadingAction}
                onClick={() => handleAction(row.id, "pay", refresh)}
              >
                <DollarSign className="mr-1 h-3.5 w-3.5" /> Liquidar / Pagar
              </Button>
            )}

            {row.status === "PAGADA" && (
              <Button
                size="sm"
                variant="outline"
                className="h-8 border-slate-500/30 text-slate-600 hover:bg-slate-50 dark:text-slate-400"
                disabled={loadingAction}
                onClick={() => handleAction(row.id, "close", refresh)}
              >
                <Lock className="mr-1 h-3.5 w-3.5" /> Cerrar Período
              </Button>
            )}
          </div>
        )}
      />

      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-bold">
              <Receipt className="h-5 w-5 text-indigo-600" />
              Detalle de Nómina {selectedPayroll?.payroll_code}
            </DialogTitle>
          </DialogHeader>

          {selectedPayroll && (
            <div className="space-y-6 text-sm">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-lg bg-muted/40 border">
                <div>
                  <span className="text-xs text-muted-foreground block">Período</span>
                  <span className="font-semibold">{selectedPayroll.period_start} al {selectedPayroll.period_end}</span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">Estado</span>
                  <StatusBadge status={selectedPayroll.status} />
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">Total Devengado</span>
                  <span className="font-semibold text-emerald-600">{formatCurrency(selectedPayroll.total_accrued)}</span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">Total Neto Pagar</span>
                  <span className="font-bold text-indigo-600">{formatCurrency(selectedPayroll.total_net)}</span>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3 text-base">Desprendibles por Empleado ({selectedPayroll.details?.length || 0})</h4>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-muted/70 border-b font-medium text-muted-foreground">
                        <th className="p-3">Empleado</th>
                        <th className="p-3">Sueldo Base</th>
                        <th className="p-3">Aux. Transporte</th>
                        <th className="p-3">Total Devengado</th>
                        <th className="p-3">Deducciones (Salud/Pensión)</th>
                        <th className="p-3 font-bold">Neto a Pagar</th>
                        <th className="p-3">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {selectedPayroll.details && selectedPayroll.details.length > 0 ? (
                        selectedPayroll.details.map((d) => (
                          <tr key={d.id} className="hover:bg-muted/20">
                            <td className="p-3 font-medium">
                              {d.employee ? `${d.employee.first_name} ${d.employee.last_name}` : `Empleado #${d.employee_id}`}
                            </td>
                            <td className="p-3 font-mono">{formatCurrency(d.base_salary)}</td>
                            <td className="p-3 font-mono">{formatCurrency(d.transport_subsidy)}</td>
                            <td className="p-3 font-mono text-emerald-600">{formatCurrency(d.total_accrued)}</td>
                            <td className="p-3 font-mono text-rose-600">{formatCurrency(d.total_deductions)}</td>
                            <td className="p-3 font-mono font-bold text-indigo-600">{formatCurrency(d.net_payable)}</td>
                            <td className="p-3"><StatusBadge status={d.status} /></td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={7} className="p-6 text-center text-muted-foreground">
                            No se han calculado empleados aún en este período. Presione &quot;Calcular&quot; en la tabla.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
