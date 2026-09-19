import { z } from "zod";
import { INTEREST_TYPES } from "@/types/client";
import { PROPERTY_TYPES } from "@/types/property";

// z.coerce.number() coerces "" to 0 before an .or() fallback ever runs, so
// blank optional fields must be normalized to undefined first.
function emptyToUndefined(val: unknown) {
  return val === "" ? undefined : val;
}

const optionalNumber = z.preprocess(emptyToUndefined, z.coerce.number().min(0).optional());
const optionalEmail = z.preprocess(emptyToUndefined, z.string().email("Correo inválido").max(255).optional());
const optionalEnum = <T extends readonly [string, ...string[]]>(values: T) =>
  z.preprocess(emptyToUndefined, z.enum(values).optional());

export const clientFormSchema = z
  .object({
    name: z.string().min(1, "El nombre es obligatorio").max(255),
    document: z.string().max(50).optional(),
    phone: z.string().max(50).optional(),
    whatsapp: z.string().max(50).optional(),
    email: optionalEmail,
    interest_type: optionalEnum(INTEREST_TYPES),
    budget_min: optionalNumber,
    budget_max: optionalNumber,
    interest_zones: z.preprocess(
      emptyToUndefined,
      z
        .string()
        .optional()
        .transform((val) => (val ? val.split(",").map((zone) => zone.trim()).filter(Boolean) : undefined))
        .refine((zones) => !zones || zones.every((zone) => zone.length <= 100), {
          message: "Cada zona debe tener máximo 100 caracteres",
        }),
    ),
    property_type_interest: optionalEnum(PROPERTY_TYPES),
    bedrooms_needed: optionalNumber,
    notes: z.string().optional(),
    status: z.enum(["activo", "inactivo"], { message: "Selecciona un estado" }),
  })
  .refine((data) => data.budget_min === undefined || data.budget_max === undefined || data.budget_max >= data.budget_min, {
    message: "El presupuesto máximo debe ser mayor o igual al mínimo",
    path: ["budget_max"],
  });

export type ClientFormSchema = z.infer<typeof clientFormSchema>;
export type ClientFormInput = z.input<typeof clientFormSchema>;
export type ClientFormOutput = z.output<typeof clientFormSchema>;
