"use client"

import { useState, useEffect } from "react"
import { X, Palette, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import type { Category } from "@/lib/firebase-types"

interface CategoryEditModalProps {
  category: Category | null
  isOpen: boolean
  onClose: () => void
  onSave: (id: string, updates: { name: string; color: string }) => Promise<{ error: string | null }>
}

export function CategoryEditModal({ category, isOpen, onClose, onSave }: CategoryEditModalProps) {
  const [name, setName] = useState("")
  const [color, setColor] = useState("#8B5CF6")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  // Update form when category changes
  useEffect(() => {
    if (category) {
      setName(category.name)
      setColor(category.color)
    }
  }, [category])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!category || !name.trim()) {
      toast({
        title: "Error",
        description: "Category name is required",
        variant: "destructive",
      })
      return
    }

    // Validate hex color format
    const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
    if (!hexColorRegex.test(color)) {
      toast({
        title: "Error",
        description: "Please enter a valid hex color (e.g., #8B5CF6)",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    
    try {
      const { error } = await onSave(category.id, {
        name: name.trim(),
        color
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
          description: "Category updated successfully!",
        })
        onClose()
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to update category. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-[#111111] border-[#374151] text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-white">
            Edit Category
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="editCategoryName" className="text-white text-sm font-medium">
              Category Name
            </Label>
            <Input
              id="editCategoryName"
              type="text"
              placeholder="Enter category name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-[#1A1A1A] border-[#374151] focus:border-[#8B5CF6] focus:ring-[#8B5CF6]/20 text-white"
              disabled={isSubmitting}
            />
          </div>
          
          <div className="space-y-2">
            <Label className="text-white text-sm font-medium flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Color
            </Label>
            <div className="flex gap-3 items-center">
              <div className="relative">
                <div 
                  className="w-12 h-12 rounded-full border-2 border-[#374151] cursor-pointer hover:border-[#8B5CF6] transition-colors overflow-hidden"
                  style={{ backgroundColor: color }}
                  onClick={() => {
                    const colorInput = document.getElementById('editCategoryColor') as HTMLInputElement
                    if (colorInput) colorInput.click()
                  }}
                >
                  <input
                    id="editCategoryColor"
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    aria-label="Select category color"
                    disabled={isSubmitting}
                  />
                </div>
              </div>
              <Input
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="bg-[#1A1A1A] border-[#374151] focus:border-[#8B5CF6] focus:ring-[#8B5CF6]/20 text-white font-mono text-sm"
                placeholder="#8B5CF6"
                disabled={isSubmitting}
              />
              {category && (name !== category.name || color !== category.color) && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setName(category.name)
                    setColor(category.color)
                  }}
                  className="px-2 py-1 h-8 text-xs border-[#374151] bg-[#1A1A1A] text-[#9CA3AF] hover:bg-[#374151] hover:text-white"
                  disabled={isSubmitting}
                >
                  Reset
                </Button>
              )}
            </div>
          </div>
          
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1 bg-[#1A1A1A] border-[#374151] text-white hover:bg-[#374151] hover:border-[#6B7280]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !name.trim() || Boolean(category && name === category.name && color === category.color)}
              className="flex-1 bg-gradient-to-r from-[#8B5CF6] to-[#A855F7] hover:from-[#7C3AED] hover:to-[#9333EA] text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (category && name === category.name && color === category.color) ? (
                "No Changes"
              ) : (
                "Update Category"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
