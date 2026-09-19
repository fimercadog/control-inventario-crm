"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import {
  ownerLeadFormSchema,
  type OwnerLeadFormInput,
  type OwnerLeadFormOutput,
} from "@/features/public-leads/owner-lead-form-schema";
import { submitPublicLead } from "@/lib/api/public";
import { LISTING_TYPE_LABELS, LISTING_TYPES, PROPERTY_TYPE_LABELS, PROPERTY_TYPES } from "@/types/property";

export function OwnerLeadForm() {
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<OwnerLeadFormInput, unknown, OwnerLeadFormOutput>({ resolver: zodResolver(ownerLeadFormSchema) });

  async function onSubmit(values: OwnerLeadFormOutput) {
    setFormError(null);
    try {
      await submitPublicLead({
        name: values.name,
        email: values.email,
        phone: values.phone,
        message: values.message,
        intent: "vender_propiedad",
        metadata: {
          property_type: values.property_type,
          listing_type: values.listing_type,
          city: values.city,
          zone: values.zone,
          address: values.address,
          estimated_price: values.estimated_price,
        },
      });
      setSubmitted(true);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "No fue posible enviar el formulario");
    }
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-card p-8 text-center">
        <CheckCircle2 className="size-8 text-primary" />
        <p className="font-medium">¡Gracias por tu información!</p>
        <p className="text-sm text-muted-foreground">
          Un asesor revisará los datos de tu inmueble y se pondrá en contacto contigo muy pronto.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 sm:p-8">
      <FieldGroup>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field data-invalid={errors.name ? "true" : undefined}>
            <FieldLabel htmlFor="owner-name">Nombre</FieldLabel>
            <Input id="owner-name" {...register("name")} />
            <FieldError errors={errors.name ? [errors.name] : undefined} />
          </Field>
          <Field data-invalid={errors.phone ? "true" : undefined}>
            <FieldLabel htmlFor="owner-phone">Teléfono</FieldLabel>
            <Input id="owner-phone" {...register("phone")} />
            <FieldError errors={errors.phone ? [errors.phone] : undefined} />
          </Field>
        </div>

        <Field data-invalid={errors.email ? "true" : undefined}>
          <FieldLabel htmlFor="owner-email">Correo electrónico</FieldLabel>
          <Input id="owner-email" type="email" {...register("email")} />
          <FieldError errors={errors.email ? [errors.email] : undefined} />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field data-invalid={errors.property_type ? "true" : undefined}>
            <FieldLabel htmlFor="owner-property-type">Tipo de inmueble</FieldLabel>
            <Controller
              name="property_type"
              control={control}
              render={({ field }) => (
                <Select value={field.value ?? ""} onValueChange={field.onChange}>
                  <SelectTrigger id="owner-property-type" className="w-full">
                    <SelectValue placeholder="Selecciona un tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {PROPERTY_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {PROPERTY_TYPE_LABELS[type]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <FieldError errors={errors.property_type ? [errors.property_type] : undefined} />
          </Field>

          <Field data-invalid={errors.listing_type ? "true" : undefined}>
            <FieldLabel htmlFor="owner-listing-type">¿Venta o arriendo?</FieldLabel>
            <Controller
              name="listing_type"
              control={control}
              render={({ field }) => (
                <Select value={field.value ?? ""} onValueChange={field.onChange}>
                  <SelectTrigger id="owner-listing-type" className="w-full">
                    <SelectValue placeholder="Selecciona una opción" />
                  </SelectTrigger>
                  <SelectContent>
                    {LISTING_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {LISTING_TYPE_LABELS[type]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <FieldError errors={errors.listing_type ? [errors.listing_type] : undefined} />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field data-invalid={errors.city ? "true" : undefined}>
            <FieldLabel htmlFor="owner-city">Ciudad</FieldLabel>
            <Input id="owner-city" {...register("city")} />
            <FieldError errors={errors.city ? [errors.city] : undefined} />
          </Field>
          <Field data-invalid={errors.zone ? "true" : undefined}>
            <FieldLabel htmlFor="owner-zone">Barrio / zona</FieldLabel>
            <Input id="owner-zone" {...register("zone")} />
            <FieldError errors={errors.zone ? [errors.zone] : undefined} />
          </Field>
        </div>

        <Field data-invalid={errors.address ? "true" : undefined}>
          <FieldLabel htmlFor="owner-address">Dirección</FieldLabel>
          <Input id="owner-address" {...register("address")} />
          <FieldError errors={errors.address ? [errors.address] : undefined} />
        </Field>

        <Field data-invalid={errors.estimated_price ? "true" : undefined}>
          <FieldLabel htmlFor="owner-price">Precio aproximado</FieldLabel>
          <Input id="owner-price" type="number" min={0} {...register("estimated_price")} />
          <FieldError errors={errors.estimated_price ? [errors.estimated_price] : undefined} />
        </Field>

        <Field data-invalid={errors.message ? "true" : undefined}>
          <FieldLabel htmlFor="owner-message">Cuéntanos más sobre tu inmueble</FieldLabel>
          <Textarea id="owner-message" rows={4} {...register("message")} />
          <FieldError errors={errors.message ? [errors.message] : undefined} />
        </Field>

        {formError && (
          <p role="alert" className="text-sm text-destructive">
            {formError}
          </p>
        )}

        <Button type="submit" disabled={isSubmitting} size="lg" className="w-full sm:w-fit">
          {isSubmitting ? <Loader2 className="animate-spin" /> : <Send />}
          Enviar información
        </Button>
      </FieldGroup>
    </form>
  );
}
