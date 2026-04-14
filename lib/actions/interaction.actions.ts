'use server'

import { revalidatePath } from 'next/cache'
import { createClient as createSupabaseClient } from '@/lib/supabase/server'
import type { ActionResult, ClientInteraction } from '@/types/app.types'
import { createInteractionSchema } from '@/lib/validations/client.schema'

export async function getClientInteractions(
  clientId: string
): Promise<ActionResult<ClientInteraction[]>> {
  const supabase = await createSupabaseClient()

  const { data, error } = await supabase
    .from('client_interactions')
    .select('*')
    .eq('client_id', clientId)
    .order('occurred_at', { ascending: false })

  if (error) return { data: null, error: (error as { message: string }).message, success: false }
  return { data: data as ClientInteraction[], error: null, success: true }
}

export async function createInteractionAction(
  clientId: string,
  workspaceId: string,
  workspaceSlug: string,
  formData: FormData
): Promise<ActionResult<ClientInteraction>> {
  const raw = {
    type: formData.get('type') as string,
    title: formData.get('title') as string,
    description: formData.get('description') as string,
    occurred_at: formData.get('occurred_at') as string,
  }

  const parsed = createInteractionSchema.safeParse(raw)
  if (!parsed.success) {
    return { data: null, error: parsed.error.issues[0].message, success: false }
  }

  const supabase = await createSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('client_interactions')
    .insert({
      client_id: clientId,
      workspace_id: workspaceId,
      type: parsed.data.type,
      title: parsed.data.title,
      description: parsed.data.description || null,
      occurred_at: parsed.data.occurred_at || new Date().toISOString(),
      created_by: user?.id,
    })
    .select()
    .single()

  if (error) return { data: null, error: (error as { message: string }).message, success: false }

  revalidatePath(`/${workspaceSlug}/clients/${clientId}`)
  return { data: data as ClientInteraction, error: null, success: true }
}

export async function deleteInteractionAction(
  interactionId: string,
  clientId: string,
  workspaceSlug: string
): Promise<ActionResult> {
  const supabase = await createSupabaseClient()

  const { error } = await supabase
    .from('client_interactions')
    .delete()
    .eq('id', interactionId)

  if (error) return { data: null, error: (error as { message: string }).message, success: false }

  revalidatePath(`/${workspaceSlug}/clients/${clientId}`)
  return { data: null, error: null, success: true }
}
