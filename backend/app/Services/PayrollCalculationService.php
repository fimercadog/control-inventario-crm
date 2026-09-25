<?php

namespace App\Services;

use App\Models\Employee;
use App\Models\Payroll;
use App\Models\PayrollDetail;
use Illuminate\Support\Facades\DB;

class PayrollCalculationService
{
    // Constantes de Nómina Colombia 2026 (Parametrizables / Reglas Documentadas)
    public const SMLV_2026 = 1423500.00; // Salario Mínimo Legal Vigente aproximado
    public const AUX_TRANSPORTE_2026 = 162000.00; // Auxilio de transporte mensual
    public const PORCENTAJE_SALUD_EMPLEADO = 0.04; // 4.0% Salud Empleado
    public const PORCENTAJE_PENSION_EMPLEADO = 0.04; // 4.0% Pensión Empleado

    public function calculate(Payroll $payroll, array $employeeIds = [], array $customAdjustments = []): Payroll
    {
        if (in_array($payroll->status, ['APROBADA', 'PAGADA', 'CERRADA'])) {
            throw new \InvalidArgumentException('No se puede calcular una nómina aprobada, pagada o cerrada.');
        }

        return DB::transaction(function () use ($payroll, $employeeIds, $customAdjustments) {
            $query = Employee::where('company_id', $payroll->company_id)
                ->where('employment_status', 'activo');

            if (!empty($employeeIds)) {
                $query->whereIn('id', $employeeIds);
            }

            $employees = $query->get();

            // Purga detalles previos si es un re-cálculo en estado BORRADOR o CALCULADA
            $payroll->details()->delete();

            $totalPayrollAccrued = 0;
            $totalPayrollDeductions = 0;
            $totalPayrollNet = 0;

            foreach ($employees as $emp) {
                $adjustments = $customAdjustments[$emp->id] ?? [];
                $workedDays = $adjustments['worked_days'] ?? 30;
                $baseSalary = (float) ($emp->salary ?? self::SMLV_2026);

                // Proporcional de sueldo básico según días laborados (base 30 días)
                $earnedSalary = round(($baseSalary / 30) * $workedDays, 2);

                // Auxilio de Transporte (Regla Legal: Sueldo base <= 2 SMLV y trabaja días reales)
                $transportSubsidy = 0;
                if ($baseSalary <= (self::SMLV_2026 * 2)) {
                    $transportSubsidy = round((self::AUX_TRANSPORTE_2026 / 30) * $workedDays, 2);
                }

                $overtime = round((float) ($adjustments['overtime'] ?? 0), 2);
                $bonuses = round((float) ($adjustments['bonuses'] ?? 0), 2);

                // Total Devengado
                $totalAccrued = round($earnedSalary + $transportSubsidy + $overtime + $bonuses, 2);

                // Base Cotizable para Salud y Pensión (Total Devengado sin Auxilio de Transporte)
                $ibc = $earnedSalary + $overtime + $bonuses;

                // Deducciones de Ley
                $healthDeduction = round($ibc * self::PORCENTAJE_SALUD_EMPLEADO, 2);
                $pensionDeduction = round($ibc * self::PORCENTAJE_PENSION_EMPLEADO, 2);
                $otherDeductions = round((float) ($adjustments['other_deductions'] ?? 0), 2);

                $totalDeductions = round($healthDeduction + $pensionDeduction + $otherDeductions, 2);
                $netPayable = round($totalAccrued - $totalDeductions, 2);

                // Desglose detallado de conceptos en JSON
                $conceptsJson = [
                    'accrued' => [
                        ['code' => 'SAL_BASICO', 'name' => 'Sueldo Básico Laborado', 'amount' => $earnedSalary, 'days' => $workedDays],
                        ['code' => 'AUX_TRANS', 'name' => 'Auxilio de Transporte', 'amount' => $transportSubsidy],
                        ['code' => 'HORAS_EXTRAS', 'name' => 'Horas Extras y Recargos', 'amount' => $overtime],
                        ['code' => 'BONIF', 'name' => 'Bonificaciones / Comisiones', 'amount' => $bonuses],
                    ],
                    'deductions' => [
                        ['code' => 'SALUD', 'name' => 'Aporte Salud Empleado (4%)', 'amount' => $healthDeduction],
                        ['code' => 'PENSION', 'name' => 'Aporte Pensión Empleado (4%)', 'amount' => $pensionDeduction],
                        ['code' => 'OTRAS_DED', 'name' => 'Préstamos / Otras Deducciones', 'amount' => $otherDeductions],
                    ],
                ];

                PayrollDetail::create([
                    'payroll_id' => $payroll->id,
                    'employee_id' => $emp->id,
                    'base_salary' => $baseSalary,
                    'worked_days' => $workedDays,
                    'transport_subsidy' => $transportSubsidy,
                    'overtime_amount' => $overtime,
                    'bonuses_amount' => $bonuses,
                    'total_accrued' => $totalAccrued,
                    'health_deduction' => $healthDeduction,
                    'pension_deduction' => $pensionDeduction,
                    'other_deductions' => $otherDeductions,
                    'total_deductions' => $totalDeductions,
                    'net_payable' => $netPayable,
                    'concepts_json' => $conceptsJson,
                    'status' => 'calculado',
                ]);

                $totalPayrollAccrued += $totalAccrued;
                $totalPayrollDeductions += $totalDeductions;
                $totalPayrollNet += $netPayable;
            }

            $payroll->update([
                'status' => 'CALCULADA',
                'total_accrued' => round($totalPayrollAccrued, 2),
                'total_deductions' => round($totalPayrollDeductions, 2),
                'total_net' => round($totalPayrollNet, 2),
                'calculated_at' => now(),
            ]);

            return $payroll->fresh(['details.employee']);
        });
    }
}
