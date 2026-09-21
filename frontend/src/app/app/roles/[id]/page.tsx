import { RolDetailView } from "./rol-detail-view";

export function generateStaticParams() {
  return [{ id: "1" }];
}

export default function RoleDetailPage() {
  return <RolDetailView />;
}
