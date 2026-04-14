'use server'

import { revalidatePath } from 'next/cache'
import { createClient as createSupabaseClient } from '@/lib/supabase/server'
import type { ActionResult, Profile } from '@/types/app.types'

const BUCKET = 'avatars'

export async function updateProfileAction(formData: FormData): Promise<ActionResult<Profile>> {
  const supabase = await createSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: null, error: 'Não autenticado', success: false }

  const fullName = (formData.get('full_name') as string)?.trim()
  if (!fullName || fullName.length < 2) {
    return { data: null, error: 'Nome deve ter ao menos 2 caracteres', success: false }
  }

  const avatarFile = formData.get('avatar') as File | null
  let avatarUrl: string | undefined

  if (avatarFile && avatarFile.size > 0) {
    if (avatarFile.size > 5 * 1024 * 1024) {
      return { data: null, error: 'Avatar muito grande (máx. 5MB)', success: false }
    }

    const ext = avatarFile.name.split('.').pop() ?? 'jpg'
    const storagePath = `${user.id}/avatar.${ext}`

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, avatarFile, { contentType: avatarFile.type, upsert: true })

    if (uploadError) {
      return { data: null, error: (uploadError as { message: string }).message, success: false }
    }

    const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(storagePath)
    avatarUrl = `${publicUrl}?t=${Date.now()}`
  }

  const updates: Record<string, unknown> = { full_name: fullName }
  if (avatarUrl) updates.avatar_url = avatarUrl

  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', user.id)
    .select()
    .single()

  if (error) return { data: null, error: (error as { message: string }).message, success: false }

  revalidatePath('/', 'layout')
  return { data: data as Profile, error: null, success: true }
}
