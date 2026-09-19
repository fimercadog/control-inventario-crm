"use client";

import { Controller, useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { useClientOptions } from "@/features/clients/use-client-options";
import { usePropertyOptions } from "@/features/properties/use-property-options";
import {
  opportunityFormSchema,
  type OpportunityFormInput,
  type OpportunityFormOutput,
} from "@/features/opportunities/opportunity-form-schema";
import { OPPORTUNITY_STAGE_LABELS, OPPORTUNITY_STAGES, type Opportunity } from "@/types/opportunity";

interface OpportunityFormProps {
  defaultValues?: Partial<OpportunityFormInput>;
  onSubmit: SubmitHandler<OpportunityFormOutput>;
  submitLabel?: string;
}

export function opportunityToFormValues(opportunity: Opportunity): Partial<OpportunityFormInput> {
  return {
    client_id: opportunity.client_id,
    property_id: opportunity.property_id ?? undefined,
    owner_id: opportunity.owner_id ?? undefined,
    value: opportunity.value ?? undefined,
    stage: opportunity.stage,
    probability: opportunity.probability ?? undefined,
    next_action: opportunity.next_action ?? undefined,
    estimated_close_date: opportunity.estimated_close_date ?? undefined,
    notes: opportunity.notes ?? undefined,
  };
}

export function OpportunityForm({ defaultValues, onSubmit, submitLabel = "Guardar" }: OpportunityFormProps) {
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<OpportunityFormInput, unknown, OpportunityFormOutput>({
    resolver: zodResolver(opportunityFormSchema),
    defaultValues: { stage: "nuevo", ...defaultValues },
  });

  const { options: clientOptions } = useClientOptions();
  const { options: propertyOptions } = usePropertyOptions();

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-6">
      <FieldGroup>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field data-invalid={errors.client_id ? "true" : undefined}>
            <FieldLabel htmlFor="client_id">Cliente</FieldLabel>
            <Controller
              name="client_id"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value ? String(field.value) : ""}
                  onValueChange={(value) => field.onChange(Number(value))}
                >
                  <SelectTrigger id="client_id" className="w-full">
                    <SelectValue placeholder="Selecciona un cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clientOptions.map((client) => (
                      <SelectItem key={client.id} value={String(client.id)}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <FieldError errors={errors.client_id ? [errors.client_id] : undefined} />
          </Field>

          <Field data-invalid={errors.property_id ? "true" : undefined}>
            <FieldLabel htmlFor="property_id">Propiedad</FieldLabel>
            <Controller
              name="property_id"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value ? String(field.value) : ""}
                  onValueChange={(value) => {
                    const propertyId = value ? Number(value) : undefined;
                    field.onChange(propertyId);
                    const property = propertyOptions.find((option) => option.id === propertyId);
                    setValue("owner_id", property?.owner_id ?? undefined);
                  }}
                >
                  <SelectTrigger id="property_id" className="w-full">
                    <SelectValue placeholder="Sin asignar" />
                  </SelectTrigger>
                  <SelectContent>
                    {propertyOptions.map((property) => (
                      <SelectItem key={property.id} value={String(property.id)}>
                        {property.code} — {property.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <FieldError errors={errors.property_id ? [errors.property_id] : undefined} />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Field data-invalid={errors.stage ? "true" : undefined}>
            <FieldLabel htmlFor="stage">Etapa</FieldLabel>
            <Controller
              name="stage"
              control={control}
              render={({ field }) => (
                <Select value={field.value ?? ""} onValueChange={field.onChange}>
                  <SelectTrigger id="stage" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {OPPORTUNITY_STAGES.map((option) => (
                      <SelectItem key={option} value={option}>
                        {OPPORTUNITY_STAGE_LABELS[option]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <FieldError errors={errors.stage ? [errors.stage] : undefined} />
          </Field>

          <Field data-invalid={errors.value ? "true" : undefined}>
            <FieldLabel htmlFor="value">Valor estimado</FieldLabel>
            <Input id="value" type="number" min={0} {...register("value")} />
            <FieldError errors={errors.value ? [errors.value] : undefined} />
          </Field>

          <Field data-invalid={errors.probability ? "true" : undefined}>
            <FieldLabel htmlFor="probability">Probabilidad (%)</FieldLabel>
            <Input id="probability" type="number" min={0} max={100} {...register("probability")} />
            <FieldError errors={errors.probability ? [errors.probability] : undefined} />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field data-invalid={errors.next_action ? "true" : undefined}>
            <FieldLabel htmlFor="next_action">Próxima acción</FieldLabel>
            <Input id="next_action" {...register("next_action")} />
            <FieldError errors={errors.next_action ? [errors.next_action] : undefined} />
          </Field>
          <Field data-invalid={errors.estimated_close_date ? "true" : undefined}>
            <FieldLabel htmlFor="estimated_close_date">Fecha estimada de cierre</FieldLabel>
            <Input id="estimated_close_date" type="date" {...register("estimated_close_date")} />
            <FieldError errors={errors.estimated_close_date ? [errors.estimated_close_date] : undefined} />
          </Field>
        </div>

        <Field data-invalid={errors.notes ? "true" : undefined}>
          <FieldLabel htmlFor="notes">Notas</FieldLabel>
          <Textarea id="notes" rows={3} {...register("notes")} />
          <FieldError errors={errors.notes ? [errors.notes] : undefined} />
        </Field>
      </FieldGroup>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="animate-spin" />}
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
