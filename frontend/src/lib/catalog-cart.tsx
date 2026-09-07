"use client";

import * as React from "react";
import type { PublicProduct } from "@/lib/catalog";

export type CartItem = {
  id: number;
  name: string;
  sku: string;
  unit_price: number;
  quantity: number;
};

const STORAGE_KEY = "catalogo-cotizacion";
const EMPTY: CartItem[] = [];

// Store externo (patron useSyncExternalStore): SSR-safe y sin setState en efecto.
// El carrito vive en localStorage; los cambios en la misma pestana se propagan
// por `listeners`, los de otras pestanas por el evento `storage`.
let cart: CartItem[] = EMPTY;
const listeners = new Set<() => void>();

function readStorage(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return EMPTY;
    // Descartar entradas con forma invalida (schema viejo, escritura parcial):
    // evita "$NaN" y payloads con undefined al cotizar.
    return parsed.filter(
      (item): item is CartItem =>
        item &&
        Number.isFinite(item.id) &&
        Number.isFinite(item.unit_price) &&
        Number.isFinite(item.quantity) &&
        item.quantity > 0,
    );
  } catch {
    return EMPTY;
  }
}

if (typeof window !== "undefined") {
  cart = readStorage();
  window.addEventListener("storage", (event) => {
    if (event.key === STORAGE_KEY) {
      cart = readStorage();
      listeners.forEach((l) => l());
    }
  });
}

function setCart(next: CartItem[]) {
  cart = next;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* almacenamiento bloqueado: el carrito vive solo en memoria */
  }
  listeners.forEach((l) => l());
}

const clamp = (n: number) => Math.max(1, Math.min(100000, Math.round(n) || 1));

export function useCatalogCart() {
  const items = React.useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => cart,
    () => EMPTY,
  );

  return React.useMemo(
    () => ({
      items,
      count: items.reduce((sum, item) => sum + item.quantity, 0),
      total: items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0),
      add: (product: PublicProduct, quantity = 1) => {
        const existing = cart.find((item) => item.id === product.id);
        setCart(
          existing
            ? cart.map((item) =>
                item.id === product.id ? { ...item, quantity: clamp(item.quantity + quantity) } : item,
              )
            : [
                ...cart,
                {
                  id: product.id,
                  name: product.name,
                  sku: product.sku,
                  unit_price: Number(product.unit_price),
                  quantity: clamp(quantity),
                },
              ],
        );
      },
      setQty: (id: number, quantity: number) =>
        setCart(cart.map((item) => (item.id === id ? { ...item, quantity: clamp(quantity) } : item))),
      remove: (id: number) => setCart(cart.filter((item) => item.id !== id)),
      clear: () => setCart(EMPTY),
    }),
    [items],
  );
}

/** Sin estado propio: se deja como punto unico de montaje por si luego hay contexto. */
export function CatalogCartProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
