import type { Metadata } from "next";
import { PropertyCatalog } from "@/features/public-properties/property-catalog";
import { SITE_CONFIG } from "@/constants/site";

export const metadata: Metadata = {
  title: `Propiedades | ${SITE_CONFIG.name}`,
  description: "Explora el catálogo completo de propiedades disponibles para comprar o arrendar.",
};

export default async function PropertiesPage(props: PageProps<"/propiedades">) {
  const searchParams = await props.searchParams;

  return (
    <PropertyCatalog
      searchParams={searchParams}
      basePath="/propiedades"
      title="Propiedades"
      description="Explora nuestro catálogo completo y filtra por lo que estás buscando."
    />
  );
}
