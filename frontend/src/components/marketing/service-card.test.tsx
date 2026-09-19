import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ServiceCard, ServiceGrid } from "./service-card";
import { services } from "./marketing-data";

describe("Service icons", () => {
  it("has a Lucide icon defined for every service", () => {
    for (const service of services) {
      expect(service.icon, `falta ícono para ${service.slug}`).toBeDefined();
    }
  });
});

describe("ServiceCard", () => {
  it("renders the title and links to the service detail page", () => {
    const service = services[0];
    render(<ServiceCard service={service} />);
    expect(screen.getByText(service.title)).toBeInTheDocument();
    expect(screen.getByRole("link")).toHaveAttribute("href", `/servicios/${service.slug}`);
  });
});

describe("ServiceGrid", () => {
  it("renders one card per service", () => {
    render(<ServiceGrid services={services} />);
    expect(screen.getAllByRole("link")).toHaveLength(services.length);
  });
});
