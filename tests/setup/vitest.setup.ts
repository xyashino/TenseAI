import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { configure } from "@testing-library/react";

// Configure testing library to use data-test-id instead of data-testid
configure({ testIdAttribute: "data-test-id" });

afterEach(() => {
  cleanup();
});

Element.prototype.scrollIntoView = vi.fn();

if (!Element.prototype.hasPointerCapture) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Element.prototype.hasPointerCapture = function (_pointerId: number): boolean {
    return false;
  };
}

if (!Element.prototype.setPointerCapture) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Element.prototype.setPointerCapture = function (_pointerId: number): void {
    // No-op implementation for testing
  };
}

if (!Element.prototype.releasePointerCapture) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Element.prototype.releasePointerCapture = function (_pointerId: number): void {
    // No-op implementation for testing
  };
}
