import { Building2, FolderKanban, CheckSquare, AlertTriangle } from 'lucide-react'

interface Stats {
  totalClients: number
  activeClients: number
  activeProjects: number
  pendingTasks: number
  overdueTasks: number
}

export function DashboardStats({ stats }: { stats: Stats }) {
  const cards = [
    {
      title: 'Clientes ativos',
      value: stats.activeClients,
      sub: `${stats.totalClients} no total`,
      icon: Building2,
      iconColor: 'text-blue-400',
      iconBg: 'bg-blue-500/10',
    },
    {
      title: 'Projetos ativos',
      value: stats.activeProjects,
      sub: 'em andamento',
      icon: FolderKanban,
      iconColor: 'text-emerald-400',
      iconBg: 'bg-emerald-500/10',
    },
    {
      title: 'Tarefas pendentes',
      value: stats.pendingTasks,
      sub: 'a fazer / em progresso',
      icon: CheckSquare,
      iconColor: 'text-amber-400',
      iconBg: 'bg-amber-500/10',
    },
    {
      title: 'Tarefas atrasadas',
      value: stats.overdueTasks,
      sub: 'prazo vencido',
      icon: AlertTriangle,
      iconColor: stats.overdueTasks > 0 ? 'text-red-400' : 'text-white/30',
      iconBg: stats.overdueTasks > 0 ? 'bg-red-500/10' : 'bg-white/[0.04]',
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <div key={card.title} className="card-sun rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-medium text-white/50 uppercase tracking-wide">{card.title}</p>
              <div className={`rounded-lg p-2 ${card.iconBg}`}>
                <Icon className={`h-4 w-4 ${card.iconColor}`} />
              </div>
            </div>
            <p className="text-3xl font-semibold text-white tracking-tight">{card.value}</p>
            <p className="text-xs text-white/40 mt-1">{card.sub}</p>
          </div>
        )
      })}
    </div>
  )
}
