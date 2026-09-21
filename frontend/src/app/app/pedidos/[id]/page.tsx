import { PedidoDetailView } from "./pedido-detail-view";

export function generateStaticParams() {
  return [{ id: "1" }];
}

export default function OrderDetailPage() {
  return <PedidoDetailView />;
}
