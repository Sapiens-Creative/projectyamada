'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Building2,
  FolderKanban,
  CheckSquare,
  DollarSign,
  Layers,
  Users,
  BarChart3,
} from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from '@/components/ui/sidebar'
import { Badge } from '@/components/ui/badge'
import { useWorkspace } from '@/providers/workspace-provider'
import { getInitials } from '@/lib/utils'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

const icons = {
  LayoutDashboard,
  Building2,
  FolderKanban,
  CheckSquare,
  DollarSign,
  Layers,
  Users,
  BarChart3,
}

const NAV_ITEMS = [
  { label: 'Dashboard', href: '', icon: 'LayoutDashboard', soon: false },
  { label: 'Clientes', href: '/clients', icon: 'Building2', soon: false },
  { label: 'Projetos', href: '/projects', icon: 'FolderKanban', soon: false },
  { label: 'Tarefas', href: '/tasks', icon: 'CheckSquare', soon: false },
  { label: 'Financeiro', href: '/financial', icon: 'DollarSign', soon: false },
  { label: 'Assets', href: '/assets', icon: 'Layers', soon: true },
  { label: 'Equipe', href: '/team', icon: 'Users', soon: false },
  { label: 'Relatórios', href: '/reports', icon: 'BarChart3', soon: false },
]

export function AppSidebar({ workspaceSlug }: { workspaceSlug: string }) {
  const pathname = usePathname()
  const { workspace } = useWorkspace()

  return (
    <Sidebar>
      <SidebarHeader className="px-4 py-3 border-b">
        <div className="flex items-center gap-2">
          <Avatar className="h-7 w-7">
            <AvatarFallback className="text-xs">{getInitials(workspace.name)}</AvatarFallback>
          </Avatar>
          <span className="font-semibold text-sm truncate">{workspace.name}</span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_ITEMS.map((item) => {
                const Icon = icons[item.icon as keyof typeof icons]
                const href = `/${workspaceSlug}${item.href}`
                const isActive = item.href === ''
                  ? pathname === `/${workspaceSlug}`
                  : pathname.startsWith(href)

                return (
                  <SidebarMenuItem key={item.label}>
                    {item.soon ? (
                      <SidebarMenuButton disabled className="opacity-50 cursor-not-allowed">
                        <Icon className="h-4 w-4" />
                        <span>{item.label}</span>
                        <Badge variant="secondary" className="ml-auto text-xs py-0">Em breve</Badge>
                      </SidebarMenuButton>
                    ) : (
                      <SidebarMenuButton isActive={isActive}>
                        <Link href={href} className="flex items-center gap-2 w-full">
                          <Icon className="h-4 w-4" />
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    )}
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
