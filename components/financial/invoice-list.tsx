'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Trash2, MoreHorizontal, CheckCircle, Send, Clock, XCircle, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { EmptyState } from '@/components/shared/empty-state'
import { deleteInvoiceAction, updateInvoiceStatusAction } from '@/lib/actions/invoice.actions'
import type { InvoiceWithClient, InvoiceStatus } from '@/types/app.types'

const STATUS_LABELS: Record<InvoiceStatus, string> = {
  draft: 'Rascunho',
  sent: 'Enviada',
  paid: 'Paga',
  overdue: 'Vencida',
  cancelled: 'Cancelada',
}

const STATUS_COLORS: Record<InvoiceStatus, string> = {
  draft: 'bg-gray-100 text-gray-700',
  sent: 'bg-blue-100 text-blue-700',
  paid: 'bg-green-100 text-green-700',
  overdue: 'bg-red-100 text-red-700',
  cancelled: 'bg-gray-100 text-gray-500',
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount)
}

function formatDate(date: string | null) {
  if (!date) return '—'
  return new Date(date + 'T00:00:00').toLocaleDateString('pt-BR')
}

interface InvoiceListProps {
  invoices: InvoiceWithClient[]
  workspaceSlug: string
}

export function InvoiceList({ invoices, workspaceSlug }: InvoiceListProps) {
  const router = useRouter()
  const [loadingId, setLoadingId] = useState<string | null>(null)

  async function handleStatusChange(invoiceId: string, status: InvoiceStatus) {
    setLoadingId(invoiceId)
    const result = await updateInvoiceStatusAction(invoiceId, status, workspaceSlug)
    setLoadingId(null)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Status atualizado')
      router.refresh()
    }
  }

  async function handleDelete(invoiceId: string) {
    setLoadingId(invoiceId)
    const result = await deleteInvoiceAction(invoiceId, workspaceSlug)
    setLoadingId(null)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Fatura excluída')
      router.refresh()
    }
  }

  if (invoices.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title="Nenhuma fatura ainda"
        description="Crie sua primeira fatura para começar a controlar o financeiro."
      />
    )
  }

  return (
    <div className="border rounded-lg divide-y overflow-hidden">
      {invoices.map((invoice) => (
        <div key={invoice.id} className="flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs text-muted-foreground">{invoice.number}</span>
              <Badge className={`text-xs px-2 py-0 ${STATUS_COLORS[invoice.status as InvoiceStatus]}`}>
                {STATUS_LABELS[invoice.status as InvoiceStatus]}
              </Badge>
            </div>
            <p className="font-medium text-sm mt-0.5 truncate">{invoice.title}</p>
            <p className="text-xs text-muted-foreground">
              {invoice.clients?.name ?? '—'}
              {invoice.projects ? ` · ${invoice.projects.name}` : ''}
            </p>
          </div>

          <div className="text-right shrink-0">
            <p className="font-semibold text-sm">{formatCurrency(invoice.amount)}</p>
            {invoice.due_date && (
              <p className="text-xs text-muted-foreground">Vence {formatDate(invoice.due_date)}</p>
            )}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger render={
              <Button variant="ghost" size="icon" disabled={loadingId === invoice.id}>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            } />
            <DropdownMenuContent align="end">
              {invoice.status !== 'sent' && invoice.status !== 'paid' && (
                <DropdownMenuItem onSelect={() => handleStatusChange(invoice.id, 'sent')}>
                  <Send className="h-4 w-4 mr-2" /> Marcar como enviada
                </DropdownMenuItem>
              )}
              {invoice.status !== 'paid' && (
                <DropdownMenuItem onSelect={() => handleStatusChange(invoice.id, 'paid')}>
                  <CheckCircle className="h-4 w-4 mr-2" /> Marcar como paga
                </DropdownMenuItem>
              )}
              {invoice.status !== 'overdue' && invoice.status !== 'paid' && (
                <DropdownMenuItem onSelect={() => handleStatusChange(invoice.id, 'overdue')}>
                  <Clock className="h-4 w-4 mr-2" /> Marcar como vencida
                </DropdownMenuItem>
              )}
              {invoice.status !== 'cancelled' && (
                <DropdownMenuItem onSelect={() => handleStatusChange(invoice.id, 'cancelled')}>
                  <XCircle className="h-4 w-4 mr-2" /> Cancelar
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={() => handleDelete(invoice.id)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" /> Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ))}
    </div>
  )
}
