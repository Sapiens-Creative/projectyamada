import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ClientForm } from '@/components/clients/client-form'
import { createClientAction } from '@/lib/actions/client.actions'

export default async function NewClientPage({
  params,
}: {
  params: Promise<{ workspaceSlug: string }>
}) {
  const { workspaceSlug } = await params
  const supabase = await createClient()

  const { data: wsData } = await supabase
    .from('workspaces')
    .select('id')
    .eq('slug', workspaceSlug)
    .single()

  const workspaceId = (wsData as { id: string } | null)?.id
  if (!workspaceId) redirect('/create-workspace')

  async function action(formData: FormData) {
    'use server'
    const result = await createClientAction(workspaceId as string, formData)
    if (result.success && result.data) {
      redirect(`/${workspaceSlug}/clients/${result.data.id}`)
    }
    return result
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-semibold">Novo cliente</h1>
      <ClientForm action={action} workspaceSlug={workspaceSlug} />
    </div>
  )
}
