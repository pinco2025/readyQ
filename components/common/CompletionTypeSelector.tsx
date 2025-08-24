"use client"

import { Button } from "@/components/ui/button"

interface CompletionTypeSelectorProps {
  value: "done" | "percentage" | "stages"
  onChange: (value: "done" | "percentage" | "stages") => void
}

const completionTypes = [
  { value: "done" as const, label: "Done/Not Done" },
  { value: "percentage" as const, label: "Percentage" },
  { value: "stages" as const, label: "Stages" },
]

export function CompletionTypeSelector({ value, onChange }: CompletionTypeSelectorProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {completionTypes.map((type) => (
        <Button
          key={type.value}
          type="button"
          variant={value === type.value ? "default" : "outline"}
          size="sm"
          onClick={() => onChange(type.value)}
          className={
            value === type.value
              ? `bg-gradient-to-r from-[#8B5CF6] to-[#A855F7] hover:from-[#7C3AED] hover:to-[#9333EA] text-white`
              : `border-[#374151] hover:bg-[#374151]/30 text-[#E5E7EB]`
          }
        >
          {type.label}
        </Button>
      ))}
    </div>
  )
}
