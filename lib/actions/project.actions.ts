'use server'

import { revalidatePath } from 'next/cache'
import { createClient as createSupabaseClient } from '@/lib/supabase/server'
import type { ActionResult, Project, ProjectWithClient } from '@/types/app.types'
import { createProjectSchema, updateProjectSchema } from '@/lib/validations/project.schema'

export async function getProjects(workspaceId: string): Promise<ActionResult<ProjectWithClient[]>> {
  const supabase = await createSupabaseClient()

  const { data, error } = await supabase
    .from('projects')
    .select('*, clients(id, name, slug, logo_url)')
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: false })

  if (error) return { data: null, error: (error as { message: string }).message, success: false }
  return { data: data as ProjectWithClient[], error: null, success: true }
}

export async function getProject(projectId: string): Promise<ActionResult<ProjectWithClient>> {
  const supabase = await createSupabaseClient()

  const { data, error } = await supabase
    .from('projects')
    .select('*, clients(id, name, slug, logo_url)')
    .eq('id', projectId)
    .single()

  if (error) return { data: null, error: (error as { message: string }).message, success: false }
  return { data: data as ProjectWithClient, error: null, success: true }
}

export async function createProjectAction(
  workspaceId: string,
  workspaceSlug: string,
  formData: FormData
): Promise<ActionResult<Project>> {
  const raw = {
    name: formData.get('name') as string,
    slug: formData.get('slug') as string,
    description: formData.get('description') as string || undefined,
    client_id: formData.get('client_id') as string || null,
    status: formData.get('status') as string || 'planning',
    start_date: formData.get('start_date') as string || null,
    end_date: formData.get('end_date') as string || null,
    budget: formData.get('budget') as string,
  }

  const parsed = createProjectSchema.safeParse(raw)
  if (!parsed.success) {
    return { data: null, error: parsed.error.issues[0].message, success: false }
  }

  const supabase = await createSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('projects')
    .insert({ ...parsed.data, workspace_id: workspaceId, created_by: user?.id })
    .select()
    .single()

  if (error) {
    const err = error as { code?: string; message: string }
    if (err.code === '23505') {
      return { data: null, error: 'Já existe um projeto com este slug', success: false }
    }
    return { data: null, error: err.message, success: false }
  }

  revalidatePath(`/${workspaceSlug}/projects`)
  return { data: data as Project, error: null, success: true }
}

export async function updateProjectAction(
  projectId: string,
  workspaceSlug: string,
  formData: FormData
): Promise<ActionResult<Project>> {
  const raw = Object.fromEntries(formData.entries())
  const parsed = updateProjectSchema.safeParse(raw)

  if (!parsed.success) {
    return { data: null, error: parsed.error.issues[0].message, success: false }
  }

  const supabase = await createSupabaseClient()

  const { data, error } = await supabase
    .from('projects')
    .update(parsed.data)
    .eq('id', projectId)
    .select()
    .single()

  if (error) return { data: null, error: (error as { message: string }).message, success: false }

  revalidatePath(`/${workspaceSlug}/projects`)
  return { data: data as Project, error: null, success: true }
}

export async function deleteProjectAction(
  projectId: string,
  workspaceSlug: string
): Promise<ActionResult> {
  const supabase = await createSupabaseClient()

  const { error } = await supabase.from('projects').delete().eq('id', projectId)
  if (error) return { data: null, error: (error as { message: string }).message, success: false }

  revalidatePath(`/${workspaceSlug}/projects`)
  return { data: null, error: null, success: true }
}
