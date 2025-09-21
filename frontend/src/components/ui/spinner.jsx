import React from 'react';
import { Loader2, LoaderCircle, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

export const Spinner = React.forwardRef(({ 
  className, 
  size = "default", 
  variant = "default",
  text = "Loading...",
  showText = true,
  ...props 
}, ref) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    default: "h-6 w-6", 
    lg: "h-8 w-8",
    xl: "h-12 w-12"
  };

  const textSizeClasses = {
    sm: "text-sm",
    default: "text-base",
    lg: "text-lg", 
    xl: "text-xl"
  };

  const getSpinnerIcon = () => {
    switch (variant) {
      case "dots":
        return <LoaderCircle className={cn("animate-spin", sizeClasses[size])} />;
      case "refresh":
        return <RefreshCw className={cn("animate-spin", sizeClasses[size])} />;
      default:
        return <Loader2 className={cn("animate-spin", sizeClasses[size])} />;
    }
  };

  return (
    <div 
      ref={ref}
      className={cn(
        "flex flex-col items-center justify-center gap-3",
        className
      )}
      {...props}
    >
      <div className="relative">
        {/* Main spinner with green neon color */}
        <div className="text-green-500 dark:text-green-400 drop-shadow-[0_0_8px_rgba(34,197,94,0.6)]">
          {getSpinnerIcon()}
        </div>
        
        {/* Optional pulsing ring for extra visual appeal */}
        {variant === "default" && (
          <div className="absolute inset-0 rounded-full border-2 border-green-500/30 dark:border-green-400/30 animate-ping drop-shadow-[0_0_8px_rgba(34,197,94,0.3)]" />
        )}
      </div>
      
      {showText && text && (
        <p className={cn(
          "text-green-600 dark:text-green-400 font-medium animate-pulse drop-shadow-[0_0_4px_rgba(34,197,94,0.4)]",
          textSizeClasses[size]
        )}>
          {text}
        </p>
      )}
    </div>
  );
});

Spinner.displayName = "Spinner";

// Additional spinner variants
export const DotsSpinner = React.forwardRef(({ className, ...props }, ref) => (
  <Spinner 
    ref={ref}
    variant="dots" 
    className={className} 
    {...props} 
  />
));

export const RefreshSpinner = React.forwardRef(({ className, ...props }, ref) => (
  <Spinner 
    ref={ref}
    variant="refresh" 
    className={className} 
    {...props} 
  />
));

// Full screen loading spinner
export const FullScreenSpinner = React.forwardRef(({ 
  className, 
  text = "Loading...",
  ...props 
}, ref) => (
  <div 
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 flex items-center justify-center",
      "bg-background/90 backdrop-blur-sm",
      className
    )}
    {...props}
  >
    <div className="flex flex-col items-center gap-6">
      <Spinner size="xl" text={text} />
    </div>
  </div>
));

// Inline spinner for buttons and small spaces
export const InlineSpinner = React.forwardRef(({ className, ...props }, ref) => (
  <Spinner 
    ref={ref}
    size="sm" 
    showText={false}
    className={cn("inline-flex", className)} 
    {...props} 
  />
));

export default Spinner;
