"use client"

import { useState, useCallback, useMemo } from "react"
import { KanbanBoard } from "@/components/common/KanbanBoard"
import { FloatingActionButton } from "@/components/common/FloatingActionButton"
import { TaskCreationModal } from "@/components/views/TaskCreationModal"
import { Button } from "@/components/ui/button"
import { LayoutGrid, List } from "lucide-react"
import { useTasks } from "@/hooks/useTasks"


export function DashboardView() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [viewMode, setViewMode] = useState<'priority' | 'status'>('priority')

  
  // Memoize the view mode handlers to prevent unnecessary re-renders
  const handlePriorityView = useCallback(() => setViewMode('priority'), [])
  const handleStatusView = useCallback(() => setViewMode('status'), [])
  const handleModalClose = useCallback(() => setIsModalOpen(false), [])
  const handleModalOpen = useCallback(() => setIsModalOpen(true), [])
  
  // Memoize the header content to prevent unnecessary re-renders
  const headerContent = useMemo(() => ({
    title: viewMode === 'priority' ? 'Priority Dashboard' : 'Status Dashboard',
    description: viewMode === 'priority' 
      ? 'Organize your tasks by priority level' 
      : 'Track your tasks by completion status'
  }), [viewMode])
  
  // Memoize the priority button props
  const priorityButtonProps = useMemo(() => ({
    variant: viewMode === 'priority' ? 'default' as const : 'outline' as const,
    className: `flex items-center gap-2 ${
      viewMode === 'priority'
        ? 'bg-gradient-to-r from-[#8B5CF6] to-[#A855F7] hover:from-[#7C3AED] hover:to-[#9333EA] text-white font-medium'
        : 'border-[#6B7280] hover:bg-[#374151]/50 bg-[#2A2A2A] text-[#E5E7EB] hover:text-white font-medium'
    }`
  }), [viewMode])
  
  // Memoize the status button props
  const statusButtonProps = useMemo(() => ({
    variant: viewMode === 'status' ? 'default' as const : 'outline' as const,
    className: `flex items-center gap-2 ${
      viewMode === 'status'
        ? 'bg-gradient-to-r from-[#8B5CF6] to-[#A855F7] hover:from-[#7C3AED] hover:to-[#9333EA] text-white font-medium'
        : 'border-[#6B7280] hover:bg-[#374151]/50 bg-[#2A2A2A] text-[#E5E7EB] hover:text-white font-medium'
    }`
  }), [viewMode])
  
  return (
    <div className="h-screen flex flex-col">
      <header className="border-b border-[#374151]/30 p-6">
        <div className="max-w-screen-xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">
                {headerContent.title}
              </h1>
              <p className="text-[#6B7280] mt-1">
                {headerContent.description}
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              
              
              <div className="flex items-center gap-2">
                <Button
                  {...priorityButtonProps}
                  size="sm"
                  onClick={handlePriorityView}
                >
                  <LayoutGrid size={16} />
                  Priority
                </Button>
                <Button
                  {...statusButtonProps}
                  size="sm"
                  onClick={handleStatusView}
                >
                  <List size={16} />
                  Status
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-hidden">
        <KanbanBoard viewMode={viewMode} />
      </div>

      <FloatingActionButton onClick={handleModalOpen} />

      <TaskCreationModal 
        isOpen={isModalOpen} 
        onClose={handleModalClose} 
      />
    </div>
  )
}
