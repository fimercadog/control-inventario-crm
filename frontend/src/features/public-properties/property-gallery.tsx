"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Expand } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { SAMPLE_PROPERTY_IMAGE } from "@/constants/images";
import { cn } from "@/lib/utils";
import type { PublicPropertyImage } from "@/types/public";

export function PropertyGallery({ images, title }: { images: PublicPropertyImage[]; title: string }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  if (images.length === 0) {
    return (
      <div className="realty-animate-scale-in relative aspect-16/10 w-full overflow-hidden bg-muted">
        <Image
          src={SAMPLE_PROPERTY_IMAGE}
          alt={`Imagen de ejemplo para ${title}`}
          fill
          priority
          className="object-cover"
          sizes="(min-width: 1024px) 66vw, 100vw"
        />
      </div>
    );
  }

  const active = images[activeIndex];

  function goTo(index: number) {
    setActiveIndex((index + images.length) % images.length);
  }

  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        onClick={() => setLightboxOpen(true)}
        className="realty-animate-scale-in group relative aspect-16/10 w-full overflow-hidden bg-muted"
      >
        <Image src={active.url} alt={active.alt ?? title} fill priority className="object-cover grayscale" sizes="(min-width: 1024px) 66vw, 100vw" />
        <span className="absolute right-3 bottom-3 flex items-center gap-1.5 rounded-full bg-foreground/80 px-3 py-1.5 text-xs font-medium text-background opacity-0 transition-opacity group-hover:opacity-100">
          <Expand className="size-3.5" />
          Ampliar
        </span>
      </button>

      {images.length > 1 && (
        <div className="grid grid-cols-5 gap-2 sm:grid-cols-6">
          {images.map((image, index) => (
            <button
              key={image.id}
              type="button"
              onClick={() => goTo(index)}
              className={cn(
                "relative aspect-square overflow-hidden ring-2 ring-transparent transition-all",
                index === activeIndex && "ring-primary",
              )}
            >
              <Image src={image.url} alt={image.alt ?? title} fill className="object-cover" sizes="100px" />
            </button>
          ))}
        </div>
      )}

      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-5xl border-none bg-transparent p-0 shadow-none">
          <DialogTitle className="sr-only">{title}</DialogTitle>
          <div className="relative aspect-16/10 w-full overflow-hidden rounded-xl bg-black">
            <Image src={active.url} alt={active.alt ?? title} fill className="object-contain" sizes="90vw" />
          </div>
          {images.length > 1 && (
            <div className="mt-3 flex items-center justify-center gap-3">
              <Button type="button" variant="secondary" size="icon" onClick={() => goTo(activeIndex - 1)} aria-label="Foto anterior">
                <ChevronLeft className="size-4" />
              </Button>
              <span className="text-sm text-white">
                {activeIndex + 1} / {images.length}
              </span>
              <Button type="button" variant="secondary" size="icon" onClick={() => goTo(activeIndex + 1)} aria-label="Foto siguiente">
                <ChevronRight className="size-4" />
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
