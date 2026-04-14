'use server'

import { revalidatePath } from 'next/cache'
import { createClient as createSupabaseClient } from '@/lib/supabase/server'
import type { ActionResult, Proposal, ProposalWithRefs } from '@/types/app.types'
import { createProposalSchema, updateProposalSchema } from '@/lib/validations/proposal.schema'

export async function getProposals(workspaceId: string): Promise<ActionResult<ProposalWithRefs[]>> {
  const supabase = await createSupabaseClient()

  const { data, error } = await supabase
    .from('proposals')
    .select('*, leads(id, name), clients(id, name, slug)')
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: false })

  if (error) return { data: null, error: (error as { message: string }).message, success: false }
  return { data: data as ProposalWithRefs[], error: null, success: true }
}

export async function createProposalAction(
  workspaceId: string,
  workspaceSlug: string,
  formData: FormData
): Promise<ActionResult<Proposal>> {
  const raw = Object.fromEntries(formData.entries())
  const parsed = createProposalSchema.safeParse(raw)
  if (!parsed.success) {
    return { data: null, error: parsed.error.issues[0].message, success: false }
  }

  const supabase = await createSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('proposals')
    .insert({ ...parsed.data, workspace_id: workspaceId, created_by: user?.id })
    .select()
    .single()

  if (error) return { data: null, error: (error as { message: string }).message, success: false }

  revalidatePath(`/${workspaceSlug}/proposals`)
  return { data: data as Proposal, error: null, success: true }
}

export async function updateProposalAction(
  proposalId: string,
  workspaceSlug: string,
  formData: FormData
): Promise<ActionResult<Proposal>> {
  const raw = Object.fromEntries(formData.entries())
  const parsed = updateProposalSchema.safeParse(raw)
  if (!parsed.success) {
    return { data: null, error: parsed.error.issues[0].message, success: false }
  }

  const supabase = await createSupabaseClient()
  const { data, error } = await supabase
    .from('proposals')
    .update({ ...parsed.data, updated_at: new Date().toISOString() })
    .eq('id', proposalId)
    .select()
    .single()

  if (error) return { data: null, error: (error as { message: string }).message, success: false }

  revalidatePath(`/${workspaceSlug}/proposals`)
  return { data: data as Proposal, error: null, success: true }
}

export async function updateProposalStatusAction(
  proposalId: string,
  status: Proposal['status'],
  workspaceSlug: string
): Promise<ActionResult<Proposal>> {
  const supabase = await createSupabaseClient()
  const { data, error } = await supabase
    .from('proposals')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', proposalId)
    .select()
    .single()

  if (error) return { data: null, error: (error as { message: string }).message, success: false }

  revalidatePath(`/${workspaceSlug}/proposals`)
  return { data: data as Proposal, error: null, success: true }
}

export async function deleteProposalAction(
  proposalId: string,
  workspaceSlug: string
): Promise<ActionResult> {
  const supabase = await createSupabaseClient()
  const { error } = await supabase.from('proposals').delete().eq('id', proposalId)
  if (error) return { data: null, error: (error as { message: string }).message, success: false }

  revalidatePath(`/${workspaceSlug}/proposals`)
  return { data: null, error: null, success: true }
}
