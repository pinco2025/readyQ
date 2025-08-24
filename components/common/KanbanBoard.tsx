"use client"

import { KanbanColumn } from "./KanbanColumn"
import { useTasks } from "@/hooks/useTasks"
import { Loader2 } from "lucide-react"
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors, DragOverEvent } from "@dnd-kit/core"
import { useState, useCallback, useMemo } from "react"
import { TaskCard } from "./TaskCard"
import type { Database } from "@/lib/supabase"
import { usePerformance } from "@/hooks/usePerformance"

type Task = Database['public']['Tables']['tasks']['Row']

interface KanbanBoardProps {
  viewMode: 'priority' | 'status'
}

export function KanbanBoard({ viewMode }: KanbanBoardProps) {
  const { tasks, loading, error, updateTask } = useTasks()
  const { measureRender, optimizeTaskList } = usePerformance()
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  // Configure sensors for drag detection
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  // Optimize task lists for performance
  const optimizedTasks = useMemo(() => {
    return optimizeTaskList(tasks, 200) // Show max 200 tasks for performance
  }, [tasks, optimizeTaskList])

  // Memoize task grouping for better performance
  const { tasksByPriority, tasksByStatus } = useMemo(() => {
    const tasksByPriority = {
      high: optimizedTasks.filter(task => task.priority === 'high'),
      medium: optimizedTasks.filter(task => task.priority === 'medium'),
      low: optimizedTasks.filter(task => task.priority === 'low'),
    }

    const tasksByStatus = {
      todo: optimizedTasks.filter(task => task.status === 'todo'),
      in_progress: optimizedTasks.filter(task => task.status === 'in_progress'),
      done: optimizedTasks.filter(task => task.status === 'done'),
    }

    return { tasksByPriority, tasksByStatus }
  }, [optimizedTasks])

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const taskId = event.active.id as string
    const task = tasks.find(t => t.id === taskId)
    setActiveTask(task || null)
    setIsDragging(true)
  }, [tasks])

  const handleDragOver = useCallback((event: DragOverEvent) => {
    // This can be used for additional drag-over logic if needed
  }, [])

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveTask(null)
    setIsDragging(false)

    if (!over || !active) return

    const taskId = active.id as string
    const targetColumn = over.id as string

    // Find the task being dragged
    const task = tasks.find(t => t.id === taskId)
    if (!task) return

    try {
      if (viewMode === 'priority') {
        // Update task priority when dragging between priority columns
        if (['high', 'medium', 'low'].includes(targetColumn)) {
          await updateTask(taskId, { priority: targetColumn as 'high' | 'medium' | 'low' })
        }
      } else {
        // Update task status when dragging between status columns
        if (['todo', 'in_progress', 'done'].includes(targetColumn)) {
          await updateTask(taskId, { status: targetColumn as 'todo' | 'in_progress' | 'done' })
        }
      }
    } catch (error) {
      console.error('Failed to update task:', error)
    }
  }, [viewMode, tasks, updateTask])

  // Performance measurement
  const renderComplete = measureRender('KanbanBoard')

  if (loading) {
    return (
      <div className="h-full p-6 flex items-center justify-center">
        <div className="flex items-center space-x-2 text-[#6B7280]">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading tasks...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-full p-6 flex items-center justify-center">
        <div className="text-center text-[#EF4444] max-w-md">
          <p className="text-lg font-semibold">Error loading tasks</p>
          <p className="text-sm mt-1 mb-4">{error}</p>
        </div>
      </div>
    )
  }

  // Complete performance measurement
  renderComplete()

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className={`h-full p-6 transition-all duration-200 ${isDragging ? 'bg-[#0F0F0F]/50' : ''}`}>
        <div className="max-w-screen-xl mx-auto h-full">
          {tasks.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center text-[#6B7280] max-w-md">
                <p className="text-lg font-semibold mb-2">No tasks yet</p>
                <p className="text-sm mb-4">Create your first task to get started</p>
                <div className="text-xs bg-[#1A1A1A] p-3 rounded border border-[#374151]/30">
                  <p className="font-medium mb-2">Getting started:</p>
                  <ol className="text-left space-y-1">
                    <li>1. Click the + button to create a task</li>
                    <li>2. Your tasks will be saved automatically</li>
                    <li>3. Switch between Priority and Status views</li>
                    <li>4. Drag and drop tasks between columns</li>
                  </ol>
                </div>
              </div>
            </div>
          ) : viewMode === 'priority' ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
              <KanbanColumn 
                id="high"
                title="High Priority" 
                priority="high" 
                tasks={tasksByPriority.high} 
                color="#EF4444" 
              />
              <KanbanColumn 
                id="medium"
                title="Medium Priority" 
                priority="medium" 
                tasks={tasksByPriority.medium} 
                color="#F59E0B" 
              />
              <KanbanColumn 
                id="low"
                title="Low Priority" 
                priority="low" 
                tasks={tasksByPriority.low} 
                color="#10B981" 
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
              <KanbanColumn 
                id="todo"
                title="To Do" 
                priority="todo" 
                tasks={tasksByStatus.todo} 
                color="#6B7280" 
              />
              <KanbanColumn 
                id="in_progress"
                title="In Progress" 
                priority="in_progress" 
                tasks={tasksByStatus.in_progress} 
                color="#8B5CF6" 
              />
              <KanbanColumn 
                id="done"
                title="Done" 
                priority="done" 
                tasks={tasksByStatus.done} 
                color="#10B981" 
              />
            </div>
          )}
        </div>
      </div>

      {/* Drag Overlay */}
      <DragOverlay>
        {activeTask ? (
          <div className="transform rotate-3 scale-105">
            <TaskCard 
              task={activeTask} 
              priority={activeTask.priority} 
              priorityColor={viewMode === 'priority' ? 
                (activeTask.priority === 'high' ? '#EF4444' : 
                 activeTask.priority === 'medium' ? '#F59E0B' : '#10B981') : 
                (activeTask.status === 'todo' ? '#6B7280' : 
                 activeTask.status === 'in_progress' ? '#8B5CF6' : '#10B981')
              }
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
