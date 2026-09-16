import { SectionHeading } from "@/components/marketing/marketing-ui";
import { BlogCard } from "@/components/marketing/blog-card";
import type { BlogPost } from "@/components/marketing/marketing-data";

export function RelatedPosts({ posts }: { posts: BlogPost[] }) {
  if (posts.length === 0) return null;

  return (
    <div>
      <SectionHeading eyebrow="Seguí leyendo" title="Otras notas que te pueden interesar" center={false} />
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post, i) => (
          <BlogCard key={post.slug} post={post} delay={i * 0.06} />
        ))}
      </div>
    </div>
  );
}
