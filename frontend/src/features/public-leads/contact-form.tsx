"use client";

import { useState } from "react";
import Link from "next/link";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { contactFormSchema, type ContactFormInput, type ContactFormOutput } from "@/features/public-leads/contact-form-schema";
import { submitPublicLead } from "@/lib/api/public";

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormInput, unknown, ContactFormOutput>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: { acceptsDataPolicy: false },
  });

  async function onSubmit(values: ContactFormOutput) {
    setFormError(null);
    try {
      await submitPublicLead({
        name: values.name,
        email: values.email,
        phone: values.phone,
        message: values.message,
        intent: "contacto_general",
        metadata: { subject: values.subject },
      });
      setSubmitted(true);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "No fue posible enviar el formulario");
    }
  }

  if (submitted) {
    return (
      <div className="realty-animate-scale-in flex flex-col items-center gap-3 rounded-xl border border-border bg-card p-8 text-center">
        <CheckCircle2 className="size-8 text-primary" />
        <p className="font-medium">¡Gracias por escribirnos!</p>
        <p className="text-sm text-muted-foreground">Te responderemos a la brevedad posible.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 sm:p-8">
      <FieldGroup>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field data-invalid={errors.name ? "true" : undefined}>
            <FieldLabel htmlFor="contact-name">Nombre</FieldLabel>
            <Input id="contact-name" {...register("name")} />
            <FieldError errors={errors.name ? [errors.name] : undefined} />
          </Field>
          <Field data-invalid={errors.phone ? "true" : undefined}>
            <FieldLabel htmlFor="contact-phone">Teléfono</FieldLabel>
            <Input id="contact-phone" {...register("phone")} />
            <FieldError errors={errors.phone ? [errors.phone] : undefined} />
          </Field>
        </div>

        <Field data-invalid={errors.email ? "true" : undefined}>
          <FieldLabel htmlFor="contact-email">Correo electrónico</FieldLabel>
          <Input id="contact-email" type="email" {...register("email")} />
          <FieldError errors={errors.email ? [errors.email] : undefined} />
        </Field>

        <Field data-invalid={errors.subject ? "true" : undefined}>
          <FieldLabel htmlFor="contact-subject">Asunto</FieldLabel>
          <Input id="contact-subject" {...register("subject")} />
          <FieldError errors={errors.subject ? [errors.subject] : undefined} />
        </Field>

        <Field data-invalid={errors.message ? "true" : undefined}>
          <FieldLabel htmlFor="contact-message">Mensaje</FieldLabel>
          <Textarea id="contact-message" rows={5} {...register("message")} />
          <FieldError errors={errors.message ? [errors.message] : undefined} />
        </Field>

        <Field data-invalid={errors.acceptsDataPolicy ? "true" : undefined} orientation="horizontal" className="items-start">
          <Controller
            name="acceptsDataPolicy"
            control={control}
            render={({ field }) => (
              <Checkbox
                id="contact-accepts-data-policy"
                checked={field.value ?? false}
                onCheckedChange={field.onChange}
                aria-invalid={!!errors.acceptsDataPolicy}
                className="mt-0.5"
              />
            )}
          />
          <FieldLabel htmlFor="contact-accepts-data-policy" className="block w-auto font-normal leading-relaxed">
            Autorizo el tratamiento de mis datos personales conforme a la{" "}
            <Link href="/privacidad" target="_blank" className="underline underline-offset-2 hover:text-foreground">
              Política de tratamiento de datos
            </Link>{" "}
            (Ley 1581 de 2012).
          </FieldLabel>
          <FieldError errors={errors.acceptsDataPolicy ? [errors.acceptsDataPolicy] : undefined} />
        </Field>

        {formError && (
          <p role="alert" className="text-sm text-destructive">
            {formError}
          </p>
        )}

        <Button type="submit" disabled={isSubmitting} className="w-full sm:w-fit">
          {isSubmitting ? <Loader2 className="animate-spin" /> : <Send />}
          Enviar mensaje
        </Button>
      </FieldGroup>
    </form>
  );
}
