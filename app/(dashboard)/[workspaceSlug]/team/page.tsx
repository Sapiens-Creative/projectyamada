import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getTeamMembers } from '@/lib/actions/team.actions'
import { getWorkspaceInvites } from '@/lib/actions/invite.actions'
import { InviteForm } from '@/components/team/invite-form'
import type { Workspace, WorkspaceMemberWithProfile, WorkspaceInvite } from '@/types/app.types'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { getInitials } from '@/lib/utils'
import { MemberActions } from '@/components/team/member-actions'

const ROLE_LABELS: Record<string, string> = {
  owner: 'Dono',
  admin: 'Admin',
  member: 'Membro',
  viewer: 'Visualizador',
}

const ROLE_COLORS: Record<string, string> = {
  owner: 'bg-purple-100 text-purple-800',
  admin: 'bg-blue-100 text-blue-800',
  member: 'bg-green-100 text-green-800',
  viewer: 'bg-gray-100 text-gray-800',
}

interface PageProps {
  params: Promise<{ workspaceSlug: string }>
}

export default async function TeamPage({ params }: PageProps) {
  const { workspaceSlug } = await params
  const supabase = await createClient()

  const { data: workspaceRaw } = await supabase
    .from('workspaces')
    .select('*')
    .eq('slug', workspaceSlug)
    .single()

  if (!workspaceRaw) notFound()
  const workspace = workspaceRaw as Workspace

  const { data: sessionData } = await supabase.auth.getUser()
  const currentUserId = sessionData.user?.id

  const [teamResult, invitesResult] = await Promise.all([
    getTeamMembers(workspace.id),
    getWorkspaceInvites(workspace.id),
  ])
  const members = (teamResult.data ?? []) as WorkspaceMemberWithProfile[]
  const pendingInvites = (invitesResult.data ?? []) as WorkspaceInvite[]

  const currentMember = members.find((m) => m.user_id === currentUserId)
  const canManage = currentMember?.role === 'owner' || currentMember?.role === 'admin'

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Equipe</h1>
        <p className="text-muted-foreground text-sm">{members.length} membro{members.length !== 1 ? 's' : ''}</p>
      </div>

      <div className="space-y-3">
        {members.map((member) => (
          <Card key={member.id}>
            <CardContent className="py-3 px-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="text-sm">
                      {getInitials(member.profiles.full_name ?? member.profiles.email)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm">{member.profiles.full_name ?? 'Sem nome'}</p>
                    <p className="text-xs text-muted-foreground">{member.profiles.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={ROLE_COLORS[member.role]}>
                    {ROLE_LABELS[member.role]}
                  </Badge>
                  {canManage && member.role !== 'owner' && member.user_id !== currentUserId && (
                    <MemberActions
                      memberId={member.id}
                      currentRole={member.role as 'admin' | 'member' | 'viewer'}
                      workspaceSlug={workspaceSlug}
                    />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {canManage && (
        <InviteForm
          workspaceId={workspace.id}
          workspaceSlug={workspaceSlug}
          pendingInvites={pendingInvites}
        />
      )}
    </div>
  )
}
