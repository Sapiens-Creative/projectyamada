import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import type { Workspace } from '@/types/app.types'
import { DashboardStats } from '@/components/dashboard/dashboard-stats'
import { RecentActivity } from '@/components/dashboard/recent-activity'

interface PageProps {
  params: Promise<{ workspaceSlug: string }>
}

export default async function WorkspaceDashboard({ params }: PageProps) {
  const { workspaceSlug } = await params
  const supabase = await createClient()

  const { data: workspaceRaw } = await supabase
    .from('workspaces')
    .select('*')
    .eq('slug', workspaceSlug)
    .single()

  if (!workspaceRaw) notFound()
  const workspace = workspaceRaw as Workspace

  const today = new Date().toISOString().split('T')[0]

  const [
    { count: totalClients },
    { count: activeClients },
    { count: activeProjects },
    { count: pendingTasks },
    { count: overdueTasks },
    { data: recentClientsRaw },
    { data: recentProjectsRaw },
    { data: recentTasksRaw },
  ] = await Promise.all([
    supabase.from('clients').select('*', { count: 'exact', head: true }).eq('workspace_id', workspace.id),
    supabase.from('clients').select('*', { count: 'exact', head: true }).eq('workspace_id', workspace.id).eq('status', 'active'),
    supabase.from('projects').select('*', { count: 'exact', head: true }).eq('workspace_id', workspace.id).eq('status', 'active'),
    supabase.from('tasks').select('*', { count: 'exact', head: true }).eq('workspace_id', workspace.id).in('status', ['todo', 'in_progress', 'in_review']),
    supabase.from('tasks').select('*', { count: 'exact', head: true }).eq('workspace_id', workspace.id).lt('due_date', today).not('status', 'eq', 'done'),
    supabase.from('clients').select('id, name, slug, status, created_at').eq('workspace_id', workspace.id).order('created_at', { ascending: false }).limit(5),
    supabase.from('projects').select('id, name, slug, status, created_at, clients(name)').eq('workspace_id', workspace.id).order('created_at', { ascending: false }).limit(5),
    supabase.from('tasks').select('id, title, status, priority, created_at').eq('workspace_id', workspace.id).order('created_at', { ascending: false }).limit(5),
  ])

  const stats = {
    totalClients: totalClients ?? 0,
    activeClients: activeClients ?? 0,
    activeProjects: activeProjects ?? 0,
    pendingTasks: pendingTasks ?? 0,
    overdueTasks: overdueTasks ?? 0,
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground text-sm">Visão geral do workspace</p>
      </div>

      <DashboardStats stats={stats} />

      <RecentActivity
        workspaceSlug={workspaceSlug}
        recentClients={(recentClientsRaw ?? []) as Record<string, unknown>[]}
        recentProjects={(recentProjectsRaw ?? []) as Record<string, unknown>[]}
        recentTasks={(recentTasksRaw ?? []) as Record<string, unknown>[]}
      />
    </div>
  )
}
