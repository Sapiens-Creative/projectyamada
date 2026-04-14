'use client'

import { useTransition, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Plus } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createCampaignCostAction } from '@/lib/actions/campaign-cost.actions'
import type { Project } from '@/types/app.types'

interface NewCampaignCostSheetProps {
  workspaceId: string
  workspaceSlug: string
  projects: Project[]
  defaultProjectId?: string
}

const CATEGORIES = [
  { value: 'media', label: 'Mídia' },
  { value: 'production', label: 'Produção' },
  { value: 'tools', label: 'Ferramentas' },
  { value: 'freelancer', label: 'Freelancer' },
  { value: 'other', label: 'Outros' },
]

export function NewCampaignCostSheet({ workspaceId, workspaceSlug, projects, defaultProjectId }: NewCampaignCostSheetProps) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [projectId, setProjectId] = useState<string>(defaultProjectId ?? '')
  const [category, setCategory] = useState<string>('')
  const router = useRouter()

  const today = new Date().toISOString().split('T')[0]

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    formData.set('project_id', projectId)
    formData.set('category', category)

    startTransition(async () => {
      const result = await createCampaignCostAction(workspaceId, workspaceSlug, formData)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Custo registrado')
        setOpen(false)
        router.refresh()
      }
    })
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger render={<Button size="sm" variant="outline"><Plus className="h-4 w-4 mr-1.5" />Registrar custo</Button>} />
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Registrar custo</SheetTitle>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {!defaultProjectId && (
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
          )}

          <div className="space-y-1.5">
            <Label>Categoria *</Label>
            <Select value={category} onValueChange={(v) => setCategory(v ?? '')}>
              <SelectTrigger><SelectValue placeholder="Selecionar categoria" /></SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Descrição *</Label>
            <Input id="description" name="description" placeholder="Ex: Google Ads — Campanha Black Friday" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="amount">Valor (R$) *</Label>
              <Input id="amount" name="amount" type="number" step="0.01" min="0.01" placeholder="1200.00" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="date">Data *</Label>
              <Input id="date" name="date" type="date" defaultValue={today} />
            </div>
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
