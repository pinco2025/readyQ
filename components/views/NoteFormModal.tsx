"use client"

import { useState, useEffect } from "react"
import { X, Pin, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Note, Category } from "@/lib/firebase-types"
import { CategorySelector } from "@/components/common/CategorySelector"
import { PersonalToggle } from "@/components/common/PersonalToggle"

interface NoteFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (noteData: {
    title: string
    content: string
    category_id: string | null
    is_personal: boolean
    is_pinned: boolean
  }) => Promise<void>
  note: Note | null
  categories: Category[]
}

export function NoteFormModal({
  isOpen,
  onClose,
  onSave,
  note,
  categories,
}: NoteFormModalProps) {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [categoryId, setCategoryId] = useState<string | null>(null)
  const [isPersonal, setIsPersonal] = useState(false)
  const [isPinned, setIsPinned] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Reset form when modal opens/closes or note changes
  useEffect(() => {
    if (isOpen) {
      if (note) {
        setTitle(note.title)
        setContent(note.content)
        setCategoryId(note.category_id)
        setIsPersonal(note.is_personal)
        setIsPinned(note.is_pinned)
      } else {
        setTitle("")
        setContent("")
        setCategoryId(null)
        setIsPersonal(false)
        setIsPinned(false)
      }
      setIsLoading(false)
    }
  }, [isOpen, note])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!title.trim()) {
      alert("Please enter a title")
      return
    }

    setIsLoading(true)
    try {
      await onSave({
        title: title.trim(),
        content: content.trim(),
        category_id: categoryId,
        is_personal: isPersonal,
        is_pinned: isPinned,
      })
    } catch (error) {
      console.error("Error saving note:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#1A1A1A] border border-[#374151] rounded-lg w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#374151] flex-shrink-0">
          <h2 className="text-xl font-semibold text-slate-100">
            {note ? "Edit Note" : "Create Note"}
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          {/* Scrollable Content */}
          <div className="p-6 space-y-6 overflow-y-auto flex-1 scrollbar-hide">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title" className="text-slate-200">
                Title *
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter note title..."
                className="bg-[#111111] border-[#374151] focus:border-[#8B5CF6] focus:ring-[#8B5CF6]/20"
                required
              />
            </div>

            {/* Content */}
            <div className="space-y-2">
              <Label htmlFor="content" className="text-slate-200">
                Content
              </Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your note content..."
                className="min-h-[200px] bg-[#111111] border-[#374151] focus:border-[#8B5CF6] focus:ring-[#8B5CF6]/20 resize-none scrollbar-hide"
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label className="text-slate-200">Category</Label>
              <CategorySelector
                value={categoryId}
                onChange={setCategoryId}
                placeholder="Select a category (optional)"
              />
            </div>

            {/* Personal Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-slate-400" />
                <Label htmlFor="personal" className="text-slate-200">
                  Personal note
                </Label>
              </div>
              <Switch
                id="personal"
                checked={isPersonal}
                onCheckedChange={setIsPersonal}
                className="data-[state=checked]:bg-[#8B5CF6]"
              />
            </div>

            {/* Pin toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Pin className="w-4 h-4 text-slate-400" />
                <Label htmlFor="pinned" className="text-slate-200">
                  Pin note
                </Label>
              </div>
              <Switch
                id="pinned"
                checked={isPinned}
                onCheckedChange={setIsPinned}
                className="data-[state=checked]:bg-[#8B5CF6]"
              />
            </div>
          </div>

          {/* Actions - Always Visible */}
          <div className="flex justify-end gap-3 p-6 border-t border-[#374151] flex-shrink-0">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-[#374151] text-slate-200 hover:bg-[#374151]/30"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !title.trim()}
              className="bg-gradient-to-r from-[#8B5CF6] to-[#A855F7] hover:from-[#7C3AED] hover:to-[#9333EA] text-white disabled:opacity-50"
            >
              {isLoading ? "Saving..." : note ? "Update Note" : "Create Note"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
