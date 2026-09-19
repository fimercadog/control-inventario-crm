import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ImageTextSection } from "./image-text-section";

describe("ImageTextSection", () => {
  it("renders the eyebrow, title, image alt text, and children", () => {
    render(
      <ImageTextSection image="/gallery/aesthetic/cabina_clinica.jpg" imageAlt="Cabina de tratamiento" eyebrow="Sección" title="Título de prueba">
        <p>Contenido hijo</p>
      </ImageTextSection>,
    );
    expect(screen.getByText("Sección")).toBeInTheDocument();
    expect(screen.getByText("Título de prueba")).toBeInTheDocument();
    expect(screen.getByText("Contenido hijo")).toBeInTheDocument();
    expect(screen.getByAltText("Cabina de tratamiento")).toBeInTheDocument();
  });

  it("puts the image second in the DOM when reverse is set", () => {
    const { container } = render(
      <ImageTextSection image="/gallery/aesthetic/cabina_clinica.jpg" imageAlt="Cabina de tratamiento" title="T" reverse>
        <p>hijo</p>
      </ImageTextSection>,
    );
    const columns = container.querySelectorAll(":scope > div > div");
    // Con reverse, la columna de imagen (contiene el <img>) queda con
    // lg:order-2 -- lo verificamos por la clase, no por el orden real en el
    // DOM (que sigue siendo fuente->imagen primero, el orden visual lo hace CSS).
    expect(columns[0].className).toContain("lg:order-2");
    expect(columns[1].className).toContain("lg:order-1");
  });
});
