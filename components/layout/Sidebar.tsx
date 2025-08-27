"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { LayoutDashboard, FolderOpen, Settings, LogOut, StickyNote } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/hooks/useAuth"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Categories", href: "/dashboard/categories", icon: FolderOpen },
  { name: "Notes", href: "/dashboard/notes", icon: StickyNote },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const { logout, user } = useAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    try {
      await logout()
      router.push("/login")
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  return (
    <div className="w-full md:w-64 bg-gradient-to-b from-[#1A1A1A] to-[#111111] border-r border-[#374151]/30 flex flex-col min-h-[100dvh] md:min-h-0">
      <div className="p-6">
        <h1 className="text-xl font-bold bg-gradient-to-r from-[#8B5CF6] to-[#A855F7] bg-clip-text text-transparent">
          ReadyQueue
        </h1>
        {user && (
          <p className="text-sm text-[#6B7280] mt-2">
            Welcome back, {user.displayName || user.email}
          </p>
        )}
      </div>

      <nav className="flex-1 px-2 md:px-4 space-y-2 overflow-auto scrollbar-hide">
        {navigation.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-2 py-2 rounded-lg text-sm font-medium transition-all",
                isActive
                  ? "bg-gradient-to-r from-[#8B5CF6]/20 to-[#A855F7]/20 text-[#8B5CF6] border border-[#8B5CF6]/30"
                  : "text-[#6B7280] hover:text-[#E5E7EB] hover:bg-[#374151]/30",
              )}
            >
              <Icon size={18} className="shrink-0" />
              <span className="truncate">{item.name}</span>
            </Link>
          )
        })}
      </nav>

      <div className="p-3 md:p-4 border-t border-[#374151]/30 safe-pb">
        <button 
          onClick={handleSignOut}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-[#6B7280] hover:text-[#E5E7EB] hover:bg-[#374151]/30 w-full transition-all"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </div>
  )
}
