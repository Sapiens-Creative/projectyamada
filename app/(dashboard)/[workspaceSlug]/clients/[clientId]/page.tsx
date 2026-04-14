import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { ClientDetailHeader } from '@/components/clients/client-detail-header'
import { Client360 } from '@/components/clients/client-360'
import { Badge } from '@/components/ui/badge'
import { CLIENT_STATUS_LABELS, CLIENT_TIER_LABELS } from '@/lib/constants'
import type { Client, ClientContact, ClientInteraction, ProjectWithClient, Task, Invoice } from '@/types/app.types'

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ workspaceSlug: string; clientId: string }>
}) {
  const { workspaceSlug, clientId } = await params
  const supabase = await createClient()

  const [
    { data: rawClient },
    { data: projectsRaw },
    { data: tasksRaw },
    { data: invoicesRaw },
    { data: interactionsRaw },
    { data: wsRaw },
  ] = await Promise.all([
    supabase.from('clients').select('*, client_contacts(*)').eq('id', clientId).single(),
    supabase.from('projects').select('*, clients(id, name, slug, logo_url)').eq('client_id', clientId).order('created_at', { ascending: false }),
    supabase.from('tasks').select('*').eq('client_id', clientId).order('created_at', { ascending: false }),
    supabase.from('invoices').select('*').eq('client_id', clientId).order('created_at', { ascending: false }),
    supabase.from('client_interactions').select('*').eq('client_id', clientId).order('occurred_at', { ascending: false }),
    supabase.from('workspaces').select('id').eq('slug', workspaceSlug).single(),
  ])

  const client = rawClient as (Client & { client_contacts: ClientContact[] }) | null
  if (!client) notFound()

  const workspaceId = (wsRaw as { id: string } | null)?.id ?? ''

  return (
    <div className="space-y-6">
      <ClientDetailHeader client={client} workspaceSlug={workspaceSlug} />

      <div className="flex gap-2 flex-wrap">
        <Badge variant="outline">{CLIENT_STATUS_LABELS[client.status]}</Badge>
        <Badge variant="secondary">{CLIENT_TIER_LABELS[client.tier]}</Badge>
        {client.industry && <Badge variant="outline">{client.industry}</Badge>}
        {client.tags?.map((tag) => (
          <Badge key={tag} className="bg-[#ff5600]/10 text-[#ff5600] border-[#ff5600]/20 hover:bg-[#ff5600]/15">
            {tag}
          </Badge>
        ))}
      </div>

      <Client360
        client={client}
        interactions={(interactionsRaw ?? []) as ClientInteraction[]}
        projects={(projectsRaw ?? []) as ProjectWithClient[]}
        tasks={(tasksRaw ?? []) as Task[]}
        invoices={(invoicesRaw ?? []) as Invoice[]}
        workspaceSlug={workspaceSlug}
        workspaceId={workspaceId}
      />
    </div>
  )
}
