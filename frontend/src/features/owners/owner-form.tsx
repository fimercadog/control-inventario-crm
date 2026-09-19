"use client";

import { Controller, useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import {
  ownerFormSchema,
  type OwnerFormInput,
  type OwnerFormOutput,
} from "@/features/owners/owner-form-schema";
import { OWNER_STATUS_LABELS, OWNER_STATUSES, type Owner } from "@/types/owner";

interface OwnerFormProps {
  defaultValues?: Partial<OwnerFormInput>;
  onSubmit: SubmitHandler<OwnerFormOutput>;
  submitLabel?: string;
}

export function ownerToFormValues(owner: Owner): Partial<OwnerFormInput> {
  return {
    name: owner.name,
    document: owner.document ?? undefined,
    phone: owner.phone ?? undefined,
    whatsapp: owner.whatsapp ?? undefined,
    email: owner.email ?? undefined,
    address: owner.address ?? undefined,
    notes: owner.notes ?? undefined,
    status: owner.status,
  };
}

export function OwnerForm({ defaultValues, onSubmit, submitLabel = "Guardar" }: OwnerFormProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<OwnerFormInput, unknown, OwnerFormOutput>({
    resolver: zodResolver(ownerFormSchema),
    defaultValues: { status: "activo", ...defaultValues },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-6">
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

        <div className="grid gap-4 sm:grid-cols-2">
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
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field data-invalid={errors.email ? "true" : undefined}>
            <FieldLabel htmlFor="email">Correo electrónico</FieldLabel>
            <Input id="email" type="email" {...register("email")} />
            <FieldError errors={errors.email ? [errors.email] : undefined} />
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
                    {OWNER_STATUSES.map((option) => (
                      <SelectItem key={option} value={option}>
                        {OWNER_STATUS_LABELS[option]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <FieldError errors={errors.status ? [errors.status] : undefined} />
          </Field>
        </div>

        <Field data-invalid={errors.address ? "true" : undefined}>
          <FieldLabel htmlFor="address">Dirección</FieldLabel>
          <Input id="address" {...register("address")} />
          <FieldError errors={errors.address ? [errors.address] : undefined} />
        </Field>

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
