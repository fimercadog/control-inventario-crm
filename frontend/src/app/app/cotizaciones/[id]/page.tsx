import { CotizacionDetailView } from "./cotizacion-detail-view";

export function generateStaticParams() {
  return [{ id: "1" }];
}

export default function QuoteDetailPage() {
  return <CotizacionDetailView />;
}
