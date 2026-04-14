'use server'

import { revalidatePath } from 'next/cache'
import { createClient as createSupabaseClient } from '@/lib/supabase/server'
import type { ActionResult, WorkspaceInvite } from '@/types/app.types'

export async function createInviteAction(
  workspaceId: string,
  workspaceSlug: string,
  formData: FormData
): Promise<ActionResult<WorkspaceInvite>> {
  const email = (formData.get('email') as string)?.trim().toLowerCase()
  const role = (formData.get('role') as string) || 'member'

  if (!email || !email.includes('@')) {
    return { data: null, error: 'E-mail inválido', success: false }
  }

  const supabase = await createSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: null, error: 'Não autenticado', success: false }

  // Check not already a member
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', email)
    .single()

  if (existingProfile) {
    const { data: existingMember } = await supabase
      .from('workspace_members')
      .select('id')
      .eq('workspace_id', workspaceId)
      .eq('user_id', existingProfile.id)
      .single()

    if (existingMember) {
      return { data: null, error: 'Usuário já é membro deste workspace', success: false }
    }
  }

  // Upsert invite (replace old pending invite for same email)
  const { data: existing } = await supabase
    .from('workspace_invites')
    .select('id')
    .eq('workspace_id', workspaceId)
    .eq('email', email)
    .is('used_at', null)
    .single()

  if (existing) {
    await supabase.from('workspace_invites').delete().eq('id', existing.id)
  }

  const { data, error } = await supabase
    .from('workspace_invites')
    .insert({
      workspace_id: workspaceId,
      email,
      role: role as 'admin' | 'member' | 'viewer',
      invited_by: user.id,
    })
    .select()
    .single()

  if (error) return { data: null, error: (error as { message: string }).message, success: false }

  revalidatePath(`/${workspaceSlug}/team`)
  return { data: data as WorkspaceInvite, error: null, success: true }
}

export async function getInviteByToken(token: string): Promise<ActionResult<WorkspaceInvite & { workspaces: { name: string; slug: string } }>> {
  const supabase = await createSupabaseClient()

  const { data, error } = await supabase
    .from('workspace_invites')
    .select('*, workspaces(name, slug)')
    .eq('token', token)
    .is('used_at', null)
    .single()

  if (error || !data) return { data: null, error: 'Convite inválido ou expirado', success: false }

  if (new Date(data.expires_at) < new Date()) {
    return { data: null, error: 'Convite expirado', success: false }
  }

  return { data: data as WorkspaceInvite & { workspaces: { name: string; slug: string } }, error: null, success: true }
}

export async function acceptInviteAction(token: string): Promise<ActionResult<{ slug: string }>> {
  const supabase = await createSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: null, error: 'Não autenticado', success: false }

  const inviteResult = await getInviteByToken(token)
  if (!inviteResult.data) return { data: null, error: inviteResult.error, success: false }

  const invite = inviteResult.data

  // Check email matches
  const { data: profile } = await supabase.from('profiles').select('email').eq('id', user.id).single()
  if (profile?.email !== invite.email) {
    return { data: null, error: `Este convite é para ${invite.email}. Você está logado com outra conta.`, success: false }
  }

  // Add as member
  const { error: memberError } = await supabase.from('workspace_members').insert({
    workspace_id: invite.workspace_id,
    user_id: user.id,
    role: invite.role,
    invited_by: invite.invited_by ?? undefined,
  })

  if (memberError) {
    if ((memberError as { code?: string }).code === '23505') {
      return { data: null, error: 'Você já é membro deste workspace', success: false }
    }
    return { data: null, error: (memberError as { message: string }).message, success: false }
  }

  // Mark invite as used
  await supabase.from('workspace_invites').update({ used_at: new Date().toISOString() }).eq('id', invite.id)

  const slug = (invite as unknown as { workspaces: { slug: string } }).workspaces.slug
  return { data: { slug }, error: null, success: true }
}

export async function getWorkspaceInvites(workspaceId: string): Promise<ActionResult<WorkspaceInvite[]>> {
  const supabase = await createSupabaseClient()

  const { data, error } = await supabase
    .from('workspace_invites')
    .select('*')
    .eq('workspace_id', workspaceId)
    .is('used_at', null)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })

  if (error) return { data: null, error: (error as { message: string }).message, success: false }
  return { data: data as WorkspaceInvite[], error: null, success: true }
}

export async function revokeInviteAction(inviteId: string, workspaceSlug: string): Promise<ActionResult> {
  const supabase = await createSupabaseClient()
  const { error } = await supabase.from('workspace_invites').delete().eq('id', inviteId)
  if (error) return { data: null, error: (error as { message: string }).message, success: false }
  revalidatePath(`/${workspaceSlug}/team`)
  return { data: null, error: null, success: true }
}
