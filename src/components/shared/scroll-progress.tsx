"use client"

import { useEffect, useState } from "react"

export function ScrollProgress() {
  const [scrollProgress, setScrollProgress] = useState(0)

  useEffect(() => {
    // 1. Target the actual scrolling container (the <main> tag)
    const scrollContainer = document.querySelector("main")

    if (!scrollContainer) return

    const handleScroll = () => {
      const totalHeight = scrollContainer.scrollHeight - scrollContainer.clientHeight
      const progress = (scrollContainer.scrollTop / totalHeight) * 100
      setScrollProgress(progress)
    }

    // 2. Listen to the main container's scroll event
    scrollContainer.addEventListener("scroll", handleScroll)
    return () => scrollContainer.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <div className="fixed top-0 left-0 w-full h-[2px] bg-transparent z-[100] pointer-events-none">
      <div
        className="h-full bg-emerald-500 transition-all duration-150 ease-out shadow-[0_0_10px_rgba(16,185,129,0.5)]"
        style={{ width: `${scrollProgress}%` }}
      />
    </div>
  )
}