"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Check, Package } from "lucide-react";
import { MarketingLayout } from "@/components/marketing/marketing-layout";
import { Section } from "@/components/marketing/marketing-ui";
import { fetchCatalogProduct, formatCOP, type PublicProduct } from "@/lib/catalog";
import { useCatalogCart } from "@/lib/catalog-cart";

export default function ProductoPage() {
  const { id } = useParams<{ id: string }>();
  const { add, items } = useCatalogCart();
  const [product, setProduct] = React.useState<PublicProduct | null>(null);
  const [status, setStatus] = React.useState<"loading" | "ready" | "missing">("loading");
  const [quantity, setQuantity] = React.useState(1);
  const [added, setAdded] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    fetchCatalogProduct(id)
      .then((data) => {
        if (cancelled) return;
        setProduct(data);
        setStatus("ready");
      })
      .catch(() => {
        if (!cancelled) setStatus("missing");
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const inCart = product ? items.some((item) => item.id === product.id) : false;

  return (
    <MarketingLayout>
      <Section>
        <Link href="/catalogo" className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
          <ArrowLeft className="size-4" /> Catalogo
        </Link>

        {status === "loading" ? (
          <p className="mt-10 text-sm text-muted-foreground">Cargando producto...</p>
        ) : status === "missing" || !product ? (
          <div className="mt-10">
            <h1 className="text-2xl font-black tracking-tight">Producto no disponible</h1>
            <p className="mt-3 text-sm text-muted-foreground">
              Este producto no esta en el catalogo publico.{" "}
              <Link href="/catalogo" className="font-medium text-primary underline">
                Volver al catalogo
              </Link>
              .
            </p>
          </div>
        ) : (
          <div className="mt-8 grid gap-10 lg:grid-cols-2 lg:items-start">
            <div className="overflow-hidden rounded-2xl border border-border bg-muted">
              <div className="aspect-square">
                {product.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={product.image_url} alt={product.name} className="size-full object-cover" />
                ) : (
                  <span className="grid size-full place-items-center text-muted-foreground">
                    <Package className="size-16" />
                  </span>
                )}
              </div>
            </div>

            <div>
              {product.category ? (
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">{product.category}</p>
              ) : null}
              <h1 className="mt-2 text-3xl font-black leading-tight tracking-tight sm:text-4xl">{product.name}</h1>
              <dl className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted-foreground">
                <div className="flex gap-1.5">
                  <dt className="font-medium">SKU:</dt>
                  <dd>{product.sku}</dd>
                </div>
                {product.brand ? (
                  <div className="flex gap-1.5">
                    <dt className="font-medium">Marca:</dt>
                    <dd>{product.brand}</dd>
                  </div>
                ) : null}
                {product.unit ? (
                  <div className="flex gap-1.5">
                    <dt className="font-medium">Unidad:</dt>
                    <dd>{product.unit}</dd>
                  </div>
                ) : null}
              </dl>

              <p className="mt-6 text-3xl font-black tracking-tight">{formatCOP(product.unit_price)}</p>

              {product.description ? (
                <p className="mt-5 text-base leading-8 text-muted-foreground">{product.description}</p>
              ) : null}

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <label className="flex items-center gap-2 text-sm">
                  <span className="font-medium">Cantidad</span>
                  <input
                    type="number"
                    min={1}
                    value={quantity}
                    onChange={(event) => setQuantity(Math.max(1, Number(event.target.value) || 1))}
                    className="h-11 w-20 rounded-lg border border-input bg-card px-3 text-sm outline-none focus:border-primary"
                  />
                </label>
                <button
                  type="button"
                  onClick={() => {
                    add(product, quantity);
                    setAdded(true);
                  }}
                  className="inline-flex h-11 items-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover"
                >
                  <Check className="size-4" />
                  Agregar a cotizacion
                </button>
                {added || inCart ? (
                  <Link
                    href="/catalogo/cotizacion"
                    className="inline-flex h-11 items-center rounded-full border-2 border-current px-6 text-sm font-semibold"
                  >
                    Ir a la cotizacion
                  </Link>
                ) : null}
              </div>
            </div>
          </div>
        )}
      </Section>
    </MarketingLayout>
  );
}
