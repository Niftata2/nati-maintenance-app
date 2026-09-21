"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

import { Input } from "@/components/ui/input"

interface CustomerSearchProps {
  initialQuery?: string
}

export function CustomerSearch({ initialQuery = "" }: CustomerSearchProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [query, setQuery] = useState(initialQuery)

  useEffect(() => {
    const timeout = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString())

      if (query.trim()) {
        params.set("q", query.trim())
      } else {
        params.delete("q")
      }

      // Keep the selected customer if one is already open.
      router.replace(`/manager/customers?${params.toString()}`)
    }, 400)

    return () => clearTimeout(timeout)
  }, [query, router, searchParams])

  return (
    <Input
      placeholder="Search by name or phone..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      className="w-72"
    />
  )
}