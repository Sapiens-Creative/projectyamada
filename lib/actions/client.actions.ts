'use server'

import { revalidatePath } from 'next/cache'
import { createClient as createSupabaseClient } from '@/lib/supabase/server'
import type { ActionResult, Client, ClientContact } from '@/types/app.types'
import { createClientSchema, updateClientSchema, createContactSchema } from '@/lib/validations/client.schema'

export async function getClients(workspaceId: string): Promise<ActionResult<Client[]>> {
  const supabase = await createSupabaseClient()

  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: false })

  if (error) return { data: null, error: (error as { message: string }).message, success: false }
  return { data: data as Client[], error: null, success: true }
}

export async function getClient(clientId: string): Promise<ActionResult<Client & { client_contacts: ClientContact[] }>> {
  const supabase = await createSupabaseClient()

  const { data, error } = await supabase
    .from('clients')
    .select('*, client_contacts(*)')
    .eq('id', clientId)
    .single()

  if (error) return { data: null, error: (error as { message: string }).message, success: false }
  return { data: data as Client & { client_contacts: ClientContact[] }, error: null, success: true }
}

function parseTagsFromForm(formData: FormData): string[] {
  const raw = formData.get('tags') as string | null
  if (!raw) return []
  return raw.split(',').map((t) => t.trim()).filter(Boolean)
}

export async function createClientAction(
  workspaceId: string,
  formData: FormData
): Promise<ActionResult<Client>> {
  const raw = {
    name: formData.get('name') as string,
    slug: formData.get('slug') as string,
    website: formData.get('website') as string,
    industry: formData.get('industry') as string,
    status: formData.get('status') as string,
    tier: formData.get('tier') as string,
    notes: formData.get('notes') as string,
    cnpj: formData.get('cnpj') as string,
    razao_social: formData.get('razao_social') as string,
    revenue_range: formData.get('revenue_range') as string || undefined,
    address_city: formData.get('address_city') as string,
    address_state: formData.get('address_state') as string,
    contract_start: formData.get('contract_start') as string,
    contract_renewal: formData.get('contract_renewal') as string,
    monthly_fee: formData.get('monthly_fee') as string,
  }

  const parsed = createClientSchema.safeParse(raw)
  if (!parsed.success) {
    return { data: null, error: parsed.error.issues[0].message, success: false }
  }

  const tags = parseTagsFromForm(formData)
  const supabase = await createSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('clients')
    .insert({ ...parsed.data, tags, workspace_id: workspaceId, created_by: user?.id })
    .select()
    .single()

  if (error) {
    const err = error as { code?: string; message: string }
    if (err.code === '23505') {
      return { data: null, error: 'Já existe um cliente com este slug', success: false }
    }
    return { data: null, error: err.message, success: false }
  }

  revalidatePath(`/[workspaceSlug]/clients`, 'page')
  return { data: data as Client, error: null, success: true }
}

export async function updateClientAction(
  clientId: string,
  workspaceSlug: string,
  formData: FormData
): Promise<ActionResult<Client>> {
  const raw = Object.fromEntries(formData.entries())
  const parsed = updateClientSchema.safeParse(raw)

  if (!parsed.success) {
    return { data: null, error: parsed.error.issues[0].message, success: false }
  }

  const tags = parseTagsFromForm(formData)
  const supabase = await createSupabaseClient()

  const { data, error } = await supabase
    .from('clients')
    .update({ ...parsed.data, tags })
    .eq('id', clientId)
    .select()
    .single()

  if (error) return { data: null, error: (error as { message: string }).message, success: false }

  revalidatePath(`/${workspaceSlug}/clients`)
  revalidatePath(`/${workspaceSlug}/clients/${clientId}`)
  return { data: data as Client, error: null, success: true }
}

export async function deleteClientAction(
  clientId: string,
  workspaceSlug: string
): Promise<ActionResult> {
  const supabase = await createSupabaseClient()

  const { error } = await supabase.from('clients').delete().eq('id', clientId)
  if (error) return { data: null, error: (error as { message: string }).message, success: false }

  revalidatePath(`/${workspaceSlug}/clients`)
  return { data: null, error: null, success: true }
}

export async function createContactAction(
  clientId: string,
  formData: FormData
): Promise<ActionResult<ClientContact>> {
  const raw = {
    full_name: formData.get('full_name') as string,
    email: formData.get('email') as string,
    phone: formData.get('phone') as string,
    role: formData.get('role') as string,
    is_primary: formData.get('is_primary') === 'true',
  }

  const parsed = createContactSchema.safeParse(raw)
  if (!parsed.success) {
    return { data: null, error: parsed.error.issues[0].message, success: false }
  }

  const supabase = await createSupabaseClient()

  const { data, error } = await supabase
    .from('client_contacts')
    .insert({ ...parsed.data, client_id: clientId })
    .select()
    .single()

  if (error) return { data: null, error: (error as { message: string }).message, success: false }

  revalidatePath(`/[workspaceSlug]/clients/${clientId}`)
  return { data: data as ClientContact, error: null, success: true }
}
