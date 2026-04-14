'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Receipt, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { deleteCampaignCostAction } from '@/lib/actions/campaign-cost.actions'
import type { CampaignCost } from '@/types/app.types'
import { EmptyState } from '@/components/shared/empty-state'

interface CampaignCostsListProps {
  costs: CampaignCost[]
  workspaceSlug: string
}

const CATEGORY_LABELS: Record<string, string> = {
  media: 'Mídia',
  production: 'Produção',
  tools: 'Ferramentas',
  freelancer: 'Freelancer',
  other: 'Outros',
}

const CATEGORY_COLORS: Record<string, string> = {
  media: 'bg-blue-500/15 text-blue-400',
  production: 'bg-purple-500/15 text-purple-400',
  tools: 'bg-amber-500/15 text-amber-400',
  freelancer: 'bg-pink-500/15 text-pink-400',
  other: 'bg-white/[0.06] text-white/50',
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount)
}

function formatDate(date: string) {
  return new Date(date + 'T12:00:00').toLocaleDateString('pt-BR')
}

export function CampaignCostsList({ costs, workspaceSlug }: CampaignCostsListProps) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const totalCosts = costs.reduce((sum, c) => sum + c.amount, 0)

  // Group by category for summary
  const byCategory = costs.reduce<Record<string, number>>((acc, c) => {
    acc[c.category] = (acc[c.category] ?? 0) + c.amount
    return acc
  }, {})

  function handleDelete(id: string) {
    startTransition(async () => {
      const result = await deleteCampaignCostAction(id, workspaceSlug)
      if (result.error) toast.error(result.error)
      else { toast.success('Custo removido'); router.refresh() }
    })
  }

  if (costs.length === 0) {
    return (
      <EmptyState
        icon={Receipt}
        title="Nenhum custo registrado"
        description="Registre custos de mídia, produção e ferramentas."
      />
    )
  }

  return (
    <div className="space-y-4">
      {/* Category summary chips */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(byCategory).map(([cat, total]) => (
          <span key={cat} className={`text-xs font-medium px-2.5 py-1 rounded-full ${CATEGORY_COLORS[cat]}`}>
            {CATEGORY_LABELS[cat]}: {formatCurrency(total)}
          </span>
        ))}
      </div>

      {/* Total */}
      <p className="text-sm text-white/50">
        {costs.length} custo{costs.length !== 1 ? 's' : ''} · Total: <span className="text-red-400 font-medium">{formatCurrency(totalCosts)}</span>
      </p>

      {/* List */}
      <div className="card-sun rounded-xl divide-y divide-white/[0.06]">
        {costs.map((cost) => (
          <div key={cost.id} className="group flex items-center gap-4 px-5 py-3">
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white/80 truncate">{cost.description}</p>
              <p className="text-xs text-white/30 mt-0.5">{formatDate(cost.date)}</p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${CATEGORY_COLORS[cost.category]}`}>
                {CATEGORY_LABELS[cost.category]}
              </span>
              <span className="text-sm font-medium text-red-400">{formatCurrency(cost.amount)}</span>
              <Button
                size="icon-xs"
                variant="ghost"
                className="opacity-0 group-hover:opacity-100 text-red-400 hover:bg-red-500/10 transition-opacity"
                onClick={() => handleDelete(cost.id)}
                disabled={isPending}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
