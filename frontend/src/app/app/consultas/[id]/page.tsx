import { ConsultaDetailView } from "./consulta-detail-view";

export function generateStaticParams() {
  return [{ id: "1" }];
}

export default function ConsultationDetailPage() {
  return <ConsultaDetailView />;
}
