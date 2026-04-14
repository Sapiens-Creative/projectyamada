import { notFound } from 'next/navigation'
import { DollarSign, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getInvoices } from '@/lib/actions/invoice.actions'
import { getClients } from '@/lib/actions/client.actions'
import { getProjects } from '@/lib/actions/project.actions'
import { getTimeEntries } from '@/lib/actions/timesheet.actions'
import { getCampaignCosts } from '@/lib/actions/campaign-cost.actions'
import { InvoiceList } from '@/components/financial/invoice-list'
import { NewInvoiceSheet } from '@/components/financial/new-invoice-sheet'
import { TimesheetList } from '@/components/financial/timesheet-list'
import { NewTimeEntrySheet } from '@/components/financial/new-time-entry-sheet'
import { CampaignCostsList } from '@/components/financial/campaign-costs-list'
import { NewCampaignCostSheet } from '@/components/financial/new-campaign-cost-sheet'
import { ProfitabilityCard } from '@/components/financial/profitability-card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { Workspace, InvoiceWithClient, Client, Project, TimeEntryWithUser, CampaignCost } from '@/types/app.types'

interface PageProps {
  params: Promise<{ workspaceSlug: string }>
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount)
}

function getNextInvoiceNumber(invoices: InvoiceWithClient[]): string {
  const nums = invoices
    .map((i) => { const m = i.number.match(/(\d+)$/); return m ? parseInt(m[1], 10) : 0 })
    .filter((n) => n > 0)
  const next = nums.length > 0 ? Math.max(...nums) + 1 : 1
  return `FAT-${String(next).padStart(3, '0')}`
}

export default async function FinancialPage({ params }: PageProps) {
  const { workspaceSlug } = await params
  const supabase = await createClient()

  const { data: workspaceRaw } = await supabase.from('workspaces').select('*').eq('slug', workspaceSlug).single()
  if (!workspaceRaw) notFound()
  const workspace = workspaceRaw as Workspace

  const [invoicesResult, clientsResult, projectsResult, entriesResult, costsResult] = await Promise.all([
    getInvoices(workspace.id),
    getClients(workspace.id),
    getProjects(workspace.id),
    getTimeEntries(workspace.id),
    getCampaignCosts(workspace.id),
  ])

  const invoices = (invoicesResult.data ?? []) as InvoiceWithClient[]
  const clients = (clientsResult.data ?? []) as Client[]
  const projects = (projectsResult.data ?? []) as Project[]
  const entries = (entriesResult.data ?? []) as TimeEntryWithUser[]
  const costs = (costsResult.data ?? []) as CampaignCost[]

  const now = new Date()
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]

  const totalFaturado = invoices.reduce((sum, i) => sum + i.amount, 0)
  const aReceber = invoices.filter((i) => i.status === 'sent').reduce((sum, i) => sum + i.amount, 0)
  const vencido = invoices.filter((i) => i.status === 'overdue').reduce((sum, i) => sum + i.amount, 0)
  const pagoEsteMes = invoices
    .filter((i) => i.status === 'paid' && i.paid_at && i.paid_at >= thisMonthStart)
    .reduce((sum, i) => sum + i.amount, 0)

  const kpis = [
    { label: 'Total faturado', value: formatCurrency(totalFaturado), icon: DollarSign, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'A receber', value: formatCurrency(aReceber), icon: TrendingUp, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { label: 'Vencido', value: formatCurrency(vencido), icon: AlertCircle, color: 'text-red-400', bg: 'bg-red-500/10' },
    { label: 'Pago este mês', value: formatCurrency(pagoEsteMes), icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Financeiro</h1>
          <p className="text-sm text-white/40">{invoices.length} fatura{invoices.length !== 1 ? 's' : ''}</p>
        </div>
        <NewInvoiceSheet
          workspaceId={workspace.id}
          workspaceSlug={workspaceSlug}
          clients={clients}
          projects={projects}
          nextNumber={getNextInvoiceNumber(invoices)}
        />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {kpis.map((kpi) => {
          const Icon = kpi.icon
          return (
            <div key={kpi.label} className="card-sun rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-white/50">{kpi.label}</p>
                <span className={`p-1.5 rounded-lg ${kpi.bg}`}>
                  <Icon className={`h-3.5 w-3.5 ${kpi.color}`} />
                </span>
              </div>
              <p className={`text-lg font-semibold ${kpi.color}`}>{kpi.value}</p>
            </div>
          )
        })}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="invoices">
        <TabsList className="bg-white/[0.04] border border-white/[0.07]">
          <TabsTrigger value="invoices">Faturas ({invoices.length})</TabsTrigger>
          <TabsTrigger value="timesheet">Timesheet ({entries.length})</TabsTrigger>
          <TabsTrigger value="costs">Custos ({costs.length})</TabsTrigger>
          <TabsTrigger value="profitability">Rentabilidade</TabsTrigger>
        </TabsList>

        <TabsContent value="invoices" className="pt-4">
          <InvoiceList invoices={invoices} workspaceSlug={workspaceSlug} />
        </TabsContent>

        <TabsContent value="timesheet" className="pt-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-white/60">Horas por projeto</h2>
            <NewTimeEntrySheet
              workspaceId={workspace.id}
              workspaceSlug={workspaceSlug}
              projects={projects}
            />
          </div>
          <TimesheetList entries={entries} workspaceSlug={workspaceSlug} showProject />
        </TabsContent>

        <TabsContent value="costs" className="pt-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-white/60">Custos de campanha</h2>
            <NewCampaignCostSheet
              workspaceId={workspace.id}
              workspaceSlug={workspaceSlug}
              projects={projects}
            />
          </div>
          <CampaignCostsList costs={costs} workspaceSlug={workspaceSlug} />
        </TabsContent>

        <TabsContent value="profitability" className="pt-4">
          <ProfitabilityCard
            invoices={invoices}
            timeEntries={entries}
            costs={costs}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
