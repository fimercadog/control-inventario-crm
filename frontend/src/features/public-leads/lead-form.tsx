"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { leadFormSchema, type LeadFormInput, type LeadFormOutput } from "@/features/public-leads/lead-form-schema";
import { submitPublicLead } from "@/lib/api/public";
import type { LeadIntent } from "@/types/public";

interface LeadFormProps {
  intent: LeadIntent;
  propertyId?: number;
  messagePlaceholder?: string;
  submitLabel?: string;
}

export function LeadForm({ intent, propertyId, messagePlaceholder, submitLabel = "Enviar mensaje" }: LeadFormProps) {
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LeadFormInput, unknown, LeadFormOutput>({ resolver: zodResolver(leadFormSchema) });

  async function onSubmit(values: LeadFormOutput) {
    setFormError(null);
    try {
      await submitPublicLead({
        name: values.name,
        email: values.email,
        phone: values.phone,
        message: values.message,
        intent,
        property_id: propertyId,
      });
      setSubmitted(true);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "No fue posible enviar el formulario");
    }
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-card p-6 text-center">
        <CheckCircle2 className="size-8 text-primary" />
        <p className="font-medium">¡Gracias por tu mensaje!</p>
        <p className="text-sm text-muted-foreground">Un asesor se pondrá en contacto contigo muy pronto.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
      <FieldGroup>
        <Field data-invalid={errors.name ? "true" : undefined}>
          <FieldLabel htmlFor="lead-name">Nombre</FieldLabel>
          <Input id="lead-name" {...register("name")} />
          <FieldError errors={errors.name ? [errors.name] : undefined} />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field data-invalid={errors.email ? "true" : undefined}>
            <FieldLabel htmlFor="lead-email">Correo electrónico</FieldLabel>
            <Input id="lead-email" type="email" {...register("email")} />
            <FieldError errors={errors.email ? [errors.email] : undefined} />
          </Field>
          <Field data-invalid={errors.phone ? "true" : undefined}>
            <FieldLabel htmlFor="lead-phone">Teléfono</FieldLabel>
            <Input id="lead-phone" {...register("phone")} />
            <FieldError errors={errors.phone ? [errors.phone] : undefined} />
          </Field>
        </div>

        <Field data-invalid={errors.message ? "true" : undefined}>
          <FieldLabel htmlFor="lead-message">Mensaje</FieldLabel>
          <Textarea id="lead-message" rows={4} placeholder={messagePlaceholder} {...register("message")} />
          <FieldError errors={errors.message ? [errors.message] : undefined} />
        </Field>

        {formError && (
          <p role="alert" className="text-sm text-destructive">
            {formError}
          </p>
        )}

        <Button type="submit" disabled={isSubmitting} className="w-full sm:w-fit">
          {isSubmitting ? <Loader2 className="animate-spin" /> : <Send />}
          {submitLabel}
        </Button>
      </FieldGroup>
    </form>
  );
}
