import type { Metadata } from "next";
import { PropertyCatalog } from "@/features/public-properties/property-catalog";
import { SITE_CONFIG } from "@/constants/site";

export const metadata: Metadata = {
  title: `Propiedades en venta | ${SITE_CONFIG.name}`,
  description: "Encuentra apartamentos, casas y locales en venta seleccionados para ti.",
};

export default async function ComprarPage(props: PageProps<"/comprar">) {
  const searchParams = await props.searchParams;

  return (
    <PropertyCatalog
      searchParams={searchParams}
      basePath="/comprar"
      lockedListingType="venta"
      title="Propiedades en venta"
      description="Encuentra la propiedad ideal para comprar, con acompañamiento en cada paso del proceso."
    />
  );
}
