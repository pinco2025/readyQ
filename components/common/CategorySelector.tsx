"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Check, ChevronsUpDown, Plus, X, Tag, ChevronDown } from "lucide-react"
import { useCategories } from "@/hooks/useCategories"
import { useToast } from "@/hooks/use-toast"
import type { Category } from "@/lib/firebase-types"

interface CategorySelectorProps {
  value: string | null
  onChange: (categoryId: string | null) => void
  placeholder?: string
  disabled?: boolean
  compact?: boolean
}

export function CategorySelector({ 
  value, 
  onChange, 
  placeholder = "Select category...",
  disabled = false,
  compact = false
}: CategorySelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState("")
  const [newCategoryColor, setNewCategoryColor] = useState("#8B5CF6")
  const [isCreating, setIsCreating] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newlyCreatedId, setNewlyCreatedId] = useState<string | null>(null)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  
  const { categories, createCategory, loading, error } = useCategories()
  const { toast } = useToast()

  const selectedCategory = categories.find(cat => cat.id === value)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setShowCreateForm(false)
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
    setShowCreateForm(false)
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
        
        // Reset form and return to category list instead of auto-selecting
        setNewCategoryName("")
        setNewCategoryColor("#8B5CF6")
        setShowCreateForm(false)
        setNewlyCreatedId(category.id)
        setShowSuccessMessage(true)
        // Keep dropdown open to show the updated list
        
        // Clear the highlight and success message after a few seconds
        setTimeout(() => {
          setNewlyCreatedId(null)
          setShowSuccessMessage(false)
        }, 3000)
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

  const predefinedColors = [
    "#8B5CF6", "#EF4444", "#10B981", "#F59E0B", 
    "#3B82F6", "#F97316", "#EC4899", "#06B6D4"
  ]

  return (
    <div className="relative" ref={dropdownRef}>
      {selectedCategory ? (
        <div className="flex items-center gap-2">
          <Badge 
            className="text-xs px-2 py-1 h-6"
            style={{ 
              backgroundColor: selectedCategory.color,
              color: 'white',
              border: 'none'
            }}
          >
            <Tag size={10} className="mr-1" />
            {selectedCategory.name}
          </Badge>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleRemoveCategory}
            className="h-5 w-5 p-0 hover:bg-red-500/20 hover:text-red-400"
            aria-label="Remove category"
          >
            <X size={10} />
          </Button>
        </div>
      ) : (
        <div className="relative">
          <Button
            type="button"
            variant="outline"
            size={compact ? "sm" : "default"}
            className="w-full justify-between text-left font-normal bg-[#111111] border-[#374151] text-gray-400 hover:text-white hover:bg-[#1A1A1A] h-9 min-w-0"
            disabled={disabled || loading}
            onClick={() => setIsOpen(!isOpen)}
          >
            <div className="flex items-center min-w-0">
              <Tag size={12} className="mr-2 text-[#6B7280] flex-shrink-0" />
              <span className="text-sm truncate">
                {loading ? 'Loading...' : placeholder}
              </span>
            </div>
            <ChevronDown size={12} className="text-[#6B7280] flex-shrink-0 ml-2" />
          </Button>
          
          {isOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-[#1A1A1A] border border-[#374151] rounded-md shadow-xl z-[9999] min-w-[200px] max-w-[280px]">
              {!showCreateForm ? (
                <div className="p-2">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-white text-xs">Categories</h4>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => setShowCreateForm(true)}
                      className="h-5 px-2 text-xs text-[#8B5CF6] hover:bg-[#8B5CF6]/20"
                    >
                      <Plus size={10} className="mr-1" />
                      New
                    </Button>
                  </div>
                  
                  {showSuccessMessage && (
                    <div className="mb-2 p-1.5 bg-[#10B981]/20 border border-[#10B981]/40 rounded text-xs text-[#10B981]">
                      ✓ Category created! Select from the list below.
                    </div>
                  )}
                  
                  {loading ? (
                    <div className="flex items-center justify-center py-2">
                      <div className="w-3 h-3 border-2 border-[#8B5CF6] border-t-transparent rounded-full animate-spin mr-2" />
                      <span className="text-gray-400 text-xs">Loading...</span>
                    </div>
                  ) : error ? (
                    <div className="text-red-400 text-xs py-1">
                      Error: {error}
                    </div>
                  ) : categories.length > 0 ? (
                    <div className="max-h-32 overflow-y-auto space-y-0.5 scrollbar-hide">
                      {categories.map((category) => (
                        <button
                          key={category.id}
                          type="button"
                          onClick={() => handleCategorySelect(category.id)}
                          className={`w-full flex items-center gap-2 p-1.5 rounded-md transition-colors text-left text-xs ${
                            newlyCreatedId === category.id 
                              ? 'bg-[#8B5CF6]/20 border border-[#8B5CF6]/40' 
                              : 'hover:bg-[#374151]/50'
                          }`}
                        >
                          <div 
                            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                            style={{ backgroundColor: category.color }}
                          />
                          <span className={`truncate ${
                            newlyCreatedId === category.id ? 'text-[#8B5CF6] font-medium' : 'text-white'
                          }`}>
                            {category.name}
                            {newlyCreatedId === category.id && ' (New!)'}
                          </span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-2">
                      <p className="text-gray-400 text-xs mb-1">No categories yet.</p>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => setShowCreateForm(true)}
                        className="text-xs text-[#8B5CF6] border-[#8B5CF6] hover:bg-[#8B5CF6]/20 h-6"
                      >
                        <Plus size={8} className="mr-1" />
                        Create First
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-2">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-white text-xs">New Category</h4>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => setShowCreateForm(false)}
                      className="h-5 w-5 p-0 text-gray-400 hover:text-white"
                    >
                      <X size={10} />
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    <Input
                      placeholder="Category name"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      className="h-7 text-xs bg-[#2A2A2A] border-[#4B5563] text-white placeholder:text-gray-400 focus:border-[#8B5CF6] focus:ring-[#8B5CF6]/20"
                      disabled={isCreating}
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          handleCreateCategory()
                        }
                      }}
                    />
                    
                    <div>
                      <div className="flex gap-1 flex-wrap">
                        {predefinedColors.map((color) => (
                          <button
                            key={color}
                            type="button"
                            onClick={() => setNewCategoryColor(color)}
                            className={`w-4 h-4 rounded-full border-2 transition-all ${
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

                    <div className="flex gap-1">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => setShowCreateForm(false)}
                        className="flex-1 h-6 text-xs border-[#4B5563] text-gray-400 hover:bg-[#374151]/30"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        onClick={handleCreateCategory}
                        className="flex-1 h-6 text-xs bg-[#8B5CF6] hover:bg-[#7C3AED] text-white"
                        disabled={isCreating || !newCategoryName.trim()}
                      >
                        {isCreating ? (
                          <>
                            <div className="w-2.5 h-2.5 border-2 border-white border-t-transparent rounded-full animate-spin mr-1" />
                            Creating
                          </>
                        ) : (
                          'Create'
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
