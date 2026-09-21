import { ProductoDetailView } from "./producto-detail-view";

export function generateStaticParams() {
  return [{ id: "1" }];
}

export default function ProductoPage() {
  return <ProductoDetailView />;
}
