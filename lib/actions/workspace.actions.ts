'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { Workspace } from '@/types/app.types'
import { createWorkspaceSchema } from '@/lib/validations/workspace.schema'
import { z } from 'zod'

export async function createWorkspace(formData: FormData): Promise<void> {
  const raw = {
    name: formData.get('name') as string,
    slug: formData.get('slug') as string,
  }

  const parsed = createWorkspaceSchema.safeParse(raw)
  if (!parsed.success) return

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: workspaceRaw, error } = await supabase
    .from('workspaces')
    .insert({ ...parsed.data, owner_id: user.id })
    .select()
    .single()

  if (error) return

  const workspace = workspaceRaw as Workspace

  await supabase.from('workspace_members').insert({
    workspace_id: workspace.id,
    user_id: user.id,
    role: 'owner',
  })

  redirect(`/${workspace.slug}`)
}

const updateWorkspaceSchema = z.object({
  name: z.string().min(2, 'Nome deve ter ao menos 2 caracteres'),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/, 'Slug inválido'),
})

export async function updateWorkspaceAction(
  workspaceId: string,
  formData: FormData
): Promise<{ error: string | null; newSlug?: string }> {
  const raw = {
    name: formData.get('name') as string,
    slug: formData.get('slug') as string,
  }

  const parsed = updateWorkspaceSchema.safeParse(raw)
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const supabase = await createClient()

  const { error } = await supabase
    .from('workspaces')
    .update({ name: parsed.data.name, slug: parsed.data.slug })
    .eq('id', workspaceId)

  if (error) {
    const err = error as { code?: string; message: string }
    if (err.code === '23505') return { error: 'Este slug já está em uso' }
    return { error: err.message }
  }

  revalidatePath(`/${parsed.data.slug}/settings`)
  return { error: null, newSlug: parsed.data.slug }
}
