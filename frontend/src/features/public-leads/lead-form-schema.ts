import { z } from "zod";

function emptyToUndefined(val: unknown) {
  return val === "" ? undefined : val;
}

export const leadFormSchema = z
  .object({
    name: z.string().min(1, "Tu nombre es obligatorio").max(255),
    email: z.preprocess(emptyToUndefined, z.string().email("Correo inválido").optional()),
    phone: z.preprocess(emptyToUndefined, z.string().max(50).optional()),
    message: z.preprocess(emptyToUndefined, z.string().max(2000).optional()),
  })
  .refine((data) => Boolean(data.email) || Boolean(data.phone), {
    message: "Indica al menos un correo o un teléfono de contacto",
    path: ["email"],
  });

export type LeadFormInput = z.input<typeof leadFormSchema>;
export type LeadFormOutput = z.output<typeof leadFormSchema>;
