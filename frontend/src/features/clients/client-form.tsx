"use client";

import { Controller, useForm, type Control, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Field, FieldError, FieldGroup, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field";
import {
  clientFormSchema,
  type ClientFormInput,
  type ClientFormOutput,
} from "@/features/clients/client-form-schema";
import {
  CLIENT_STATUS_LABELS,
  CLIENT_STATUSES,
  INTEREST_TYPE_LABELS,
  INTEREST_TYPES,
  type Client,
} from "@/types/client";
import { PROPERTY_TYPE_LABELS, PROPERTY_TYPES } from "@/types/property";

interface ClientFormProps {
  defaultValues?: Partial<ClientFormInput>;
  onSubmit: SubmitHandler<ClientFormOutput>;
  submitLabel?: string;
}

export function clientToFormValues(client: Client): Partial<ClientFormInput> {
  return {
    name: client.name,
    document: client.document ?? undefined,
    phone: client.phone ?? undefined,
    whatsapp: client.whatsapp ?? undefined,
    email: client.email ?? undefined,
    interest_type: client.interest_type ?? undefined,
    budget_min: client.budget_min ?? undefined,
    budget_max: client.budget_max ?? undefined,
    interest_zones: client.interest_zones.join(", "),
    property_type_interest: client.property_type_interest ?? undefined,
    bedrooms_needed: client.bedrooms_needed ?? undefined,
    notes: client.notes ?? undefined,
    status: client.status,
  };
}

export function ClientForm({ defaultValues, onSubmit, submitLabel = "Guardar" }: ClientFormProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ClientFormInput, unknown, ClientFormOutput>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: { status: "activo", ...defaultValues },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-8">
      <FieldSet>
        <FieldLegend>Contacto</FieldLegend>
        <FieldGroup>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field data-invalid={errors.name ? "true" : undefined}>
              <FieldLabel htmlFor="name">Nombre</FieldLabel>
              <Input id="name" {...register("name")} />
              <FieldError errors={errors.name ? [errors.name] : undefined} />
            </Field>
            <Field data-invalid={errors.document ? "true" : undefined}>
              <FieldLabel htmlFor="document">Documento</FieldLabel>
              <Input id="document" {...register("document")} />
              <FieldError errors={errors.document ? [errors.document] : undefined} />
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field data-invalid={errors.phone ? "true" : undefined}>
              <FieldLabel htmlFor="phone">Teléfono</FieldLabel>
              <Input id="phone" {...register("phone")} />
              <FieldError errors={errors.phone ? [errors.phone] : undefined} />
            </Field>
            <Field data-invalid={errors.whatsapp ? "true" : undefined}>
              <FieldLabel htmlFor="whatsapp">WhatsApp</FieldLabel>
              <Input id="whatsapp" {...register("whatsapp")} />
              <FieldError errors={errors.whatsapp ? [errors.whatsapp] : undefined} />
            </Field>
            <Field data-invalid={errors.email ? "true" : undefined}>
              <FieldLabel htmlFor="email">Correo</FieldLabel>
              <Input id="email" type="email" {...register("email")} />
              <FieldError errors={errors.email ? [errors.email] : undefined} />
            </Field>
          </div>
        </FieldGroup>
      </FieldSet>

      <FieldSet>
        <FieldLegend>Interés</FieldLegend>
        <FieldGroup>
          <div className="grid gap-4 sm:grid-cols-3">
            <EnumSelectField
              name="interest_type"
              control={control}
              label="Tipo de interés"
              options={INTEREST_TYPES}
              labels={INTEREST_TYPE_LABELS}
              placeholder="Sin especificar"
            />
            <EnumSelectField
              name="property_type_interest"
              control={control}
              label="Tipo de inmueble buscado"
              options={PROPERTY_TYPES}
              labels={PROPERTY_TYPE_LABELS}
              placeholder="Sin especificar"
            />
            <Field data-invalid={errors.bedrooms_needed ? "true" : undefined}>
              <FieldLabel htmlFor="bedrooms_needed">Habitaciones</FieldLabel>
              <Input id="bedrooms_needed" type="number" min={0} {...register("bedrooms_needed")} />
              <FieldError errors={errors.bedrooms_needed ? [errors.bedrooms_needed] : undefined} />
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field data-invalid={errors.budget_min ? "true" : undefined}>
              <FieldLabel htmlFor="budget_min">Presupuesto mínimo</FieldLabel>
              <Input id="budget_min" type="number" min={0} {...register("budget_min")} />
              <FieldError errors={errors.budget_min ? [errors.budget_min] : undefined} />
            </Field>
            <Field data-invalid={errors.budget_max ? "true" : undefined}>
              <FieldLabel htmlFor="budget_max">Presupuesto máximo</FieldLabel>
              <Input id="budget_max" type="number" min={0} {...register("budget_max")} />
              <FieldError errors={errors.budget_max ? [errors.budget_max] : undefined} />
            </Field>
          </div>
          <Field data-invalid={errors.interest_zones ? "true" : undefined}>
            <FieldLabel htmlFor="interest_zones">Zonas de interés</FieldLabel>
            <Input id="interest_zones" placeholder="Chapinero, Usaquén, Norte" {...register("interest_zones")} />
            <FieldError errors={errors.interest_zones ? [errors.interest_zones] : undefined} />
          </Field>
        </FieldGroup>
      </FieldSet>

      <FieldSet>
        <FieldLegend>Seguimiento</FieldLegend>
        <FieldGroup>
          <Field data-invalid={errors.status ? "true" : undefined}>
            <FieldLabel htmlFor="status">Estado</FieldLabel>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <Select value={field.value ?? ""} onValueChange={field.onChange}>
                  <SelectTrigger id="status" className="w-full sm:w-1/3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CLIENT_STATUSES.map((option) => (
                      <SelectItem key={option} value={option}>
                        {CLIENT_STATUS_LABELS[option]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <FieldError errors={errors.status ? [errors.status] : undefined} />
          </Field>
          <Field data-invalid={errors.notes ? "true" : undefined}>
            <FieldLabel htmlFor="notes">Notas</FieldLabel>
            <Textarea id="notes" rows={3} {...register("notes")} />
            <FieldError errors={errors.notes ? [errors.notes] : undefined} />
          </Field>
        </FieldGroup>
      </FieldSet>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="animate-spin" />}
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}

interface EnumSelectFieldProps<TOption extends string> {
  name: "interest_type" | "property_type_interest";
  control: Control<ClientFormInput>;
  label: string;
  options: readonly TOption[];
  labels: Record<TOption, string>;
  placeholder: string;
}

function EnumSelectField<TOption extends string>({
  name,
  control,
  label,
  options,
  labels,
  placeholder,
}: EnumSelectFieldProps<TOption>) {
  return (
    <Field>
      <FieldLabel htmlFor={name}>{label}</FieldLabel>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <Select value={typeof field.value === "string" ? field.value : ""} onValueChange={field.onChange}>
            <SelectTrigger id={name} className="w-full">
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option} value={option}>
                  {labels[option]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      />
    </Field>
  );
}
