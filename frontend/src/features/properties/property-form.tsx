"use client";

import { Controller, useForm, type Control, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field";
import {
  propertyFormSchema,
  type PropertyFormInput,
  type PropertyFormOutput,
} from "@/features/properties/property-form-schema";
import { useOwnerOptions } from "@/features/owners/use-owner-options";
import {
  LISTING_TYPE_LABELS,
  LISTING_TYPES,
  PROPERTY_STATUS_LABELS,
  PROPERTY_STATUSES,
  PROPERTY_TYPE_LABELS,
  PROPERTY_TYPES,
  type Property,
} from "@/types/property";

interface PropertyFormProps {
  defaultValues?: Partial<PropertyFormInput>;
  onSubmit: SubmitHandler<PropertyFormOutput>;
  submitLabel?: string;
}

function toDefaultValues(property?: Partial<PropertyFormInput>): Partial<PropertyFormInput> {
  return {
    status: "borrador",
    ...property,
  };
}

export function propertyToFormValues(property: Property): Partial<PropertyFormInput> {
  return {
    title: property.title,
    description: property.description ?? undefined,
    property_type: property.property_type,
    listing_type: property.listing_type,
    status: property.status,
    city: property.city,
    zone: property.zone ?? undefined,
    address: property.address ?? undefined,
    owner_id: property.owner_id ?? undefined,
    price: property.price,
    admin_fee: property.admin_fee ?? undefined,
    stratum: property.stratum ?? undefined,
    bedrooms: property.bedrooms ?? undefined,
    bathrooms: property.bathrooms ?? undefined,
    parking_spots: property.parking_spots ?? undefined,
    built_area: property.built_area ?? undefined,
    private_area: property.private_area ?? undefined,
    year_built: property.year_built ?? undefined,
    notes: property.notes ?? undefined,
    is_featured: property.is_featured ?? false,
    is_published: property.published_at !== null,
  };
}

export function PropertyForm({ defaultValues, onSubmit, submitLabel = "Guardar" }: PropertyFormProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<PropertyFormInput, unknown, PropertyFormOutput>({
    resolver: zodResolver(propertyFormSchema),
    defaultValues: toDefaultValues(defaultValues),
  });

  const { options: ownerOptions } = useOwnerOptions();

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-8">
      <FieldSet>
        <FieldLegend>Información general</FieldLegend>
        <FieldGroup>
          <Field data-invalid={errors.title ? "true" : undefined}>
            <FieldLabel htmlFor="title">Título</FieldLabel>
            <Input id="title" {...register("title")} />
            <FieldError errors={errors.title ? [errors.title] : undefined} />
          </Field>

          <Field data-invalid={errors.description ? "true" : undefined}>
            <FieldLabel htmlFor="description">Descripción</FieldLabel>
            <Textarea id="description" rows={4} {...register("description")} />
            <FieldError errors={errors.description ? [errors.description] : undefined} />
          </Field>

          <div className="grid gap-4 sm:grid-cols-3">
            <SelectField
              name="property_type"
              control={control}
              label="Tipo de inmueble"
              options={PROPERTY_TYPES}
              labels={PROPERTY_TYPE_LABELS}
              error={errors.property_type?.message}
            />
            <SelectField
              name="listing_type"
              control={control}
              label="Venta / Arriendo"
              options={LISTING_TYPES}
              labels={LISTING_TYPE_LABELS}
              error={errors.listing_type?.message}
            />
            <SelectField
              name="status"
              control={control}
              label="Estado"
              options={PROPERTY_STATUSES}
              labels={PROPERTY_STATUS_LABELS}
              error={errors.status?.message}
            />
          </div>

          <Field data-invalid={errors.owner_id ? "true" : undefined}>
            <FieldLabel htmlFor="owner_id">Propietario</FieldLabel>
            <Controller
              name="owner_id"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value ? String(field.value) : ""}
                  onValueChange={(value) => field.onChange(value ? Number(value) : undefined)}
                >
                  <SelectTrigger id="owner_id" className="w-full">
                    <SelectValue placeholder="Sin asignar" />
                  </SelectTrigger>
                  <SelectContent>
                    {ownerOptions.map((owner) => (
                      <SelectItem key={owner.id} value={String(owner.id)}>
                        {owner.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <FieldError errors={errors.owner_id ? [errors.owner_id] : undefined} />
          </Field>
        </FieldGroup>
      </FieldSet>

      <FieldSet>
        <FieldLegend>Ubicación</FieldLegend>
        <FieldGroup>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field data-invalid={errors.city ? "true" : undefined}>
              <FieldLabel htmlFor="city">Ciudad</FieldLabel>
              <Input id="city" {...register("city")} />
              <FieldError errors={errors.city ? [errors.city] : undefined} />
            </Field>
            <Field data-invalid={errors.zone ? "true" : undefined}>
              <FieldLabel htmlFor="zone">Barrio / Zona</FieldLabel>
              <Input id="zone" {...register("zone")} />
              <FieldError errors={errors.zone ? [errors.zone] : undefined} />
            </Field>
          </div>
          <Field data-invalid={errors.address ? "true" : undefined}>
            <FieldLabel htmlFor="address">Dirección</FieldLabel>
            <Input id="address" {...register("address")} />
            <FieldError errors={errors.address ? [errors.address] : undefined} />
          </Field>
        </FieldGroup>
      </FieldSet>

      <FieldSet>
        <FieldLegend>Precio</FieldLegend>
        <FieldGroup>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field data-invalid={errors.price ? "true" : undefined}>
              <FieldLabel htmlFor="price">Precio</FieldLabel>
              <Input id="price" type="number" step="1" {...register("price")} />
              <FieldError errors={errors.price ? [errors.price] : undefined} />
            </Field>
            <Field data-invalid={errors.admin_fee ? "true" : undefined}>
              <FieldLabel htmlFor="admin_fee">Administración</FieldLabel>
              <Input id="admin_fee" type="number" step="1" {...register("admin_fee")} />
              <FieldError errors={errors.admin_fee ? [errors.admin_fee] : undefined} />
            </Field>
          </div>
        </FieldGroup>
      </FieldSet>

      <FieldSet>
        <FieldLegend>Características</FieldLegend>
        <FieldGroup>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field data-invalid={errors.stratum ? "true" : undefined}>
              <FieldLabel htmlFor="stratum">Estrato</FieldLabel>
              <Input id="stratum" type="number" min={1} max={6} {...register("stratum")} />
              <FieldError errors={errors.stratum ? [errors.stratum] : undefined} />
            </Field>
            <Field data-invalid={errors.bedrooms ? "true" : undefined}>
              <FieldLabel htmlFor="bedrooms">Habitaciones</FieldLabel>
              <Input id="bedrooms" type="number" min={0} {...register("bedrooms")} />
              <FieldError errors={errors.bedrooms ? [errors.bedrooms] : undefined} />
            </Field>
            <Field data-invalid={errors.bathrooms ? "true" : undefined}>
              <FieldLabel htmlFor="bathrooms">Baños</FieldLabel>
              <Input id="bathrooms" type="number" min={0} {...register("bathrooms")} />
              <FieldError errors={errors.bathrooms ? [errors.bathrooms] : undefined} />
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field data-invalid={errors.parking_spots ? "true" : undefined}>
              <FieldLabel htmlFor="parking_spots">Parqueaderos</FieldLabel>
              <Input id="parking_spots" type="number" min={0} {...register("parking_spots")} />
              <FieldError errors={errors.parking_spots ? [errors.parking_spots] : undefined} />
            </Field>
            <Field data-invalid={errors.built_area ? "true" : undefined}>
              <FieldLabel htmlFor="built_area">Área construida (m²)</FieldLabel>
              <Input id="built_area" type="number" min={0} {...register("built_area")} />
              <FieldError errors={errors.built_area ? [errors.built_area] : undefined} />
            </Field>
            <Field data-invalid={errors.private_area ? "true" : undefined}>
              <FieldLabel htmlFor="private_area">Área privada (m²)</FieldLabel>
              <Input id="private_area" type="number" min={0} {...register("private_area")} />
              <FieldError errors={errors.private_area ? [errors.private_area] : undefined} />
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field data-invalid={errors.year_built ? "true" : undefined}>
              <FieldLabel htmlFor="year_built">Año de construcción</FieldLabel>
              <Input id="year_built" type="number" min={1900} {...register("year_built")} />
              <FieldError errors={errors.year_built ? [errors.year_built] : undefined} />
            </Field>
          </div>
          <Field data-invalid={errors.notes ? "true" : undefined}>
            <FieldLabel htmlFor="notes">Observaciones</FieldLabel>
            <Textarea id="notes" rows={3} {...register("notes")} />
            <FieldError errors={errors.notes ? [errors.notes] : undefined} />
          </Field>
        </FieldGroup>
      </FieldSet>

      <FieldSet>
        <FieldLegend>Sitio web</FieldLegend>
        <FieldGroup>
          <Field orientation="horizontal">
            <FieldLabel htmlFor="is_published">Publicar en el sitio web</FieldLabel>
            <Controller
              name="is_published"
              control={control}
              render={({ field }) => (
                <Switch id="is_published" checked={field.value ?? false} onCheckedChange={field.onChange} />
              )}
            />
            <FieldDescription>Solo las propiedades publicadas aparecen en el catálogo público.</FieldDescription>
          </Field>
          <Field orientation="horizontal">
            <FieldLabel htmlFor="is_featured">Propiedad destacada</FieldLabel>
            <Controller
              name="is_featured"
              control={control}
              render={({ field }) => (
                <Switch id="is_featured" checked={field.value ?? false} onCheckedChange={field.onChange} />
              )}
            />
            <FieldDescription>Se muestra en la sección de propiedades destacadas del inicio.</FieldDescription>
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

type EnumFieldName = "property_type" | "listing_type" | "status";

interface SelectFieldProps<TOption extends string> {
  name: EnumFieldName;
  control: Control<PropertyFormInput>;
  label: string;
  options: readonly TOption[];
  labels: Record<TOption, string>;
  error?: string;
}

function SelectField<TOption extends string>({ name, control, label, options, labels, error }: SelectFieldProps<TOption>) {
  return (
    <Field data-invalid={error ? "true" : undefined}>
      <FieldLabel htmlFor={name}>{label}</FieldLabel>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <Select value={field.value ?? ""} onValueChange={field.onChange}>
            <SelectTrigger id={name} className="w-full">
              <SelectValue />
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
      {error && <FieldError errors={[{ message: error }]} />}
    </Field>
  );
}
