import { ProductPage } from "@/components/marketing/product-page";
import { productPages } from "@/components/marketing/marketing-data";

export default function AgendaProductPage() {
  return <ProductPage {...productPages.agenda} />;
}
