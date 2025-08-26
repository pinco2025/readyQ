import type { ReactNode } from "react"
import { Sidebar } from "@/components/layout/Sidebar"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"

interface AppLayoutProps {
  children: ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-[#1A1A1A] flex">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex">
        <Sidebar />
      </div>

      {/* Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Top Bar */}
        <div className="md:hidden sticky top-0 z-30 bg-[#1A1A1A]/95 backdrop-blur border-b border-[#374151]/30 safe-pt">
          <div className="flex items-center justify-between px-3 py-3">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Open menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-[85vw] max-w-sm h-[100dvh] safe-pr">
                <Sidebar />
              </SheetContent>
            </Sheet>
            <span className="text-sm font-semibold">ReadyQueue</span>
            <div className="w-9" />
          </div>
        </div>

        <main className="flex-1 overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  )
}
