"use client"

import { useState, useEffect, useRef } from "react"
import { Plus, X, Tag, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useCategories } from "@/hooks/useCategories"
import { useToast } from "@/hooks/use-toast"
import type { Database } from "@/lib/supabase"

type Category = Database['public']['Tables']['categories']['Row']

interface CategorySelectorProps {
  value: string | null
  onChange: (categoryId: string | null) => void
  placeholder?: string
  disabled?: boolean
}

export function CategorySelector({ 
  value, 
  onChange, 
  placeholder = "Select category...",
  disabled = false 
}: CategorySelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState("")
  const [newCategoryColor, setNewCategoryColor] = useState("#8B5CF6")
  const [isCreating, setIsCreating] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  
  const { categories, createCategory, loading, error } = useCategories()
  const { toast } = useToast()

  const selectedCategory = categories.find(cat => cat.id === value)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleCategorySelect = (categoryId: string | null) => {
    onChange(categoryId)
    setIsOpen(false)
  }

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      toast({
        title: "Error",
        description: "Category name is required",
        variant: "destructive",
      })
      return
    }

    setIsCreating(true)
    
    try {
      const { category, error } = await createCategory({
        name: newCategoryName.trim(),
        color: newCategoryColor,
      })

      if (error) {
        toast({
          title: "Error",
          description: error,
          variant: "destructive",
        })
      } else if (category) {
        toast({
          title: "Success",
          description: "Category created successfully!",
        })
        
        // Select the newly created category
        onChange(category.id)
        setNewCategoryName("")
        setNewCategoryColor("#8B5CF6")
        setIsOpen(false)
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to create category. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsCreating(false)
    }
  }

  const handleRemoveCategory = () => {
    onChange(null)
  }

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (!open) {
      // Reset form when closing
      setNewCategoryName("")
      setNewCategoryColor("#8B5CF6")
    }
  }

  const predefinedColors = [
    "#8B5CF6", // Purple
    "#EF4444", // Red
    "#10B981", // Green
    "#F59E0B", // Yellow
    "#3B82F6", // Blue
    "#F97316", // Orange
    "#EC4899", // Pink
    "#06B6D4", // Cyan
  ]

  return (
    <div className="space-y-2 relative" ref={dropdownRef}>
      {selectedCategory ? (
        <div className="flex items-center gap-2">
          <Badge 
            className="text-xs px-3 py-1"
            style={{ 
              backgroundColor: selectedCategory.color,
              color: 'white',
              border: 'none'
            }}
          >
            <Tag size={12} className="mr-1" />
            {selectedCategory.name}
          </Badge>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleRemoveCategory}
            className="h-6 w-6 p-0 hover:bg-red-500/20 hover:text-red-400"
            aria-label="Remove category"
          >
            <X size={12} />
          </Button>
        </div>
      ) : (
        <div className="relative">
          <Button
            type="button"
            variant="outline"
            className="w-full justify-between text-left font-normal bg-[#2A2A2A] border-[#4B5563] text-gray-400 hover:text-white hover:bg-[#374151]/30"
            disabled={disabled || loading}
            onClick={() => setIsOpen(!isOpen)}
          >
            <div className="flex items-center">
              <Tag size={16} className="mr-2 text-[#6B7280]" />
              <span>
                {loading ? 'Loading categories...' : placeholder}
              </span>
            </div>
            <ChevronDown size={16} className="text-[#6B7280]" />
          </Button>
          
          {isOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-[#1A1A1A] border border-[#374151] rounded-md shadow-xl z-[9999] max-h-96 overflow-hidden">
              <div className="p-4 border-b border-[#374151]/30">
                <h4 className="font-medium text-white mb-3">Select Category</h4>
                
                {loading ? (
                  <div className="flex items-center justify-center py-4">
                    <div className="w-4 h-4 border-2 border-[#8B5CF6] border-t-transparent rounded-full animate-spin mr-2" />
                    <span className="text-gray-400">Loading categories...</span>
                  </div>
                ) : error ? (
                  <div className="text-red-400 text-sm py-2">
                    Error loading categories: {error}
                  </div>
                ) : categories.length > 0 ? (
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        type="button"
                        onClick={() => handleCategorySelect(category.id)}
                        className="w-full flex items-center gap-3 p-2 rounded-md hover:bg-[#374151]/50 transition-colors text-left"
                      >
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                        <span className="text-white">{category.name}</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-400 text-sm mb-3">No categories yet.</p>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        // Focus on the category name input
                        const input = document.querySelector('input[placeholder="Category name"]') as HTMLInputElement
                        if (input) input.focus()
                      }}
                      className="text-[#8B5CF6] border-[#8B5CF6] hover:bg-[#8B5CF6]/20"
                    >
                      <Plus size={14} className="mr-2" />
                      Create Your First Category
                    </Button>
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-[#374151]/30">
                <h4 className="font-medium text-white mb-3">Create New Category</h4>
                
                <div className="space-y-3">
                  <div>
                    <Input
                      placeholder="Category name"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      className="bg-[#2A2A2A] border-[#4B5563] text-white placeholder:text-gray-400 focus:border-[#8B5CF6] focus:ring-[#8B5CF6]/20"
                      disabled={isCreating}
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          handleCreateCategory()
                        }
                      }}
                    />
                  </div>
                  
                  <div>
                    <Label className="text-white text-sm mb-2 block">Color</Label>
                    <div className="flex gap-2 flex-wrap">
                      {predefinedColors.map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setNewCategoryColor(color)}
                          className={`w-6 h-6 rounded-full border-2 transition-all ${
                            newCategoryColor === color 
                              ? 'border-white scale-110' 
                              : 'border-[#4B5563] hover:border-[#6B7280]'
                          }`}
                          style={{ backgroundColor: color }}
                          aria-label={`Select color ${color}`}
                        />
                      ))}
                    </div>
                  </div>

                  <Button
                    type="button"
                    size="sm"
                    onClick={handleCreateCategory}
                    className="w-full bg-gradient-to-r from-[#8B5CF6] to-[#A855F7] hover:from-[#7C3AED] hover:to-[#9333EA] text-white"
                    disabled={isCreating || !newCategoryName.trim()}
                  >
                    {isCreating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Plus size={16} className="mr-2" />
                        Create Category
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
