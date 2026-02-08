import { Component, type ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center px-6" data-testid="error-boundary">
          <div className="text-center max-w-sm">
            <div className="w-16 h-16 bg-rose-100 dark:bg-rose-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-rose-500" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">Something went wrong</h2>
            <p className="text-sm text-muted-foreground mb-6">
              An unexpected error occurred. Try refreshing the page.
            </p>
            <Button
              onClick={() => window.location.reload()}
              className="gap-2"
              data-testid="button-refresh"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh Page
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
