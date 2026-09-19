import { api } from "@/lib/api/axios";
import type { ApiSuccessResponse } from "@/types/api";
import type { ContingencyModuleDefinition, ContingencySessionInfo, ContingencyStatus } from "@/types/contingency";

export async function fetchContingencyStatus(): Promise<ContingencyStatus> {
  const response = await api.get<ApiSuccessResponse<ContingencyStatus>>("/contingency/status");
  return response.data.data;
}

export async function fetchEligibleModules(): Promise<ContingencyModuleDefinition[]> {
  const response = await api.get<ApiSuccessResponse<ContingencyModuleDefinition[]>>("/contingency/modules");
  return response.data.data;
}

export async function activateContingency(enabledModules: string[]): Promise<ContingencySessionInfo> {
  const response = await api.post<ApiSuccessResponse<ContingencySessionInfo>>("/contingency/activate", {
    enabled_modules: enabledModules,
  });
  return response.data.data;
}

export async function deactivateContingency(): Promise<void> {
  await api.post("/contingency/deactivate");
}
