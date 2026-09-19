import { z } from "zod";
import { OPPORTUNITY_STAGES } from "@/types/opportunity";

function emptyToUndefined(val: unknown) {
  return val === "" ? undefined : val;
}

const optionalNumber = z.preprocess(emptyToUndefined, z.coerce.number().min(0).optional());
const requiredNumber = z.preprocess(emptyToUndefined, z.coerce.number({ message: "Selecciona un cliente" }));

export const opportunityFormSchema = z.object({
  client_id: requiredNumber,
  property_id: optionalNumber,
  owner_id: optionalNumber,
  value: optionalNumber,
  stage: z.enum(OPPORTUNITY_STAGES, { message: "Selecciona una etapa" }),
  probability: z.preprocess(emptyToUndefined, z.coerce.number().min(0).max(100).optional()),
  next_action: z.string().max(255).optional(),
  estimated_close_date: z.string().optional(),
  notes: z.string().optional(),
});

export type OpportunityFormSchema = z.infer<typeof opportunityFormSchema>;
export type OpportunityFormInput = z.input<typeof opportunityFormSchema>;
export type OpportunityFormOutput = z.output<typeof opportunityFormSchema>;
