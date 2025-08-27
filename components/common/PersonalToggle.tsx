"use client"

import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { User } from "lucide-react"

interface PersonalToggleProps {
  value: boolean
  onChange: (value: boolean) => void
}

export function PersonalToggle({ value, onChange }: PersonalToggleProps) {
  return (
    <div className="flex items-center gap-2">
      <Switch
        id="personal-toggle"
        checked={value}
        onCheckedChange={onChange}
        className="data-[state=checked]:bg-[#8B5CF6]"
      />
      <Label 
        htmlFor="personal-toggle" 
        className="text-sm text-slate-300 cursor-pointer flex items-center gap-1.5"
      >
        <User size={14} className="text-slate-400" />
        Personal Only
      </Label>
    </div>
  )
}
