'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { ActionResult, TimeEntry, TimeEntryWithUser } from '@/types/app.types'
import { createTimeEntrySchema } from '@/lib/validations/timesheet.schema'

export async function getTimeEntries(workspaceId: string, projectId?: string): Promise<ActionResult<TimeEntryWithUser[]>> {
  const supabase = await createClient()

  let query = supabase
    .from('time_entries')
    .select('*, profiles!time_entries_user_id_fkey(id, full_name, avatar_url)')
    .eq('workspace_id', workspaceId)
    .order('date', { ascending: false })

  if (projectId) {
    query = query.eq('project_id', projectId)
  }

  const { data, error } = await query
  if (error) return { data: null, error: (error as { message: string }).message, success: false }
  return { data: data as unknown as TimeEntryWithUser[], error: null, success: true }
}

export async function createTimeEntryAction(
  workspaceId: string,
  workspaceSlug: string,
  formData: FormData
): Promise<ActionResult<TimeEntry>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: null, error: 'Não autenticado', success: false }

  const raw = Object.fromEntries(formData)
  const parsed = createTimeEntrySchema.safeParse(raw)
  if (!parsed.success) return { data: null, error: parsed.error.issues[0].message, success: false }

  const { data, error } = await supabase
    .from('time_entries')
    .insert({
      workspace_id: workspaceId,
      user_id: user.id,
      project_id: parsed.data.project_id,
      description: parsed.data.description || null,
      hours: parsed.data.hours,
      hourly_rate: parsed.data.hourly_rate ?? null,
      date: parsed.data.date,
    })
    .select()
    .single()

  if (error) return { data: null, error: (error as { message: string }).message, success: false }
  revalidatePath(`/${workspaceSlug}/financial`)
  revalidatePath(`/${workspaceSlug}/projects`)
  return { data: data as TimeEntry, error: null, success: true }
}

export async function deleteTimeEntryAction(
  entryId: string,
  workspaceSlug: string
): Promise<ActionResult> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('time_entries')
    .delete()
    .eq('id', entryId)

  if (error) return { data: null, error: (error as { message: string }).message, success: false }
  revalidatePath(`/${workspaceSlug}/financial`)
  revalidatePath(`/${workspaceSlug}/projects`)
  return { data: null, error: null, success: true }
}
