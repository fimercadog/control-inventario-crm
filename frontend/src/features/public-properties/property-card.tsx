import Image from "next/image";
import Link from "next/link";
import { SAMPLE_PROPERTY_IMAGE } from "@/constants/images";
import { LISTING_TYPE_LABELS, PROPERTY_TYPE_LABELS } from "@/types/property";
import type { PublicPropertySummary } from "@/types/public";
import { currencyFormatter } from "@/features/public-properties/format";

export function PropertyCard({ property }: { property: PublicPropertySummary }) {
  const location = [property.zone, property.city].filter(Boolean).join(", ");

  return (
    <Link
      href={`/propiedades/${property.slug}`}
      className="realty-hover-lift group flex flex-col gap-5"
    >
      <div className="relative aspect-[1.48/1] w-full overflow-hidden bg-muted">
        <Image
          src={property.cover_image ?? SAMPLE_PROPERTY_IMAGE}
          alt={property.cover_image ? property.title : "Interior moderno de propiedad"}
          fill
          className="object-cover grayscale transition duration-300 group-hover:scale-105 group-hover:grayscale-0"
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
        />
      </div>

      <div className="flex flex-1 flex-col items-start gap-2">
        <p className="text-xl font-extrabold text-(--realty-primary)">{currencyFormatter.format(property.price)}</p>
        <p className="text-sm font-extrabold text-(--realty-primary)">
          {[
            property.bedrooms !== null ? `${property.bedrooms} Hab.` : null,
            property.bathrooms !== null ? `${property.bathrooms} Baños` : null,
            (property.built_area ?? property.private_area) !== null ? `${property.built_area ?? property.private_area} m²` : null,
          ].filter(Boolean).join(", ")}
        </p>
        <h3 className="line-clamp-1 text-sm font-medium text-muted-foreground">{property.title}</h3>
        <p className="line-clamp-1 text-sm text-muted-foreground">{location}</p>
        <p className="text-[0.68rem] font-extrabold tracking-wide text-(--realty-blue) uppercase">
          {PROPERTY_TYPE_LABELS[property.property_type]} · {LISTING_TYPE_LABELS[property.listing_type]}
          {property.is_featured ? " · Destacada" : ""}
        </p>
        <span className="realty-button mt-3">Ver propiedad</span>
      </div>
    </Link>
  );
}
