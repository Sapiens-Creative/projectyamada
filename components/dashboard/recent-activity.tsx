import Link from 'next/link'
import { Building2, FolderKanban, CheckSquare } from 'lucide-react'
import { cn } from '@/lib/utils'

const CLIENT_STATUS_COLORS: Record<string, string> = {
  lead: 'bg-white/[0.06] text-white/60',
  active: 'bg-emerald-500/15 text-emerald-400',
  paused: 'bg-amber-500/15 text-amber-400',
  churned: 'bg-red-500/15 text-red-400',
}

const PROJECT_STATUS_COLORS: Record<string, string> = {
  planning: 'bg-blue-500/15 text-blue-400',
  active: 'bg-emerald-500/15 text-emerald-400',
  paused: 'bg-amber-500/15 text-amber-400',
  completed: 'bg-white/[0.06] text-white/50',
  cancelled: 'bg-red-500/15 text-red-400',
}

const TASK_PRIORITY_COLORS: Record<string, string> = {
  low: 'bg-white/[0.06] text-white/50',
  medium: 'bg-blue-500/15 text-blue-400',
  high: 'bg-orange-500/15 text-orange-400',
  urgent: 'bg-red-500/15 text-red-400',
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

function SectionCard({ title, icon: Icon, children }: {
  title: string
  icon: React.ElementType
  children: React.ReactNode
}) {
  return (
    <div className="card-sun rounded-xl p-5 flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-white/40" />
        <h3 className="text-sm font-medium text-white/70">{title}</h3>
      </div>
      <div className="border-t border-white/[0.06]" />
      {children}
    </div>
  )
}

export function RecentActivity({ workspaceSlug, recentClients, recentProjects, recentTasks }: RecentActivityProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <SectionCard title="Últimos clientes" icon={Building2}>
        <div className="space-y-1">
          {recentClients.length === 0 ? (
            <p className="text-xs text-white/30 py-2">Nenhum cliente ainda.</p>
          ) : (
            recentClients.map((c) => (
              <Link
                key={c.id as string}
                href={`/${workspaceSlug}/clients/${c.id}`}
                className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-white/[0.04] transition-colors"
              >
                <span className="text-sm text-white/80 truncate">{c.name as string}</span>
                <span className={cn('text-[10px] font-medium px-2 py-0.5 rounded-full ml-2 shrink-0', CLIENT_STATUS_COLORS[c.status as string] ?? 'bg-white/[0.06] text-white/50')}>
                  {STATUS_LABELS[c.status as string] ?? c.status}
                </span>
              </Link>
            ))
          )}
        </div>
        {recentClients.length > 0 && (
          <Link href={`/${workspaceSlug}/clients`} className="text-xs text-white/30 hover:text-[#ff5600] transition-colors mt-1">
            Ver todos →
          </Link>
        )}
      </SectionCard>

      <SectionCard title="Últimos projetos" icon={FolderKanban}>
        <div className="space-y-1">
          {recentProjects.length === 0 ? (
            <p className="text-xs text-white/30 py-2">Nenhum projeto ainda.</p>
          ) : (
            recentProjects.map((p) => (
              <Link
                key={p.id as string}
                href={`/${workspaceSlug}/projects/${p.id}`}
                className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-white/[0.04] transition-colors"
              >
                <span className="text-sm text-white/80 truncate">{p.name as string}</span>
                <span className={cn('text-[10px] font-medium px-2 py-0.5 rounded-full ml-2 shrink-0', PROJECT_STATUS_COLORS[p.status as string] ?? 'bg-white/[0.06] text-white/50')}>
                  {STATUS_LABELS[p.status as string] ?? p.status}
                </span>
              </Link>
            ))
          )}
        </div>
        {recentProjects.length > 0 && (
          <Link href={`/${workspaceSlug}/projects`} className="text-xs text-white/30 hover:text-[#ff5600] transition-colors mt-1">
            Ver todos →
          </Link>
        )}
      </SectionCard>

      <SectionCard title="Últimas tarefas" icon={CheckSquare}>
        <div className="space-y-1">
          {recentTasks.length === 0 ? (
            <p className="text-xs text-white/30 py-2">Nenhuma tarefa ainda.</p>
          ) : (
            recentTasks.map((t) => (
              <div key={t.id as string} className="flex items-center justify-between py-1.5 px-2 rounded-lg">
                <span className={cn('text-sm truncate', t.status === 'done' ? 'line-through text-white/25' : 'text-white/80')}>
                  {t.title as string}
                </span>
                <span className={cn('text-[10px] font-medium px-2 py-0.5 rounded-full ml-2 shrink-0', TASK_PRIORITY_COLORS[t.priority as string] ?? 'bg-white/[0.06] text-white/50')}>
                  {STATUS_LABELS[t.priority as string] ?? t.priority}
                </span>
              </div>
            ))
          )}
        </div>
        {recentTasks.length > 0 && (
          <Link href={`/${workspaceSlug}/tasks`} className="text-xs text-white/30 hover:text-[#ff5600] transition-colors mt-1">
            Ver todas →
          </Link>
        )}
      </SectionCard>
    </div>
  )
}
