import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getInvoices } from '@/lib/actions/invoice.actions'
import { getProjects } from '@/lib/actions/project.actions'
import { getClients } from '@/lib/actions/client.actions'
import { getTimeEntries } from '@/lib/actions/timesheet.actions'
import { getCampaignCosts } from '@/lib/actions/campaign-cost.actions'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AgencyKpis } from '@/components/reports/agency-kpis'
import { RevenueForecast } from '@/components/reports/revenue-forecast'
import { RevenueChart } from '@/components/reports/revenue-chart'
import { DonutChart } from '@/components/reports/donut-chart'
import { ClientPerformanceTable } from '@/components/reports/client-performance-table'
import { ChannelBreakdown } from '@/components/reports/channel-breakdown'
import { ProfitabilityTable } from '@/components/reports/profitability-table'
import type { Workspace, InvoiceWithClient, ProjectWithClient, Client, TimeEntryWithUser, CampaignCost } from '@/types/app.types'

interface PageProps {
  params: Promise<{ workspaceSlug: string }>
}

const MONTH_NAMES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

function getRevenueByMonth(invoices: InvoiceWithClient[]) {
  const now = new Date()
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const label = `${MONTH_NAMES[d.getMonth()]}/${String(d.getFullYear()).slice(2)}`
    const value = invoices
      .filter((inv) => inv.status === 'paid' && inv.paid_at?.startsWith(key))
      .reduce((sum, inv) => sum + inv.amount, 0)
    return { month: label, value }
  })
}

function getForecastData(invoices: InvoiceWithClient[], mrr: number, pipelineValue: number, conversionRate: number) {
  const now = new Date()
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() + i - 2, 1)
    const isPast = i < 2
    const label = `${MONTH_NAMES[d.getMonth()]}/${String(d.getFullYear()).slice(2)}`
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`

    const confirmado = isPast
      ? invoices.filter((inv) => inv.status === 'paid' && inv.paid_at?.startsWith(key)).reduce((s, i) => s + i.amount, 0)
      : mrr

    const estimado = isPast ? 0 : (pipelineValue * conversionRate) / 100 / 3

    return { month: label, confirmado, estimado }
  })
}

export default async function ReportsPage({ params }: PageProps) {
  const { workspaceSlug } = await params
  const supabase = await createClient()

  const { data: workspaceRaw } = await supabase.from('workspaces').select('*').eq('slug', workspaceSlug).single()
  if (!workspaceRaw) notFound()
  const workspace = workspaceRaw as Workspace

  const now = new Date()
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split('T')[0]

  const [
    invoicesResult,
    projectsResult,
    clientsResult,
    entriesResult,
    costsResult,
    { data: leadsRaw },
    { data: interactionsRaw },
    { data: tasksRaw },
  ] = await Promise.all([
    getInvoices(workspace.id),
    getProjects(workspace.id),
    getClients(workspace.id),
    getTimeEntries(workspace.id),
    getCampaignCosts(workspace.id),
    supabase.from('leads').select('id, source, stage, estimated_value, converted_client_id, created_at').eq('workspace_id', workspace.id),
    supabase.from('client_interactions').select('client_id, occurred_at').eq('workspace_id', workspace.id).order('occurred_at', { ascending: false }),
    supabase.from('tasks').select('project_id, status, client_id').eq('workspace_id', workspace.id),
  ])

  const invoices = (invoicesResult.data ?? []) as InvoiceWithClient[]
  const projects = (projectsResult.data ?? []) as ProjectWithClient[]
  const clients = (clientsResult.data ?? []) as Client[]
  const timeEntries = (entriesResult.data ?? []) as TimeEntryWithUser[]
  const campaignCosts = (costsResult.data ?? []) as CampaignCost[]
  const leads = (leadsRaw ?? []) as { id: string; source: string | null; stage: string; estimated_value: number | null; converted_client_id: string | null; created_at: string }[]
  const interactions = (interactionsRaw ?? []) as { client_id: string; occurred_at: string }[]
  const tasks = (tasksRaw ?? []) as { project_id: string | null; status: string; client_id: string | null }[]

  // ── Agency KPIs ──────────────────────────────────────────────────────────
  const activeClients = clients.filter((c) => c.status === 'active')
  const mrr = activeClients.reduce((sum, c) => sum + (c.monthly_fee ?? 0), 0)

  const activeLeads = leads.filter((l) => ['contacted', 'proposal', 'negotiation'].includes(l.stage))
  const pipelineValue = activeLeads.reduce((sum, l) => sum + (l.estimated_value ?? 0), 0)

  const newClientsThisMonth = clients.filter((c) => c.created_at >= thisMonthStart).length
  const churnedThisMonth = clients.filter((c) => c.status === 'churned' && c.updated_at >= thisMonthStart).length

  const closedLeads = leads.filter((l) => l.stage === 'won' || l.stage === 'lost')
  const wonLeads = leads.filter((l) => l.stage === 'won')
  const conversionRate = closedLeads.length > 0 ? (wonLeads.length / closedLeads.length) * 100 : 0

  // ── Charts ────────────────────────────────────────────────────────────────
  const revenueData = getRevenueByMonth(invoices)
  const forecastData = getForecastData(invoices, mrr, pipelineValue, conversionRate)

  const projectStatusData = Object.entries(
    projects.reduce<Record<string, number>>((acc, p) => { acc[p.status] = (acc[p.status] ?? 0) + 1; return acc }, {})
  ).map(([status, value]) => ({
    name: { planning: 'Planejamento', active: 'Ativo', paused: 'Pausado', completed: 'Concluído', cancelled: 'Cancelado' }[status] ?? status,
    value,
    color: { planning: '#94a3b8', active: '#3b82f6', paused: '#f59e0b', completed: '#22c55e', cancelled: '#ef4444' }[status] ?? '#94a3b8',
  }))

  // ── Client Performance Table ──────────────────────────────────────────────
  const lastInteractionMap: Record<string, string> = {}
  interactions.forEach((i) => {
    if (!lastInteractionMap[i.client_id]) lastInteractionMap[i.client_id] = i.occurred_at
  })

  const clientRevenue: Record<string, number> = {}
  invoices.forEach((inv) => {
    clientRevenue[inv.client_id] = (clientRevenue[inv.client_id] ?? 0) + inv.amount
  })

  const projectsByClient: Record<string, number> = {}
  projects.filter((p) => p.status === 'active' && p.clients).forEach((p) => {
    const cid = p.clients!.id
    projectsByClient[cid] = (projectsByClient[cid] ?? 0) + 1
  })

  const openTasksByClient: Record<string, number> = {}
  tasks.filter((t) => t.status !== 'done' && t.client_id).forEach((t) => {
    openTasksByClient[t.client_id!] = (openTasksByClient[t.client_id!] ?? 0) + 1
  })

  const clientRows = clients
    .filter((c) => c.status === 'active')
    .sort((a, b) => (clientRevenue[b.id] ?? 0) - (clientRevenue[a.id] ?? 0))
    .map((client) => ({
      client,
      activeProjects: projectsByClient[client.id] ?? 0,
      openTasks: openTasksByClient[client.id] ?? 0,
      totalRevenue: clientRevenue[client.id] ?? 0,
      lastInteraction: lastInteractionMap[client.id] ?? null,
    }))

  // ── Channel Breakdown ─────────────────────────────────────────────────────
  const channelMap: Record<string, { total: number; won: number; value: number }> = {}
  leads.forEach((l) => {
    const src = l.source ?? 'other'
    if (!channelMap[src]) channelMap[src] = { total: 0, won: 0, value: 0 }
    channelMap[src].total++
    if (l.stage === 'won') channelMap[src].won++
    channelMap[src].value += l.estimated_value ?? 0
  })
  const channelData = Object.entries(channelMap)
    .sort((a, b) => b[1].total - a[1].total)
    .map(([source, d]) => ({ source, ...d }))

  // ── Profitability by project ──────────────────────────────────────────────
  const profitRows = projects
    .map((p) => {
      const revenue = invoices
        .filter((i) => i.project_id === p.id && (i.status === 'paid' || i.status === 'sent'))
        .reduce((s, i) => s + i.amount, 0)
      const hoursCost = timeEntries
        .filter((e) => e.project_id === p.id)
        .reduce((s, e) => s + e.hours * (e.hourly_rate ?? 0), 0)
      const costs = campaignCosts
        .filter((c) => c.project_id === p.id)
        .reduce((s, c) => s + c.amount, 0)
      const margin = revenue - hoursCost - costs
      const marginPct = revenue > 0 ? (margin / revenue) * 100 : 0
      return { projectId: p.id, projectName: p.name, revenue, hoursCost, campaignCosts: costs, margin, marginPct }
    })
    .filter((r) => r.revenue > 0 || r.hoursCost > 0 || r.campaignCosts > 0)
    .sort((a, b) => b.margin - a.margin)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Relatórios</h1>
        <p className="text-sm text-white/40">Visão analítica do workspace</p>
      </div>

      {/* Agency KPIs — always visible */}
      <AgencyKpis
        mrr={mrr}
        pipelineValue={pipelineValue}
        newClientsThisMonth={newClientsThisMonth}
        churnedThisMonth={churnedThisMonth}
        activeLeads={activeLeads.length}
        conversionRate={conversionRate}
      />

      <Tabs defaultValue="agency">
        <TabsList className="bg-white/[0.04] border border-white/[0.07]">
          <TabsTrigger value="agency">Agência</TabsTrigger>
          <TabsTrigger value="clients">Clientes</TabsTrigger>
          <TabsTrigger value="channels">Canais</TabsTrigger>
          <TabsTrigger value="profitability">Rentabilidade</TabsTrigger>
        </TabsList>

        {/* ── AGÊNCIA ── */}
        <TabsContent value="agency" className="pt-4 space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="card-sun rounded-xl p-5">
              <h2 className="text-sm font-medium text-white/60 mb-4">Faturamento recebido — últimos 6 meses</h2>
              <RevenueChart data={revenueData} />
            </div>
            <div className="card-sun rounded-xl p-5">
              <h2 className="text-sm font-medium text-white/60 mb-4">Previsão de receita — próximos 3 meses</h2>
              <RevenueForecast data={forecastData} />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="card-sun rounded-xl p-5">
              <h2 className="text-sm font-medium text-white/60 mb-4">Status dos projetos</h2>
              {projectStatusData.length > 0 ? (
                <DonutChart data={projectStatusData} />
              ) : (
                <p className="text-sm text-white/30 text-center py-10">Nenhum projeto</p>
              )}
            </div>

            <div className="card-sun rounded-xl p-5">
              <h2 className="text-sm font-medium text-white/60 mb-4">Top clientes por faturamento</h2>
              {clientRows.length === 0 ? (
                <p className="text-sm text-white/30 text-center py-10">Nenhum dado</p>
              ) : (
                <div className="space-y-3 mt-2">
                  {clientRows.slice(0, 5).map((row, i) => {
                    const total = clientRows.reduce((s, r) => s + r.totalRevenue, 0)
                    const pct = total > 0 ? (row.totalRevenue / total) * 100 : 0
                    return (
                      <div key={row.client.id} className="space-y-1.5">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium text-white/70 truncate flex items-center gap-2">
                            <span className="text-white/30 w-4">{i + 1}.</span>
                            {row.client.name}
                          </span>
                          <span className="shrink-0 font-semibold text-white/80">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(row.totalRevenue)}
                          </span>
                        </div>
                        <div className="h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
                          <div className="h-full bg-[#ff5600]/50 rounded-full" style={{ width: `${Math.min(pct, 100)}%` }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* ── CLIENTES ── */}
        <TabsContent value="clients" className="pt-4">
          <ClientPerformanceTable rows={clientRows} workspaceSlug={workspaceSlug} />
        </TabsContent>

        {/* ── CANAIS ── */}
        <TabsContent value="channels" className="pt-4 space-y-4">
          <p className="text-sm text-white/40">Leads por canal de aquisição ({leads.length} total)</p>
          <ChannelBreakdown data={channelData} />
        </TabsContent>

        {/* ── RENTABILIDADE ── */}
        <TabsContent value="profitability" className="pt-4 space-y-4">
          <p className="text-sm text-white/40">
            Rentabilidade por projeto — receita (faturas) menos custos de horas e campanha
          </p>
          <ProfitabilityTable rows={profitRows} workspaceSlug={workspaceSlug} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
