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
import { ProjectForm } from './project-form'
import { createProjectAction } from '@/lib/actions/project.actions'
import type { Client } from '@/types/app.types'

interface NewProjectSheetProps {
  workspaceId: string
  workspaceSlug: string
  clients: Client[]
}

export function NewProjectSheet({ workspaceId, workspaceSlug, clients }: NewProjectSheetProps) {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger render={
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Novo projeto
        </Button>
      } />
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Novo projeto</SheetTitle>
        </SheetHeader>
        <div className="mt-6">
          <ProjectForm
            workspaceId={workspaceId}
            workspaceSlug={workspaceSlug}
            clients={clients}
            action={createProjectAction}
            onSuccess={() => setOpen(false)}
          />
        </div>
      </SheetContent>
    </Sheet>
  )
}
