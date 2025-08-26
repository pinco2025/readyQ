import { TaskCard } from "./TaskCard"
import type { Task } from "@/lib/firebase-types"
import { useDroppable } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"

interface KanbanColumnProps {
  id: string
  title: string
  priority: "high" | "medium" | "low" | "todo" | "in_progress" | "done"
  tasks: Task[]
  color: string
}

export function KanbanColumn({ id, title, priority, tasks, color }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: id,
  })

  // Helper function to get the actual priority for TaskCard
  const getTaskPriority = (task: Task) => {
    return task.priority as "high" | "medium" | "low"
  }

  return (
    <div 
      ref={setNodeRef}
      className={`bg-[#111111]/30 rounded-lg border transition-all duration-200 flex flex-col h-full ${
        isOver 
          ? 'border-[#8B5CF6] bg-[#1A1A1A]/50 shadow-lg shadow-[#8B5CF6]/20' 
          : 'border-[#374151]/30'
      }`}
    >
      <div className="p-4 border-b border-[#374151]/30">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
          <h3 className="font-semibold text-lg">{title}</h3>
          <span className="bg-[#374151]/50 text-[#6B7280] px-2 py-1 rounded-full text-xs">{tasks.length}</span>
        </div>
      </div>

      <div className="flex-1 p-4 space-y-3 overflow-y-auto kanban-column-scroll">
        <SortableContext items={tasks.map(task => task.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} priority={getTaskPriority(task)} priorityColor={color} />
          ))}
        </SortableContext>

        {tasks.length === 0 && (
          <div className="text-center text-[#6B7280] py-8">
            <p>No tasks in this column</p>
          </div>
        )}
      </div>
    </div>
  )
}
