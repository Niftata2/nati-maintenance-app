"use client"

import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Moon, Sun } from "lucide-react"
import { useEffect, useState } from "react"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Sync local state with the actual theme
    setIsDark(theme === "dark")
  }, [theme])

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="h-9 w-9 relative">
        <Sun className="h-4 w-4" />
      </Button>
    )
  }

  const handleToggle = () => {
    const newTheme = isDark ? "light" : "dark"
    
    // 1. Update local state immediately to trigger the CSS animation
    setIsDark(!isDark) 
    
    // 2. Update the actual theme
    setTheme(newTheme) 
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleToggle}
      className="h-9 w-9 rounded-full relative"
      aria-label="Toggle theme"
    >
      {/* Sun Icon */}
      <Sun 
        className={`h-4 w-4 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-500 ease-in-out text-amber-500 ${
          isDark ? "rotate-[360deg] scale-0 opacity-0" : "rotate-0 scale-100 opacity-100"
        }`} 
      />
      
      {/* Moon Icon */}
      <Moon 
        className={`h-4 w-4 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-500 ease-in-out text-slate-700 ${
          isDark ? "rotate-0 scale-100 opacity-100" : "-rotate-[360deg] scale-0 opacity-0"
        }`} 
      />
    </Button>
  )
}