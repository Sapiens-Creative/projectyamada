'use server'

import { revalidatePath } from 'next/cache'
import { createClient as createSupabaseClient } from '@/lib/supabase/server'
import type { ActionResult, Notification } from '@/types/app.types'

export async function getNotifications(workspaceId: string): Promise<ActionResult<Notification[]>> {
  const supabase = await createSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: null, error: 'Não autenticado', success: false }

  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('workspace_id', workspaceId)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(30)

  if (error) return { data: null, error: (error as { message: string }).message, success: false }
  return { data: data as Notification[], error: null, success: true }
}

export async function markNotificationReadAction(notificationId: string): Promise<ActionResult> {
  const supabase = await createSupabaseClient()

  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', notificationId)

  if (error) return { data: null, error: (error as { message: string }).message, success: false }
  return { data: null, error: null, success: true }
}

export async function markAllNotificationsReadAction(workspaceId: string): Promise<ActionResult> {
  const supabase = await createSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: null, error: 'Não autenticado', success: false }

  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('workspace_id', workspaceId)
    .eq('user_id', user.id)
    .eq('read', false)

  if (error) return { data: null, error: (error as { message: string }).message, success: false }
  revalidatePath('/', 'layout')
  return { data: null, error: null, success: true }
}

export async function createNotificationAction(params: {
  workspaceId: string
  userId: string
  type: string
  title: string
  message?: string
  entityType?: string
  entityId?: string
}): Promise<ActionResult<Notification>> {
  const supabase = await createSupabaseClient()

  const { data, error } = await supabase
    .from('notifications')
    .insert({
      workspace_id: params.workspaceId,
      user_id: params.userId,
      type: params.type,
      title: params.title,
      message: params.message ?? null,
      entity_type: params.entityType ?? null,
      entity_id: params.entityId ?? null,
    })
    .select()
    .single()

  if (error) return { data: null, error: (error as { message: string }).message, success: false }
  return { data: data as Notification, error: null, success: true }
}
