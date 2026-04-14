'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { CheckCircle, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { approveAssetAction } from '@/lib/actions/asset.actions'

interface AssetApprovalActionsProps {
  assetId: string
  currentStatus: 'pending' | 'approved' | 'rejected'
  workspaceSlug: string
}

export function AssetApprovalActions({ assetId, currentStatus, workspaceSlug }: AssetApprovalActionsProps) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handle(status: 'approved' | 'rejected') {
    startTransition(async () => {
      const result = await approveAssetAction(assetId, status, workspaceSlug)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(status === 'approved' ? 'Asset aprovado' : 'Asset rejeitado')
        router.refresh()
      }
    })
  }

  if (currentStatus === 'approved') {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full">
        <CheckCircle className="h-3 w-3" /> Aprovado
      </span>
    )
  }

  if (currentStatus === 'rejected') {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-medium text-red-400 bg-red-500/15 px-2 py-0.5 rounded-full">
        <XCircle className="h-3 w-3" /> Rejeitado
      </span>
    )
  }

  return (
    <div className="flex items-center gap-1">
      <span className="text-[10px] text-white/30 mr-1">Pendente</span>
      <Button
        size="icon-xs"
        variant="ghost"
        className="text-emerald-400 hover:bg-emerald-500/10"
        onClick={() => handle('approved')}
        disabled={isPending}
        title="Aprovar"
      >
        <CheckCircle className="h-3.5 w-3.5" />
      </Button>
      <Button
        size="icon-xs"
        variant="ghost"
        className="text-red-400 hover:bg-red-500/10"
        onClick={() => handle('rejected')}
        disabled={isPending}
        title="Rejeitar"
      >
        <XCircle className="h-3.5 w-3.5" />
      </Button>
    </div>
  )
}
