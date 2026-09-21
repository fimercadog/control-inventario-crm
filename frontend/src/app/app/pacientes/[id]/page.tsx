import { PacienteDetailView } from "./paciente-detail-view";

export function generateStaticParams() {
  return [{ id: "1" }];
}

export default function PatientDetailPage() {
  return <PacienteDetailView />;
}
