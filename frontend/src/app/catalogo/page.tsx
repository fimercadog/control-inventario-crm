"use client";

import * as React from "react";
import Link from "next/link";
import { AlertCircle, Check, Package, Plus, Search } from "lucide-react";
import { MarketingLayout } from "@/components/marketing/marketing-layout";
import { PageHero } from "@/components/marketing/page-hero";
import { Section, cardHover } from "@/components/marketing/marketing-ui";
import { cn } from "@/lib/utils";
import {
  fetchCatalog,
  fetchCatalogCategories,
  formatCOP,
  type CatalogCategory,
  type PublicProduct,
} from "@/lib/catalog";
import { useCatalogCart } from "@/lib/catalog-cart";

function AddButton({ product }: { product: PublicProduct }) {
  const { add, items } = useCatalogCart();
  const inCart = items.some((item) => item.id === product.id);
  return (
    <button
      type="button"
      onClick={() => add(product)}
      className={cn(
        "inline-flex h-9 items-center gap-1.5 rounded-full px-4 text-sm font-semibold transition-colors",
        inCart
          ? "bg-success/10 text-success"
          : "bg-primary text-primary-foreground hover:bg-primary-hover",
      )}
    >
      {inCart ? <Check className="size-4" /> : <Plus className="size-4" />}
      {inCart ? "Agregada" : "Agregar"}
    </button>
  );
}

function ProductCard({ product }: { product: PublicProduct }) {
  return (
    <div className={cn("flex flex-col overflow-hidden rounded-2xl border border-border bg-card", cardHover)}>
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
          <AddButton product={product} />
        </div>
      </div>
    </div>
  );
}

export default function CatalogoPage() {
  const [categories, setCategories] = React.useState<CatalogCategory[]>([]);
  const [categoryId, setCategoryId] = React.useState<number | null>(null);
  const [search, setSearch] = React.useState("");
  const [query, setQuery] = React.useState("");
  const [products, setProducts] = React.useState<PublicProduct[]>([]);
  const [page, setPage] = React.useState(1);
  const [lastPage, setLastPage] = React.useState(1);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(false);

  React.useEffect(() => {
    fetchCatalogCategories().then(setCategories).catch(() => {});
  }, []);

  // debounce de la busqueda; al cambiar el termino se vuelve a la pagina 1
  React.useEffect(() => {
    const t = setTimeout(() => {
      setQuery(search.trim());
      setPage(1);
    }, 350);
    return () => clearTimeout(t);
  }, [search]);

  const pickCategory = (id: number | null) => {
    setCategoryId(id);
    setPage(1);
  };

  React.useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setLoading(true);
      setError(false);
      try {
        const res = await fetchCatalog({ category_id: categoryId ?? undefined, q: query || undefined, page });
        if (cancelled) return;
        setProducts((prev) => (page === 1 ? res.data : [...prev, ...res.data]));
        setLastPage(res.meta.last_page);
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [categoryId, query, page]);

  return (
    <MarketingLayout>
      <PageHero
        eyebrow="Catalogo"
        title="Productos disponibles"
        lead="Explora el catalogo, arma tu lista y solicita una cotizacion. Te respondemos con precios y disponibilidad."
        visual="none"
      />

      <Section className="pt-0">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => pickCategory(null)}
              className={cn(
                "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                categoryId === null ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-primary/50",
              )}
            >
              Todo
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => pickCategory(category.id)}
                className={cn(
                  "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                  categoryId === category.id
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border hover:border-primary/50",
                )}
              >
                {category.name}
              </button>
            ))}
          </div>
          <label className="relative w-full lg:w-72">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por nombre o SKU"
              aria-label="Buscar en el catalogo"
              className="h-11 w-full rounded-lg border border-input bg-card pl-9 pr-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
            />
          </label>
        </div>

        {error ? (
          <div className="mt-10 flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
            <AlertCircle className="size-4" /> No se pudo cargar el catalogo. Recarga la pagina.
          </div>
        ) : loading && products.length === 0 ? (
          <p className="mt-10 text-sm text-muted-foreground">Cargando catalogo...</p>
        ) : products.length === 0 ? (
          <p className="mt-10 text-sm text-muted-foreground">No hay productos que coincidan con tu busqueda.</p>
        ) : (
          <>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            {page < lastPage ? (
              <div className="mt-10 text-center">
                <button
                  type="button"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={loading}
                  className="inline-flex h-11 items-center rounded-full border-2 border-current px-6 text-sm font-semibold disabled:opacity-60"
                >
                  {loading ? "Cargando..." : "Ver mas productos"}
                </button>
              </div>
            ) : null}
          </>
        )}
      </Section>
    </MarketingLayout>
  );
}
