'use server'

import { revalidatePath } from 'next/cache'
import { createClient as createSupabaseClient } from '@/lib/supabase/server'
import type { ActionResult, Invoice, InvoiceWithClient, InvoiceStatus } from '@/types/app.types'
import { createInvoiceSchema, updateInvoiceSchema } from '@/lib/validations/invoice.schema'

export async function getInvoices(workspaceId: string, projectId?: string): Promise<ActionResult<InvoiceWithClient[]>> {
  const supabase = await createSupabaseClient()

  let query = supabase
    .from('invoices')
    .select('*, clients(id, name, slug), projects(id, name, slug)')
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: false })

  if (projectId) {
    query = query.eq('project_id', projectId)
  }

  const { data, error } = await query

  if (error) return { data: null, error: (error as { message: string }).message, success: false }
  return { data: data as InvoiceWithClient[], error: null, success: true }
}

export async function createInvoiceAction(
  workspaceId: string,
  workspaceSlug: string,
  formData: FormData
): Promise<ActionResult<Invoice>> {
  const raw = {
    number: formData.get('number') as string,
    title: formData.get('title') as string,
    client_id: formData.get('client_id') as string,
    project_id: formData.get('project_id') as string || null,
    status: formData.get('status') as string || 'draft',
    amount: formData.get('amount') as string,
    due_date: formData.get('due_date') as string || null,
    paid_at: formData.get('paid_at') as string || null,
    notes: formData.get('notes') as string || null,
  }

  if (raw.project_id === 'none') raw.project_id = null

  const parsed = createInvoiceSchema.safeParse(raw)
  if (!parsed.success) {
    return { data: null, error: parsed.error.issues[0].message, success: false }
  }

  const supabase = await createSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('invoices')
    .insert({ ...parsed.data, workspace_id: workspaceId, created_by: user?.id })
    .select()
    .single()

  if (error) {
    const err = error as { code?: string; message: string }
    if (err.code === '23505') return { data: null, error: 'Número de fatura já existe', success: false }
    return { data: null, error: err.message, success: false }
  }

  revalidatePath(`/${workspaceSlug}/financial`)
  return { data: data as Invoice, error: null, success: true }
}

export async function updateInvoiceAction(
  invoiceId: string,
  workspaceSlug: string,
  formData: FormData
): Promise<ActionResult<Invoice>> {
  const raw = Object.fromEntries(formData.entries())
  if (raw.project_id === 'none') raw.project_id = ''

  const parsed = updateInvoiceSchema.safeParse(raw)
  if (!parsed.success) {
    return { data: null, error: parsed.error.issues[0].message, success: false }
  }

  const supabase = await createSupabaseClient()
  const { data, error } = await supabase
    .from('invoices')
    .update(parsed.data)
    .eq('id', invoiceId)
    .select()
    .single()

  if (error) return { data: null, error: (error as { message: string }).message, success: false }

  revalidatePath(`/${workspaceSlug}/financial`)
  return { data: data as Invoice, error: null, success: true }
}

export async function updateInvoiceStatusAction(
  invoiceId: string,
  status: InvoiceStatus,
  workspaceSlug: string
): Promise<ActionResult<Invoice>> {
  const supabase = await createSupabaseClient()

  const updates: Record<string, unknown> = { status }
  if (status === 'paid') updates.paid_at = new Date().toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('invoices')
    .update(updates)
    .eq('id', invoiceId)
    .select()
    .single()

  if (error) return { data: null, error: (error as { message: string }).message, success: false }

  revalidatePath(`/${workspaceSlug}/financial`)
  return { data: data as Invoice, error: null, success: true }
}

export async function deleteInvoiceAction(
  invoiceId: string,
  workspaceSlug: string
): Promise<ActionResult> {
  const supabase = await createSupabaseClient()

  const { error } = await supabase.from('invoices').delete().eq('id', invoiceId)
  if (error) return { data: null, error: (error as { message: string }).message, success: false }

  revalidatePath(`/${workspaceSlug}/financial`)
  return { data: null, error: null, success: true }
}
