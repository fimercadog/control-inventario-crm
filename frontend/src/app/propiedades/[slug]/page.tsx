import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PublicContainer } from "@/components/public/public-container";
import { PropertyGallery } from "@/features/public-properties/property-gallery";
import { PropertyFeatures } from "@/features/public-properties/property-features";
import { PropertyCTA } from "@/features/public-properties/property-cta";
import { currencyFormatter } from "@/features/public-properties/format";
import { fetchPublicPropertyBySlug } from "@/lib/api/public";
import { LISTING_TYPE_LABELS, PROPERTY_TYPE_LABELS } from "@/types/property";
import { SITE_CONFIG } from "@/constants/site";

// Needs a live backend at request time — don't prerender at build time.
export const dynamic = "force-dynamic";

export async function generateMetadata(props: PageProps<"/propiedades/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const property = await fetchPublicPropertyBySlug(slug);

  if (!property) {
    return { title: `Propiedad no encontrada | ${SITE_CONFIG.name}` };
  }

  const location = [property.zone, property.city].filter(Boolean).join(", ");
  const title = `${property.title} en ${LISTING_TYPE_LABELS[property.listing_type].toLowerCase()} en ${location} | ${SITE_CONFIG.name}`;
  const description = property.description?.slice(0, 160) ?? `${PROPERTY_TYPE_LABELS[property.property_type]} en ${location}.`;
  const image = property.images[0]?.url;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: image ? [{ url: image }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function PropertyDetailPage(props: PageProps<"/propiedades/[slug]">) {
  const { slug } = await props.params;
  const property = await fetchPublicPropertyBySlug(slug);

  if (!property) {
    notFound();
  }

  const location = [property.zone, property.city].filter(Boolean).join(", ");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: property.title,
    description: property.description ?? undefined,
    image: property.images.map((image) => image.url),
    offers: {
      "@type": "Offer",
      price: property.price,
      priceCurrency: "COP",
      availability: "https://schema.org/InStock",
    },
  };

  return (
    <PublicContainer className="flex flex-col gap-16 py-16 sm:py-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />

      <div className="realty-animate-fade-up flex max-w-5xl flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge className="rounded-full bg-(--realty-accent) text-white">{LISTING_TYPE_LABELS[property.listing_type]}</Badge>
          <span className="text-xs font-extrabold tracking-wide text-muted-foreground uppercase">{property.code}</span>
        </div>
        <h1 className="font-sans text-4xl font-medium tracking-normal text-balance sm:text-5xl lg:text-6xl">
          {property.title}
        </h1>
        <p className="flex items-center gap-1.5 text-muted-foreground">
          <MapPin className="size-4 shrink-0" />
          {location}
        </p>
      </div>

      <div className="grid gap-16 lg:grid-cols-[minmax(0,2fr)_380px]">
        <div className="flex flex-col gap-8">
          <PropertyGallery images={property.images} title={property.title} />

          {property.description && (
            <div className="realty-animate-fade-up border-t border-black/10 pt-8">
              <h2 className="text-3xl font-medium">Descripción</h2>
              <p className="mt-6 max-w-4xl whitespace-pre-line text-sm leading-8 text-muted-foreground">{property.description}</p>
            </div>
          )}

          <div className="realty-animate-fade-up pt-8">
            <h2 className="text-3xl font-medium">Detalles de la propiedad</h2>
            <div className="mt-8">
              <PropertyFeatures property={property} />
            </div>
          </div>

          {property.features.length > 0 && (
            <div className="realty-animate-fade-up flex flex-col gap-5">
              <h2 className="text-3xl font-medium">Características adicionales</h2>
              <ul className="grid grid-cols-2 gap-x-12 gap-y-4 sm:grid-cols-3">
                {property.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="size-1.5 shrink-0 rounded-full bg-(--realty-accent)" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <aside className="realty-animate-fade-up realty-animate-delay-1 flex flex-col gap-8 lg:sticky lg:top-28 lg:h-fit">
          <div className="bg-(--realty-surface) p-8">
            <p className="text-3xl font-extrabold text-(--realty-primary)">{currencyFormatter.format(property.price)}</p>
            {property.admin_fee !== null && (
              <p className="mt-3 text-sm text-muted-foreground">+ {currencyFormatter.format(property.admin_fee)} de administración</p>
            )}
            <div className="mt-8 border-t border-black/10 pt-6 text-sm font-extrabold text-(--realty-primary)">
              {[
                property.bedrooms !== null ? `${property.bedrooms} habitaciones` : null,
                property.bathrooms !== null ? `${property.bathrooms} baños` : null,
                (property.built_area ?? property.private_area) !== null ? `${property.built_area ?? property.private_area} m²` : null,
              ].filter(Boolean).join(", ")}
            </div>
            <p className="mt-3 text-sm text-muted-foreground">{location}</p>
          </div>
          <PropertyCTA propertyId={property.id} title={property.title} code={property.code} />
        </aside>
      </div>
    </PublicContainer>
  );
}
