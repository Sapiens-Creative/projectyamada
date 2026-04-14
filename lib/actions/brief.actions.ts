'use server'

import { revalidatePath } from 'next/cache'
import { createClient as createSupabaseClient } from '@/lib/supabase/server'
import type { ActionResult, CampaignBrief } from '@/types/app.types'
import { upsertBriefSchema } from '@/lib/validations/brief.schema'

export async function getBrief(projectId: string): Promise<ActionResult<CampaignBrief | null>> {
  const supabase = await createSupabaseClient()

  const { data, error } = await supabase
    .from('campaign_briefs')
    .select('*')
    .eq('project_id', projectId)
    .maybeSingle()

  if (error) return { data: null, error: (error as { message: string }).message, success: false }
  return { data: data as CampaignBrief | null, error: null, success: true }
}

export async function upsertBriefAction(
  projectId: string,
  workspaceId: string,
  workspaceSlug: string,
  formData: FormData
): Promise<ActionResult<CampaignBrief>> {
  const raw = Object.fromEntries(formData.entries())
  const parsed = upsertBriefSchema.safeParse(raw)
  if (!parsed.success) {
    return { data: null, error: parsed.error.issues[0].message, success: false }
  }

  // Parse channels from comma-separated string
  const channelsRaw = formData.get('channels') as string | null
  const channels = channelsRaw
    ? channelsRaw.split(',').map((c) => c.trim()).filter(Boolean)
    : []

  const supabase = await createSupabaseClient()

  const payload = {
    project_id: projectId,
    workspace_id: workspaceId,
    objective: parsed.data.objective || null,
    target_audience: parsed.data.target_audience || null,
    channels,
    budget_total: parsed.data.budget_total ?? null,
    budget_media: parsed.data.budget_media ?? null,
    start_date: parsed.data.start_date || null,
    end_date: parsed.data.end_date || null,
    strategy: parsed.data.strategy || null,
    notes: parsed.data.notes || null,
    updated_at: new Date().toISOString(),
  }

  const { data, error } = await supabase
    .from('campaign_briefs')
    .upsert(payload, { onConflict: 'project_id' })
    .select()
    .single()

  if (error) return { data: null, error: (error as { message: string }).message, success: false }

  revalidatePath(`/${workspaceSlug}/projects/${projectId}`)
  return { data: data as CampaignBrief, error: null, success: true }
}
