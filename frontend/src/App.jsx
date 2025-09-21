import React from "react";
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

// Wrappers
import { Guest, Protect } from "./warpper/Protect";

// Hooks & Redux
import { useStoreuser } from "../src/hooks/usegetData";
import { useSelector } from "react-redux";

// UI Components
import { FullScreenSpinner } from "@/components/ui/spinner";

function App() {
  const { user, isLoading } = useStoreuser();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
        <FullScreenSpinner text="Initializing Hiky..." />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
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

        {/* Catch-all route for 404 */}
        <Route element={<NotFoundPage />} path="*" />
      </Routes>
    </ThemeProvider>
  );
}

export default App;