import React from "react";
import { Button } from "./components/ui/button";
import { Routes, Route } from "react-router-dom";
import Layout from "./Layout/layout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { ThemeProvider } from "@/components/theme-provider";
import NotFoundPage from "./pages/NotFoundPage";
import { ProfileUploader } from "./pages/NewProfile";
import { useStoreuser } from "../src/hooks/usegetData";
import ChatLayout  from "./Layout/chatLayout";
import ChatHome from "./pages/ChatHome";

function App() {
  const { user, isLoading } = useStoreuser();
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <Routes>
        <Route element={<Layout />} path="/">
          <Route element={<Login />} path="/login" />
          <Route element={<Register />} path="/register" />
          <Route element={<ProfileUploader />} path="/profile-uploader" />
          <Route element={<NotFoundPage />} path="/*" />
        </Route>
        <Route element={<ChatLayout />} path="/">
          <Route element={<ChatHome />} path="/" index />
        </Route>
      </Routes>
    </ThemeProvider>
  );
}

export default App;
