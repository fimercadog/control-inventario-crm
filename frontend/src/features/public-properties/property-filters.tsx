"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PROPERTY_TYPE_LABELS, PROPERTY_TYPES } from "@/types/property";

const ANY_VALUE = "__any__";

function selectValue(current: string | null): string {
  return current ?? ANY_VALUE;
}

interface PropertyFiltersProps {
  basePath?: string;
  hideListingType?: boolean;
}

export function PropertyFilters({ basePath = "/propiedades", hideListingType = false }: PropertyFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [city, setCity] = useState(searchParams.get("city") ?? "");
  const [priceMin, setPriceMin] = useState(searchParams.get("price_min") ?? "");
  const [priceMax, setPriceMax] = useState(searchParams.get("price_max") ?? "");

  function updateParam(key: string, value: string | undefined) {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== ANY_VALUE) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page");
    router.push(`${basePath}?${params.toString()}`);
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (city) params.set("city", city);
    else params.delete("city");
    if (priceMin) params.set("price_min", priceMin);
    else params.delete("price_min");
    if (priceMax) params.set("price_max", priceMax);
    else params.delete("price_max");
    params.delete("page");
    router.push(`${basePath}?${params.toString()}`);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 bg-(--realty-surface) p-5">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {!hideListingType && (
          <Select value={selectValue(searchParams.get("listing_type"))} onValueChange={(v) => updateParam("listing_type", v)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Comprar o arrendar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ANY_VALUE}>Comprar o arrendar</SelectItem>
              <SelectItem value="venta">Comprar</SelectItem>
              <SelectItem value="arriendo">Arrendar</SelectItem>
            </SelectContent>
          </Select>
        )}

        <Select value={selectValue(searchParams.get("property_type"))} onValueChange={(v) => updateParam("property_type", v)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Tipo de inmueble" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ANY_VALUE}>Todos los tipos</SelectItem>
            {PROPERTY_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {PROPERTY_TYPE_LABELS[type]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectValue(searchParams.get("bedrooms"))} onValueChange={(v) => updateParam("bedrooms", v)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Habitaciones" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ANY_VALUE}>Habitaciones</SelectItem>
            {[1, 2, 3, 4, 5].map((n) => (
              <SelectItem key={n} value={String(n)}>
                {n}+ habitaciones
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectValue(searchParams.get("bathrooms"))} onValueChange={(v) => updateParam("bathrooms", v)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Baños" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ANY_VALUE}>Baños</SelectItem>
            {[1, 2, 3, 4].map((n) => (
              <SelectItem key={n} value={String(n)}>
                {n}+ baños
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-3 sm:grid-cols-4">
        <Input placeholder="Ciudad" value={city} onChange={(e) => setCity(e.target.value)} className="sm:col-span-2" />
        <Input type="number" min={0} placeholder="Precio mínimo" value={priceMin} onChange={(e) => setPriceMin(e.target.value)} />
        <Input type="number" min={0} placeholder="Precio máximo" value={priceMax} onChange={(e) => setPriceMax(e.target.value)} />
      </div>

      <Button type="submit" className="h-9 rounded-full bg-(--realty-accent) px-5 text-[0.68rem] font-extrabold uppercase text-white hover:bg-(--realty-accent)/90 sm:w-fit">
        <Search />
        Aplicar filtros
      </Button>
    </form>
  );
}
