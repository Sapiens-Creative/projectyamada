'use client'

import Link from 'next/link'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ContactList } from '@/components/clients/contact-list'
import { InteractionList } from '@/components/clients/interaction-list'
import { NewInteractionSheet } from '@/components/clients/new-interaction-sheet'
import { ProjectCard } from '@/components/projects/project-card'
import { EmptyState } from '@/components/shared/empty-state'
import { Badge } from '@/components/ui/badge'
import { FolderKanban, CheckSquare, Layers, MessageSquare, DollarSign, Globe, MapPin, Calendar, Tag, TrendingUp } from 'lucide-react'
import type { Client, ClientContact, ClientInteraction, ProjectWithClient, Task, Invoice } from '@/types/app.types'

const REVENUE_LABELS: Record<string, string> = {
  '<100k': 'Até R$ 100k',
  '100k-500k': 'R$ 100k – R$ 500k',
  '500k-2m': 'R$ 500k – R$ 2M',
  '>2m': 'Acima de R$ 2M',
}

const INVOICE_STATUS_LABELS: Record<string, string> = {
  draft: 'Rascunho', sent: 'Enviada', paid: 'Paga', overdue: 'Vencida', cancelled: 'Cancelada',
}
const INVOICE_STATUS_COLORS: Record<string, string> = {
  draft: 'bg-white/[0.06] text-white/50',
  sent: 'bg-blue-500/15 text-blue-400',
  paid: 'bg-emerald-500/15 text-emerald-400',
  overdue: 'bg-red-500/15 text-red-400',
  cancelled: 'bg-white/[0.06] text-white/30',
}

interface Client360Props {
  client: Client & { client_contacts: ClientContact[] }
  interactions: ClientInteraction[]
  projects: ProjectWithClient[]
  tasks: Task[]
  invoices: Invoice[]
  workspaceSlug: string
  workspaceId: string
}

function KpiCard({ label, value, icon: Icon, color }: { label: string; value: string | number; icon: React.ElementType; color: string }) {
  return (
    <div className="card-sun rounded-xl p-4 flex items-center gap-3">
      <div className={`rounded-lg p-2 ${color}/10`}>
        <Icon className={`h-4 w-4 ${color}`} />
      </div>
      <div>
        <p className="text-xs text-white/40 uppercase tracking-wide">{label}</p>
        <p className="text-lg font-semibold text-white">{value}</p>
      </div>
    </div>
  )
}

export function Client360({ client, interactions, projects, tasks, invoices, workspaceSlug, workspaceId }: Client360Props) {
  const activeTasks = tasks.filter((t) => t.status !== 'done').length
  const mrr = client.monthly_fee
    ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(client.monthly_fee)
    : '—'
  const totalInvoiced = invoices
    .filter((i) => i.status === 'paid')
    .reduce((sum, i) => sum + (i.amount ?? 0), 0)
  const totalInvoicedFmt = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalInvoiced)

  return (
    <div className="space-y-6">
      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard label="MRR" value={mrr} icon={TrendingUp} color="text-[#ff5600]" />
        <KpiCard label="Projetos ativos" value={projects.filter((p) => p.status === 'active').length} icon={FolderKanban} color="text-purple-400" />
        <KpiCard label="Tarefas abertas" value={activeTasks} icon={CheckSquare} color="text-amber-400" />
        <KpiCard label="Total faturado" value={totalInvoicedFmt} icon={DollarSign} color="text-emerald-400" />
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="bg-white/[0.04] border border-white/[0.07]">
          <TabsTrigger value="overview">Visão geral</TabsTrigger>
          <TabsTrigger value="contacts">Contatos ({client.client_contacts?.length ?? 0})</TabsTrigger>
          <TabsTrigger value="projects">Projetos ({projects.length})</TabsTrigger>
          <TabsTrigger value="invoices">Faturas ({invoices.length})</TabsTrigger>
          <TabsTrigger value="interactions">Interações ({interactions.length})</TabsTrigger>
        </TabsList>

        {/* VISÃO GERAL */}
        <TabsContent value="overview" className="pt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Dados empresariais */}
            <div className="card-sun rounded-xl p-5 space-y-4">
              <h3 className="text-sm font-medium text-white/60 uppercase tracking-wide">Dados da empresa</h3>
              <dl className="space-y-3">
                {client.razao_social && (
                  <div>
                    <dt className="text-xs text-white/40">Razão social</dt>
                    <dd className="text-sm text-white/80">{client.razao_social}</dd>
                  </div>
                )}
                {client.cnpj && (
                  <div>
                    <dt className="text-xs text-white/40">CNPJ</dt>
                    <dd className="text-sm text-white/80 font-mono">{client.cnpj}</dd>
                  </div>
                )}
                {client.revenue_range && (
                  <div>
                    <dt className="text-xs text-white/40">Faturamento anual</dt>
                    <dd className="text-sm text-white/80">{REVENUE_LABELS[client.revenue_range]}</dd>
                  </div>
                )}
                {(client.address_city || client.address_state) && (
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-white/30" />
                    <span className="text-sm text-white/80">
                      {[client.address_city, client.address_state].filter(Boolean).join(', ')}
                    </span>
                  </div>
                )}
                {client.website && (
                  <div className="flex items-center gap-1.5">
                    <Globe className="h-3.5 w-3.5 text-white/30" />
                    <a href={client.website} target="_blank" rel="noopener noreferrer" className="text-sm text-[#ff5600] hover:underline truncate">
                      {client.website}
                    </a>
                  </div>
                )}
              </dl>
            </div>

            {/* Dados contratuais */}
            <div className="card-sun rounded-xl p-5 space-y-4">
              <h3 className="text-sm font-medium text-white/60 uppercase tracking-wide">Contrato</h3>
              <dl className="space-y-3">
                {client.contract_start && (
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-white/30" />
                    <div>
                      <dt className="text-xs text-white/40">Início</dt>
                      <dd className="text-sm text-white/80">{new Date(client.contract_start).toLocaleDateString('pt-BR')}</dd>
                    </div>
                  </div>
                )}
                {client.contract_renewal && (
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-amber-400" />
                    <div>
                      <dt className="text-xs text-white/40">Renovação</dt>
                      <dd className="text-sm text-amber-400 font-medium">{new Date(client.contract_renewal).toLocaleDateString('pt-BR')}</dd>
                    </div>
                  </div>
                )}
                {client.notes && (
                  <div>
                    <dt className="text-xs text-white/40 mb-1">Notas</dt>
                    <dd className="text-sm text-white/60 whitespace-pre-wrap">{client.notes}</dd>
                  </div>
                )}
                {!client.contract_start && !client.contract_renewal && !client.notes && (
                  <p className="text-sm text-white/30">Nenhum dado contratual.</p>
                )}
              </dl>
            </div>

            {/* Tags */}
            {client.tags && client.tags.length > 0 && (
              <div className="card-sun rounded-xl p-5 lg:col-span-2">
                <div className="flex items-center gap-2 mb-3">
                  <Tag className="h-4 w-4 text-white/40" />
                  <h3 className="text-sm font-medium text-white/60 uppercase tracking-wide">Tags</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {client.tags.map((tag) => (
                    <span key={tag} className="inline-flex items-center text-xs bg-[#ff5600]/15 text-[#ff5600] rounded-full px-3 py-1">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        {/* CONTATOS */}
        <TabsContent value="contacts" className="pt-4">
          <ContactList contacts={client.client_contacts ?? []} clientId={client.id} />
        </TabsContent>

        {/* PROJETOS */}
        <TabsContent value="projects" className="pt-4">
          {projects.length === 0 ? (
            <EmptyState icon={FolderKanban} title="Nenhum projeto vinculado" description="Crie um projeto e vincule a este cliente." />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map((p) => <ProjectCard key={p.id} project={p} workspaceSlug={workspaceSlug} />)}
            </div>
          )}
        </TabsContent>

        {/* FATURAS */}
        <TabsContent value="invoices" className="pt-4">
          {invoices.length === 0 ? (
            <EmptyState icon={DollarSign} title="Nenhuma fatura" description="Crie uma fatura para este cliente." />
          ) : (
            <div className="card-sun rounded-xl divide-y divide-white/[0.06]">
              {invoices.map((inv) => (
                <div key={inv.id} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <p className="text-sm text-white/80">{inv.title}</p>
                    <p className="text-xs text-white/40">#{inv.number} · Vence {inv.due_date ? new Date(inv.due_date).toLocaleDateString('pt-BR') : '—'}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-white/80">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(inv.amount ?? 0)}
                    </span>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${INVOICE_STATUS_COLORS[inv.status] ?? 'bg-white/[0.06] text-white/50'}`}>
                      {INVOICE_STATUS_LABELS[inv.status] ?? inv.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="mt-3">
            <Link href={`/${workspaceSlug}/financial`} className="text-xs text-white/30 hover:text-[#ff5600] transition-colors">
              Ver todas as faturas →
            </Link>
          </div>
        </TabsContent>

        {/* INTERAÇÕES */}
        <TabsContent value="interactions" className="pt-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-white/60">Histórico de interações</h3>
            <NewInteractionSheet clientId={client.id} workspaceId={workspaceId} workspaceSlug={workspaceSlug} />
          </div>
          <div className="card-sun rounded-xl p-2">
            <InteractionList interactions={interactions} clientId={client.id} workspaceSlug={workspaceSlug} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
