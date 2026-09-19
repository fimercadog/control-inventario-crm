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
  visitFormSchema,
  type VisitFormInput,
  type VisitFormOutput,
} from "@/features/visits/visit-form-schema";
import { VISIT_STATUS_LABELS, VISIT_STATUSES, type Visit } from "@/types/visit";

interface VisitFormProps {
  defaultValues?: Partial<VisitFormInput>;
  onSubmit: SubmitHandler<VisitFormOutput>;
  submitLabel?: string;
}

function toDatetimeLocal(iso: string): string {
  const date = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function visitToFormValues(visit: Visit): Partial<VisitFormInput> {
  return {
    property_id: visit.property_id,
    client_id: visit.client_id,
    scheduled_at: toDatetimeLocal(visit.scheduled_at),
    status: visit.status,
    notes: visit.notes ?? undefined,
    result: visit.result ?? undefined,
    follow_up: visit.follow_up ?? undefined,
  };
}

export function VisitForm({ defaultValues, onSubmit, submitLabel = "Guardar" }: VisitFormProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<VisitFormInput, unknown, VisitFormOutput>({
    resolver: zodResolver(visitFormSchema),
    defaultValues: { status: "pendiente", ...defaultValues },
  });

  const { options: clientOptions } = useClientOptions();
  const { options: propertyOptions } = usePropertyOptions();

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-6">
      <FieldGroup>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field data-invalid={errors.property_id ? "true" : undefined}>
            <FieldLabel htmlFor="property_id">Propiedad</FieldLabel>
            <Controller
              name="property_id"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value ? String(field.value) : ""}
                  onValueChange={(value) => field.onChange(Number(value))}
                >
                  <SelectTrigger id="property_id" className="w-full">
                    <SelectValue placeholder="Selecciona una propiedad" />
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
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field data-invalid={errors.scheduled_at ? "true" : undefined}>
            <FieldLabel htmlFor="scheduled_at">Fecha y hora</FieldLabel>
            <Input id="scheduled_at" type="datetime-local" {...register("scheduled_at")} />
            <FieldError errors={errors.scheduled_at ? [errors.scheduled_at] : undefined} />
          </Field>
          <Field data-invalid={errors.status ? "true" : undefined}>
            <FieldLabel htmlFor="status">Estado</FieldLabel>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <Select value={field.value ?? ""} onValueChange={field.onChange}>
                  <SelectTrigger id="status" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {VISIT_STATUSES.map((option) => (
                      <SelectItem key={option} value={option}>
                        {VISIT_STATUS_LABELS[option]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <FieldError errors={errors.status ? [errors.status] : undefined} />
          </Field>
        </div>

        <Field data-invalid={errors.notes ? "true" : undefined}>
          <FieldLabel htmlFor="notes">Observaciones</FieldLabel>
          <Textarea id="notes" rows={2} {...register("notes")} />
          <FieldError errors={errors.notes ? [errors.notes] : undefined} />
        </Field>

        <Field data-invalid={errors.result ? "true" : undefined}>
          <FieldLabel htmlFor="result">Resultado</FieldLabel>
          <Textarea id="result" rows={2} {...register("result")} />
          <FieldError errors={errors.result ? [errors.result] : undefined} />
        </Field>

        <Field data-invalid={errors.follow_up ? "true" : undefined}>
          <FieldLabel htmlFor="follow_up">Seguimiento posterior</FieldLabel>
          <Textarea id="follow_up" rows={2} {...register("follow_up")} />
          <FieldError errors={errors.follow_up ? [errors.follow_up] : undefined} />
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
