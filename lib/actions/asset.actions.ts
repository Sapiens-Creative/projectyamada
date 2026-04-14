'use server'

import { revalidatePath } from 'next/cache'
import { createClient as createSupabaseClient } from '@/lib/supabase/server'
import type { ActionResult, Asset, AssetWithClient } from '@/types/app.types'

const BUCKET = 'assets'

export async function getAssets(workspaceId: string): Promise<ActionResult<AssetWithClient[]>> {
  const supabase = await createSupabaseClient()

  const { data, error } = await supabase
    .from('assets')
    .select('*, clients(id, name, slug)')
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: false })

  if (error) return { data: null, error: (error as { message: string }).message, success: false }
  return { data: data as AssetWithClient[], error: null, success: true }
}

export async function uploadAssetAction(
  workspaceId: string,
  workspaceSlug: string,
  formData: FormData
): Promise<ActionResult<Asset>> {
  const supabase = await createSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  const file = formData.get('file') as File | null
  const clientId = formData.get('client_id') as string | null

  if (!file || file.size === 0) {
    return { data: null, error: 'Nenhum arquivo selecionado', success: false }
  }

  const MAX_SIZE = 50 * 1024 * 1024 // 50MB
  if (file.size > MAX_SIZE) {
    return { data: null, error: 'Arquivo muito grande (máx. 50MB)', success: false }
  }

  const ext = file.name.split('.').pop() ?? 'bin'
  const storagePath = `${workspaceId}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, file, { contentType: file.type, upsert: false })

  if (uploadError) {
    return { data: null, error: (uploadError as { message: string }).message, success: false }
  }

  const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(storagePath)

  const { data, error } = await supabase
    .from('assets')
    .insert({
      workspace_id: workspaceId,
      client_id: clientId && clientId !== 'none' ? clientId : null,
      name: file.name,
      file_url: publicUrl,
      storage_path: storagePath,
      file_type: file.type,
      size: file.size,
      created_by: user?.id,
    })
    .select()
    .single()

  if (error) {
    await supabase.storage.from(BUCKET).remove([storagePath])
    return { data: null, error: (error as { message: string }).message, success: false }
  }

  revalidatePath(`/${workspaceSlug}/assets`)
  return { data: data as Asset, error: null, success: true }
}

export async function approveAssetAction(
  assetId: string,
  status: 'approved' | 'rejected',
  workspaceSlug: string
): Promise<ActionResult<Asset>> {
  const supabase = await createSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('assets')
    .update({
      approval_status: status,
      approved_by: status === 'approved' ? user?.id : null,
      approved_at: status === 'approved' ? new Date().toISOString() : null,
    })
    .eq('id', assetId)
    .select()
    .single()

  if (error) return { data: null, error: (error as { message: string }).message, success: false }

  revalidatePath(`/${workspaceSlug}/assets`)
  return { data: data as Asset, error: null, success: true }
}

export async function deleteAssetAction(
  assetId: string,
  storagePath: string,
  workspaceSlug: string
): Promise<ActionResult> {
  const supabase = await createSupabaseClient()

  await supabase.storage.from(BUCKET).remove([storagePath])

  const { error } = await supabase.from('assets').delete().eq('id', assetId)
  if (error) return { data: null, error: (error as { message: string }).message, success: false }

  revalidatePath(`/${workspaceSlug}/assets`)
  return { data: null, error: null, success: true }
}
