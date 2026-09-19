import { z } from "zod";
import { LISTING_TYPES, PROPERTY_STATUSES, PROPERTY_TYPES } from "@/types/property";

// z.coerce.number() coerces "" to 0 (Number("") === 0) before an .or() fallback
// ever runs, so blank optional fields must be normalized to undefined first.
function emptyToUndefined(val: unknown) {
  return val === "" ? undefined : val;
}

const optionalNumber = z.preprocess(emptyToUndefined, z.coerce.number().min(0).optional());
const optionalStratum = z.preprocess(emptyToUndefined, z.coerce.number().min(1).max(6).optional());
// Mirrors StorePropertyRequest's 'min:1900, max:'.(date('Y') + 1) — a year
// far outside a plausible construction date is rejected client-side too.
const optionalYearBuilt = z.preprocess(
  emptyToUndefined,
  z.coerce.number().min(1900).max(new Date().getFullYear() + 1).optional(),
);

export const propertyFormSchema = z
  .object({
    title: z.string().min(1, "El título es obligatorio").max(255),
    description: z.string().optional(),
    property_type: z.enum(PROPERTY_TYPES, { message: "Selecciona un tipo de inmueble" }),
    listing_type: z.enum(LISTING_TYPES, { message: "Selecciona venta o arriendo" }),
    status: z.enum(PROPERTY_STATUSES, { message: "Selecciona un estado" }),
    owner_id: optionalNumber,
    city: z.string().min(1, "La ciudad es obligatoria").max(255),
    zone: z.string().max(255).optional(),
    address: z.string().max(255).optional(),
    price: z.coerce.number().min(0, "El precio debe ser mayor o igual a 0"),
    admin_fee: optionalNumber,
    stratum: optionalStratum,
    bedrooms: optionalNumber,
    bathrooms: optionalNumber,
    parking_spots: optionalNumber,
    built_area: optionalNumber,
    private_area: optionalNumber,
    year_built: optionalYearBuilt,
    notes: z.string().optional(),
    is_featured: z.boolean().optional(),
    is_published: z.boolean().optional(),
  })
  .transform(({ is_published, ...rest }) => ({
    ...rest,
    published_at: is_published ? new Date().toISOString() : null,
  }));

export type PropertyFormSchema = z.infer<typeof propertyFormSchema>;
export type PropertyFormInput = z.input<typeof propertyFormSchema>;
export type PropertyFormOutput = z.output<typeof propertyFormSchema>;
