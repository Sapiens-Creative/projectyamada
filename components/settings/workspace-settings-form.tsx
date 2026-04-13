'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { updateWorkspaceAction } from '@/lib/actions/workspace.actions'
import type { Workspace } from '@/types/app.types'

interface WorkspaceSettingsFormProps {
  workspace: Workspace
  workspaceSlug: string
}

export function WorkspaceSettingsForm({ workspace, workspaceSlug }: WorkspaceSettingsFormProps) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await updateWorkspaceAction(workspace.id, formData)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Workspace atualizado')
        if (result.newSlug && result.newSlug !== workspaceSlug) {
          router.push(`/${result.newSlug}/settings`)
        } else {
          router.refresh()
        }
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nome do workspace</Label>
        <Input id="name" name="name" defaultValue={workspace.name} required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="slug">Slug (URL)</Label>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">okei.app/</span>
          <Input
            id="slug"
            name="slug"
            defaultValue={workspace.slug}
            pattern="[a-z0-9-]+"
            required
          />
        </div>
        <p className="text-xs text-muted-foreground">Alterar o slug muda a URL do workspace.</p>
      </div>

      <div className="space-y-2">
        <Label>Plano</Label>
        <p className="text-sm font-medium capitalize">{workspace.plan}</p>
      </div>

      <Button type="submit" disabled={isPending}>
        {isPending ? 'Salvando...' : 'Salvar alterações'}
      </Button>
    </form>
  )
}
