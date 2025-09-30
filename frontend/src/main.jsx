import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Provider } from "react-redux";
import {store} from "../src/state/store.js"
import ErrorBoundary from "./components/ErrorBoundary.jsx";

const queryClient = new QueryClient();

// Component to handle initial loader cleanup
const AppWrapper = () => {
  useEffect(() => {
    console.log('AppWrapper: React has mounted, preparing to hide initial loader');
    
    // Hide the initial HTML loader once React has mounted
    const initialLoader = document.getElementById('initial-loader');
    const body = document.body;
    
    if (initialLoader) {
      console.log('AppWrapper: Initial loader found, starting transition');
      // Add a small delay to ensure smooth transition
      setTimeout(() => {
        body.classList.add('react-loaded');
        console.log('AppWrapper: Added react-loaded class');
        // Remove the loader element after transition
        setTimeout(() => {
          if (initialLoader.parentNode) {
            initialLoader.remove();
            console.log('AppWrapper: Initial loader removed');
          }
        }, 300); // Increased time to match CSS transition
      }, 150); // Slightly longer delay to ensure React is fully ready
    } else {
      console.log('AppWrapper: No initial loader found');
    }
  }, []);

  return (
    <ErrorBoundary>
      <Provider store={store}>
        <BrowserRouter>
          <QueryClientProvider client={queryClient}>
            <App />
            <ToastContainer />
          </QueryClientProvider>
        </BrowserRouter>
      </Provider>
    </ErrorBoundary>
  );
};

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AppWrapper />
  </StrictMode>
);
