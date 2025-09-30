import React, { useEffect, useState, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";

// Layouts
import Layout from "./Layout/layout";
import ChatLayout from "./Layout/chatLayout";

// Pages
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import { ProfileUploader } from "./pages/NewProfile";
import ChatHome from "./pages/ChatHome";
import NotFoundPage from "./pages/NotFoundPage";
import Unauthorized from "./pages/Unauthorized";

// Wrappers
import { Guest, Protect } from "./warpper/Protect";

// Hooks & Redux
import { useStoreuser } from "../src/hooks/usegetData";
import { useSelector } from "react-redux";

// UI Components
import { FullScreenSpinner } from "@/components/ui/spinner";
import Setting from "./pages/Setting";

function App() {
  const { user, isLoading, isAuthenticated: hookIsAuthenticated } = useStoreuser();
  const reduxIsAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const [appInitialized, setAppInitialized] = useState(false);
  const [minLoadingTime, setMinLoadingTime] = useState(true);
  
  // Use the most up-to-date authentication state
  const isAuthenticated = hookIsAuthenticated || reduxIsAuthenticated;

  // Ensure minimum loading time to prevent flashing
  useEffect(() => {
    const timer = setTimeout(() => {
      setMinLoadingTime(false);
    }, 300); // Reduced to 300ms since we have HTML loader
    
    return () => clearTimeout(timer);
  }, []);
  
  // Mark app as initialized after loading is complete
  useEffect(() => {
    console.log('App: Loading state changed', { isLoading, minLoadingTime, isAuthenticated });
    if (!isLoading && !minLoadingTime) {
      const timer = setTimeout(() => {
        console.log('App: Marking as initialized');
        setAppInitialized(true);
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [isLoading, minLoadingTime, isAuthenticated]);

  // Show loading screen while checking authentication or during minimum loading time
  if (isLoading || minLoadingTime || !appInitialized) {
    return (
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
        <FullScreenSpinner text="Initializing Hiky..." />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <Suspense fallback={<FullScreenSpinner text="Loading..." />}>
        <Routes>
        {/* Public Routes - Guest Layout */}
        <Route element={<Layout />} path="/">
          <Route
            index
            element={
              <Guest>
                <Landing />
              </Guest>
            }
          />
          <Route
            path="login"
            element={
              <Guest>
                <Login />
              </Guest>
            }
          />
          <Route
            path="register"
            element={
              <Guest>
                <Register />
              </Guest>
            }
          />
          <Route
            path="forgot-password"
            element={
              <Guest>
                <ForgotPassword />
              </Guest>
            }
          />
          <Route
            path="reset-password"
            element={
              <Guest>
                <ResetPassword />
              </Guest>
            }
          />
          <Route
            path="profile-uploader"
            element={
              <Guest>
                <ProfileUploader />
              </Guest>
            }
          />
        </Route>

        {/* Protected Routes - Chat Layout */}
        <Route element={<ChatLayout />} path="/chat">
          <Route
            index
            element={
              <Protect>
                <ChatHome />
              </Protect>
            }
          />
        </Route>

        {/* Protected Settings Route */}
        <Route
          element={
          
              <Setting />
        
          }
          path="/settings"
        />

        {/* Unauthorized Route */}
        <Route element={<Unauthorized />} path="/unauthorized" />

        {/* Catch-all route for 404 */}
        <Route element={<NotFoundPage />} path="*" />
        </Routes>
      </Suspense>
    </ThemeProvider>
  );
}

export default App;