"use client"

import { Button } from "@/components/ui/button"

interface PrioritySelectorProps {
  value: "high" | "medium" | "low"
  onChange: (value: "high" | "medium" | "low") => void
}

const priorities = [
  { value: "high" as const, label: "High", color: "#EF4444" },
  { value: "medium" as const, label: "Medium", color: "#F59E0B" },
  { value: "low" as const, label: "Low", color: "#10B981" },
]

export function PrioritySelector({ value, onChange }: PrioritySelectorProps) {
  return (
    <div className="flex gap-2">
      {priorities.map((priority) => (
        <Button
          key={priority.value}
          type="button"
          variant={value === priority.value ? "default" : "outline"}
          size="sm"
          onClick={() => onChange(priority.value)}
          className={
            value === priority.value
              ? `bg-gradient-to-r from-[#8B5CF6] to-[#A855F7] hover:from-[#7C3AED] hover:to-[#9333EA] text-white font-medium`
              : `border-[#6B7280] hover:bg-[#374151]/50 bg-[#2A2A2A] text-[#E5E7EB] hover:text-white font-medium`
          }
        >
          <div className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: priority.color }} />
          {priority.label}
        </Button>
      ))}
    </div>
  )
}
