"use client"

import { useState } from "react"
import { Plus, Search, Filter, X, Pin, Edit, Trash2, FolderOpen, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Note, Category } from "@/lib/firebase-types"
import { NoteFormModal } from "@/components/views/NoteFormModal"
import { PersonalToggle } from "@/components/common/PersonalToggle"
import { CategorySelector } from "@/components/common/CategorySelector"
import { FloatingActionButton } from "@/components/common/FloatingActionButton"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { formatDistanceToNow } from "date-fns"

interface NotesViewProps {
  notes: Note[]
  categories: Category[]
  loading: boolean
  error: string | null
  searchQuery: string
  setSearchQuery: (query: string) => void
  selectedCategoryId: string | null
  setSelectedCategoryId: (categoryId: string | null) => void
  showPersonalOnly: boolean
  setShowPersonalOnly: (show: boolean) => void
  addNote: (noteData: any) => Promise<void>
  updateNote: (noteId: string, updates: any) => Promise<void>
  deleteNote: (noteId: string) => Promise<void>
  togglePin: (noteId: string, isPinned: boolean) => Promise<void>
  clearFilters: () => void
}

export function NotesView({
  notes,
  categories,
  loading,
  error,
  searchQuery,
  setSearchQuery,
  selectedCategoryId,
  setSelectedCategoryId,
  showPersonalOnly,
  setShowPersonalOnly,
  addNote,
  updateNote,
  deleteNote,
  togglePin,
  clearFilters,
}: NotesViewProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingNote, setEditingNote] = useState<Note | null>(null)
  const [showTagFilter, setShowTagFilter] = useState(false)

  const handleAddNote = () => {
    setEditingNote(null)
    setIsModalOpen(true)
  }

  const handleEditNote = (note: Note) => {
    setEditingNote(note)
    setIsModalOpen(true)
  }

  const handleDeleteNote = async (noteId: string) => {
    try {
      await deleteNote(noteId)
    } catch (error) {
      console.error("Error deleting note:", error)
    }
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setEditingNote(null)
  }

  const handleSaveNote = async (noteData: any) => {
    try {
      if (editingNote) {
        await updateNote(editingNote.id, noteData)
      } else {
        await addNote(noteData)
      }
      handleModalClose()
    } catch (error) {
      console.error("Error saving note:", error)
    }
  }

  const getCategoryName = (categoryId: string | null) => {
    if (!categoryId) return null
    const category = categories.find(cat => cat.id === categoryId)
    return category?.name || null
  }

  const getCategoryColor = (categoryId: string | null) => {
    if (!categoryId) return null
    const category = categories.find(cat => cat.id === categoryId)
    return category?.color || null
  }

  if (loading) {
    return (
      <div className="flex-1 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-700 rounded w-1/4"></div>
          <div className="h-10 bg-gray-700 rounded"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Notes</h1>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-[#1A1A1A]/50 border border-[#374151]/30 rounded-lg p-4">
        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input
            placeholder="Search notes by title or content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-[#111111] border-[#374151] focus:border-[#8B5CF6] focus:ring-[#8B5CF6]/20 h-10"
          />
        </div>

        {/* Filters Row */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          {/* Category Filter */}
          <div className="flex-1 sm:max-w-xs">
            <div className="text-xs font-medium text-slate-300 mb-2">Filter by Category</div>
            <CategorySelector
              value={selectedCategoryId}
              onChange={setSelectedCategoryId}
              placeholder="All Categories"
              compact={true}
            />
          </div>

          {/* Personal Toggle */}
          <div className="flex items-center gap-3">
            <PersonalToggle
              value={showPersonalOnly}
              onChange={setShowPersonalOnly}
            />

            {/* Clear Filters */}
            {(searchQuery || selectedCategoryId || showPersonalOnly) && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="border-[#374151] text-slate-200 hover:bg-[#1A1A1A] h-8 px-3 text-xs"
              >
                <X className="w-3 h-3 mr-1" />
                Clear All
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <p className="text-red-400 font-medium">Error Loading Notes</p>
              <p className="text-red-300 mt-1">{error}</p>
              <div className="mt-3 text-sm text-red-300">
                <p>• Check your internet connection</p>
                <p>• Verify Firebase is properly configured</p>
                <p>• Ensure you're logged in</p>
                <button 
                  onClick={() => window.location.reload()} 
                  className="mt-2 text-red-400 hover:text-red-300 underline"
                >
                  Try refreshing the page
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

             {/* Notes Grid */}
       {notes.length === 0 ? (
         <div className="text-center py-12">
           <div className="w-16 h-16 mx-auto mb-4 bg-[#374151]/30 rounded-full flex items-center justify-center">
             <FolderOpen className="w-8 h-8 text-slate-400" />
           </div>
           <h3 className="text-lg font-medium text-slate-200 mb-2">No notes yet</h3>
           <p className="text-slate-400 mb-4">
             {searchQuery || selectedCategoryId || showPersonalOnly
               ? "No notes match your search criteria"
               : "Create your first note to get started"}
           </p>
           {!searchQuery && !selectedCategoryId && !showPersonalOnly && (
             <Button
               onClick={handleAddNote}
               className="bg-gradient-to-r from-[#8B5CF6] to-[#A855F7] hover:from-[#7C3AED] hover:to-[#9333EA] text-white"
             >
               <Plus className="w-4 h-4 mr-2" />
               Create Note
             </Button>
           )}
         </div>
       ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                     {notes.map((note) => (
             <NoteCard
               key={note.id}
               note={note}
               categories={categories}
               onEdit={() => handleEditNote(note)}
               onDelete={() => handleDeleteNote(note.id)}
               onTogglePin={() => togglePin(note.id, note.is_pinned)}
             />
           ))}
        </div>
      )}

             {/* Note Form Modal */}
       <NoteFormModal
         isOpen={isModalOpen}
         onClose={handleModalClose}
         onSave={handleSaveNote}
         note={editingNote}
         categories={categories}
       />
       <FloatingActionButton onClick={handleAddNote} />
    </div>
  )
}

interface NoteCardProps {
  note: Note
  categories: Category[]
  onEdit: () => void
  onDelete: () => void
  onTogglePin: () => void
}

function NoteCard({ note, categories, onEdit, onDelete, onTogglePin }: NoteCardProps) {
  const contentPreview = note.content.length > 150 
    ? note.content.substring(0, 150) + "..."
    : note.content

  const getCategoryName = (categoryId: string | null) => {
    if (!categoryId) return null
    const category = categories.find(cat => cat.id === categoryId)
    return category?.name || null
  }

  const getCategoryColor = (categoryId: string | null) => {
    if (!categoryId) return null
    const category = categories.find(cat => cat.id === categoryId)
    return category?.color || null
  }

  return (
    <Card className={`bg-[#1A1A1A] border-[#374151]/30 hover:border-[#8B5CF6]/30 transition-all ${
      note.is_pinned ? 'ring-2 ring-[#8B5CF6]/30' : ''
    }`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-slate-100 truncate">
                {note.title}
              </h3>
              {note.is_pinned && (
                <Pin className="w-4 h-4 text-[#8B5CF6] flex-shrink-0" />
              )}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {formatDistanceToNow(new Date(note.updated_at), { addSuffix: true })}
            </p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-slate-400 hover:text-slate-200"
              >
                <span className="sr-only">Open menu</span>
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                </svg>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-[#1A1A1A] border-[#374151]">
              <DropdownMenuItem onClick={onTogglePin} className="text-slate-200 hover:bg-[#374151]">
                <Pin className="w-4 h-4 mr-2" />
                {note.is_pinned ? 'Unpin' : 'Pin'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onEdit} className="text-slate-200 hover:bg-[#374151]">
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDelete} className="text-red-400 hover:bg-red-500/10">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
             <CardContent className="pt-0">
         <p className="text-slate-300 text-sm line-clamp-3 mb-3">
           {contentPreview}
         </p>
         <div className="flex items-center justify-between">
           {/* Category Badge */}
           {note.category_id && (
             <Badge
               variant="outline"
               className="text-xs border-[#374151] text-slate-300 bg-[#374151]/20"
               style={{
                 borderColor: getCategoryColor(note.category_id) || '#374151',
                 color: getCategoryColor(note.category_id) || '#D1D5DB'
               }}
             >
               {getCategoryName(note.category_id)}
             </Badge>
           )}
           
           {/* Personal Badge */}
           {note.is_personal && (
             <div className="flex items-center gap-1 text-xs text-slate-400">
               <User className="w-3 h-3" />
               <span>Personal</span>
             </div>
           )}
         </div>
       </CardContent>
    </Card>
  )
}
