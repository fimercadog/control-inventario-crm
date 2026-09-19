import { Suspense } from "react";
import { PublicContainer } from "@/components/public/public-container";
import { SectionHeading } from "@/components/public/section-heading";
import { Pagination } from "@/components/public/pagination";
import { PropertyFilters } from "@/features/public-properties/property-filters";
import { PropertyGrid } from "@/features/public-properties/property-grid";
import { fetchPublicProperties } from "@/lib/api/public";
import type { ListingTypeValue } from "@/types/property";
import type { PublicPropertyFilters } from "@/types/public";

interface PropertyCatalogProps {
  searchParams: Record<string, string | string[] | undefined>;
  basePath: string;
  lockedListingType?: ListingTypeValue;
  title: string;
  description: string;
}

export async function PropertyCatalog({
  searchParams,
  basePath,
  lockedListingType,
  title,
  description,
}: PropertyCatalogProps) {
  const page = Number(searchParams.page ?? 1) || 1;
  const search = typeof searchParams.search === "string" ? searchParams.search : undefined;

  const filters: PublicPropertyFilters = {
    listing_type: lockedListingType ?? (typeof searchParams.listing_type === "string" ? searchParams.listing_type : undefined),
    property_type: typeof searchParams.property_type === "string" ? searchParams.property_type : undefined,
    city: typeof searchParams.city === "string" ? searchParams.city : undefined,
    zone: typeof searchParams.zone === "string" ? searchParams.zone : undefined,
    bedrooms: typeof searchParams.bedrooms === "string" ? searchParams.bedrooms : undefined,
    bathrooms: typeof searchParams.bathrooms === "string" ? searchParams.bathrooms : undefined,
    price_min: typeof searchParams.price_min === "string" ? searchParams.price_min : undefined,
    price_max: typeof searchParams.price_max === "string" ? searchParams.price_max : undefined,
  };

  const { items, meta } = await fetchPublicProperties(page, filters, search);

  return (
    <PublicContainer className="flex flex-col gap-12 py-20 sm:py-24">
      <div className="realty-animate-fade-up">
        <SectionHeading level={1} title={title} description={description} align="center" />
      </div>

      <Suspense>
        <div className="realty-animate-fade-up realty-animate-delay-1">
          <PropertyFilters basePath={basePath} hideListingType={Boolean(lockedListingType)} />
        </div>
      </Suspense>

      <p className="realty-animate-fade-up realty-animate-delay-2 text-center text-xs font-extrabold tracking-wide text-(--realty-blue) uppercase">
        {meta.total} propiedades encontradas
      </p>

      <PropertyGrid properties={items} />

      <Suspense>
        <Pagination currentPage={meta.current_page} lastPage={meta.last_page} basePath={basePath} />
      </Suspense>
    </PublicContainer>
  );
}
