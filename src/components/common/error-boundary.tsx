import { Component, type ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  context?: string;
  defaultMessage?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const context = this.props.context || "Component";
    const errorMessage = `${context} error:`;

    // Log error for debugging (in production, this would go to an error tracking service)
    if (process.env.NODE_ENV === "development") {
      // eslint-disable-next-line no-console
      console.error(errorMessage, error, errorInfo);
    }

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="bg-destructive text-destructive-foreground p-4 rounded-md">
          {this.state.error?.message ||
            this.props.defaultMessage ||
            "Something went wrong. Please try refreshing the page."}
        </div>
      );
    }

    return this.props.children;
  }
}
