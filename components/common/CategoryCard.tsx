"use client"

import { Edit2, Trash2, Tag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
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

interface Category {
  id: string
  name: string
  color: string
  taskCount?: number
}

interface CategoryCardProps {
  category: Category
  onDelete: () => void
  onEdit: (category: Category) => void
}

export function CategoryCard({ category, onDelete, onEdit }: CategoryCardProps) {
  const taskCount = category.taskCount || 0

  return (
    <Card className="bg-[#111111]/80 border-[#374151]/30 hover:border-[#8B5CF6]/50 transition-all duration-200 group hover:shadow-lg hover:shadow-[#8B5CF6]/10">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4 flex-1 min-w-0">
            <div className="relative">
              <div 
                className="w-5 h-5 rounded-full shadow-lg" 
                style={{ backgroundColor: category.color }}
              />
              <div className="absolute inset-0 rounded-full bg-white/20 animate-pulse" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-slate-50 text-lg mb-1 truncate">
                {category.name}
              </h3>
              <div className="flex items-center gap-2 text-[#9CA3AF]">
                <Tag className="h-4 w-4" />
                <span className="text-sm">
                  {taskCount} {taskCount === 1 ? 'task' : 'tasks'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="h-9 px-3 border-[#4B5563] bg-[#1A1A1A] text-[#E5E7EB] hover:bg-[#374151]/50 hover:text-white hover:border-[#8B5CF6] hover:shadow-[#8B5CF6]/20 transition-all duration-200"
              aria-label="Edit category"
              onClick={() => onEdit(category)}
            >
              <Edit2 size={14} className="mr-2" />
              Edit
            </Button>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 px-3 border-red-500/30 bg-[#1A1A1A] text-red-400 hover:bg-red-500/20 hover:text-red-300 hover:border-red-500 transition-colors"
                  aria-label="Delete category"
                >
                  <Trash2 size={14} className="mr-2" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-[#1A1A1A] border-[#374151]">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-slate-50">
                    Delete Category
                  </AlertDialogTitle>
                  <AlertDialogDescription className="text-[#9CA3AF]">
                    Are you sure you want to delete "{category.name}"? This action cannot be undone and will remove all tasks associated with this category.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="bg-[#374151] border-[#374151] text-slate-200 hover:bg-[#4B5563]">
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={onDelete}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    Delete Category
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
