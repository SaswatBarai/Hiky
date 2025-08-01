import React from 'react'
import { Button } from './components/ui/button'
import {Routes,Route} from "react-router-dom";
import Layout from './Layout/layout';
import Login from './pages/Login';
import Register from './pages/Register';
import { ThemeProvider } from "@/components/theme-provider"

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">

   <Routes>
      <Route element={<Layout/>} path='/'>
        <Route element={<Login/>} path='/login'/>
        <Route element={<Register/>} path='/register'/>
      </Route>
   </Routes>
    </ThemeProvider>
  )
}

export default App