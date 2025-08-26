"use client"

import { useState } from "react"
import { Plus, Loader2, Palette, Tag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CategoryCard } from "@/components/common/CategoryCard"
import { CategoryEditModal } from "@/components/common/CategoryEditModal"
import { useCategories } from "@/hooks/useCategories"
import { useToast } from "@/hooks/use-toast"
import type { Category } from "@/lib/firebase-types"

export function CategoryManagement() {
  const [newCategoryName, setNewCategoryName] = useState("")
  const [newCategoryColor, setNewCategoryColor] = useState("#8B5CF6")
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Edit modal state
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  
  const { categories, loading, error, createCategory, updateCategory, deleteCategory } = useCategories()
  const { toast } = useToast()

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      toast({
        title: "Error",
        description: "Category name is required",
        variant: "destructive",
      })
      return
    }

    // Validate hex color format
    const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
    if (!hexColorRegex.test(newCategoryColor)) {
      toast({
        title: "Error",
        description: "Please enter a valid hex color (e.g., #8B5CF6)",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    
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
      } else {
        toast({
          title: "Success",
          description: "Category created successfully!",
        })
        
        // Reset form
        setNewCategoryName("")
        setNewCategoryColor("#8B5CF6")
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to create category. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category)
    setIsEditModalOpen(true)
  }

  const handleSaveEdit = async (id: string, updates: { name: string; color: string }) => {
    try {
      const { error } = await updateCategory(id, updates)
      
      if (error) {
        return { error }
      }
      
      // Close modal on success
      setIsEditModalOpen(false)
      setEditingCategory(null)
      return { error: null }
    } catch (err) {
      return { error: "Failed to update category" }
    }
  }

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false)
    setEditingCategory(null)
  }

  const handleDeleteCategory = async (id: string) => {
    try {
      const { error } = await deleteCategory(id)
      
      if (error) {
        toast({
          title: "Error",
          description: error,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Success",
          description: "Category deleted successfully!",
        })
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to delete category. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0A0A] to-[#1A1A1A]">
      <header className="border-b border-[#374151]/30 bg-[#111111]/80 backdrop-blur-sm p-4 md:p-6 md:sticky md:top-0 md:z-10">
        <div className="max-w-screen-xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-[#8B5CF6] to-[#A855F7] rounded-lg">
              <Tag className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white md:bg-gradient-to-r md:from-white md:to-[#E5E7EB] md:bg-clip-text md:text-transparent">
                Category Management
              </h1>
              <p className="text-[#9CA3AF] mt-1 text-base md:text-lg">
                Organize and manage your task categories
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="p-4 md:p-6">
        <div className="max-w-screen-xl mx-auto space-y-8">
          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-16">
              <div className="flex items-center space-x-3 text-[#9CA3AF]">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="text-lg">Loading categories...</span>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-16">
              <div className="text-[#EF4444]">
                <p className="text-xl font-semibold">Error loading categories</p>
                <p className="text-base mt-2">{error}</p>
              </div>
            </div>
          )}

          {/* Add New Category */}
          <Card className="bg-[#111111]/80 border-[#374151]/30 backdrop-blur-sm shadow-xl">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-slate-50 text-xl">
                <div className="p-2 bg-gradient-to-r from-[#8B5CF6] to-[#A855F7] rounded-lg">
                  <Plus className="h-5 w-5 text-white" />
                </div>
                Add New Category
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <Label className="text-slate-200 text-sm font-medium" htmlFor="categoryName">
                    Category Name
                  </Label>
                  <Input
                    id="categoryName"
                    placeholder="Enter category name"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    className="bg-[#1A1A1A] border-[#374151] focus:border-[#8B5CF6] focus:ring-[#8B5CF6]/20 h-12 text-slate-200 placeholder:text-[#6B7280]"
                  />
                </div>
                <div className="space-y-3">
                  <Label className="text-slate-200 text-sm font-medium flex items-center gap-2" htmlFor="categoryColor">
                    <Palette className="h-4 w-4" />
                    Color
                  </Label>
                  <div className="flex gap-3 items-center">
                    <div className="relative">
                      <div 
                        className="w-12 h-12 rounded-full border-2 border-[#374151] cursor-pointer hover:border-[#8B5CF6] transition-colors overflow-hidden"
                        style={{ backgroundColor: newCategoryColor }}
                        onClick={() => {
                          // Trigger the hidden color input
                          const colorInput = document.getElementById('categoryColor') as HTMLInputElement
                          if (colorInput) colorInput.click()
                        }}
                      >
                        <input
                          id="categoryColor"
                          type="color"
                          value={newCategoryColor}
                          onChange={(e) => setNewCategoryColor(e.target.value)}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          aria-label="Select category color"
                        />
                      </div>
                    </div>
                    <Input
                      value={newCategoryColor}
                      onChange={(e) => setNewCategoryColor(e.target.value)}
                      className="bg-[#1A1A1A] border-[#374151] focus:border-[#8B5CF6] focus:ring-[#8B5CF6]/20 text-slate-200 h-12 font-mono text-sm"
                      placeholder="#8B5CF6"
                    />
                  </div>
                </div>
                <div className="flex items-end gap-3">
                  <Button
                    onClick={handleAddCategory}
                    className="flex-1 h-12 bg-gradient-to-r from-[#8B5CF6] to-[#A855F7] hover:from-[#7C3AED] hover:to-[#9333EA] text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Plus className="mr-2 h-5 w-5" />
                        Add Category
                      </>
                    )}
                  </Button>
                  {(newCategoryName.trim() || newCategoryColor !== "#8B5CF6") && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setNewCategoryName("")
                        setNewCategoryColor("#8B5CF6")
                      }}
                      className="h-12 px-4 border-[#374151] bg-[#1A1A1A] text-[#9CA3AF] hover:bg-[#374151] hover:text-white"
                      disabled={isSubmitting}
                    >
                      Reset
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Categories List */}
          {!loading && !error && (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-semibold text-slate-50">Existing Categories</h2>
                <div className="px-3 py-1 bg-[#374151]/30 rounded-full text-sm text-[#9CA3AF]">
                  {categories.length} {categories.length === 1 ? 'category' : 'categories'}
                </div>
              </div>
              
              {categories.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {categories.map((category) => (
                    <CategoryCard
                      key={category.id}
                      category={category}
                      onDelete={() => handleDeleteCategory(category.id)}
                      onEdit={handleEditCategory}
                    />
                  ))}
                </div>
              ) : (
                <Card className="bg-[#111111]/50 border-[#374151]/30 border-dashed">
                  <CardContent className="p-12 text-center">
                    <div className="p-4 bg-[#374151]/30 rounded-full w-fit mx-auto mb-4">
                      <Tag className="h-8 w-8 text-[#6B7280]" />
                    </div>
                    <h3 className="text-lg font-medium text-slate-200 mb-2">No categories yet</h3>
                    <p className="text-[#9CA3AF]">Create your first category to organize your tasks</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Edit Category Modal */}
      <CategoryEditModal
        category={editingCategory}
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        onSave={handleSaveEdit}
      />
    </div>
  )
}
