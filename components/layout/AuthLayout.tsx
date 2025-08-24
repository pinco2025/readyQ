import type { ReactNode } from "react"

interface AuthLayoutProps {
  children: ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1A1A1A] via-[#1A1A1A] to-[#2D1B69]/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[#8B5CF6] to-[#A855F7] bg-clip-text text-transparent">
            ReadyQueue
          </h1>
          <p className="text-[#6B7280] mt-2">Organize your tasks with sophistication</p>
        </div>
        {children}
      </div>
    </div>
  )
}
