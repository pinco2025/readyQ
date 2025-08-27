import { useEffect, useMemo, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useTasks } from "@/hooks/useTasks"
import { useCategories } from "@/hooks/useCategories"
import type { Task } from "@/lib/firebase-types"
import { CheckCircle2, Circle, Tag, User, Loader2, Edit, X, Clock, CheckCircle } from "lucide-react"

interface TaskDetailModalProps {
  open: boolean
  task: Task | null
  onOpenChange: (open: boolean) => void
}

export function TaskDetailModal({ open, task, onOpenChange }: TaskDetailModalProps) {
  const { updateTask, toggleTaskCompletion } = useTasks()
  const { categories } = useCategories()
  const [description, setDescription] = useState<string>("")
  const [priority, setPriority] = useState<"high" | "medium" | "low">("medium")
  const [status, setStatus] = useState<"todo" | "in_progress" | "done">("todo")
  const [categoryId, setCategoryId] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (task) {
      setDescription(task.description || "")
      setPriority(task.priority)
      setStatus(task.status)
      setCategoryId(task.category_id)
    }
  }, [task?.id])

  const taskCategory = useMemo(() => {
    if (!task?.category_id) return null
    return categories.find(c => c.id === task.category_id) || null
  }, [categories, task?.category_id])

  const isCompleted = task?.status === 'done'

  const handleToggleCompletion = async () => {
    if (!task) return
    // Cycle through the three states: todo -> in_progress -> done -> todo
    const currentStatus = task.status
    let newStatus: "todo" | "in_progress" | "done"
    
    if (currentStatus === 'todo') {
      newStatus = 'in_progress'
    } else if (currentStatus === 'in_progress') {
      newStatus = 'done'
    } else {
      newStatus = 'todo'
    }
    
    await updateTask(task.id, { status: newStatus })
  }

  const handlePriorityClick = () => {
    if (!isEditing) return
    // Cycle through priority levels: high -> medium -> low -> high
    const currentPriority = priority
    let newPriority: "high" | "medium" | "low"
    
    if (currentPriority === 'high') {
      newPriority = 'medium'
    } else if (currentPriority === 'medium') {
      newPriority = 'low'
    } else {
      newPriority = 'high'
    }
    
    setPriority(newPriority)
  }

  const handleSave = async () => {
    if (!task) return
    setIsSaving(true)
    try {
      await updateTask(task.id, { 
        description: description.trim() ? description.trim() : null,
        priority,
        status,
        category_id: categoryId
      })
      setIsEditing(false)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancelEdit = () => {
    if (task) {
      setDescription(task.description || "")
      setPriority(task.priority)
      setStatus(task.status)
      setCategoryId(task.category_id)
    }
    setIsEditing(false)
  }

  if (!task) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#111111] border-[#374151] text-white md:max-w-lg w-[100vw] h-[100dvh] md:h-auto md:w-auto rounded-none md:rounded-lg p-0">
        <DialogHeader className="sticky top-0 z-10 bg-[#111111] border-b border-[#374151]/30 px-4 md:px-6 py-3 md:py-4">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0 text-center md:text-left">
              <DialogTitle className="text-lg md:text-xl font-semibold text-white truncate">
                {task.name}
              </DialogTitle>
              <DialogDescription className="text-[#9CA3AF] text-sm mt-1">Task details and description</DialogDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
              className="h-10 w-10 md:h-8 md:w-8 p-0 hover:bg-[#374151]/30 text-gray-400 hover:text-white ml-3 flex-shrink-0 absolute right-4 md:relative md:right-auto"
            >
              {isEditing ? <X size={18} className="md:size-4" /> : <Edit size={18} className="md:size-4" />}
            </Button>
          </div>
        </DialogHeader>

        <div className="px-4 md:px-6 py-3 md:py-4 space-y-3 md:space-y-4 overflow-y-auto max-h-[calc(100dvh-5rem)] md:max-h-none scrollbar-hide">
          <div className="flex items-center gap-2 md:gap-3 flex-wrap">
            {/* Status toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={isEditing ? handleToggleCompletion : undefined}
              disabled={!isEditing}
              className={`border-[#374151] bg-[#1A1A1A] text-slate-200 transition-all text-sm md:text-base px-3 md:px-4 py-2 md:py-2 h-auto ${
                isEditing 
                  ? 'hover:bg-[#374151] hover:text-white cursor-pointer' 
                  : 'cursor-default opacity-80'
              }`}
            >
              {task.status === 'done' ? (
                <CheckCircle2 size={16} className="text-[#10B981] md:size-5" />
              ) : task.status === 'in_progress' ? (
                <Clock size={16} className="text-[#8B5CF6] md:size-5" />
              ) : (
                <Circle size={16} className="text-[#6B7280] md:size-5" />
              )}
              <span className="ml-2 text-xs md:text-sm">
                {task.status === 'done' ? 'Done' : task.status === 'in_progress' ? 'In Progress' : 'To Do'}
              </span>
            </Button>

            {/* Priority - Clickable when editing */}
            <Badge 
              className={`text-xs px-2 py-1.5 md:px-3 md:py-1.5 cursor-pointer transition-all ${
                isEditing ? 'hover:scale-105 hover:shadow-md' : ''
              } ${
                priority === 'high' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                'bg-green-500/20 text-green-400 border border-green-500/30'
              }`}
              onClick={handlePriorityClick}
            >
              Priority: {priority}
            </Badge>

            {/* Personal */}
            {task.is_personal && (
              <span className="text-xs px-2 py-1.5 md:px-3 md:py-1.5 bg-[#374151]/50 rounded text-slate-200 flex items-center gap-1">
                <User size={12} className="md:size-3" />
                <span className="hidden sm:inline">Personal</span>
              </span>
            )}

            {/* Category - Clickable when editing */}
            {taskCategory && (
              <span 
                className={`text-xs px-2 py-1.5 md:px-3 md:py-1.5 rounded text-white flex items-center gap-1 transition-all ${
                  isEditing ? 'hover:scale-105 hover:shadow-md' : ''
                }`}
                style={{ backgroundColor: taskCategory.color }}
              >
                <Tag size={12} className="md:size-3" />
                <span className="max-w-[80px] md:max-w-none truncate">{taskCategory.name}</span>
              </span>
            )}
            {!taskCategory && isEditing && (
              <span className="text-xs px-2 py-1.5 md:px-3 md:py-1.5 bg-[#374151]/50 rounded text-slate-200 flex items-center gap-1">
                <Tag size={12} className="md:size-3" />
                <span className="hidden sm:inline">No Category</span>
              </span>
            )}
          </div>

          {/* Editable Fields - Only show when editing */}
          {isEditing && (
            <>
              <div className="space-y-2">
                <Label className="text-slate-200 text-sm font-medium">Category</Label>
                <Select value={categoryId || "none"} onValueChange={(value) => setCategoryId(value === "none" ? null : value)}>
                  <SelectTrigger className="bg-[#1A1A1A] border-[#374151] focus:border-[#8B5CF6] focus:ring-[#8B5CF6]/20 text-slate-200 h-12 md:h-10 px-4 text-base">
                    <SelectValue placeholder="Select a category..." />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1A1A1A] border-[#374151] text-slate-200 min-w-[280px] md:min-w-[240px] max-h-[300px]">
                    <SelectItem value="none" className="hover:bg-[#374151] py-3 md:py-2.5 px-4 text-base">
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-full bg-[#6B7280]" />
                        <span>No category</span>
                      </div>
                    </SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id} className="hover:bg-[#374151] py-3 md:py-2.5 px-4 text-base">
                        <div className="flex items-center gap-3">
                          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: category.color }} />
                          <span>{category.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="taskDescriptionDetail" className="text-slate-200 text-sm font-medium">Description</Label>
            <Textarea
              id="taskDescriptionDetail"
              placeholder="Add a detailed description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-[#1A1A1A] border-[#374151] focus:border-[#8B5CF6] focus:ring-[#8B5CF6]/20 text-slate-200 placeholder:text-[#6B7280] min-h-[120px] md:min-h-[160px] resize-none"
              disabled={!isEditing}
            />
          </div>

          <div className="flex gap-3 pt-2 pb-6 md:pb-0">
            {isEditing ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancelEdit}
                  className="flex-1 bg-[#1A1A1A] border-[#374151] text-white hover:bg-[#374151] hover:border-[#6B7280] h-12 md:h-10 text-sm md:text-base"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex-1 bg-gradient-to-r from-[#8B5CF6] to-[#A855F7] hover:from-[#7C3AED] hover:to-[#9333EA] text-white h-12 md:h-10 text-sm md:text-base"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </>
            ) : (
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1 bg-[#1A1A1A] border-[#374151] text-white hover:bg-[#374151] hover:border-[#6B7280] h-12 md:h-10 text-sm md:text-base"
              >
                Close
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
