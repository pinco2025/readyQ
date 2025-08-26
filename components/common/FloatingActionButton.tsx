"use client"

import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

interface FloatingActionButtonProps {
  onClick: () => void
}

export function FloatingActionButton({ onClick }: FloatingActionButtonProps) {
  return (
    <Button
      onClick={onClick}
      aria-label="Create new task"
      className="fixed z-40 bottom-[max(1rem,env(safe-area-inset-bottom))] right-[max(1rem,env(safe-area-inset-right))] md:bottom-6 md:right-6 w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#A855F7] hover:from-[#7C3AED] hover:to-[#9333EA] shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
    >
      <Plus size={22} className="md:size-6" />
    </Button>
  )
}
