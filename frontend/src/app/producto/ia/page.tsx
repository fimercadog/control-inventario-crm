import { ProductPage } from "@/components/marketing/product-page";
import { productPages } from "@/components/marketing/marketing-data";

export default function iaProductPage() {
  return <ProductPage {...productPages.ia} />;
}
