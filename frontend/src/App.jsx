import React from "react";
import { Routes, Route } from "react-router-dom";
import { useSelector } from "react-redux";
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

// Hooks
import { useStoreuser } from "../src/hooks/usegetData";

function App() {
  const { user, isLoading } = useStoreuser();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  console.log("App component rendering...", { user, isLoading, isAuthenticated });

  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <Routes>
        {/* Public Routes - Guest only (redirects if authenticated) */}
        <Route element={<Layout />} path="/">
          {/* Landing Page */}
          <Route 
          path="/"
            element={
              <Guest>
                <Landing />
              </Guest>
            } 
          />
          
          {/* Authentication Routes - Guest only */}
          <Route 
            path="/login" 
            element={
              <Guest>
                <Login />
              </Guest>
            } 
          />
          
          <Route 
            path="/register" 
            element={
              <Guest>
                <Register />
              </Guest>
            } 
          />
          
          {/* Profile Setup Route - Guest only */}
          <Route 
            path="/profile-uploader" 
            element={
              <Guest>
                <ProfileUploader />
              </Guest>
            } 
          />
          
          {/* Password Reset Routes - Available to everyone */}
          <Route 
            path="/forgot-password" 
            element={<ForgotPassword />} 
          />
          
          <Route 
            path="/reset-password/:token" 
            element={<ResetPassword />} 
          />
          
          {/* 404 - Catch all other routes */}
          <Route path="*" element={<NotFoundPage />} />
        </Route>

        {/* Protected Routes - Authenticated users only */}
        <Route element={<ChatLayout />} path="/">
          <Route 
          path="/"
            element={
              <Protect>
                <ChatHome />
              </Protect>
            } 
          />
        </Route>
      </Routes>
    </ThemeProvider>
  );
}

export default App;
