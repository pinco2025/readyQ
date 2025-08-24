interface PriorityBadgeProps {
  priority: "high" | "medium" | "low"
  color: string
}

export function PriorityBadge({ priority, color }: PriorityBadgeProps) {
  return (
    <span
      className="px-2 py-1 rounded-full text-xs font-medium"
      style={{
        backgroundColor: `${color}20`,
        color: color,
        border: `1px solid ${color}30`,
      }}
    >
      {priority.charAt(0).toUpperCase() + priority.slice(1)}
    </span>
  )
}
