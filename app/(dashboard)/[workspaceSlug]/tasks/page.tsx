import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getTasks } from '@/lib/actions/task.actions'
import { getProjects } from '@/lib/actions/project.actions'
import { getClients } from '@/lib/actions/client.actions'
import { getTeamMembers } from '@/lib/actions/team.actions'
import type { Workspace, TaskWithAssignee, Project, Client, WorkspaceMemberWithProfile } from '@/types/app.types'
import { TaskList } from '@/components/tasks/task-list'
import { NewTaskSheet } from '@/components/tasks/new-task-sheet'

interface PageProps {
  params: Promise<{ workspaceSlug: string }>
}

export default async function TasksPage({ params }: PageProps) {
  const { workspaceSlug } = await params
  const supabase = await createClient()

  const { data: workspaceRaw } = await supabase
    .from('workspaces')
    .select('*')
    .eq('slug', workspaceSlug)
    .single()

  if (!workspaceRaw) notFound()
  const workspace = workspaceRaw as Workspace

  const [tasksResult, projectsResult, clientsResult, membersResult] = await Promise.all([
    getTasks(workspace.id),
    getProjects(workspace.id),
    getClients(workspace.id),
    getTeamMembers(workspace.id),
  ])

  const tasks = (tasksResult.data ?? []) as TaskWithAssignee[]
  const projects = (projectsResult.data ?? []) as Project[]
  const clients = (clientsResult.data ?? []) as Client[]
  const members = (membersResult.data ?? []) as WorkspaceMemberWithProfile[]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Tarefas</h1>
          <p className="text-muted-foreground text-sm">{tasks.length} tarefa{tasks.length !== 1 ? 's' : ''}</p>
        </div>
        <NewTaskSheet
          workspaceId={workspace.id}
          workspaceSlug={workspaceSlug}
          projects={projects}
          clients={clients}
          members={members}
        />
      </div>

      <TaskList tasks={tasks} workspaceSlug={workspaceSlug} />
    </div>
  )
}
