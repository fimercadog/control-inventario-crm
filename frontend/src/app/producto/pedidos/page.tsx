import { ProductPage } from "@/components/marketing/product-page";
import { productPages } from "@/components/marketing/marketing-data";

export default function pedidosProductPage() {
  return <ProductPage {...productPages.pedidos} />;
}
