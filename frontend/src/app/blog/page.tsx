"use client";

import * as React from "react";
import { MarketingLayout } from "@/components/marketing/marketing-layout";
import { SplitHero } from "@/components/marketing/split-hero";
import { Section } from "@/components/marketing/marketing-ui";
import { BlogCard, FeaturedPost } from "@/components/marketing/blog-card";
import { blogCategories, blogPosts } from "@/components/marketing/marketing-data";
import { cn } from "@/lib/utils";

export default function BlogPage() {
  const [category, setCategory] = React.useState<string | null>(null);

  const [featured, ...rest] = blogPosts;
  const filtered = category ? rest.filter((p) => p.category === category) : rest;
  const showFeatured = !category || category === featured.category;

  return (
    <MarketingLayout>
      <SplitHero
        eyebrow="Blog Deportivo"
        title="Consejos de formación, táctica y nutrición para jóvenes futbolistas"
        lead="Nutrición deportiva, preparación física, técnica individual y psicología del deporte para jóvenes atletas y acudientes."
        image="/gallery/illustrations/illustration-10.png"
        imageAlt="Balón de fútbol y laptop con táctica deportiva"
      />

      <Section className="pt-0">
        <div className="flex flex-wrap justify-center gap-2">
          <button
            type="button"
            onClick={() => setCategory(null)}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors",
              category === null ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/70",
            )}
          >
            Todas
          </button>
          {blogCategories.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors",
                category === c ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/70",
              )}
            >
              {c}
            </button>
          ))}
        </div>

        {showFeatured && (
          <div className="mt-12">
            <FeaturedPost post={featured} />
          </div>
        )}

        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((post) => (
            <BlogCard key={post.slug} post={post} />
          ))}
        </div>
      </Section>
    </MarketingLayout>
  );
}
