import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import type { InvoiceWithClient, TimeEntryWithUser, CampaignCost } from '@/types/app.types'

interface ProfitabilityCardProps {
  invoices: InvoiceWithClient[]
  timeEntries: TimeEntryWithUser[]
  costs: CampaignCost[]
  projectName?: string
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount)
}

export function ProfitabilityCard({ invoices, timeEntries, costs, projectName }: ProfitabilityCardProps) {
  const revenue = invoices
    .filter((i) => i.status === 'paid' || i.status === 'sent')
    .reduce((sum, i) => sum + i.amount, 0)

  const hoursCost = timeEntries.reduce((sum, e) => sum + (e.hours * (e.hourly_rate ?? 0)), 0)
  const campaignCosts = costs.reduce((sum, c) => sum + c.amount, 0)
  const totalCosts = hoursCost + campaignCosts

  const margin = revenue - totalCosts
  const marginPct = revenue > 0 ? (margin / revenue) * 100 : 0

  const Icon = marginPct >= 30 ? TrendingUp : marginPct >= 0 ? Minus : TrendingDown
  const marginColor = marginPct >= 30 ? 'text-emerald-400' : marginPct >= 0 ? 'text-amber-400' : 'text-red-400'

  const rows = [
    { label: 'Receita (faturas)', value: formatCurrency(revenue), valueClass: 'text-blue-400' },
    { label: 'Horas trabalhadas', value: `${timeEntries.reduce((s, e) => s + e.hours, 0).toFixed(1)}h · ${formatCurrency(hoursCost)}`, valueClass: 'text-red-400' },
    { label: 'Custos de campanha', value: formatCurrency(campaignCosts), valueClass: 'text-red-400' },
    { label: 'Total de custos', value: formatCurrency(totalCosts), valueClass: 'text-red-400 font-medium' },
  ]

  return (
    <div className="card-sun rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-white/70">
          {projectName ? `Rentabilidade — ${projectName}` : 'Rentabilidade geral'}
        </h3>
        <Icon className={`h-4 w-4 ${marginColor}`} />
      </div>

      <div className="space-y-2">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between">
            <span className="text-xs text-white/50">{row.label}</span>
            <span className={`text-xs ${row.valueClass}`}>{row.value}</span>
          </div>
        ))}
      </div>

      <div className="pt-2 border-t border-white/[0.07]">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Margem bruta</span>
          <span className={`text-sm font-semibold ${marginColor}`}>
            {formatCurrency(margin)} ({marginPct.toFixed(1)}%)
          </span>
        </div>
      </div>
    </div>
  )
}
