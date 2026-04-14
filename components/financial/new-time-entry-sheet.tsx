'use client'

import { useTransition, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Plus } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createTimeEntryAction } from '@/lib/actions/timesheet.actions'
import type { Project } from '@/types/app.types'

interface NewTimeEntrySheetProps {
  workspaceId: string
  workspaceSlug: string
  projects: Project[]
  defaultProjectId?: string
}

export function NewTimeEntrySheet({ workspaceId, workspaceSlug, projects, defaultProjectId }: NewTimeEntrySheetProps) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [projectId, setProjectId] = useState<string>(defaultProjectId ?? '')
  const router = useRouter()

  const today = new Date().toISOString().split('T')[0]

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    formData.set('project_id', projectId)

    startTransition(async () => {
      const result = await createTimeEntryAction(workspaceId, workspaceSlug, formData)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Horas registradas')
        setOpen(false)
        router.refresh()
      }
    })
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger render={<Button size="sm"><Plus className="h-4 w-4 mr-1.5" />Registrar horas</Button>} />
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Registrar horas</SheetTitle>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-1.5">
            <Label>Projeto *</Label>
            <Select value={projectId} onValueChange={(v) => setProjectId(v ?? '')}>
              <SelectTrigger><SelectValue placeholder="Selecionar projeto" /></SelectTrigger>
              <SelectContent>
                {projects.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Descrição</Label>
            <Textarea id="description" name="description" placeholder="O que foi feito?" rows={2} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="hours">Horas *</Label>
              <Input id="hours" name="hours" type="number" step="0.25" min="0.25" placeholder="2.5" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="hourly_rate">Taxa/h (R$)</Label>
              <Input id="hourly_rate" name="hourly_rate" type="number" step="0.01" min="0" placeholder="150.00" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="date">Data *</Label>
            <Input id="date" name="date" type="date" defaultValue={today} />
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="submit" disabled={isPending} className="flex-1">
              {isPending ? 'Salvando...' : 'Registrar'}
            </Button>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
