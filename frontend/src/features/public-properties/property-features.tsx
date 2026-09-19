import { PROPERTY_TYPE_LABELS } from "@/types/property";
import { currencyFormatter } from "@/features/public-properties/format";
import type { PublicPropertyDetail } from "@/types/public";

interface FeatureItem {
  label: string;
  value: string;
}

export function PropertyFeatures({ property }: { property: PublicPropertyDetail }) {
  const items: FeatureItem[] = [
    { label: "Tipo", value: PROPERTY_TYPE_LABELS[property.property_type] },
    property.bedrooms !== null && { label: "Habitaciones", value: String(property.bedrooms) },
    property.bathrooms !== null && { label: "Baños", value: String(property.bathrooms) },
    property.parking_spots !== null && { label: "Parqueaderos", value: String(property.parking_spots) },
    property.built_area !== null && { label: "Área construida", value: `${property.built_area} m²` },
    property.private_area !== null && { label: "Área privada", value: `${property.private_area} m²` },
    property.stratum !== null && { label: "Estrato", value: String(property.stratum) },
    property.admin_fee !== null && { label: "Administración", value: currencyFormatter.format(property.admin_fee) },
    property.year_built !== null && { label: "Año de construcción", value: String(property.year_built) },
  ].filter((item): item is FeatureItem => Boolean(item));

  return (
    <div className="grid gap-x-16 sm:grid-cols-2">
      {items.map((item) => (
        <div key={item.label} className="grid grid-cols-2 border-b border-black/10 py-5 text-sm">
          <p className="font-extrabold text-[0.7rem] tracking-wide text-(--realty-primary) uppercase">{item.label}</p>
          <p className="text-muted-foreground">{item.value}</p>
        </div>
      ))}
    </div>
  );
}
