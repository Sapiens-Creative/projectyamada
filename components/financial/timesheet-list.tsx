'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Clock, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { deleteTimeEntryAction } from '@/lib/actions/timesheet.actions'
import type { TimeEntryWithUser } from '@/types/app.types'
import { EmptyState } from '@/components/shared/empty-state'

interface TimesheetListProps {
  entries: TimeEntryWithUser[]
  workspaceSlug: string
  showProject?: boolean
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount)
}

function formatDate(date: string) {
  return new Date(date + 'T12:00:00').toLocaleDateString('pt-BR')
}

export function TimesheetList({ entries, workspaceSlug, showProject }: TimesheetListProps) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const totalHours = entries.reduce((sum, e) => sum + e.hours, 0)
  const totalValue = entries.reduce((sum, e) => sum + (e.hours * (e.hourly_rate ?? 0)), 0)

  function handleDelete(id: string) {
    startTransition(async () => {
      const result = await deleteTimeEntryAction(id, workspaceSlug)
      if (result.error) toast.error(result.error)
      else { toast.success('Lançamento removido'); router.refresh() }
    })
  }

  if (entries.length === 0) {
    return (
      <EmptyState
        icon={Clock}
        title="Nenhum lançamento de horas"
        description="Registre as horas trabalhadas nos projetos."
      />
    )
  }

  return (
    <div className="space-y-3">
      {/* Summary */}
      <div className="flex gap-4 text-sm">
        <span className="text-white/50">{entries.length} lançamento{entries.length !== 1 ? 's' : ''}</span>
        <span className="text-white/50">·</span>
        <span className="font-medium">{totalHours.toFixed(1)}h total</span>
        {totalValue > 0 && (
          <>
            <span className="text-white/50">·</span>
            <span className="text-emerald-400 font-medium">{formatCurrency(totalValue)}</span>
          </>
        )}
      </div>

      {/* List */}
      <div className="card-sun rounded-xl divide-y divide-white/[0.06]">
        {entries.map((entry) => (
          <div key={entry.id} className="group flex items-center gap-4 px-5 py-3">
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white/80 truncate">{entry.description || '—'}</p>
              <p className="text-xs text-white/30 mt-0.5">
                {formatDate(entry.date)}
                {entry.profiles && ` · ${entry.profiles.full_name}`}
                {showProject && entry.project_id && ` · Projeto`}
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <div className="text-right">
                <p className="text-sm font-medium">{entry.hours.toFixed(1)}h</p>
                {entry.hourly_rate && (
                  <p className="text-xs text-emerald-400">
                    {formatCurrency(entry.hours * entry.hourly_rate)}
                  </p>
                )}
              </div>
              <Button
                size="icon-xs"
                variant="ghost"
                className="opacity-0 group-hover:opacity-100 text-red-400 hover:bg-red-500/10 transition-opacity"
                onClick={() => handleDelete(entry.id)}
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
