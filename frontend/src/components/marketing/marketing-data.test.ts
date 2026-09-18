import { describe, expect, it } from "vitest";
import {
  adjacentPosts,
  blogPostBySlug,
  blogPosts,
  relatedPosts,
  serviceBySlug,
  services,
  teamBySlug,
} from "./marketing-data";

describe("blogPostBySlug", () => {
  it("finds an existing post by slug", () => {
    const post = blogPostBySlug(blogPosts[0].slug);
    expect(post).toBe(blogPosts[0]);
  });

  it("returns undefined for an unknown slug", () => {
    expect(blogPostBySlug("no-existe")).toBeUndefined();
  });
});

describe("relatedPosts", () => {
  it("never includes the post itself", () => {
    const post = blogPosts[0];
    const related = relatedPosts(post);
    expect(related.find((p) => p.slug === post.slug)).toBeUndefined();
  });

  it("prioritizes posts from the same category", () => {
    const post = blogPosts[0];
    const sameCategory = blogPosts.filter((p) => p.slug !== post.slug && p.category === post.category);
    const related = relatedPosts(post, blogPosts.length - 1);
    // Todos los de la misma categoria deben aparecer antes que los de otra.
    const firstOtherCategoryIndex = related.findIndex((p) => p.category !== post.category);
    if (firstOtherCategoryIndex !== -1) {
      const sameCategoryAfter = related.slice(firstOtherCategoryIndex).some((p) => p.category === post.category);
      expect(sameCategoryAfter).toBe(false);
    }
    expect(related.filter((p) => p.category === post.category).length).toBe(sameCategory.length);
  });

  it("respects the limit", () => {
    const limit = Math.min(2, blogPosts.length - 1);
    expect(relatedPosts(blogPosts[0], limit)).toHaveLength(limit);
  });
});

describe("adjacentPosts", () => {
  it("first post has no previous", () => {
    const { prev } = adjacentPosts(blogPosts[0]);
    expect(prev).toBeNull();
  });

  it("last post has no next", () => {
    const { next } = adjacentPosts(blogPosts[blogPosts.length - 1]);
    expect(next).toBeNull();
  });

  it("middle post has both neighbors matching array order", () => {
    if (blogPosts.length > 2) {
      const post = blogPosts[1];
      const { prev, next } = adjacentPosts(post);
      expect(prev).toBe(blogPosts[0]);
      expect(next).toBe(blogPosts[2]);
    }
  });
});

describe("serviceBySlug / teamBySlug", () => {
  it("finds an existing service", () => {
    expect(serviceBySlug(services[0].slug)).toBe(services[0]);
  });

  it("returns undefined for an unknown service", () => {
    expect(serviceBySlug("no-existe")).toBeUndefined();
  });

  it("finds an existing team member", () => {
    expect(teamBySlug("maria-elena-gomez")?.name).toBe("Lic. María Elena Gómez");
  });
});

describe("blog post content completeness", () => {
  it("every post has a non-empty body, image, and a valid author", () => {
    for (const post of blogPosts) {
      expect(post.body.length).toBeGreaterThan(0);
      expect(post.image).toMatch(/^\/(gallery|carenote)\//);
      expect(teamBySlug(post.authorSlug)).toBeDefined();
    }
  });
});
