'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { ActionResult, CampaignCost } from '@/types/app.types'
import { createCampaignCostSchema } from '@/lib/validations/campaign-cost.schema'

export async function getCampaignCosts(workspaceId: string, projectId?: string): Promise<ActionResult<CampaignCost[]>> {
  const supabase = await createClient()

  let query = supabase
    .from('campaign_costs')
    .select('*')
    .eq('workspace_id', workspaceId)
    .order('date', { ascending: false })

  if (projectId) {
    query = query.eq('project_id', projectId)
  }

  const { data, error } = await query
  if (error) return { data: null, error: (error as { message: string }).message, success: false }
  return { data: data as CampaignCost[], error: null, success: true }
}

export async function createCampaignCostAction(
  workspaceId: string,
  workspaceSlug: string,
  formData: FormData
): Promise<ActionResult<CampaignCost>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: null, error: 'Não autenticado', success: false }

  const raw = Object.fromEntries(formData)
  const parsed = createCampaignCostSchema.safeParse(raw)
  if (!parsed.success) return { data: null, error: parsed.error.issues[0].message, success: false }

  const { data, error } = await supabase
    .from('campaign_costs')
    .insert({
      workspace_id: workspaceId,
      project_id: parsed.data.project_id,
      category: parsed.data.category,
      description: parsed.data.description,
      amount: parsed.data.amount,
      date: parsed.data.date,
      created_by: user.id,
    })
    .select()
    .single()

  if (error) return { data: null, error: (error as { message: string }).message, success: false }
  revalidatePath(`/${workspaceSlug}/financial`)
  revalidatePath(`/${workspaceSlug}/projects`)
  return { data: data as CampaignCost, error: null, success: true }
}

export async function deleteCampaignCostAction(
  costId: string,
  workspaceSlug: string
): Promise<ActionResult> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('campaign_costs')
    .delete()
    .eq('id', costId)

  if (error) return { data: null, error: (error as { message: string }).message, success: false }
  revalidatePath(`/${workspaceSlug}/financial`)
  revalidatePath(`/${workspaceSlug}/projects`)
  return { data: null, error: null, success: true }
}
