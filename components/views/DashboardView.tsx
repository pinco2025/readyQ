"use client"

import { useState } from "react"
import { KanbanBoard } from "@/components/common/KanbanBoard"
import { FloatingActionButton } from "@/components/common/FloatingActionButton"
import { TaskCreationModal } from "@/components/views/TaskCreationModal"
import { Button } from "@/components/ui/button"
import { LayoutGrid, List } from "lucide-react"

export function DashboardView() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [viewMode, setViewMode] = useState<'priority' | 'status'>('priority')
  
  return (
    <div className="h-screen flex flex-col">
      <header className="border-b border-[#374151]/30 p-6">
        <div className="max-w-screen-xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">
                {viewMode === 'priority' ? 'Priority Dashboard' : 'Status Dashboard'}
              </h1>
              <p className="text-[#6B7280] mt-1">
                {viewMode === 'priority' 
                  ? 'Organize your tasks by priority level' 
                  : 'Track your tasks by completion status'
                }
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'priority' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('priority')}
                className={`flex items-center gap-2 ${
                  viewMode === 'priority'
                    ? 'bg-gradient-to-r from-[#8B5CF6] to-[#A855F7] hover:from-[#7C3AED] hover:to-[#9333EA] text-white font-medium'
                    : 'border-[#6B7280] hover:bg-[#374151]/50 bg-[#2A2A2A] text-[#E5E7EB] hover:text-white font-medium'
                }`}
              >
                <LayoutGrid size={16} />
                Priority
              </Button>
              <Button
                variant={viewMode === 'status' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('status')}
                className={`flex items-center gap-2 ${
                  viewMode === 'status'
                    ? 'bg-gradient-to-r from-[#8B5CF6] to-[#A855F7] hover:from-[#7C3AED] hover:to-[#9333EA] text-white font-medium'
                    : 'border-[#6B7280] hover:bg-[#374151]/50 bg-[#2A2A2A] text-[#E5E7EB] hover:text-white font-medium'
                }`}
              >
                <List size={16} />
                Status
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-hidden">
        <KanbanBoard viewMode={viewMode} />
      </div>

      <FloatingActionButton onClick={() => setIsModalOpen(true)} />

      <TaskCreationModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  )
}
