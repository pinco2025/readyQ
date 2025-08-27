"use client"

import { useState } from "react"
import { useAuth } from "@/hooks/useAuth"
import { useNotes } from "@/hooks/useNotes"
import { NotesView } from "@/components/views/NotesView"
import { AppLayout } from "@/components/layout/AppLayout"

export default function NotesPage() {
  const { user } = useAuth()
  const notesHook = useNotes(user?.uid || null)

  return (
    <AppLayout>
      <NotesView {...notesHook} />
    </AppLayout>
  )
}
