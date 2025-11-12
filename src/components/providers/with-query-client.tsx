import { QueryClient, QueryClientProvider as TanstackQueryClientProvider } from "@tanstack/react-query";
import type { ComponentType } from "react";

const queryClient = new QueryClient();

export function withQueryClient<P extends object>(Component: ComponentType<P>) {
  return function WrappedComponent(props: P) {
    return (
      <TanstackQueryClientProvider client={queryClient}>
        <Component {...props} />
      </TanstackQueryClientProvider>
    );
  };
}
