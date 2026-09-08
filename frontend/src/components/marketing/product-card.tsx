"use client";

import Link from "next/link";
import { Check, Package, Plus } from "lucide-react";
import { cardHover } from "@/components/marketing/marketing-ui";
import { cn } from "@/lib/utils";
import { formatCOP, type PublicProduct } from "@/lib/catalog";
import { useCatalogCart } from "@/lib/catalog-cart";

/**
 * Card de producto del catálogo público. Compartida por /catalogo y el preview
 * del inicio. `showAdd={false}` oculta el botón "Agregar" (en el inicio la card
 * solo enlaza a la ficha; agregar al carrito ahí era una acción sin contexto).
 */
export function ProductCard({ product, showAdd = true }: { product: PublicProduct; showAdd?: boolean }) {
  return (
    <div className={cn("flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card", cardHover)}>
      <Link href={`/catalogo/${product.id}`} className="block aspect-4/3 bg-muted">
        {product.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.image_url} alt={product.name} className="size-full object-cover" />
        ) : (
          <span className="grid size-full place-items-center text-muted-foreground">
            <Package className="size-10" />
          </span>
        )}
      </Link>
      <div className="flex flex-1 flex-col p-5">
        {product.category ? (
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">{product.category}</p>
        ) : null}
        <Link href={`/catalogo/${product.id}`} className="mt-1 text-base font-bold leading-snug hover:text-primary">
          {product.name}
        </Link>
        {product.description ? (
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">{product.description}</p>
        ) : null}
        <div className="mt-4 flex items-center justify-between gap-3 pt-1">
          <span className="text-lg font-black tracking-tight">{formatCOP(product.unit_price)}</span>
          {showAdd ? <AddButton product={product} /> : null}
        </div>
      </div>
    </div>
  );
}

function AddButton({ product }: { product: PublicProduct }) {
  const { add, items } = useCatalogCart();
  const inCart = items.some((item) => item.id === product.id);
  return (
    <button
      type="button"
      onClick={() => add(product)}
      className={cn(
        "inline-flex h-9 items-center gap-1.5 rounded-full px-4 text-sm font-semibold transition-colors",
        inCart ? "bg-success/10 text-success" : "bg-primary text-primary-foreground hover:bg-primary-hover",
      )}
    >
      {inCart ? <Check className="size-4" /> : <Plus className="size-4" />}
      {inCart ? "Agregada" : "Agregar"}
    </button>
  );
}
