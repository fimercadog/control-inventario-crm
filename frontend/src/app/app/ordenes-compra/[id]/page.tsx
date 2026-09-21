import { OrdenCompraDetailView } from "./orden-compra-detail-view";

export function generateStaticParams() {
  return [{ id: "1" }];
}

export default function PurchaseOrderDetailPage() {
  return <OrdenCompraDetailView />;
}
