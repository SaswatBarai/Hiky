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
import Landing from "./pages/Landing";
import { Guest, Protect } from "./warpper/Protect";
import {useSelector} from "react-redux"

function App() {
  const { user, isLoading } = useStoreuser();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <Routes>
        <Route element={<Layout />} path="/">
          <Route element={<Guest>
            <Login />
          </Guest>} path="/login" />
          <Route element={
            <Guest>
              <Register />
            </Guest>
          } path="/register" />
          <Route element={
            <Guest>
              <ProfileUploader />
            </Guest>
          } path="/profile-uploader" />
          <Route element={<NotFoundPage />} path="/*" />
          <Route element={
            <Guest>
              <Landing />
            </Guest>
          } path="/"/>
        </Route>
        {
          isAuthenticated &&
          <Route element={<ChatLayout />} path="/">
          <Route element={<Protect>
            <ChatHome />
          </Protect>} path="/" index />
        </Route>
          
        }
      </Routes>
    </ThemeProvider>
  );
}

export default App;
