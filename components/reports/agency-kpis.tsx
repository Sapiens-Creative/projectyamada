import { TrendingUp, Users, DollarSign, Target } from 'lucide-react'

interface AgencyKpisProps {
  mrr: number
  pipelineValue: number
  newClientsThisMonth: number
  churnedThisMonth: number
  activeLeads: number
  conversionRate: number
}

function formatCurrency(v: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v)
}

export function AgencyKpis({
  mrr,
  pipelineValue,
  newClientsThisMonth,
  churnedThisMonth,
  activeLeads,
  conversionRate,
}: AgencyKpisProps) {
  const kpis = [
    {
      label: 'MRR',
      value: formatCurrency(mrr),
      sub: 'Receita mensal recorrente',
      icon: DollarSign,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
    },
    {
      label: 'Pipeline',
      value: formatCurrency(pipelineValue),
      sub: `${activeLeads} lead${activeLeads !== 1 ? 's' : ''} em negociação`,
      icon: TrendingUp,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
    },
    {
      label: 'Novos clientes',
      value: String(newClientsThisMonth),
      sub: `${churnedThisMonth} churn este mês`,
      icon: Users,
      color: newClientsThisMonth > churnedThisMonth ? 'text-emerald-400' : 'text-amber-400',
      bg: 'bg-purple-500/10',
    },
    {
      label: 'Taxa de conversão',
      value: `${conversionRate.toFixed(0)}%`,
      sub: 'Leads ganhos / total fechados',
      icon: Target,
      color: conversionRate >= 30 ? 'text-emerald-400' : 'text-amber-400',
      bg: 'bg-amber-500/10',
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {kpis.map((kpi) => {
        const Icon = kpi.icon
        return (
          <div key={kpi.label} className="card-sun rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs text-white/50">{kpi.label}</p>
              <span className={`p-1.5 rounded-lg ${kpi.bg}`}>
                <Icon className={`h-3.5 w-3.5 ${kpi.color}`} />
              </span>
            </div>
            <div>
              <p className={`text-xl font-semibold ${kpi.color}`}>{kpi.value}</p>
              <p className="text-[11px] text-white/30 mt-0.5">{kpi.sub}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
