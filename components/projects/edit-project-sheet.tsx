'use client'

import { useState } from 'react'
import { Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { ProjectForm } from './project-form'
import { updateProjectAction } from '@/lib/actions/project.actions'
import type { ProjectWithClient, Client } from '@/types/app.types'

interface EditProjectSheetProps {
  project: ProjectWithClient
  workspaceId: string
  workspaceSlug: string
  clients: Client[]
}

export function EditProjectSheet({ project, workspaceId, workspaceSlug, clients }: EditProjectSheetProps) {
  const [open, setOpen] = useState(false)

  async function handleAction(_wid: string, _wslug: string, formData: FormData) {
    return updateProjectAction(project.id, workspaceSlug, formData)
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger render={
        <Button variant="outline" size="sm">
          <Pencil className="h-4 w-4 mr-2" />
          Editar
        </Button>
      } />
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Editar projeto</SheetTitle>
        </SheetHeader>
        <div className="mt-6">
          <ProjectForm
            workspaceId={workspaceId}
            workspaceSlug={workspaceSlug}
            clients={clients}
            project={project}
            action={handleAction}
            onSuccess={() => setOpen(false)}
          />
        </div>
      </SheetContent>
    </Sheet>
  )
}
