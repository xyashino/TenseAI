import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { RenderOptions } from "@testing-library/react";
import { render as rtlRender } from "@testing-library/react";
import { type ReactElement, type ReactNode } from "react";

vi.mock("astro:transitions/client", () => ({
  navigate: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });

function render(ui: ReactElement, options?: RenderOptions) {
  const testQueryClient = createTestQueryClient();

  function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={testQueryClient}>{children}</QueryClientProvider>;
  }

  return rtlRender(ui, { wrapper: Wrapper, ...options });
}

export {
  act,
  findByLabelText,
  findByRole,
  findByTestId,
  findByText,
  fireEvent,
  getAllByLabelText,
  getAllByRole,
  getAllByTestId,
  getAllByText,
  getByLabelText,
  getByRole,
  getByTestId,
  getByText,
  queryByLabelText,
  queryByRole,
  queryByTestId,
  queryByText,
  screen,
  waitFor,
  waitForElementToBeRemoved,
  within,
} from "@testing-library/react";
export { render };
