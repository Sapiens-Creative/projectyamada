'use client'

import { useRouter } from 'next/navigation'
import { ChevronsUpDown, Plus, Check } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useWorkspace } from '@/providers/workspace-provider'
import { getInitials } from '@/lib/utils'

export function WorkspaceSwitcher() {
  const { workspace, allWorkspaces } = useWorkspace()
  const router = useRouter()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 w-full rounded-md px-2 py-1.5 hover:bg-sidebar-accent outline-none">
        <Avatar className="h-6 w-6 shrink-0">
          <AvatarFallback className="text-xs font-semibold">{getInitials(workspace.name)}</AvatarFallback>
        </Avatar>
        <span className="font-semibold text-sm truncate flex-1 text-left">{workspace.name}</span>
        <ChevronsUpDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        {allWorkspaces.map((ws) => (
          <DropdownMenuItem
            key={ws.id}
            onSelect={() => router.push(`/${ws.slug}`)}
            className="gap-2"
          >
            <Avatar className="h-5 w-5 shrink-0">
              <AvatarFallback className="text-xs">{getInitials(ws.name)}</AvatarFallback>
            </Avatar>
            <span className="truncate flex-1">{ws.name}</span>
            {ws.id === workspace.id && <Check className="h-3.5 w-3.5 text-primary shrink-0" />}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => router.push('/create-workspace')} className="gap-2">
          <div className="h-5 w-5 rounded border-2 border-dashed flex items-center justify-center shrink-0">
            <Plus className="h-3 w-3" />
          </div>
          <span>Novo workspace</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
