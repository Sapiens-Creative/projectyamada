import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Plus, FileText } from 'lucide-react'
import { EmptyState } from '@/components/shared/empty-state'
import type { ProposalWithRefs, Workspace, Lead, Client } from '@/types/app.types'
import { NewProposalSheet } from '@/components/proposals/new-proposal-sheet'

const STATUS_LABELS: Record<string, string> = {
  draft: 'Rascunho', sent: 'Enviada', accepted: 'Aceita', rejected: 'Recusada', expired: 'Expirada',
}
const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-white/[0.06] text-white/50',
  sent: 'bg-blue-500/15 text-blue-400',
  accepted: 'bg-emerald-500/15 text-emerald-400',
  rejected: 'bg-red-500/15 text-red-400',
  expired: 'bg-white/[0.06] text-white/30',
}

export default async function ProposalsPage({
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

  const [{ data: proposalsRaw }, { data: leadsRaw }, { data: clientsRaw }] = await Promise.all([
    supabase
      .from('proposals')
      .select('*, leads(id, name), clients(id, name, slug)')
      .eq('workspace_id', workspace.id)
      .order('created_at', { ascending: false }),
    supabase.from('leads').select('id, name').eq('workspace_id', workspace.id),
    supabase.from('clients').select('id, name, slug').eq('workspace_id', workspace.id),
  ])

  const proposals = (proposalsRaw ?? []) as ProposalWithRefs[]
  const leads = (leadsRaw ?? []) as Lead[]
  const clients = (clientsRaw ?? []) as Client[]

  const totalAccepted = proposals
    .filter((p) => p.status === 'accepted')
    .reduce((s, p) => s + (p.total_value ?? 0), 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Propostas</h1>
          <p className="text-sm text-white/40 mt-0.5">
            {proposals.filter((p) => p.status === 'sent').length} enviadas ·{' '}
            {proposals.filter((p) => p.status === 'accepted').length} aceitas ·{' '}
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalAccepted)} convertidos
          </p>
        </div>
        <NewProposalSheet
          workspaceId={workspace.id}
          workspaceSlug={workspaceSlug}
          leads={leads}
          clients={clients}
        />
      </div>

      {proposals.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="Nenhuma proposta ainda"
          description="Crie sua primeira proposta comercial."
        />
      ) : (
        <div className="card-sun rounded-xl divide-y divide-white/[0.06]">
          {proposals.map((p) => (
            <div key={p.id} className="flex items-center gap-4 px-5 py-4 hover:bg-white/[0.02] transition-colors">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white/90 truncate">{p.title}</p>
                <p className="text-xs text-white/40 mt-0.5">
                  {p.leads?.name ?? p.clients?.name ?? 'Sem vínculo'}
                  {p.valid_until && ` · Válida até ${new Date(p.valid_until).toLocaleDateString('pt-BR')}`}
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                {p.total_value != null && (
                  <span className="text-sm font-medium text-white/70">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p.total_value)}
                  </span>
                )}
                <span className={`text-[10px] font-medium px-2.5 py-1 rounded-full ${STATUS_COLORS[p.status]}`}>
                  {STATUS_LABELS[p.status]}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
