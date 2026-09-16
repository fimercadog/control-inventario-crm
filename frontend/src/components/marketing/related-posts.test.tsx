import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { RelatedPosts } from "./related-posts";
import { blogPosts } from "./marketing-data";

describe("RelatedPosts", () => {
  it("renders nothing for an empty list", () => {
    const { container } = render(<RelatedPosts posts={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders a card per post", () => {
    const posts = blogPosts.slice(0, 3);
    render(<RelatedPosts posts={posts} />);
    for (const post of posts) {
      expect(screen.getByText(post.title)).toBeInTheDocument();
    }
  });
});
