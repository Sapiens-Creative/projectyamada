'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ChevronRight, ChevronLeft, UserCircle, DollarSign, Trash2, ArrowRightLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { updateLeadStageAction, deleteLeadAction, convertLeadToClientAction } from '@/lib/actions/lead.actions'
import type { LeadWithAssignee } from '@/types/app.types'
import { getInitials } from '@/lib/utils'

const STAGES = ['new', 'contacted', 'proposal', 'negotiation', 'won', 'lost'] as const
type Stage = typeof STAGES[number]

const SCORE_COLOR = (score: number) => {
  if (score >= 70) return 'text-emerald-400 bg-emerald-500/15'
  if (score >= 40) return 'text-amber-400 bg-amber-500/15'
  return 'text-white/40 bg-white/[0.06]'
}

function calcScore(lead: LeadWithAssignee): number {
  let score = 0
  if (lead.estimated_value && lead.estimated_value > 5000) score += 30
  if (lead.contact_email) score += 20
  if (lead.contact_phone) score += 10
  if (lead.source === 'referral') score += 20
  if (lead.stage !== 'new') score += 20
  return Math.min(score, 100)
}

interface LeadCardProps {
  lead: LeadWithAssignee
  workspaceSlug: string
  workspaceId: string
}

export function LeadCard({ lead, workspaceSlug, workspaceId }: LeadCardProps) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const score = calcScore(lead)
  const stageIdx = STAGES.indexOf(lead.stage as Stage)

  function moveStage(dir: -1 | 1) {
    const newStage = STAGES[stageIdx + dir]
    if (!newStage) return
    startTransition(async () => {
      const result = await updateLeadStageAction(lead.id, newStage, workspaceSlug)
      if (result.error) toast.error(result.error)
      else router.refresh()
    })
  }

  function handleDelete() {
    if (!confirm(`Remover lead "${lead.name}"?`)) return
    startTransition(async () => {
      const result = await deleteLeadAction(lead.id, workspaceSlug)
      if (result.error) toast.error(result.error)
      else { toast.success('Lead removido'); router.refresh() }
    })
  }

  function handleConvert() {
    if (!confirm(`Converter "${lead.name}" em cliente?`)) return
    startTransition(async () => {
      const result = await convertLeadToClientAction(lead.id, workspaceId, workspaceSlug)
      if (result.error) toast.error(result.error)
      else { toast.success('Lead convertido em cliente!'); router.refresh() }
    })
  }

  return (
    <div className="group card-sun rounded-xl p-4 space-y-3 hover:border-white/20 transition-all">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white/90 truncate">{lead.name}</p>
          {lead.contact_name && (
            <p className="text-xs text-white/40 flex items-center gap-1 mt-0.5">
              <UserCircle className="h-3 w-3" />{lead.contact_name}
            </p>
          )}
        </div>
        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md shrink-0 ${SCORE_COLOR(score)}`}>
          {score}
        </span>
      </div>

      {/* Value */}
      {lead.estimated_value && (
        <div className="flex items-center gap-1 text-xs text-emerald-400">
          <DollarSign className="h-3 w-3" />
          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(lead.estimated_value)}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-1">
          {/* Move left */}
          {stageIdx > 0 && stageIdx < 5 && (
            <Button
              variant="ghost"
              size="icon-xs"
              className="text-white/30 hover:text-white/70 opacity-0 group-hover:opacity-100"
              onClick={() => moveStage(-1)}
              disabled={isPending}
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
          )}
          {/* Move right */}
          {stageIdx < 4 && stageIdx !== 4 && (
            <Button
              variant="ghost"
              size="icon-xs"
              className="text-white/30 hover:text-white/70 opacity-0 group-hover:opacity-100"
              onClick={() => moveStage(1)}
              disabled={isPending}
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          )}
          {/* Convert to client (only won) */}
          {lead.stage === 'won' && !lead.converted_client_id && (
            <Button
              variant="ghost"
              size="icon-xs"
              className="text-emerald-400 hover:text-emerald-300 opacity-0 group-hover:opacity-100"
              onClick={handleConvert}
              disabled={isPending}
              title="Converter em cliente"
            >
              <ArrowRightLeft className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>

        <div className="flex items-center gap-1">
          {lead.assignee && (
            <Avatar className="h-5 w-5 ring-1 ring-white/10">
              <AvatarFallback className="text-[9px] bg-white/10 text-white/60">
                {getInitials(lead.assignee.full_name ?? '')}
              </AvatarFallback>
            </Avatar>
          )}
          <Button
            variant="ghost"
            size="icon-xs"
            className="text-white/20 hover:text-red-400 opacity-0 group-hover:opacity-100"
            onClick={handleDelete}
            disabled={isPending}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  )
}
