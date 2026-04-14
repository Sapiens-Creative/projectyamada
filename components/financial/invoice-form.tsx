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
import type { Invoice, Client, Project } from '@/types/app.types'

interface InvoiceFormProps {
  workspaceId: string
  workspaceSlug: string
  clients: Client[]
  projects: Project[]
  invoice?: Invoice
  nextNumber?: string
  action: (workspaceId: string, workspaceSlug: string, formData: FormData) => Promise<{ data: unknown; error: string | null; success: boolean }>
  onSuccess?: () => void
}

export function InvoiceForm({ workspaceId, workspaceSlug, clients, projects, invoice, nextNumber, action, onSuccess }: InvoiceFormProps) {
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
        toast.success(invoice ? 'Fatura atualizada' : 'Fatura criada')
        onSuccess?.()
        router.refresh()
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="number">Número *</Label>
          <Input
            id="number"
            name="number"
            defaultValue={invoice?.number ?? nextNumber ?? ''}
            placeholder="FAT-001"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select name="status" defaultValue={invoice?.status ?? 'draft'}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Rascunho</SelectItem>
              <SelectItem value="sent">Enviada</SelectItem>
              <SelectItem value="paid">Paga</SelectItem>
              <SelectItem value="overdue">Vencida</SelectItem>
              <SelectItem value="cancelled">Cancelada</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="title">Descrição / Título *</Label>
        <Input
          id="title"
          name="title"
          defaultValue={invoice?.title ?? ''}
          placeholder="Ex: Gestão de redes sociais — Março 2026"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="client_id">Cliente *</Label>
          <Select name="client_id" defaultValue={invoice?.client_id ?? ''} required>
            <SelectTrigger>
              <SelectValue placeholder="Selecione..." />
            </SelectTrigger>
            <SelectContent>
              {clients.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="project_id">Projeto</Label>
          <Select name="project_id" defaultValue={invoice?.project_id ?? 'none'}>
            <SelectTrigger>
              <SelectValue placeholder="Opcional..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Sem projeto</SelectItem>
              {projects.map((p) => (
                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="amount">Valor (R$) *</Label>
          <Input
            id="amount"
            name="amount"
            type="number"
            step="0.01"
            min="0"
            defaultValue={invoice?.amount ?? ''}
            placeholder="0,00"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="due_date">Vencimento</Label>
          <Input id="due_date" name="due_date" type="date" defaultValue={invoice?.due_date ?? ''} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="paid_at">Data de pagamento</Label>
        <Input id="paid_at" name="paid_at" type="date" defaultValue={invoice?.paid_at ?? ''} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Observações</Label>
        <Textarea
          id="notes"
          name="notes"
          defaultValue={invoice?.notes ?? ''}
          placeholder="Condições, observações..."
          rows={3}
        />
      </div>

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? 'Salvando...' : invoice ? 'Salvar alterações' : 'Criar fatura'}
      </Button>
    </form>
  )
}
