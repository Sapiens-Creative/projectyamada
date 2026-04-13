'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Project, Client } from '@/types/app.types'

interface ProjectFormProps {
  workspaceId: string
  workspaceSlug: string
  clients: Client[]
  project?: Project
  action: (workspaceId: string, workspaceSlug: string, formData: FormData) => Promise<{ data: unknown; error: string | null; success: boolean }>
  onSuccess?: () => void
}

export function ProjectForm({ workspaceId, workspaceSlug, clients, project, action, onSuccess }: ProjectFormProps) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await action(workspaceId, workspaceSlug, formData)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(project ? 'Projeto atualizado' : 'Projeto criado')
        onSuccess?.()
        router.refresh()
      }
    })
  }

  function generateSlug(name: string) {
    return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nome *</Label>
        <Input
          id="name"
          name="name"
          defaultValue={project?.name}
          placeholder="Ex: Campanha de Verão 2026"
          onChange={(e) => {
            const slugInput = document.getElementById('slug') as HTMLInputElement
            if (slugInput && !project) slugInput.value = generateSlug(e.target.value)
          }}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="slug">Slug *</Label>
        <Input
          id="slug"
          name="slug"
          defaultValue={project?.slug}
          placeholder="campanha-verao-2026"
          pattern="[a-z0-9-]+"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descrição</Label>
        <Textarea
          id="description"
          name="description"
          defaultValue={project?.description ?? ''}
          placeholder="Descreva o projeto..."
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select name="status" defaultValue={project?.status ?? 'planning'}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="planning">Planejamento</SelectItem>
              <SelectItem value="active">Ativo</SelectItem>
              <SelectItem value="paused">Pausado</SelectItem>
              <SelectItem value="completed">Concluído</SelectItem>
              <SelectItem value="cancelled">Cancelado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="client_id">Cliente</Label>
          <Select name="client_id" defaultValue={project?.client_id ?? 'none'}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Sem cliente</SelectItem>
              {clients.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="start_date">Data de início</Label>
          <Input id="start_date" name="start_date" type="date" defaultValue={project?.start_date ?? ''} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="end_date">Data de fim</Label>
          <Input id="end_date" name="end_date" type="date" defaultValue={project?.end_date ?? ''} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="budget">Orçamento (R$)</Label>
        <Input
          id="budget"
          name="budget"
          type="number"
          step="0.01"
          min="0"
          defaultValue={project?.budget ?? ''}
          placeholder="0.00"
        />
      </div>

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? 'Salvando...' : project ? 'Salvar alterações' : 'Criar projeto'}
      </Button>
    </form>
  )
}
