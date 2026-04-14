import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getInvoices } from '@/lib/actions/invoice.actions'
import { getProjects } from '@/lib/actions/project.actions'
import { getClients } from '@/lib/actions/client.actions'
import { RevenueChart } from '@/components/reports/revenue-chart'
import { DonutChart } from '@/components/reports/donut-chart'
import type { Workspace, InvoiceWithClient, ProjectWithClient, Client } from '@/types/app.types'

interface PageProps {
  params: Promise<{ workspaceSlug: string }>
}

const MONTH_NAMES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

function getRevenueByMonth(invoices: InvoiceWithClient[]) {
  const now = new Date()
  const months: { month: string; value: number }[] = []

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const label = `${MONTH_NAMES[d.getMonth()]}/${String(d.getFullYear()).slice(2)}`
    const value = invoices
      .filter((inv) => inv.status === 'paid' && inv.paid_at && inv.paid_at.startsWith(key))
      .reduce((sum, inv) => sum + inv.amount, 0)
    months.push({ month: label, value })
  }
  return months
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount)
}

export default async function ReportsPage({ params }: PageProps) {
  const { workspaceSlug } = await params
  const supabase = await createClient()

  const { data: workspaceRaw } = await supabase
    .from('workspaces')
    .select('*')
    .eq('slug', workspaceSlug)
    .single()

  if (!workspaceRaw) notFound()
  const workspace = workspaceRaw as Workspace

  const [invoicesResult, projectsResult, clientsResult] = await Promise.all([
    getInvoices(workspace.id),
    getProjects(workspace.id),
    getClients(workspace.id),
  ])

  const invoices = (invoicesResult.data ?? []) as InvoiceWithClient[]
  const projects = (projectsResult.data ?? []) as ProjectWithClient[]
  const clients = (clientsResult.data ?? []) as Client[]

  // Revenue KPIs
  const totalPaid = invoices.filter((i) => i.status === 'paid').reduce((s, i) => s + i.amount, 0)
  const totalPending = invoices.filter((i) => i.status === 'sent').reduce((s, i) => s + i.amount, 0)
  const avgTicket = invoices.length > 0 ? invoices.reduce((s, i) => s + i.amount, 0) / invoices.length : 0
  const activeClients = clients.filter((c) => c.status === 'active').length

  // Task completion rate
  const tasksResult = await supabase
    .from('tasks')
    .select('status')
    .eq('workspace_id', workspace.id)
  const tasks = (tasksResult.data ?? []) as { status: string }[]
  const doneTasks = tasks.filter((t) => t.status === 'done').length
  const completionRate = tasks.length > 0 ? Math.round((doneTasks / tasks.length) * 100) : 0

  // Revenue chart
  const revenueData = getRevenueByMonth(invoices)

  // Project status donut
  const projectStatusColors: Record<string, string> = {
    planning: '#94a3b8',
    active: '#3b82f6',
    paused: '#f59e0b',
    completed: '#22c55e',
    cancelled: '#ef4444',
  }
  const projectStatusLabels: Record<string, string> = {
    planning: 'Planejamento',
    active: 'Ativo',
    paused: 'Pausado',
    completed: 'Concluído',
    cancelled: 'Cancelado',
  }
  const projectStatusData = Object.entries(
    projects.reduce<Record<string, number>>((acc, p) => {
      acc[p.status] = (acc[p.status] ?? 0) + 1
      return acc
    }, {})
  ).map(([status, value]) => ({
    name: projectStatusLabels[status] ?? status,
    value,
    color: projectStatusColors[status] ?? '#94a3b8',
  }))

  // Invoice status donut
  const invoiceStatusColors: Record<string, string> = {
    draft: '#94a3b8',
    sent: '#3b82f6',
    paid: '#22c55e',
    overdue: '#ef4444',
    cancelled: '#d1d5db',
  }
  const invoiceStatusLabels: Record<string, string> = {
    draft: 'Rascunho',
    sent: 'Enviada',
    paid: 'Paga',
    overdue: 'Vencida',
    cancelled: 'Cancelada',
  }
  const invoiceStatusData = Object.entries(
    invoices.reduce<Record<string, number>>((acc, i) => {
      acc[i.status] = (acc[i.status] ?? 0) + 1
      return acc
    }, {})
  ).map(([status, value]) => ({
    name: invoiceStatusLabels[status] ?? status,
    value,
    color: invoiceStatusColors[status] ?? '#94a3b8',
  }))

  // Top clients by revenue
  const clientRevenue: Record<string, { name: string; total: number; count: number }> = {}
  invoices.forEach((inv) => {
    if (!inv.clients) return
    if (!clientRevenue[inv.client_id]) {
      clientRevenue[inv.client_id] = { name: inv.clients.name, total: 0, count: 0 }
    }
    clientRevenue[inv.client_id].total += inv.amount
    clientRevenue[inv.client_id].count += 1
  })
  const topClients = Object.values(clientRevenue)
    .sort((a, b) => b.total - a.total)
    .slice(0, 5)

  const kpis = [
    { label: 'Receita recebida', value: formatCurrency(totalPaid) },
    { label: 'A receber', value: formatCurrency(totalPending) },
    { label: 'Ticket médio', value: formatCurrency(avgTicket) },
    { label: 'Clientes ativos', value: String(activeClients) },
    { label: 'Projetos', value: String(projects.length) },
    { label: 'Taxa de conclusão', value: `${completionRate}%` },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Relatórios</h1>
        <p className="text-muted-foreground text-sm">Visão geral do desempenho do workspace</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">{kpi.label}</p>
            <p className="text-2xl font-bold mt-1">{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="border rounded-lg p-4">
          <h2 className="font-semibold text-sm mb-4">Faturamento recebido — últimos 6 meses</h2>
          <RevenueChart data={revenueData} />
        </div>
        <div className="border rounded-lg p-4">
          <h2 className="font-semibold text-sm mb-4">Status dos projetos</h2>
          {projectStatusData.length > 0 ? (
            <DonutChart data={projectStatusData} />
          ) : (
            <div className="h-[220px] flex items-center justify-center text-sm text-muted-foreground">Nenhum projeto</div>
          )}
        </div>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="border rounded-lg p-4">
          <h2 className="font-semibold text-sm mb-4">Status das faturas</h2>
          {invoiceStatusData.length > 0 ? (
            <DonutChart data={invoiceStatusData} />
          ) : (
            <div className="h-[220px] flex items-center justify-center text-sm text-muted-foreground">Nenhuma fatura</div>
          )}
        </div>

        <div className="border rounded-lg p-4">
          <h2 className="font-semibold text-sm mb-4">Top clientes por faturamento</h2>
          {topClients.length === 0 ? (
            <div className="h-[220px] flex items-center justify-center text-sm text-muted-foreground">Nenhum dado</div>
          ) : (
            <div className="space-y-3 mt-2">
              {topClients.map((client, i) => {
                const pct = totalPaid > 0 ? (client.total / (totalPaid + totalPending)) * 100 : 0
                return (
                  <div key={client.name} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium truncate flex items-center gap-2">
                        <span className="text-muted-foreground w-4">{i + 1}.</span>
                        {client.name}
                      </span>
                      <span className="shrink-0 font-semibold">{formatCurrency(client.total)}</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${Math.min(pct, 100)}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
