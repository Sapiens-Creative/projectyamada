'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { MoreHorizontal, UserCog, UserMinus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { updateMemberRoleAction, removeMemberAction } from '@/lib/actions/team.actions'

interface MemberActionsProps {
  memberId: string
  currentRole: 'admin' | 'member' | 'viewer'
  workspaceSlug: string
}

export function MemberActions({ memberId, currentRole, workspaceSlug }: MemberActionsProps) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function changeRole(role: 'admin' | 'member' | 'viewer') {
    startTransition(async () => {
      const result = await updateMemberRoleAction(memberId, role, workspaceSlug)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Cargo atualizado')
        router.refresh()
      }
    })
  }

  function remove() {
    startTransition(async () => {
      const result = await removeMemberAction(memberId, workspaceSlug)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Membro removido')
        router.refresh()
      }
    })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={
        <Button variant="ghost" size="icon" disabled={isPending}>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      } />
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => changeRole('admin')} disabled={currentRole === 'admin'}>
          <UserCog className="h-4 w-4 mr-2" /> Promover a Admin
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => changeRole('member')} disabled={currentRole === 'member'}>
          <UserCog className="h-4 w-4 mr-2" /> Definir como Membro
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => changeRole('viewer')} disabled={currentRole === 'viewer'}>
          <UserCog className="h-4 w-4 mr-2" /> Definir como Visualizador
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={remove} className="text-destructive">
          <UserMinus className="h-4 w-4 mr-2" /> Remover da equipe
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
