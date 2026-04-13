import Link from 'next/link'
import { Building2, FolderKanban, CheckSquare } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const CLIENT_STATUS_COLORS: Record<string, string> = {
  lead: 'bg-gray-100 text-gray-700',
  active: 'bg-green-100 text-green-700',
  paused: 'bg-yellow-100 text-yellow-700',
  churned: 'bg-red-100 text-red-700',
}

const PROJECT_STATUS_COLORS: Record<string, string> = {
  planning: 'bg-blue-100 text-blue-700',
  active: 'bg-green-100 text-green-700',
  paused: 'bg-yellow-100 text-yellow-700',
  completed: 'bg-gray-100 text-gray-700',
  cancelled: 'bg-red-100 text-red-700',
}

const TASK_PRIORITY_COLORS: Record<string, string> = {
  low: 'bg-gray-100 text-gray-600',
  medium: 'bg-blue-100 text-blue-700',
  high: 'bg-orange-100 text-orange-700',
  urgent: 'bg-red-100 text-red-700',
}

const STATUS_LABELS: Record<string, string> = {
  lead: 'Lead', active: 'Ativo', paused: 'Pausado', churned: 'Cancelado',
  planning: 'Planejamento', completed: 'Concluído', cancelled: 'Cancelado',
  low: 'Baixa', medium: 'Média', high: 'Alta', urgent: 'Urgente',
}

interface RecentActivityProps {
  workspaceSlug: string
  recentClients: Record<string, unknown>[]
  recentProjects: Record<string, unknown>[]
  recentTasks: Record<string, unknown>[]
}

export function RecentActivity({ workspaceSlug, recentClients, recentProjects, recentTasks }: RecentActivityProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Recent Clients */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            Últimos clientes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {recentClients.length === 0 ? (
            <p className="text-xs text-muted-foreground">Nenhum cliente ainda.</p>
          ) : (
            recentClients.map((c) => (
              <Link
                key={c.id as string}
                href={`/${workspaceSlug}/clients/${c.id}`}
                className="flex items-center justify-between py-1 hover:opacity-75 transition-opacity"
              >
                <span className="text-sm truncate">{c.name as string}</span>
                <Badge className={cn('text-xs ml-2 shrink-0', CLIENT_STATUS_COLORS[c.status as string] ?? 'bg-gray-100 text-gray-700')}>
                  {STATUS_LABELS[c.status as string] ?? c.status}
                </Badge>
              </Link>
            ))
          )}
          {recentClients.length > 0 && (
            <Link href={`/${workspaceSlug}/clients`} className="text-xs text-muted-foreground hover:underline block pt-1">
              Ver todos →
            </Link>
          )}
        </CardContent>
      </Card>

      {/* Recent Projects */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <FolderKanban className="h-4 w-4 text-muted-foreground" />
            Últimos projetos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {recentProjects.length === 0 ? (
            <p className="text-xs text-muted-foreground">Nenhum projeto ainda.</p>
          ) : (
            recentProjects.map((p) => (
              <Link
                key={p.id as string}
                href={`/${workspaceSlug}/projects/${p.id}`}
                className="flex items-center justify-between py-1 hover:opacity-75 transition-opacity"
              >
                <span className="text-sm truncate">{p.name as string}</span>
                <Badge className={cn('text-xs ml-2 shrink-0', PROJECT_STATUS_COLORS[p.status as string] ?? 'bg-gray-100 text-gray-700')}>
                  {STATUS_LABELS[p.status as string] ?? p.status}
                </Badge>
              </Link>
            ))
          )}
          {recentProjects.length > 0 && (
            <Link href={`/${workspaceSlug}/projects`} className="text-xs text-muted-foreground hover:underline block pt-1">
              Ver todos →
            </Link>
          )}
        </CardContent>
      </Card>

      {/* Recent Tasks */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
            Últimas tarefas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {recentTasks.length === 0 ? (
            <p className="text-xs text-muted-foreground">Nenhuma tarefa ainda.</p>
          ) : (
            recentTasks.map((t) => (
              <div key={t.id as string} className="flex items-center justify-between py-1">
                <span className={cn('text-sm truncate', t.status === 'done' && 'line-through text-muted-foreground')}>
                  {t.title as string}
                </span>
                <Badge className={cn('text-xs ml-2 shrink-0', TASK_PRIORITY_COLORS[t.priority as string] ?? 'bg-gray-100 text-gray-600')}>
                  {STATUS_LABELS[t.priority as string] ?? t.priority}
                </Badge>
              </div>
            ))
          )}
          {recentTasks.length > 0 && (
            <Link href={`/${workspaceSlug}/tasks`} className="text-xs text-muted-foreground hover:underline block pt-1">
              Ver todas →
            </Link>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
