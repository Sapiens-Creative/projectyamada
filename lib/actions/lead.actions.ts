'use server'

import { revalidatePath } from 'next/cache'
import { createClient as createSupabaseClient } from '@/lib/supabase/server'
import type { ActionResult, Lead, LeadWithAssignee, Client } from '@/types/app.types'
import { createLeadSchema, updateLeadSchema } from '@/lib/validations/lead.schema'

export async function getLeads(workspaceId: string): Promise<ActionResult<LeadWithAssignee[]>> {
  const supabase = await createSupabaseClient()

  const { data, error } = await supabase
    .from('leads')
    .select('*, assignee:profiles!leads_assigned_to_fkey(id, full_name, avatar_url)')
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: false })

  if (error) return { data: null, error: (error as { message: string }).message, success: false }
  return { data: data as LeadWithAssignee[], error: null, success: true }
}

export async function createLeadAction(
  workspaceId: string,
  workspaceSlug: string,
  formData: FormData
): Promise<ActionResult<Lead>> {
  const raw = Object.fromEntries(formData.entries())
  const parsed = createLeadSchema.safeParse(raw)
  if (!parsed.success) {
    return { data: null, error: parsed.error.issues[0].message, success: false }
  }

  const supabase = await createSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('leads')
    .insert({ ...parsed.data, workspace_id: workspaceId, created_by: user?.id })
    .select()
    .single()

  if (error) return { data: null, error: (error as { message: string }).message, success: false }

  revalidatePath(`/${workspaceSlug}/pipeline`)
  return { data: data as Lead, error: null, success: true }
}

export async function updateLeadAction(
  leadId: string,
  workspaceSlug: string,
  formData: FormData
): Promise<ActionResult<Lead>> {
  const raw = Object.fromEntries(formData.entries())
  const parsed = updateLeadSchema.safeParse(raw)
  if (!parsed.success) {
    return { data: null, error: parsed.error.issues[0].message, success: false }
  }

  const supabase = await createSupabaseClient()
  const { data, error } = await supabase
    .from('leads')
    .update({ ...parsed.data, updated_at: new Date().toISOString() })
    .eq('id', leadId)
    .select()
    .single()

  if (error) return { data: null, error: (error as { message: string }).message, success: false }

  revalidatePath(`/${workspaceSlug}/pipeline`)
  return { data: data as Lead, error: null, success: true }
}

export async function updateLeadStageAction(
  leadId: string,
  stage: Lead['stage'],
  workspaceSlug: string
): Promise<ActionResult<Lead>> {
  const supabase = await createSupabaseClient()

  const { data, error } = await supabase
    .from('leads')
    .update({ stage, updated_at: new Date().toISOString() })
    .eq('id', leadId)
    .select()
    .single()

  if (error) return { data: null, error: (error as { message: string }).message, success: false }

  revalidatePath(`/${workspaceSlug}/pipeline`)
  return { data: data as Lead, error: null, success: true }
}

export async function deleteLeadAction(
  leadId: string,
  workspaceSlug: string
): Promise<ActionResult> {
  const supabase = await createSupabaseClient()
  const { error } = await supabase.from('leads').delete().eq('id', leadId)
  if (error) return { data: null, error: (error as { message: string }).message, success: false }

  revalidatePath(`/${workspaceSlug}/pipeline`)
  return { data: null, error: null, success: true }
}

export async function convertLeadToClientAction(
  leadId: string,
  workspaceId: string,
  workspaceSlug: string
): Promise<ActionResult<Client>> {
  const supabase = await createSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch lead data
  const { data: leadRaw, error: leadErr } = await supabase
    .from('leads')
    .select('*')
    .eq('id', leadId)
    .single()

  if (leadErr || !leadRaw) {
    return { data: null, error: 'Lead não encontrado', success: false }
  }

  const lead = leadRaw as Lead

  // Generate slug from name
  const slug = lead.name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .slice(0, 60)

  // Create client
  const { data: clientData, error: clientErr } = await supabase
    .from('clients')
    .insert({
      workspace_id: workspaceId,
      name: lead.name,
      slug,
      status: 'active',
      tier: 'standard',
      created_by: user?.id,
      notes: lead.notes || null,
    })
    .select()
    .single()

  if (clientErr) {
    const err = clientErr as { code?: string; message: string }
    if (err.code === '23505') {
      return { data: null, error: 'Já existe um cliente com esse nome. Renomeie o lead antes de converter.', success: false }
    }
    return { data: null, error: err.message, success: false }
  }

  // Link lead to client and mark as won
  await supabase
    .from('leads')
    .update({ stage: 'won', converted_client_id: (clientData as Client).id, updated_at: new Date().toISOString() })
    .eq('id', leadId)

  revalidatePath(`/${workspaceSlug}/pipeline`)
  revalidatePath(`/${workspaceSlug}/clients`)
  return { data: clientData as Client, error: null, success: true }
}
