import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";

afterEach(() => {
  cleanup();
});

Element.prototype.scrollIntoView = vi.fn();

if (!Element.prototype.hasPointerCapture) {
  Element.prototype.hasPointerCapture = function (pointerId: number): boolean {
    return false;
  };
}

if (!Element.prototype.setPointerCapture) {
  Element.prototype.setPointerCapture = function (pointerId: number): void {};
}

if (!Element.prototype.releasePointerCapture) {
  Element.prototype.releasePointerCapture = function (pointerId: number): void {};
}
