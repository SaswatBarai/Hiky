import React from 'react';
import { Spinner, FullScreenSpinner } from './spinner';
import { cn } from '@/lib/utils';

// Loading page variants
export const LoadingPage = ({ 
  className, 
  text = "Loading...", 
  variant = "default",
  showBackground = true,
  ...props 
}) => {
  const backgroundClass = showBackground 
    ? "bg-background" 
    : "bg-transparent";

  return (
    <div 
      className={cn(
        "flex items-center justify-center min-h-screen",
        backgroundClass,
        className
      )}
      {...props}
    >
      <div className="flex flex-col items-center gap-6">
        <Spinner 
          size="xl" 
          text={text}
          variant={variant}
        />
      </div>
    </div>
  );
};

// Compact loading for smaller areas
export const CompactLoading = ({ 
  className, 
  text = "Loading...", 
  size = "default",
  ...props 
}) => {
  return (
    <div 
      className={cn(
        "flex items-center justify-center p-4",
        className
      )}
      {...props}
    >
      <Spinner 
        size={size} 
        text={text}
      />
    </div>
  );
};

// Loading overlay for modals or specific sections
export const LoadingOverlay = ({ 
  className, 
  text = "Loading...", 
  show = true,
  ...props 
}) => {
  if (!show) return null;

  return (
    <div 
      className={cn(
        "absolute inset-0 z-50 flex items-center justify-center",
        "bg-background/80 backdrop-blur-sm",
        className
      )}
      {...props}
    >
      <Spinner 
        size="lg" 
        text={text}
      />
    </div>
  );
};

// Loading for buttons
export const ButtonLoading = ({ 
  className, 
  size = "sm",
  ...props 
}) => {
  return (
    <Spinner 
      size={size} 
      showText={false}
      className={cn("inline-flex", className)}
      {...props}
    />
  );
};

// Loading states for different contexts
export const AuthLoading = ({ text = "Authenticating..." }) => (
  <LoadingPage text={text} variant="dots" />
);

export const DataLoading = ({ text = "Loading data..." }) => (
  <LoadingPage text={text} variant="refresh" />
);

export const MessageLoading = ({ text = "Sending message..." }) => (
  <CompactLoading text={text} size="sm" />
);

export default LoadingPage;