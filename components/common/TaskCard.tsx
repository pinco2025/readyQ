import { CheckCircle2, Circle, User, MoreVertical, CircleDot, GripVertical, Trash2, Clock, CheckCircle, Tag } from "lucide-react"
import { PriorityBadge } from "./PriorityBadge"
import { useTasks } from "@/hooks/useTasks"
import { useCategories } from "@/hooks/useCategories"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import type { Task } from "@/lib/firebase-types"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { useAccessibility } from "@/hooks/useAccessibility"

interface TaskCardProps {
  task: Task
  priority: "high" | "medium" | "low"
  priorityColor: string
}

export function TaskCard({ task, priority, priorityColor }: TaskCardProps) {
  const { toggleTaskCompletion, updateTask, deleteTask } = useTasks()
  const { categories } = useCategories()
  const { announceToScreenReader } = useAccessibility()
  
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: {
      task,
    },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  // Get the category for this task
  const taskCategory = task.category_id ? categories.find(cat => cat.id === task.category_id) : null

  const handleToggleCompletion = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    try {
      const { error } = await toggleTaskCompletion(task.id)
      if (error) {
        console.error('Failed to toggle task completion:', error)
        announceToScreenReader('Failed to update task status')
      } else {
        const newStatus = task.status === 'done' ? 'todo' : 'done'
        announceToScreenReader(`Task marked as ${newStatus}`)
      }
    } catch (err) {
      console.error('Error toggling task completion:', err)
      announceToScreenReader('Error updating task status')
    }
  }

  const handleStatusChange = async (newStatus: 'todo' | 'in_progress' | 'done') => {
    try {
      const { error } = await updateTask(task.id, { status: newStatus })
      if (error) {
        console.error('Failed to update task status:', error)
        announceToScreenReader('Failed to update task status')
      } else {
        announceToScreenReader(`Task status changed to ${newStatus}`)
      }
    } catch (err) {
      console.error('Error updating task status:', err)
      announceToScreenReader('Error updating task status')
    }
  }

  const handleDeleteTask = async () => {
    try {
      const { error } = await deleteTask(task.id)
      if (error) {
        console.error('Failed to delete task:', error)
        announceToScreenReader('Failed to delete task')
      } else {
        announceToScreenReader('Task deleted successfully')
      }
    } catch (err) {
      console.error('Error deleting task:', err)
      announceToScreenReader('Error deleting task')
    }
  }

  const getStatusIcon = () => {
    switch (task.status) {
      case 'done':
        return <CheckCircle2 size={20} className="text-[#8B5CF6]" />
      case 'in_progress':
        return <CircleDot size={20} className="text-[#8B5CF6] fill-[#8B5CF6]" />
      case 'todo':
      default:
        return <Circle size={20} className="text-[#6B7280]" />
    }
  }

  const getStatusText = () => {
    switch (task.status) {
      case 'done':
        return 'completed'
      case 'in_progress':
        return 'in progress'
      case 'todo':
      default:
        return 'to do'
    }
  }

  const isCompleted = task.status === 'done'

  return (
    <div 
      ref={setNodeRef}
      style={style}
      className={`bg-[#1A1A1A] border border-[#374151]/30 rounded-lg p-4 hover:border-[#8B5CF6]/30 transition-all group ${
        isDragging ? 'shadow-lg scale-105 z-50' : ''
      }`}
      role="article"
      aria-label={`Task: ${task.name}, Priority: ${priority}, Status: ${getStatusText()}, Category: ${taskCategory?.name || 'none'}`}
      tabIndex={0}
      onMouseDown={(e) => {
        // Only allow interactions with specific elements
        if (e.target === e.currentTarget) {
          e.preventDefault()
        }
      }}
    >
      <div className="flex items-start gap-3">
        {/* Drag Handle */}
        <div 
          {...attributes}
          {...listeners}
          className="mt-1 cursor-grab active:cursor-grabbing text-[#6B7280] hover:text-[#8B5CF6] transition-colors flex-shrink-0"
          role="button"
          tabIndex={-1}
          aria-label="Drag to reorder task"
          aria-describedby={`task-${task.id}-description`}
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
        >
          <GripVertical size={16} />
        </div>

        {/* Completion Toggle */}
        <button 
          onClick={handleToggleCompletion}
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          className="mt-0.5 hover:text-[#8B5CF6] transition-colors flex-shrink-0"
          aria-label={`Mark task as ${isCompleted ? 'incomplete' : 'complete'}`}
          aria-pressed={isCompleted}
          type="button"
        >
          {getStatusIcon()}
        </button>

        <div className="flex-1 min-w-0">
          <h4
            id={`task-${task.id}-description`}
            className={`font-medium text-sm leading-relaxed ${
              isCompleted ? "line-through text-[#6B7280]" : "text-[#E5E7EB]"
            }`}
          >
            {task.name}
          </h4>

          {/* Category Badge */}
          {taskCategory && (
            <div className="mt-2">
              <Badge 
                className="text-xs px-2 py-1"
                style={{ 
                  backgroundColor: taskCategory.color,
                  color: 'white',
                  border: 'none'
                }}
              >
                <Tag size={10} className="mr-1" />
                {taskCategory.name}
              </Badge>
            </div>
          )}

          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-2">
              <PriorityBadge priority={priority} color={priorityColor} />
              {task.is_personal && (
                <div className="flex items-center gap-1 text-xs text-[#6B7280]" aria-label="Personal task">
                  <User size={12} />
                  <span>Personal</span>
                </div>
              )}
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0 hover:bg-[#374151]/50 hover:text-[#8B5CF6] transition-all duration-200 rounded-md"
                  aria-label="Task options menu"
                  aria-haspopup="true"
                >
                  <MoreVertical size={16} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-[#1A1A1A] border-[#374151] min-w-[200px] p-1 shadow-xl shadow-black/50 backdrop-blur-sm">
                <DropdownMenuItem 
                  onClick={() => handleStatusChange('todo')}
                  className="hover:bg-[#374151]/50 focus:bg-[#374151]/50 cursor-pointer text-slate-200 hover:text-white transition-colors px-3 py-2 rounded-md hover:border-l-2 hover:border-l-[#6B7280]"
                  aria-label="Mark as To Do"
                >
                  <Circle className="mr-3 h-4 w-4 text-[#6B7280]" />
                  Mark as To Do
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => handleStatusChange('in_progress')}
                  className="hover:bg-[#374151]/50 focus:bg-[#374151]/50 cursor-pointer text-slate-200 hover:text-white transition-colors px-3 py-2 rounded-md hover:border-l-2 hover:border-l-[#8B5CF6]"
                  aria-label="Mark as In Progress"
                >
                  <Clock className="mr-3 h-4 w-4 text-[#8B5CF6]" />
                  Mark as In Progress
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => handleStatusChange('done')}
                  className="hover:bg-[#374151]/50 focus:bg-[#374151]/50 cursor-pointer text-slate-200 hover:text-white transition-colors px-3 py-2 rounded-md hover:border-l-2 hover:border-l-[#10B981]"
                  aria-label="Mark as Done"
                >
                  <CheckCircle className="mr-3 h-4 w-4 text-[#10B981]" />
                  Mark as Done
                </DropdownMenuItem>
                
                <DropdownMenuSeparator className="bg-[#374151] my-2 mx-1" />
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem 
                      className="hover:bg-red-500/20 focus:bg-red-500/20 text-red-400 hover:text-red-300 cursor-pointer px-3 py-2 rounded-md transition-colors border-l-2 border-l-transparent hover:border-l-red-500"
                      onSelect={(e) => e.preventDefault()}
                      aria-label="Delete task"
                    >
                      <Trash2 className="mr-3 h-4 w-4" />
                      Delete Task
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-[#1A1A1A] border-[#374151]">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-white">
                        Delete Task
                      </AlertDialogTitle>
                      <AlertDialogDescription className="text-[#9CA3AF]">
                        Are you sure you want to delete "{task.name}"? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="bg-[#374151] border-[#374151] text-slate-200 hover:bg-[#4B5563]">
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={handleDeleteTask}
                        className="bg-red-600 hover:bg-red-700 text-white"
                      >
                        Delete Task
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  )
}
