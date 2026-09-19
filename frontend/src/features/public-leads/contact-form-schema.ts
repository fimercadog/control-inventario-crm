import { z } from "zod";

function emptyToUndefined(val: unknown) {
  return val === "" ? undefined : val;
}

export const contactFormSchema = z
  .object({
    name: z.string().min(1, "Tu nombre es obligatorio").max(255),
    email: z.preprocess(emptyToUndefined, z.string().email("Correo inválido").optional()),
    phone: z.preprocess(emptyToUndefined, z.string().max(50).optional()),
    subject: z.preprocess(emptyToUndefined, z.string().max(255).optional()),
    message: z.string().min(1, "Cuéntanos en qué podemos ayudarte").max(2000),
    acceptsDataPolicy: z.boolean(),
  })
  .refine((data) => Boolean(data.email) || Boolean(data.phone), {
    message: "Indica al menos un correo o un teléfono de contacto",
    path: ["email"],
  })
  .refine((data) => data.acceptsDataPolicy === true, {
    message: "Debes autorizar el tratamiento de tus datos personales para continuar",
    path: ["acceptsDataPolicy"],
  });

export type ContactFormInput = z.input<typeof contactFormSchema>;
export type ContactFormOutput = z.output<typeof contactFormSchema>;
