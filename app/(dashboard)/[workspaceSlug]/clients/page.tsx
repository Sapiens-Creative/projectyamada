import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ClientList } from '@/components/clients/client-list'
import { buttonVariants } from '@/components/ui/button'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Client } from '@/types/app.types'

export default async function ClientsPage({
  params,
}: {
  params: Promise<{ workspaceSlug: string }>
}) {
  const { workspaceSlug } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: wsData } = await supabase
    .from('workspaces')
    .select('id')
    .eq('slug', workspaceSlug)
    .single()

  const workspace = wsData as { id: string } | null
  if (!workspace) redirect('/create-workspace')

  const { data: clientsRaw } = await supabase
    .from('clients')
    .select('*')
    .eq('workspace_id', workspace.id)
    .order('created_at', { ascending: false })

  const clients = (clientsRaw ?? []) as Client[]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Clientes</h1>
        <Link href={`/${workspaceSlug}/clients/new`} className={cn(buttonVariants())}>
          <Plus className="h-4 w-4 mr-2" />
          Novo cliente
        </Link>
      </div>
      <ClientList clients={clients} workspaceSlug={workspaceSlug} />
    </div>
  )
}
