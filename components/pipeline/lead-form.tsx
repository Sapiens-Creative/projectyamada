'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { Lead, ActionResult, WorkspaceMemberWithProfile } from '@/types/app.types'

const SOURCE_LABELS: Record<string, string> = {
  site: 'Site', landing_page: 'Landing Page', referral: 'Indicação',
  linkedin: 'LinkedIn', facebook: 'Facebook', event: 'Evento',
  cold: 'Prospecção ativa', other: 'Outro',
}

interface LeadFormProps {
  workspaceId: string
  workspaceSlug: string
  members: WorkspaceMemberWithProfile[]
  lead?: Lead
  action: (workspaceId: string, workspaceSlug: string, formData: FormData) => Promise<ActionResult<Lead>>
  onSuccess?: () => void
}

export function LeadForm({ workspaceId, workspaceSlug, members, lead, action, onSuccess }: LeadFormProps) {
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
        toast.success(lead ? 'Lead atualizado' : 'Lead criado')
        onSuccess?.()
        router.refresh()
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="name">Empresa / Nome *</Label>
        <Input id="name" name="name" required defaultValue={lead?.name ?? ''} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="contact_name">Contato</Label>
          <Input id="contact_name" name="contact_name" placeholder="Nome do responsável" defaultValue={lead?.contact_name ?? ''} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="contact_email">E-mail</Label>
          <Input id="contact_email" name="contact_email" type="email" defaultValue={lead?.contact_email ?? ''} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="contact_phone">Telefone</Label>
          <Input id="contact_phone" name="contact_phone" type="tel" defaultValue={lead?.contact_phone ?? ''} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="estimated_value">Valor estimado (R$)</Label>
          <Input id="estimated_value" name="estimated_value" type="number" step="0.01" defaultValue={lead?.estimated_value ?? ''} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="source">Origem</Label>
          <Select name="source" defaultValue={lead?.source ?? 'other'}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {Object.entries(SOURCE_LABELS).map(([v, l]) => (
                <SelectItem key={v} value={v}>{l}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="stage">Estágio</Label>
          <Select name="stage" defaultValue={lead?.stage ?? 'new'}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="new">Novo</SelectItem>
              <SelectItem value="contacted">Contactado</SelectItem>
              <SelectItem value="proposal">Proposta</SelectItem>
              <SelectItem value="negotiation">Negociação</SelectItem>
              <SelectItem value="won">Ganho</SelectItem>
              <SelectItem value="lost">Perdido</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="assigned_to">Responsável</Label>
        <Select name="assigned_to" defaultValue={lead?.assigned_to ?? ''}>
          <SelectTrigger><SelectValue placeholder="Sem responsável" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="">Sem responsável</SelectItem>
            {members.map((m) => (
              <SelectItem key={m.user_id} value={m.user_id}>
                {m.profiles.full_name ?? m.profiles.email}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="notes">Notas</Label>
        <Textarea id="notes" name="notes" rows={3} defaultValue={lead?.notes ?? ''} />
      </div>

      <div className="flex gap-2 justify-end pt-2">
        <Button type="button" variant="outline" onClick={() => onSuccess?.()}>Cancelar</Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Salvando...' : lead ? 'Salvar' : 'Criar lead'}
        </Button>
      </div>
    </form>
  )
}
