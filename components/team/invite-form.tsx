'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Copy, Check, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createInviteAction, revokeInviteAction } from '@/lib/actions/invite.actions'
import type { WorkspaceInvite } from '@/types/app.types'

interface InviteFormProps {
  workspaceId: string
  workspaceSlug: string
  pendingInvites: WorkspaceInvite[]
}

export function InviteForm({ workspaceId, workspaceSlug, pendingInvites }: InviteFormProps) {
  const [role, setRole] = useState('member')
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const origin = typeof window !== 'undefined' ? window.location.origin : ''

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    formData.set('role', role)
    const form = e.currentTarget

    startTransition(async () => {
      const result = await createInviteAction(workspaceId, workspaceSlug, formData)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Convite criado')
        form.reset()
        const link = `${origin}/invite/${result.data!.token}`
        await navigator.clipboard.writeText(link).catch(() => {})
        toast.info('Link copiado para a área de transferência')
      }
    })
  }

  function copyLink(token: string, id: string) {
    const link = `${origin}/invite/${token}`
    navigator.clipboard.writeText(link)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  function handleRevoke(inviteId: string) {
    startTransition(async () => {
      const result = await revokeInviteAction(inviteId, workspaceSlug)
      if (result.error) toast.error(result.error)
      else toast.success('Convite revogado')
    })
  }

  return (
    <div className="space-y-4">
      <div className="border rounded-lg p-4 space-y-4">
        <h3 className="font-medium text-sm">Convidar por e-mail</h3>
        <form onSubmit={handleSubmit} className="flex gap-2 flex-wrap">
          <div className="flex-1 min-w-48 space-y-1">
            <Label htmlFor="invite-email" className="sr-only">E-mail</Label>
            <Input id="invite-email" name="email" type="email" placeholder="email@exemplo.com" required />
          </div>
          <Select value={role} onValueChange={(v) => setRole(v ?? 'member')}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="member">Membro</SelectItem>
              <SelectItem value="viewer">Visualizador</SelectItem>
            </SelectContent>
          </Select>
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Criando...' : 'Convidar'}
          </Button>
        </form>
        <p className="text-xs text-muted-foreground">
          Um link de convite será gerado. Compartilhe com a pessoa convidada.
        </p>
      </div>

      {pendingInvites.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Convites pendentes</p>
          {pendingInvites.map((invite) => (
            <div key={invite.id} className="flex items-center gap-3 border rounded-lg px-3 py-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm truncate">{invite.email}</p>
                <p className="text-xs text-muted-foreground capitalize">
                  {invite.role} · expira {new Date(invite.expires_at).toLocaleDateString('pt-BR')}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => copyLink(invite.token, invite.id)}
              >
                {copiedId === invite.id ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-destructive"
                disabled={isPending}
                onClick={() => handleRevoke(invite.id)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
