'use client'

import { LeadCard } from './lead-card'
import type { LeadWithAssignee } from '@/types/app.types'

const STAGES = [
  { key: 'new',         label: 'Novo',        color: 'text-white/50',   dot: 'bg-white/30' },
  { key: 'contacted',   label: 'Contactado',  color: 'text-blue-400',   dot: 'bg-blue-400' },
  { key: 'proposal',    label: 'Proposta',    color: 'text-purple-400', dot: 'bg-purple-400' },
  { key: 'negotiation', label: 'Negociação',  color: 'text-amber-400',  dot: 'bg-amber-400' },
  { key: 'won',         label: 'Ganho',       color: 'text-emerald-400',dot: 'bg-emerald-400' },
  { key: 'lost',        label: 'Perdido',     color: 'text-red-400',    dot: 'bg-red-400' },
] as const

interface PipelineBoardProps {
  leads: LeadWithAssignee[]
  workspaceSlug: string
  workspaceId: string
}

export function PipelineBoard({ leads, workspaceSlug, workspaceId }: PipelineBoardProps) {
  const totalValue = leads
    .filter((l) => l.stage !== 'lost')
    .reduce((s, l) => s + (l.estimated_value ?? 0), 0)

  return (
    <div className="space-y-4">
      {/* Summary bar */}
      <div className="flex items-center gap-6 text-sm text-white/50">
        <span>{leads.filter((l) => l.stage !== 'lost' && l.stage !== 'won').length} leads ativos</span>
        <span className="text-emerald-400 font-medium">
          Pipeline: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalValue)}
        </span>
      </div>

      {/* Board */}
      <div className="flex gap-3 overflow-x-auto pb-4 -mx-1 px-1">
        {STAGES.map(({ key, label, color, dot }) => {
          const colLeads = leads.filter((l) => l.stage === key)
          return (
            <div key={key} className="flex-shrink-0 w-64 space-y-2">
              {/* Column header */}
              <div className="flex items-center gap-2 px-1 py-1.5">
                <span className={`h-2 w-2 rounded-full ${dot}`} />
                <span className={`text-xs font-medium uppercase tracking-wide ${color}`}>{label}</span>
                <span className="ml-auto text-xs text-white/25">{colLeads.length}</span>
              </div>

              {/* Cards */}
              <div className="space-y-2 min-h-[80px]">
                {colLeads.map((lead) => (
                  <LeadCard
                    key={lead.id}
                    lead={lead}
                    workspaceSlug={workspaceSlug}
                    workspaceId={workspaceId}
                  />
                ))}
                {colLeads.length === 0 && (
                  <div className="rounded-xl border border-dashed border-white/[0.06] p-4 text-center">
                    <p className="text-xs text-white/20">Vazio</p>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
