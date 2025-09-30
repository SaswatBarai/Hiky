import React from 'react';
import { FullScreenSpinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  // Catches JavaScript errors anywhere in the child component tree
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  // Logs error details and updates state
  componentDidCatch(error, errorInfo) {
    console.error('Error Boundary caught an error:', error, errorInfo);
    this.setState({ error: error, errorInfo: errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="max-w-md w-full mx-4 text-center space-y-6">
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-foreground">Something went wrong</h1>
              <p className="text-muted-foreground">
                We're sorry, but something unexpected happened. Please try refreshing the page.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={this.handleReload} className="w-full sm:w-auto">
                Refresh Page
              </Button>
              <Button 
                onClick={this.handleReset} 
                variant="outline"
                className="w-full sm:w-auto"
              >
                Try Again
              </Button>
            </div>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-sm font-medium mb-2">
                  Error Details (Development)
                </summary>
                <pre className="text-xs bg-muted p-3 rounded-md overflow-auto">
                  {this.state.error.toString()}
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;