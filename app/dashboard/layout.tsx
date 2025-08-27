"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/")
    }
  }, [user, loading, router])

  // If loading or not authenticated, don't render anything (will redirect)
  if (loading || !user) {
    return null
  }

  // If authenticated, render the dashboard content
  return <>{children}</>
}
