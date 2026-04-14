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
import { WorkspaceSwitcher } from '@/components/layout/workspace-switcher'

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
  { label: 'Dashboard',  href: '',          icon: 'LayoutDashboard', soon: false },
  { label: 'Clientes',   href: '/clients',  icon: 'Building2',       soon: false },
  { label: 'Projetos',   href: '/projects', icon: 'FolderKanban',    soon: false },
  { label: 'Tarefas',    href: '/tasks',    icon: 'CheckSquare',     soon: false },
  { label: 'Financeiro', href: '/financial',icon: 'DollarSign',      soon: false },
  { label: 'Assets',     href: '/assets',   icon: 'Layers',          soon: false },
  { label: 'Equipe',     href: '/team',     icon: 'Users',           soon: false },
  { label: 'Relatórios', href: '/reports',  icon: 'BarChart3',       soon: false },
]

export function AppSidebar({ workspaceSlug }: { workspaceSlug: string }) {
  const pathname = usePathname()

  return (
    <Sidebar className="border-r border-white/[0.07] bg-transparent">
      <SidebarHeader className="px-2 py-3 border-b border-white/[0.07]">
        <WorkspaceSwitcher />
      </SidebarHeader>

      <SidebarContent className="px-2 py-3">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5">
              {NAV_ITEMS.map((item) => {
                const Icon = icons[item.icon as keyof typeof icons]
                const href = `/${workspaceSlug}${item.href}`
                const isActive = item.href === ''
                  ? pathname === `/${workspaceSlug}`
                  : pathname.startsWith(href)

                return (
                  <SidebarMenuItem key={item.label}>
                    {item.soon ? (
                      <SidebarMenuButton
                        disabled
                        className="opacity-35 cursor-not-allowed h-9 rounded-md px-3 text-sm text-white/60"
                      >
                        <Icon className="h-4 w-4" />
                        <span>{item.label}</span>
                        <Badge
                          variant="secondary"
                          className="ml-auto text-[10px] py-0 px-1.5 bg-white/10 text-white/40 border-0"
                        >
                          Em breve
                        </Badge>
                      </SidebarMenuButton>
                    ) : (
                      <SidebarMenuButton
                        isActive={isActive}
                        className={`h-9 rounded-md px-3 text-sm transition-all duration-150
                          ${isActive
                            ? 'bg-[#ff5600]/15 text-[#ff5600] border border-[#ff5600]/20 font-medium'
                            : 'text-white/60 hover:text-white/90 hover:bg-white/[0.06]'
                          }`}
                      >
                        <Link href={href} className="flex items-center gap-2.5 w-full">
                          <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-[#ff5600]' : ''}`} />
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
