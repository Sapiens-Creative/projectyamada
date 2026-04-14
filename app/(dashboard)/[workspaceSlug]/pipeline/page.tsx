import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PipelineBoard } from '@/components/pipeline/pipeline-board'
import { NewLeadSheet } from '@/components/pipeline/new-lead-sheet'
import type { LeadWithAssignee, Workspace, WorkspaceMemberWithProfile } from '@/types/app.types'

export default async function PipelinePage({
  params,
}: {
  params: Promise<{ workspaceSlug: string }>
}) {
  const { workspaceSlug } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: wsRaw } = await supabase
    .from('workspaces')
    .select('*')
    .eq('slug', workspaceSlug)
    .single()

  if (!wsRaw) redirect('/create-workspace')
  const workspace = wsRaw as Workspace

  const [{ data: leadsRaw }, { data: membersRaw }] = await Promise.all([
    supabase
      .from('leads')
      .select('*, assignee:profiles!leads_assigned_to_fkey(id, full_name, avatar_url)')
      .eq('workspace_id', workspace.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('workspace_members')
      .select('*, profiles(*)')
      .eq('workspace_id', workspace.id),
  ])

  const leads = (leadsRaw ?? []) as LeadWithAssignee[]
  const members = (membersRaw ?? []) as WorkspaceMemberWithProfile[]

  // Stats
  const wonLeads = leads.filter((l) => l.stage === 'won')
  const lostLeads = leads.filter((l) => l.stage === 'lost')
  const activeLeads = leads.filter((l) => !['won', 'lost'].includes(l.stage))
  const conversionRate = leads.length > 0
    ? Math.round((wonLeads.length / leads.length) * 100)
    : 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Pipeline de Vendas</h1>
          <p className="text-sm text-white/40 mt-0.5">
            {activeLeads.length} em negociação · {wonLeads.length} ganhos · {lostLeads.length} perdidos · {conversionRate}% conversão
          </p>
        </div>
        <NewLeadSheet workspaceId={workspace.id} workspaceSlug={workspaceSlug} members={members} />
      </div>

      <PipelineBoard leads={leads} workspaceSlug={workspaceSlug} workspaceId={workspace.id} />
    </div>
  )
}
