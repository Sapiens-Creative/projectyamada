import { Building2, FolderKanban, CheckSquare, AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

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
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      title: 'Projetos ativos',
      value: stats.activeProjects,
      sub: 'em andamento',
      icon: FolderKanban,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      title: 'Tarefas pendentes',
      value: stats.pendingTasks,
      sub: 'a fazer / em progresso',
      icon: CheckSquare,
      color: 'text-yellow-600',
      bg: 'bg-yellow-50',
    },
    {
      title: 'Tarefas atrasadas',
      value: stats.overdueTasks,
      sub: 'prazo vencido',
      icon: AlertTriangle,
      color: stats.overdueTasks > 0 ? 'text-red-600' : 'text-gray-400',
      bg: stats.overdueTasks > 0 ? 'bg-red-50' : 'bg-gray-50',
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <Card key={card.title}>
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <div className={`rounded-md p-1.5 ${card.bg}`}>
                <Icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{card.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{card.sub}</p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
