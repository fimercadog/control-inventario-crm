import { z } from "zod";
import { OWNER_STATUSES } from "@/types/owner";

function emptyToUndefined(val: unknown) {
  return val === "" ? undefined : val;
}

export const ownerFormSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio").max(255),
  document: z.string().max(50).optional(),
  phone: z.string().max(50).optional(),
  whatsapp: z.string().max(50).optional(),
  email: z.preprocess(emptyToUndefined, z.string().email("Correo inválido").max(255).optional()),
  address: z.string().max(255).optional(),
  notes: z.string().optional(),
  status: z.enum(OWNER_STATUSES, { message: "Selecciona un estado" }),
});

export type OwnerFormSchema = z.infer<typeof ownerFormSchema>;
export type OwnerFormInput = z.input<typeof ownerFormSchema>;
export type OwnerFormOutput = z.output<typeof ownerFormSchema>;
