import type { Metadata } from "next";
import { PropertyCatalog } from "@/features/public-properties/property-catalog";
import { SITE_CONFIG } from "@/constants/site";

export const metadata: Metadata = {
  title: `Propiedades en arriendo | ${SITE_CONFIG.name}`,
  description: "Encuentra apartamentos, casas y oficinas disponibles para arrendar.",
};

export default async function ArrendarPage(props: PageProps<"/arrendar">) {
  const searchParams = await props.searchParams;

  return (
    <PropertyCatalog
      searchParams={searchParams}
      basePath="/arrendar"
      lockedListingType="arriendo"
      title="Propiedades en arriendo"
      description="Explora las opciones disponibles para arrendar hoy mismo."
    />
  );
}
