'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Workspace } from '@/types/app.types'
import { createWorkspaceSchema } from '@/lib/validations/workspace.schema'

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
