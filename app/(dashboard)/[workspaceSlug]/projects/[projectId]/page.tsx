import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getProject } from '@/lib/actions/project.actions'
import { getClients } from '@/lib/actions/client.actions'
import { getTeamMembers } from '@/lib/actions/team.actions'
import { getBrief } from '@/lib/actions/brief.actions'
import { getInvoices } from '@/lib/actions/invoice.actions'
import { getTimeEntries } from '@/lib/actions/timesheet.actions'
import { getCampaignCosts } from '@/lib/actions/campaign-cost.actions'
import type { Workspace, ProjectWithClient, Client, TaskWithAssignee, WorkspaceMemberWithProfile, CampaignBrief, Asset, InvoiceWithClient, TimeEntryWithUser, CampaignCost } from '@/types/app.types'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowLeft, Building2, Calendar, DollarSign, Layers } from 'lucide-react'
import { EditProjectSheet } from '@/components/projects/edit-project-sheet'
import { ProjectTaskList } from '@/components/projects/project-task-list'
import { NewTaskSheet } from '@/components/tasks/new-task-sheet'
import { CampaignBriefTab } from '@/components/projects/campaign-brief-tab'
import { ProjectTimeline } from '@/components/projects/project-timeline'
import { AssetApprovalActions } from '@/components/assets/asset-approval-actions'
import { EmptyState } from '@/components/shared/empty-state'
import { TimesheetList } from '@/components/financial/timesheet-list'
import { NewTimeEntrySheet } from '@/components/financial/new-time-entry-sheet'
import { CampaignCostsList } from '@/components/financial/campaign-costs-list'
import { NewCampaignCostSheet } from '@/components/financial/new-campaign-cost-sheet'
import { ProfitabilityCard } from '@/components/financial/profitability-card'

const STATUS_LABELS: Record<string, string> = {
  planning: 'Planejamento', active: 'Ativo', paused: 'Pausado',
  completed: 'Concluído', cancelled: 'Cancelado',
}
const STATUS_COLORS: Record<string, string> = {
  planning: 'bg-blue-500/15 text-blue-400',
  active: 'bg-emerald-500/15 text-emerald-400',
  paused: 'bg-amber-500/15 text-amber-400',
  completed: 'bg-white/[0.06] text-white/50',
  cancelled: 'bg-red-500/15 text-red-400',
}

interface PageProps {
  params: Promise<{ workspaceSlug: string; projectId: string }>
}

export default async function ProjectDetailPage({ params }: PageProps) {
  const { workspaceSlug, projectId } = await params
  const supabase = await createClient()

  const { data: workspaceRaw } = await supabase.from('workspaces').select('*').eq('slug', workspaceSlug).single()
  if (!workspaceRaw) notFound()
  const workspace = workspaceRaw as Workspace

  const [projectResult, clientsResult, membersResult, briefResult, { data: tasksRaw }, { data: assetsRaw }, invoicesResult, entriesResult, costsResult] = await Promise.all([
    getProject(projectId),
    getClients(workspace.id),
    getTeamMembers(workspace.id),
    getBrief(projectId),
    supabase
      .from('tasks')
      .select('*, assignee:profiles!tasks_assignee_id_fkey(id, full_name, avatar_url)')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false }),
    supabase
      .from('assets')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false }),
    getInvoices(workspace.id, projectId),
    getTimeEntries(workspace.id, projectId),
    getCampaignCosts(workspace.id, projectId),
  ])

  if (!projectResult.data) notFound()
  const project = projectResult.data as ProjectWithClient
  const clients = (clientsResult.data ?? []) as Client[]
  const members = (membersResult.data ?? []) as WorkspaceMemberWithProfile[]
  const tasks = (tasksRaw ?? []) as TaskWithAssignee[]
  const brief = briefResult.data as CampaignBrief | null
  const assets = (assetsRaw ?? []) as Asset[]
  const projectInvoices = (invoicesResult.data ?? []) as InvoiceWithClient[]
  const timeEntries = (entriesResult.data ?? []) as TimeEntryWithUser[]
  const campaignCosts = (costsResult.data ?? []) as CampaignCost[]

  return (
    <div className="space-y-6">
      {/* Back nav */}
      <Link href={`/${workspaceSlug}/projects`}>
        <Button variant="ghost" size="sm" className="-ml-2">
          <ArrowLeft className="h-4 w-4 mr-1" />Projetos
        </Button>
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1 flex-wrap">
            <h1 className="text-2xl font-semibold">{project.name}</h1>
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLORS[project.status]}`}>
              {STATUS_LABELS[project.status]}
            </span>
          </div>
          {project.clients && (
            <div className="flex items-center gap-1 text-sm text-white/40">
              <Building2 className="h-3.5 w-3.5" />
              <Link href={`/${workspaceSlug}/clients/${project.clients.id}`} className="hover:text-white/70 transition-colors">
                {project.clients.name}
              </Link>
            </div>
          )}
        </div>
        <EditProjectSheet project={project} workspaceId={workspace.id} workspaceSlug={workspaceSlug} clients={clients} />
      </div>

      {/* KPI cards */}
      {(project.start_date || project.end_date || project.budget) && (
        <div className="flex gap-3 flex-wrap">
          {project.start_date && (
            <div className="card-sun rounded-xl px-4 py-3 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-white/30" />
              <div>
                <p className="text-[10px] text-white/40">Início</p>
                <p className="text-sm font-medium">{new Date(project.start_date).toLocaleDateString('pt-BR')}</p>
              </div>
            </div>
          )}
          {project.end_date && (
            <div className="card-sun rounded-xl px-4 py-3 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-amber-400" />
              <div>
                <p className="text-[10px] text-white/40">Prazo</p>
                <p className="text-sm font-medium text-amber-400">{new Date(project.end_date).toLocaleDateString('pt-BR')}</p>
              </div>
            </div>
          )}
          {project.budget && (
            <div className="card-sun rounded-xl px-4 py-3 flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-emerald-400" />
              <div>
                <p className="text-[10px] text-white/40">Orçamento</p>
                <p className="text-sm font-medium text-emerald-400">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(project.budget)}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {project.description && (
        <p className="text-sm text-white/50 whitespace-pre-wrap">{project.description}</p>
      )}

      {/* Tabs */}
      <Tabs defaultValue="tasks">
        <TabsList className="bg-white/[0.04] border border-white/[0.07]">
          <TabsTrigger value="tasks">Tarefas ({tasks.length})</TabsTrigger>
          <TabsTrigger value="brief">Brief{brief ? ' ✓' : ''}</TabsTrigger>
          <TabsTrigger value="timeline">Cronograma</TabsTrigger>
          <TabsTrigger value="assets">Assets ({assets.length})</TabsTrigger>
          <TabsTrigger value="financial">Financeiro</TabsTrigger>
        </TabsList>

        {/* TAREFAS */}
        <TabsContent value="tasks" className="pt-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-white/60">{tasks.length} tarefa{tasks.length !== 1 ? 's' : ''}</h2>
            <NewTaskSheet
              workspaceId={workspace.id}
              workspaceSlug={workspaceSlug}
              projects={[project]}
              clients={clients}
              members={members}
            />
          </div>
          <ProjectTaskList tasks={tasks} workspaceSlug={workspaceSlug} />
        </TabsContent>

        {/* BRIEF */}
        <TabsContent value="brief" className="pt-4">
          <CampaignBriefTab
            brief={brief}
            projectId={projectId}
            workspaceId={workspace.id}
            workspaceSlug={workspaceSlug}
          />
        </TabsContent>

        {/* TIMELINE */}
        <TabsContent value="timeline" className="pt-4">
          <ProjectTimeline tasks={tasks} />
        </TabsContent>

        {/* ASSETS */}
        <TabsContent value="assets" className="pt-4">
          {assets.length === 0 ? (
            <EmptyState
              icon={Layers}
              title="Nenhum asset neste projeto"
              description="Faça upload na página de Assets e vincule a este projeto."
            />
          ) : (
            <div className="card-sun rounded-xl divide-y divide-white/[0.06]">
              {assets.map((asset) => (
                <div key={asset.id} className="flex items-center gap-4 px-5 py-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white/80 truncate">{asset.name}</p>
                    <p className="text-xs text-white/30 mt-0.5">
                      {(asset.size / 1024 / 1024).toFixed(2)} MB · {asset.file_type}
                      {asset.version > 1 && ` · v${asset.version}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <a
                      href={asset.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-white/40 hover:text-[#ff5600] transition-colors"
                    >
                      Ver
                    </a>
                    <AssetApprovalActions
                      assetId={asset.id}
                      currentStatus={asset.approval_status as 'pending' | 'approved' | 'rejected'}
                      workspaceSlug={workspaceSlug}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
        {/* FINANCEIRO */}
        <TabsContent value="financial" className="pt-4 space-y-6">
          <ProfitabilityCard
            invoices={projectInvoices}
            timeEntries={timeEntries}
            costs={campaignCosts}
            projectName={project.name}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-white/60">Horas</h3>
                <NewTimeEntrySheet
                  workspaceId={workspace.id}
                  workspaceSlug={workspaceSlug}
                  projects={[project]}
                  defaultProjectId={project.id}
                />
              </div>
              <TimesheetList entries={timeEntries} workspaceSlug={workspaceSlug} />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-white/60">Custos</h3>
                <NewCampaignCostSheet
                  workspaceId={workspace.id}
                  workspaceSlug={workspaceSlug}
                  projects={[project]}
                  defaultProjectId={project.id}
                />
              </div>
              <CampaignCostsList costs={campaignCosts} workspaceSlug={workspaceSlug} />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
