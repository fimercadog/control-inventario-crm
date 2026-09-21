import { ProductoDetailView } from "./producto-detail-view";

export function generateStaticParams() {
  return Array.from({ length: 50 }, (_, i) => ({ id: String(i + 1) }));
}

export default function ProductoPage() {
  return <ProductoDetailView />;
}
