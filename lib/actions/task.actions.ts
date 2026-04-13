'use server'

import { revalidatePath } from 'next/cache'
import { createClient as createSupabaseClient } from '@/lib/supabase/server'
import type { ActionResult, Task, TaskWithAssignee } from '@/types/app.types'
import { createTaskSchema, updateTaskSchema } from '@/lib/validations/task.schema'

export async function getTasks(workspaceId: string): Promise<ActionResult<TaskWithAssignee[]>> {
  const supabase = await createSupabaseClient()

  const { data, error } = await supabase
    .from('tasks')
    .select('*, assignee:profiles!tasks_assignee_id_fkey(id, full_name, avatar_url)')
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: false })

  if (error) return { data: null, error: (error as { message: string }).message, success: false }
  return { data: data as TaskWithAssignee[], error: null, success: true }
}

export async function createTaskAction(
  workspaceId: string,
  workspaceSlug: string,
  formData: FormData
): Promise<ActionResult<Task>> {
  const raw = {
    title: formData.get('title') as string,
    description: formData.get('description') as string || undefined,
    status: formData.get('status') as string || 'todo',
    priority: formData.get('priority') as string || 'medium',
    project_id: formData.get('project_id') as string || null,
    client_id: formData.get('client_id') as string || null,
    assignee_id: formData.get('assignee_id') as string || null,
    due_date: formData.get('due_date') as string || null,
  }

  // Convert 'none' selects to null
  if (raw.project_id === 'none') raw.project_id = null
  if (raw.client_id === 'none') raw.client_id = null
  if (raw.assignee_id === 'none') raw.assignee_id = null

  const parsed = createTaskSchema.safeParse(raw)
  if (!parsed.success) {
    return { data: null, error: parsed.error.issues[0].message, success: false }
  }

  const supabase = await createSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('tasks')
    .insert({ ...parsed.data, workspace_id: workspaceId, created_by: user?.id })
    .select()
    .single()

  if (error) return { data: null, error: (error as { message: string }).message, success: false }

  revalidatePath(`/${workspaceSlug}/tasks`)
  return { data: data as Task, error: null, success: true }
}

export async function updateTaskAction(
  taskId: string,
  workspaceSlug: string,
  formData: FormData
): Promise<ActionResult<Task>> {
  const raw = Object.fromEntries(formData.entries())

  // Convert 'none' selects to null
  if (raw.project_id === 'none') raw.project_id = ''
  if (raw.client_id === 'none') raw.client_id = ''
  if (raw.assignee_id === 'none') raw.assignee_id = ''

  const parsed = updateTaskSchema.safeParse(raw)
  if (!parsed.success) {
    return { data: null, error: parsed.error.issues[0].message, success: false }
  }

  const supabase = await createSupabaseClient()

  const { data, error } = await supabase
    .from('tasks')
    .update(parsed.data)
    .eq('id', taskId)
    .select()
    .single()

  if (error) return { data: null, error: (error as { message: string }).message, success: false }

  revalidatePath(`/${workspaceSlug}/tasks`)
  return { data: data as Task, error: null, success: true }
}

export async function updateTaskStatusAction(
  taskId: string,
  status: 'backlog' | 'todo' | 'in_progress' | 'in_review' | 'done',
  workspaceSlug: string
): Promise<ActionResult<Task>> {
  const supabase = await createSupabaseClient()

  const { data, error } = await supabase
    .from('tasks')
    .update({ status })
    .eq('id', taskId)
    .select()
    .single()

  if (error) return { data: null, error: (error as { message: string }).message, success: false }

  revalidatePath(`/${workspaceSlug}/tasks`)
  return { data: data as Task, error: null, success: true }
}

export async function deleteTaskAction(
  taskId: string,
  workspaceSlug: string
): Promise<ActionResult> {
  const supabase = await createSupabaseClient()

  const { error } = await supabase.from('tasks').delete().eq('id', taskId)
  if (error) return { data: null, error: (error as { message: string }).message, success: false }

  revalidatePath(`/${workspaceSlug}/tasks`)
  return { data: null, error: null, success: true }
}
