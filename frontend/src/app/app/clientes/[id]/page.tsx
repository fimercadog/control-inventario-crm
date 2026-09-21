import { ClienteDetailView } from "./cliente-detail-view";

export function generateStaticParams() {
  return [{ id: "1" }];
}

export default function ClientDetailPage() {
  return <ClienteDetailView />;
}
