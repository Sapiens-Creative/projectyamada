import { notFound } from 'next/navigation'
import { DollarSign, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getInvoices } from '@/lib/actions/invoice.actions'
import { getClients } from '@/lib/actions/client.actions'
import { getProjects } from '@/lib/actions/project.actions'
import { InvoiceList } from '@/components/financial/invoice-list'
import { NewInvoiceSheet } from '@/components/financial/new-invoice-sheet'
import type { Workspace, InvoiceWithClient, Client, Project } from '@/types/app.types'

interface PageProps {
  params: Promise<{ workspaceSlug: string }>
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount)
}

function getNextInvoiceNumber(invoices: InvoiceWithClient[]): string {
  const nums = invoices
    .map((i) => {
      const match = i.number.match(/(\d+)$/)
      return match ? parseInt(match[1], 10) : 0
    })
    .filter((n) => n > 0)
  const next = nums.length > 0 ? Math.max(...nums) + 1 : 1
  return `FAT-${String(next).padStart(3, '0')}`
}

export default async function FinancialPage({ params }: PageProps) {
  const { workspaceSlug } = await params
  const supabase = await createClient()

  const { data: workspaceRaw } = await supabase
    .from('workspaces')
    .select('*')
    .eq('slug', workspaceSlug)
    .single()

  if (!workspaceRaw) notFound()
  const workspace = workspaceRaw as Workspace

  const [invoicesResult, clientsResult, projectsResult] = await Promise.all([
    getInvoices(workspace.id),
    getClients(workspace.id),
    getProjects(workspace.id),
  ])

  const invoices = (invoicesResult.data ?? []) as InvoiceWithClient[]
  const clients = (clientsResult.data ?? []) as Client[]
  const projects = (projectsResult.data ?? []) as Project[]

  const now = new Date()
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]

  const totalFaturado = invoices.reduce((sum, i) => sum + i.amount, 0)
  const aReceber = invoices
    .filter((i) => i.status === 'sent')
    .reduce((sum, i) => sum + i.amount, 0)
  const vencido = invoices
    .filter((i) => i.status === 'overdue')
    .reduce((sum, i) => sum + i.amount, 0)
  const pagoEsteMes = invoices
    .filter((i) => i.status === 'paid' && i.paid_at && i.paid_at >= thisMonthStart)
    .reduce((sum, i) => sum + i.amount, 0)

  const nextNumber = getNextInvoiceNumber(invoices)

  const summaryCards = [
    { label: 'Total faturado', value: formatCurrency(totalFaturado), icon: DollarSign, color: 'text-blue-600' },
    { label: 'A receber', value: formatCurrency(aReceber), icon: TrendingUp, color: 'text-yellow-600' },
    { label: 'Vencido', value: formatCurrency(vencido), icon: AlertCircle, color: 'text-red-600' },
    { label: 'Pago este mês', value: formatCurrency(pagoEsteMes), icon: CheckCircle2, color: 'text-green-600' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Financeiro</h1>
          <p className="text-muted-foreground text-sm">{invoices.length} fatura{invoices.length !== 1 ? 's' : ''}</p>
        </div>
        <NewInvoiceSheet
          workspaceId={workspace.id}
          workspaceSlug={workspaceSlug}
          clients={clients}
          projects={projects}
          nextNumber={nextNumber}
        />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card) => {
          const Icon = card.icon
          return (
            <div key={card.label} className="border rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{card.label}</p>
                <Icon className={`h-4 w-4 ${card.color}`} />
              </div>
              <p className="text-xl font-bold">{card.value}</p>
            </div>
          )
        })}
      </div>

      <InvoiceList invoices={invoices} workspaceSlug={workspaceSlug} />
    </div>
  )
}
