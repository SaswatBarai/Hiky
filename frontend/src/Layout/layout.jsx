import React from 'react';
import {Outlet} from "react-router-dom"
import {Moon,Sun} from "lucide-react"
import {cn} from "../lib/utils"
import{useTheme} from "../components/theme-provider"
function Layout() {

    const {setTheme,theme} = useTheme();
    const isDark = theme === "dark";
  return (
    <div>
        <div className={cn(
            'fixed left-2 bottom-4 transition delay-100 cursor-pointer',
            isDark && "rotate-180",
            !isDark && "rotate-0"
        )}>
            {
                isDark ? 
                (
                    <>
                        <Sun color='yellow' onClick={() => setTheme("light")}/>
                    </>
                ):(
                    <>
                    <Moon onClick={() => setTheme("dark")} />
                
                </>)
            }
        </div>
        <Outlet/>
    </div>
  )
}

export default Layout