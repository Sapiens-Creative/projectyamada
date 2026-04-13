'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { TaskForm } from './task-form'
import { createTaskAction } from '@/lib/actions/task.actions'
import type { Project, Client, WorkspaceMemberWithProfile } from '@/types/app.types'

interface NewTaskSheetProps {
  workspaceId: string
  workspaceSlug: string
  projects: Project[]
  clients: Client[]
  members: WorkspaceMemberWithProfile[]
}

export function NewTaskSheet({ workspaceId, workspaceSlug, projects, clients, members }: NewTaskSheetProps) {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger render={
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nova tarefa
        </Button>
      } />
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Nova tarefa</SheetTitle>
        </SheetHeader>
        <div className="mt-6">
          <TaskForm
            workspaceId={workspaceId}
            workspaceSlug={workspaceSlug}
            projects={projects}
            clients={clients}
            members={members}
            action={createTaskAction}
            onSuccess={() => setOpen(false)}
          />
        </div>
      </SheetContent>
    </Sheet>
  )
}
