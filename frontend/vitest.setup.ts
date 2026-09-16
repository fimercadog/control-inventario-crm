import "@testing-library/jest-dom/vitest";

// jsdom no implementa IntersectionObserver (lo usa <Reveal> para el fade-in
// on-scroll). Stub mínimo: nunca dispara, alcanza para que el componente
// monte sin explotar en tests que no verifican la animación en sí.
class IntersectionObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
// @ts-expect-error -- stub global, no implementa la interfaz completa a propósito
globalThis.IntersectionObserver = IntersectionObserverStub;
