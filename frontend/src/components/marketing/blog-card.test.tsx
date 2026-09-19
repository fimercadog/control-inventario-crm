import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { BlogCard, FeaturedPost } from "./blog-card";
import { blogPosts } from "./marketing-data";

const post = blogPosts[0];

describe("BlogCard", () => {
  it("renders the title, category, and a link to the post", () => {
    render(<BlogCard post={post} />);
    expect(screen.getByText(post.title)).toBeInTheDocument();
    expect(screen.getByText(new RegExp(post.category))).toBeInTheDocument();
    expect(screen.getByRole("link")).toHaveAttribute("href", `/blog/${post.slug}`);
  });

  it("shows the publish date", () => {
    render(<BlogCard post={post} />);
    expect(screen.getByText(/de agosto de 2026/)).toBeInTheDocument();
  });
});

describe("FeaturedPost", () => {
  it("renders the author name and links to the post", () => {
    render(<FeaturedPost post={post} />);
    expect(screen.getByRole("link")).toHaveAttribute("href", `/blog/${post.slug}`);
    expect(screen.getByText("Dra. Sofía Valenzuela")).toBeInTheDocument();
  });
});
