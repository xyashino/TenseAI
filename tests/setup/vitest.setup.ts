import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";

afterEach(() => {
  cleanup();
});

Element.prototype.scrollIntoView = vi.fn();

if (!Element.prototype.hasPointerCapture) {
  Element.prototype.hasPointerCapture = function (_pointerId: number): boolean {
    return false;
  };
}

if (!Element.prototype.setPointerCapture) {
  Element.prototype.setPointerCapture = function (_pointerId: number): void {
    // No-op implementation for testing
  };
}

if (!Element.prototype.releasePointerCapture) {
  Element.prototype.releasePointerCapture = function (_pointerId: number): void {
    // No-op implementation for testing
  };
}
