import React, { useState } from 'react';
import { Button } from './button';
import { 
  Spinner, 
  DotsSpinner, 
  RefreshSpinner, 
  FullScreenSpinner,
  InlineSpinner 
} from './spinner';
import { 
  LoadingPage, 
  CompactLoading, 
  LoadingOverlay, 
  ButtonLoading,
  AuthLoading,
  DataLoading,
  MessageLoading 
} from './loading-page';

// Example component showing different spinner usage
export const SpinnerExamples = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);

  const handleButtonClick = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 2000);
  };

  const handleOverlayToggle = () => {
    setShowOverlay(!showOverlay);
  };

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-bold text-foreground mb-8">Spinner Components</h1>
      
      {/* Basic Spinners */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-foreground">Basic Spinners</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 border rounded-lg">
            <h3 className="font-medium mb-2">Default Spinner</h3>
            <Spinner text="Loading..." />
          </div>
          
          <div className="p-4 border rounded-lg">
            <h3 className="font-medium mb-2">Dots Spinner</h3>
            <DotsSpinner text="Processing..." />
          </div>
          
          <div className="p-4 border rounded-lg">
            <h3 className="font-medium mb-2">Refresh Spinner</h3>
            <RefreshSpinner text="Refreshing..." />
          </div>
        </div>
      </section>

      {/* Size Variants */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-foreground">Size Variants</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="p-4 border rounded-lg text-center">
            <h3 className="font-medium mb-2">Small</h3>
            <Spinner size="sm" text="Small" />
          </div>
          
          <div className="p-4 border rounded-lg text-center">
            <h3 className="font-medium mb-2">Default</h3>
            <Spinner size="default" text="Default" />
          </div>
          
          <div className="p-4 border rounded-lg text-center">
            <h3 className="font-medium mb-2">Large</h3>
            <Spinner size="lg" text="Large" />
          </div>
          
          <div className="p-4 border rounded-lg text-center">
            <h3 className="font-medium mb-2">Extra Large</h3>
            <Spinner size="xl" text="Extra Large" />
          </div>
        </div>
      </section>

      {/* Button Loading */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-foreground">Button Loading</h2>
        <div className="flex gap-4">
          <Button onClick={handleButtonClick} disabled={isLoading}>
            {isLoading ? <ButtonLoading /> : "Click Me"}
          </Button>
          
          <Button variant="outline" onClick={handleButtonClick} disabled={isLoading}>
            {isLoading ? <ButtonLoading /> : "Outline Button"}
          </Button>
        </div>
      </section>

      {/* Loading States */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-foreground">Loading States</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 border rounded-lg">
            <h3 className="font-medium mb-2">Auth Loading</h3>
            <AuthLoading text="Signing in..." />
          </div>
          
          <div className="p-4 border rounded-lg">
            <h3 className="font-medium mb-2">Data Loading</h3>
            <DataLoading text="Fetching data..." />
          </div>
          
          <div className="p-4 border rounded-lg">
            <h3 className="font-medium mb-2">Message Loading</h3>
            <MessageLoading text="Sending..." />
          </div>
          
          <div className="p-4 border rounded-lg">
            <h3 className="font-medium mb-2">Compact Loading</h3>
            <CompactLoading text="Quick load..." />
          </div>
        </div>
      </section>

      {/* Loading Overlay */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-foreground">Loading Overlay</h2>
        <div className="relative p-8 border rounded-lg bg-muted/20">
          <h3 className="font-medium mb-4">Content with Overlay</h3>
          <p className="text-muted-foreground mb-4">
            This content can be overlaid with a loading spinner.
          </p>
          <Button onClick={handleOverlayToggle}>
            {showOverlay ? "Hide" : "Show"} Overlay
          </Button>
          
          <LoadingOverlay 
            show={showOverlay} 
            text="Processing overlay..." 
          />
        </div>
      </section>

      {/* Inline Spinners */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-foreground">Inline Spinners</h2>
        <div className="space-y-2">
          <p className="flex items-center gap-2">
            <InlineSpinner /> Processing inline...
          </p>
          <p className="flex items-center gap-2">
            <InlineSpinner size="sm" /> Small inline spinner
          </p>
          <p className="flex items-center gap-2">
            <InlineSpinner size="lg" /> Large inline spinner
          </p>
        </div>
      </section>
    </div>
  );
};

export default SpinnerExamples;
