import { redirect } from 'next/navigation'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { getInitials } from '@/lib/utils'
import type { Workspace } from '@/types/app.types'

export default async function WorkspacesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data } = await supabase
    .from('workspace_members')
    .select('role, workspaces(*)')
    .eq('user_id', user.id)
    .order('joined_at', { ascending: true })

  const memberships = (data ?? []) as unknown as { role: string; workspaces: Workspace }[]

  if (memberships.length === 1) {
    redirect(`/${memberships[0].workspaces.slug}`)
  }

  if (memberships.length === 0) {
    redirect('/create-workspace')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-md space-y-4">
        <div className="text-center space-y-1 mb-6">
          <h1 className="text-2xl font-bold">Seus workspaces</h1>
          <p className="text-muted-foreground text-sm">Escolha um workspace para entrar</p>
        </div>

        <div className="space-y-2">
          {memberships.map(({ role, workspaces: ws }) => (
            <Link
              key={ws.id}
              href={`/${ws.slug}`}
              className="flex items-center gap-3 p-4 bg-background border rounded-lg hover:border-primary hover:shadow-sm transition-all"
            >
              <Avatar className="h-10 w-10">
                <AvatarFallback className="font-semibold">{getInitials(ws.name)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{ws.name}</p>
                <p className="text-xs text-muted-foreground capitalize">{role}</p>
              </div>
              <span className="text-muted-foreground text-xs font-mono">{ws.slug}</span>
            </Link>
          ))}
        </div>

        <Link
          href="/create-workspace"
          className="flex items-center gap-3 p-4 border border-dashed rounded-lg hover:border-primary text-muted-foreground hover:text-foreground transition-colors"
        >
          <div className="h-10 w-10 rounded-full border-2 border-dashed flex items-center justify-center">
            <Plus className="h-4 w-4" />
          </div>
          <span className="text-sm font-medium">Criar novo workspace</span>
        </Link>
      </div>
    </div>
  )
}
