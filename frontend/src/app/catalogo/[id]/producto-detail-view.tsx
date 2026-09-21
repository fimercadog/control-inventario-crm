"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Check, Package } from "lucide-react";
import { MarketingLayout } from "@/components/marketing/marketing-layout";
import { Section } from "@/components/marketing/marketing-ui";
import { fetchCatalogProduct, formatCOP, type PublicProduct } from "@/lib/catalog";
import { useCatalogCart } from "@/lib/catalog-cart";

export function ProductoDetailView() {
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
            <h1 className="text-2xl font-extrabold tracking-tight">Producto no disponible</h1>
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
              {product.image_url ? (
                <img src={product.image_url} alt={product.name} className="h-96 w-full object-cover" />
              ) : (
                <div className="flex h-96 w-full items-center justify-center bg-muted">
                  <Package className="size-20 text-muted-foreground/40" />
                </div>
              )}
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {product.category || "General"}
              </p>
              <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-foreground">{product.name}</h1>
              {product.sku ? <p className="mt-1 text-xs text-muted-foreground">SKU: {product.sku}</p> : null}
              <p className="mt-4 text-3xl font-black text-primary">{formatCOP(product.unit_price)}</p>

              {product.description ? (
                <p className="mt-6 text-sm text-muted-foreground leading-relaxed">{product.description}</p>
              ) : null}

              <div className="mt-8 flex items-center gap-4">
                <input
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="h-11 w-20 rounded-lg border border-border bg-card px-3 text-center font-bold"
                />
                <button
                  type="button"
                  onClick={() => {
                    add(product, quantity);
                    setAdded(true);
                    setTimeout(() => setAdded(false), 2000);
                  }}
                  className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-6 font-semibold text-primary-foreground transition hover:opacity-90"
                >
                  {added ? <Check className="size-5" /> : null}
                  {added ? "Agregado" : inCart ? "Agregar mas" : "Agregar a la cotizacion"}
                </button>
              </div>

              <div className="mt-8 rounded-xl border border-border bg-card p-4">
                <p className="text-xs font-semibold text-muted-foreground">💡 ¿Necesitas este insumo o servicio con urgencia?</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Solicita una cotizacion formal directamente a traves de nuestro sistema.
                </p>
                <Link
                  href="/catalogo/cotizacion"
                  className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-primary underline"
                >
                  Ir al carrito de cotizacion →
                </Link>
              </div>
            </div>
          </div>
        )}
      </Section>
    </MarketingLayout>
  );
}
