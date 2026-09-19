import { z } from "zod";
import { LISTING_TYPES, PROPERTY_TYPES } from "@/types/property";

function emptyToUndefined(val: unknown) {
  return val === "" ? undefined : val;
}

export const ownerLeadFormSchema = z
  .object({
    name: z.string().min(1, "Tu nombre es obligatorio").max(255),
    email: z.preprocess(emptyToUndefined, z.string().email("Correo inválido").optional()),
    phone: z.preprocess(emptyToUndefined, z.string().max(50).optional()),
    property_type: z.enum(PROPERTY_TYPES, { message: "Selecciona el tipo de inmueble" }),
    listing_type: z.enum(LISTING_TYPES, { message: "Selecciona venta o arriendo" }),
    city: z.string().min(1, "La ciudad es obligatoria").max(100),
    zone: z.preprocess(emptyToUndefined, z.string().max(100).optional()),
    address: z.preprocess(emptyToUndefined, z.string().max(255).optional()),
    estimated_price: z.preprocess(emptyToUndefined, z.coerce.number().min(0).optional()),
    message: z.preprocess(emptyToUndefined, z.string().max(2000).optional()),
  })
  .refine((data) => Boolean(data.email) || Boolean(data.phone), {
    message: "Indica al menos un correo o un teléfono de contacto",
    path: ["email"],
  });

export type OwnerLeadFormInput = z.input<typeof ownerLeadFormSchema>;
export type OwnerLeadFormOutput = z.output<typeof ownerLeadFormSchema>;
