"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import type { ReactNode } from "react"

interface AuthLayoutProps {
  children: ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard")
    }
  }, [user, loading, router])

  // If loading or authenticated, don't render anything (will redirect)
  if (loading || user) {
    return null
  }

  // If not authenticated, render the auth content
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1A1A1A] via-[#1A1A1A] to-[#2D1B69]/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[#8B5CF6] to-[#A855F7] bg-clip-text text-transparent">
            ReadyQueue
          </h1>
          <p className="text-[#9CA3AF] mt-2">Organize your tasks with sophistication</p>
        </div>
        {children}
      </div>
    </div>
  )
}
