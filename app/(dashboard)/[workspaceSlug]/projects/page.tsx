import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getProjects } from '@/lib/actions/project.actions'
import { getClients } from '@/lib/actions/client.actions'
import type { Workspace, ProjectWithClient, Client } from '@/types/app.types'
import { ProjectCard } from '@/components/projects/project-card'
import { NewProjectSheet } from '@/components/projects/new-project-sheet'
import { EmptyState } from '@/components/shared/empty-state'
import { FolderKanban } from 'lucide-react'

interface PageProps {
  params: Promise<{ workspaceSlug: string }>
}

export default async function ProjectsPage({ params }: PageProps) {
  const { workspaceSlug } = await params
  const supabase = await createClient()

  const { data: workspaceRaw } = await supabase
    .from('workspaces')
    .select('*')
    .eq('slug', workspaceSlug)
    .single()

  if (!workspaceRaw) notFound()
  const workspace = workspaceRaw as Workspace

  const [projectsResult, clientsResult] = await Promise.all([
    getProjects(workspace.id),
    getClients(workspace.id),
  ])

  const projects = (projectsResult.data ?? []) as ProjectWithClient[]
  const clients = (clientsResult.data ?? []) as Client[]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Projetos</h1>
          <p className="text-muted-foreground text-sm">{projects.length} projeto{projects.length !== 1 ? 's' : ''}</p>
        </div>
        <NewProjectSheet
          workspaceId={workspace.id}
          workspaceSlug={workspaceSlug}
          clients={clients}
        />
      </div>

      {projects.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="Nenhum projeto ainda"
          description="Crie seu primeiro projeto para começar a organizar campanhas e entregas."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              workspaceSlug={workspaceSlug}
            />
          ))}
        </div>
      )}
    </div>
  )
}
