'use server'

import { revalidatePath } from 'next/cache'
import { createClient as createSupabaseClient } from '@/lib/supabase/server'
import type { ActionResult, WorkspaceMemberWithProfile } from '@/types/app.types'

export async function getTeamMembers(workspaceId: string): Promise<ActionResult<WorkspaceMemberWithProfile[]>> {
  const supabase = await createSupabaseClient()

  const { data, error } = await supabase
    .from('workspace_members')
    .select('*, profiles(*)')
    .eq('workspace_id', workspaceId)
    .order('joined_at', { ascending: true })

  if (error) return { data: null, error: (error as { message: string }).message, success: false }
  return { data: data as WorkspaceMemberWithProfile[], error: null, success: true }
}

export async function updateMemberRoleAction(
  memberId: string,
  role: 'admin' | 'member' | 'viewer',
  workspaceSlug: string
): Promise<ActionResult> {
  const supabase = await createSupabaseClient()

  const { error } = await supabase
    .from('workspace_members')
    .update({ role })
    .eq('id', memberId)

  if (error) return { data: null, error: (error as { message: string }).message, success: false }

  revalidatePath(`/${workspaceSlug}/team`)
  return { data: null, error: null, success: true }
}

export async function removeMemberAction(
  memberId: string,
  workspaceSlug: string
): Promise<ActionResult> {
  const supabase = await createSupabaseClient()

  const { error } = await supabase
    .from('workspace_members')
    .delete()
    .eq('id', memberId)

  if (error) return { data: null, error: (error as { message: string }).message, success: false }

  revalidatePath(`/${workspaceSlug}/team`)
  return { data: null, error: null, success: true }
}
