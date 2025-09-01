import { Moon, Sun } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useTheme } from "@/components/theme-provider"

export function ModeToggle() {
  const { setTheme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="border-green-200 dark:border-green-600/30 bg-white/50 dark:bg-black/20 hover:bg-green-50 dark:hover:bg-green-600/10">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-green-600 dark:text-green-400" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-green-600 dark:text-green-400" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-white/95 dark:bg-black/90 border-green-200 dark:border-green-600/30 backdrop-blur-sm">
        <DropdownMenuItem onClick={() => setTheme("light")} className="text-foreground hover:bg-green-50 dark:text-white dark:hover:bg-green-600/10">
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")} className="text-foreground hover:bg-green-50 dark:text-white dark:hover:bg-green-600/10">
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")} className="text-foreground hover:bg-green-50 dark:text-white dark:hover:bg-green-600/10">
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
