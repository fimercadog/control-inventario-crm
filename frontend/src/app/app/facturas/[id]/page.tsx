import { FacturaDetailView } from "./factura-detail-view";

export function generateStaticParams() {
  return [{ id: "1" }];
}

export default function InvoiceDetailPage() {
  return <FacturaDetailView />;
}
