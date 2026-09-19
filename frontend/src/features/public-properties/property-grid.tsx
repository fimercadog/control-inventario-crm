import { Home } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { PropertyCard } from "@/features/public-properties/property-card";
import type { PublicPropertySummary } from "@/types/public";

export function PropertyGrid({ properties }: { properties: PublicPropertySummary[] }) {
  if (properties.length === 0) {
    return (
      <EmptyState
        icon={Home}
        title="No encontramos propiedades"
        description="Ajusta la búsqueda o los filtros para ver más resultados."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-x-12 gap-y-18 sm:grid-cols-2 lg:grid-cols-3">
      {properties.map((property) => (
        <PropertyCard key={property.id} property={property} />
      ))}
    </div>
  );
}
