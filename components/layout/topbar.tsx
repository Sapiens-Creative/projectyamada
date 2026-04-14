'use client'

import { useRouter } from 'next/navigation'
import { LogOut, Settings, User } from 'lucide-react'
import { signOut } from '@/lib/actions/auth.actions'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useWorkspace } from '@/providers/workspace-provider'
import { getInitials } from '@/lib/utils'
import { GlobalSearch } from '@/components/search/global-search'
import { NotificationBell } from '@/components/notifications/notification-bell'

export function Topbar() {
  const { profile, workspace } = useWorkspace()
  const router = useRouter()

  return (
    <header className="flex h-13 items-center gap-2 border-b border-white/[0.07] px-4 glass-popover backdrop-blur-xl">
      <SidebarTrigger className="-ml-1 text-white/50 hover:text-white/80" />
      <Separator orientation="vertical" className="h-4 bg-white/10" />

      <GlobalSearch workspaceId={workspace.id} workspaceSlug={workspace.slug} />

      <div className="flex-1" />

      <NotificationBell workspaceId={workspace.id} />

      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-2 rounded-md p-1.5 hover:bg-white/[0.06] outline-none transition-colors">
          <Avatar className="h-7 w-7 ring-1 ring-white/10">
            <AvatarImage src={profile.avatar_url ?? undefined} />
            <AvatarFallback className="text-xs bg-[#ff5600]/20 text-[#ff5600] font-semibold">
              {getInitials(profile.full_name ?? profile.email)}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm text-white/70 hidden sm:block max-w-28 truncate">
            {profile.full_name ?? profile.email}
          </span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52 glass-popover border-white/10">
          <div className="px-2 py-2">
            <p className="text-sm font-medium text-white/90 truncate">{profile.full_name ?? profile.email}</p>
            <p className="text-xs text-white/40 truncate">{profile.email}</p>
          </div>
          <DropdownMenuSeparator className="bg-white/08" />
          <DropdownMenuItem
            onClick={() => router.push(`/${workspace.slug}/profile`)}
            className="text-white/70 hover:text-white focus:text-white"
          >
            <User className="h-4 w-4 mr-2" />
            Meu perfil
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => router.push(`/${workspace.slug}/settings`)}
            className="text-white/70 hover:text-white focus:text-white"
          >
            <Settings className="h-4 w-4 mr-2" />
            Configurações
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-white/08" />
          <DropdownMenuItem
            onClick={async () => { await signOut() }}
            className="text-white/50 hover:text-white focus:text-white"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sair
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
