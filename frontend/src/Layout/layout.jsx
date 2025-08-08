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
            'fixed left-4 bottom-6 transition-all duration-300 cursor-pointer z-50 group',
            'hover:scale-110'
        )}>
            <div className="p-3 rounded-full bg-background/80 backdrop-blur-sm shadow-lg border border-border/50 hover:shadow-xl transition-all duration-200"
             onClick={() => setTheme(isDark ? "light" : "dark")}
            >
                {
                    isDark ? 
                    (
                        <Sun 
                            className="w-5 h-5 text-yellow-500 transition-all duration-300 group-hover:rotate-45" 
                        />
                    ):(
                        <Moon 
                            className="w-5 h-5 text-blue-600 transition-all duration-300 group-hover:-rotate-45" 
                        />
                    )
                }
            </div>
        </div>
        <Outlet/>
    </div>
  )
}

export default Layout