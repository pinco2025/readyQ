"use client"

import { useState, useEffect } from "react"
import { X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PrioritySelector } from "@/components/common/PrioritySelector"
import { PersonalToggle } from "@/components/common/PersonalToggle"
import { CategorySelector } from "@/components/common/CategorySelector"
import { useTasks } from "@/hooks/useTasks"
import { useToast } from "@/hooks/use-toast"

interface TaskCreationModalProps {
  isOpen: boolean
  onClose: () => void
}

export function TaskCreationModal({ isOpen, onClose }: TaskCreationModalProps) {
  const [taskName, setTaskName] = useState("")
  const [priority, setPriority] = useState<"high" | "medium" | "low">("medium")
  const [isPersonal, setIsPersonal] = useState(false)
  const [categoryId, setCategoryId] = useState<string | null>(null)
  const [description, setDescription] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const { createTask } = useTasks()
  const { toast } = useToast()

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!taskName.trim()) {
      toast({
        title: "Error",
        description: "Task name is required",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    
    try {
      const { task, error } = await createTask({
        name: taskName.trim(),
        description: description.trim() ? description.trim() : null,
        priority,
        is_personal: isPersonal,
        completion_type: "done", // Default to done/not done
        category_id: categoryId,
      })

      if (error) {
        toast({
          title: "Error",
          description: error,
          variant: "destructive",
        })
        

      } else {
        toast({
          title: "Success",
          description: "Task created successfully!",
        })
        
        // Reset form and close modal
        setTaskName("")
        setPriority("medium")
        setIsPersonal(false)
        setCategoryId(null)
        setDescription("")
        onClose()
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to create task. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Reset form when modal opens/closes
  const handleClose = () => {
    setTaskName("")
    setPriority("medium")
    setIsPersonal(false)
    setCategoryId(null)
    setDescription("")
    onClose()
  }

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden'
      return () => {
        document.removeEventListener('keydown', handleEscape)
        document.body.style.overflow = 'unset'
      }
    }
  }, [isOpen])


  
  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-lg flex items-center justify-center p-0 md:p-4 z-[9999]"
      onClick={handleClose}
    >
      <div className="flex items-center justify-center min-h-[100dvh] w-full">
        <Card 
          className="w-full h-[100dvh] md:h-auto md:max-w-md bg-[#1A1A1A] border-[#374151] shadow-2xl animate-in slide-in-from-bottom-4 duration-300 md:mx-4 rounded-none md:rounded-lg"
          onClick={(e) => e.stopPropagation()}
        >
          <CardHeader className="sticky top-0 z-10 bg-[#1A1A1A] flex flex-row items-center justify-between space-y-0 py-3 md:py-4 px-4 md:px-6 border-b border-[#374151]/30">
            <CardTitle className="text-lg md:text-xl font-bold text-white text-center md:text-left flex-1">Create New Task</CardTitle>
            <Button variant="ghost" size="sm" onClick={handleClose} className="h-8 w-8 p-0 hover:bg-[#374151]/30 text-gray-400 hover:text-white flex-shrink-0">
              <X size={16} />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4 md:space-y-6 pt-4 md:pt-6 px-4 md:px-6 overflow-y-auto max-h-[calc(100dvh-4rem)] md:max-h-none scrollbar-hide">
            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
              <div className="space-y-2">
                <Label htmlFor="taskName" className="text-white font-medium">Task Name *</Label>
                <Input
                  id="taskName"
                  placeholder="Enter task name"
                  value={taskName}
                  onChange={(e) => setTaskName(e.target.value)}
                  className="bg-[#2A2A2A] border-[#4B5563] text-white placeholder:text-gray-400 focus:border-[#8B5CF6] focus:ring-[#8B5CF6]/20 focus:bg-[#2A2A2A] focus:outline-none"
                  disabled={isSubmitting}
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <Label className="text-white font-medium">Priority Level *</Label>
                <PrioritySelector value={priority} onChange={setPriority} />
              </div>

              <div className="space-y-2">
                <Label className="text-white font-medium">Classification</Label>
                <PersonalToggle value={isPersonal} onChange={setIsPersonal} />
              </div>

              <div className="space-y-2">
                <Label className="text-white font-medium">Category</Label>
                <CategorySelector 
                  value={categoryId} 
                  onChange={setCategoryId}
                  placeholder="Select or create a category..."
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="taskDescription" className="text-white font-medium">Description</Label>
                <Textarea
                  id="taskDescription"
                  placeholder="Add an optional description..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="bg-[#2A2A2A] border-[#4B5563] text-white placeholder:text-gray-400 focus:border-[#8B5CF6] focus:ring-[#8B5CF6]/20 focus:bg-[#2A2A2A] focus:outline-none min-h-[120px]"
                  disabled={isSubmitting}
                />
              </div>

              <div className="flex gap-3 pt-4 pb-6 md:pb-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  className="flex-1 border-[#4B5563] hover:bg-[#374151]/30 bg-[#2A2A2A] text-white hover:text-white"
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-[#8B5CF6] to-[#A855F7] hover:from-[#7C3AED] hover:to-[#9333EA] text-white font-medium"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Task'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
