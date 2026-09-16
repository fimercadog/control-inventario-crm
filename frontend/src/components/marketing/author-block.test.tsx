import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AuthorBlock } from "./author-block";
import { team } from "./marketing-data";

describe("AuthorBlock", () => {
  it("renders the author name, role, and a link to their profile", () => {
    const author = team[0];
    render(<AuthorBlock author={author} />);
    expect(screen.getByText(author.name)).toBeInTheDocument();
    expect(screen.getByText(author.role)).toBeInTheDocument();
    expect(screen.getByRole("link")).toHaveAttribute("href", `/equipo/${author.slug}`);
  });
});
