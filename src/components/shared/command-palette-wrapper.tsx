"use client"

import { useEffect, useState } from "react"
import { CommandPalette } from "./command-palette"

export function CommandPaletteWrapper() {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Cmd+K (Mac) or Ctrl+K (Windows/Linux)
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault() // Prevent browser default search
        setIsOpen(prev => !prev)
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [])

  return <CommandPalette isOpen={isOpen} onClose={() => setIsOpen(false)} />
}