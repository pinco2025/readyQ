"use client"

import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

interface PersonalToggleProps {
  value: boolean
  onChange: (value: boolean) => void
}

export function PersonalToggle({ value, onChange }: PersonalToggleProps) {
  return (
    <div className="flex items-center space-x-2">
      <Switch
        id="personal-toggle"
        checked={value}
        onCheckedChange={onChange}
        className="data-[state=checked]:bg-[#8B5CF6]"
      />
      <Label htmlFor="personal-toggle" className="text-sm text-white">
        Personal Task
      </Label>
    </div>
  )
}
