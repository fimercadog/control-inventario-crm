import { ProductPage } from "@/components/marketing/product-page";
import { productPages } from "@/components/marketing/marketing-data";

export default function PacientesProductPage() {
  return <ProductPage {...productPages.pacientes} />;
}
