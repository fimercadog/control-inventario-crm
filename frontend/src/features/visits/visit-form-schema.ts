import { z } from "zod";
import { VISIT_STATUSES } from "@/types/visit";

function emptyToUndefined(val: unknown) {
  return val === "" ? undefined : val;
}

const requiredId = z.preprocess(emptyToUndefined, z.coerce.number({ message: "Este campo es obligatorio" }));

export const visitFormSchema = z.object({
  property_id: requiredId,
  client_id: requiredId,
  // The <input type="datetime-local"> value is a timezone-naive wall-clock string
  // (e.g. "2026-08-25T14:30"). Interpreted bare, Laravel's UTC app timezone would
  // silently treat it as UTC instead of the browser's local time, shifting the
  // stored instant. new Date(naiveString) parses it as local time per spec, so
  // .toISOString() converts it to an unambiguous absolute instant before it's sent.
  scheduled_at: z
    .string()
    .min(1, "La fecha y hora son obligatorias")
    .transform((val) => new Date(val).toISOString()),
  status: z.enum(VISIT_STATUSES, { message: "Selecciona un estado" }),
  notes: z.string().optional(),
  result: z.string().optional(),
  follow_up: z.string().optional(),
});

export type VisitFormSchema = z.infer<typeof visitFormSchema>;
export type VisitFormInput = z.input<typeof visitFormSchema>;
export type VisitFormOutput = z.output<typeof visitFormSchema>;
