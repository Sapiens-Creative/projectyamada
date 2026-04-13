import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getProject } from '@/lib/actions/project.actions'
import { getClients } from '@/lib/actions/client.actions'
import type { Workspace, ProjectWithClient, Client } from '@/types/app.types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, Calendar, DollarSign, Building2 } from 'lucide-react'
import { EditProjectSheet } from '@/components/projects/edit-project-sheet'

const STATUS_LABELS: Record<string, string> = {
  planning: 'Planejamento',
  active: 'Ativo',
  paused: 'Pausado',
  completed: 'Concluído',
  cancelled: 'Cancelado',
}

const STATUS_COLORS: Record<string, string> = {
  planning: 'bg-blue-100 text-blue-800',
  active: 'bg-green-100 text-green-800',
  paused: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-gray-100 text-gray-800',
  cancelled: 'bg-red-100 text-red-800',
}

interface PageProps {
  params: Promise<{ workspaceSlug: string; projectId: string }>
}

export default async function ProjectDetailPage({ params }: PageProps) {
  const { workspaceSlug, projectId } = await params
  const supabase = await createClient()

  const { data: workspaceRaw } = await supabase
    .from('workspaces')
    .select('*')
    .eq('slug', workspaceSlug)
    .single()

  if (!workspaceRaw) notFound()
  const workspace = workspaceRaw as Workspace

  const [projectResult, clientsResult] = await Promise.all([
    getProject(projectId),
    getClients(workspace.id),
  ])

  if (!projectResult.data) notFound()
  const project = projectResult.data as ProjectWithClient
  const clients = (clientsResult.data ?? []) as Client[]

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/${workspaceSlug}/projects`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Projetos
          </Button>
        </Link>
      </div>

      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold">{project.name}</h1>
            <Badge className={STATUS_COLORS[project.status]}>
              {STATUS_LABELS[project.status]}
            </Badge>
          </div>
          {project.clients && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Building2 className="h-3 w-3" />
              <Link href={`/${workspaceSlug}/clients/${project.clients.id}`} className="hover:underline">
                {project.clients.name}
              </Link>
            </div>
          )}
        </div>
        <EditProjectSheet
          project={project}
          workspaceId={workspace.id}
          workspaceSlug={workspaceSlug}
          clients={clients}
        />
      </div>

      <Separator />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {project.start_date && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4" /> Início
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-semibold">{new Date(project.start_date).toLocaleDateString('pt-BR')}</p>
            </CardContent>
          </Card>
        )}
        {project.end_date && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4" /> Prazo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-semibold">{new Date(project.end_date).toLocaleDateString('pt-BR')}</p>
            </CardContent>
          </Card>
        )}
        {project.budget && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <DollarSign className="h-4 w-4" /> Orçamento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-semibold">R$ {project.budget.toLocaleString('pt-BR')}</p>
            </CardContent>
          </Card>
        )}
      </div>

      {project.description && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Descrição</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{project.description}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Tarefas</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Módulo de tarefas em desenvolvimento.</p>
        </CardContent>
      </Card>
    </div>
  )
}
