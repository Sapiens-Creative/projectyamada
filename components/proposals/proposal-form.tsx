'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { Proposal, Lead, Client, ActionResult } from '@/types/app.types'

interface ProposalFormProps {
  workspaceId: string
  workspaceSlug: string
  leads: Lead[]
  clients: Client[]
  proposal?: Proposal
  action: (workspaceId: string, workspaceSlug: string, formData: FormData) => Promise<ActionResult<Proposal>>
  onSuccess?: () => void
}

export function ProposalForm({ workspaceId, workspaceSlug, leads, clients, proposal, action, onSuccess }: ProposalFormProps) {
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
        toast.success(proposal ? 'Proposta atualizada' : 'Proposta criada')
        onSuccess?.()
        router.refresh()
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="title">Título *</Label>
        <Input id="title" name="title" required defaultValue={proposal?.title ?? ''} placeholder="ex: Proposta de Gestão de Tráfego" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="lead_id">Lead</Label>
          <Select name="lead_id" defaultValue={proposal?.lead_id ?? ''}>
            <SelectTrigger><SelectValue placeholder="Nenhum" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="">Nenhum</SelectItem>
              {leads.map((l) => (
                <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="client_id">Cliente</Label>
          <Select name="client_id" defaultValue={proposal?.client_id ?? ''}>
            <SelectTrigger><SelectValue placeholder="Nenhum" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="">Nenhum</SelectItem>
              {clients.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="total_value">Valor total (R$)</Label>
          <Input id="total_value" name="total_value" type="number" step="0.01" defaultValue={proposal?.total_value ?? ''} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="valid_until">Válida até</Label>
          <Input id="valid_until" name="valid_until" type="date" defaultValue={proposal?.valid_until ?? ''} />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="status">Status</Label>
        <Select name="status" defaultValue={proposal?.status ?? 'draft'}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="draft">Rascunho</SelectItem>
            <SelectItem value="sent">Enviada</SelectItem>
            <SelectItem value="accepted">Aceita</SelectItem>
            <SelectItem value="rejected">Recusada</SelectItem>
            <SelectItem value="expired">Expirada</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="notes">Notas / Escopo</Label>
        <Textarea id="notes" name="notes" rows={4} defaultValue={proposal?.notes ?? ''} placeholder="Descreva os serviços inclusos, condições, etc." />
      </div>

      <div className="flex gap-2 justify-end pt-2">
        <Button type="button" variant="outline" onClick={() => onSuccess?.()}>Cancelar</Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Salvando...' : proposal ? 'Salvar' : 'Criar proposta'}
        </Button>
      </div>
    </form>
  )
}
