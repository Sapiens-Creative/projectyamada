import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { WorkspaceProvider } from '@/providers/workspace-provider'
import { AppSidebar } from '@/components/layout/sidebar'
import { Topbar } from '@/components/layout/topbar'
import { SidebarProvider } from '@/components/ui/sidebar'
import type { Profile, Workspace } from '@/types/app.types'

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ workspaceSlug: string }>
}) {
  const { workspaceSlug } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profileRaw } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const profile = profileRaw as Profile | null
  if (!profile) redirect('/login')

  const { data: workspaceRaw } = await supabase
    .from('workspaces')
    .select('*')
    .eq('slug', workspaceSlug)
    .single()

  const workspace = workspaceRaw as Workspace | null
  if (!workspace) redirect('/create-workspace')

  const { data: member } = await supabase
    .from('workspace_members')
    .select('id')
    .eq('workspace_id', workspace.id)
    .eq('user_id', user.id)
    .single()

  if (!member) redirect('/create-workspace')

  const { data: allMemberships } = await supabase
    .from('workspace_members')
    .select('workspaces(*)')
    .eq('user_id', user.id)
    .order('joined_at', { ascending: true })

  const allWorkspaces = ((allMemberships ?? []) as unknown as { workspaces: Workspace }[]).map((m) => m.workspaces)

  return (
    <WorkspaceProvider workspace={workspace} profile={profile} allWorkspaces={allWorkspaces}>
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <AppSidebar workspaceSlug={workspaceSlug} />
          <div className="flex flex-col flex-1 min-w-0">
            <Topbar />
            <main className="flex-1 p-6">{children}</main>
          </div>
        </div>
      </SidebarProvider>
    </WorkspaceProvider>
  )
}
