import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ClientDetailHeader } from '@/components/clients/client-detail-header'
import { ContactList } from '@/components/clients/contact-list'
import { Badge } from '@/components/ui/badge'
import { CLIENT_STATUS_LABELS, CLIENT_TIER_LABELS } from '@/lib/constants'
import type { Client, ClientContact } from '@/types/app.types'

type ClientWithContacts = Client & { client_contacts: ClientContact[] }

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ workspaceSlug: string; clientId: string }>
}) {
  const { workspaceSlug, clientId } = await params
  const supabase = await createClient()

  const { data: rawClient } = await supabase
    .from('clients')
    .select('*, client_contacts(*)')
    .eq('id', clientId)
    .single()

  const client = rawClient as ClientWithContacts | null

  if (!client) notFound()

  return (
    <div className="space-y-6">
      <ClientDetailHeader client={client} workspaceSlug={workspaceSlug} />

      <div className="flex gap-2 flex-wrap">
        <Badge variant="outline">{CLIENT_STATUS_LABELS[client.status]}</Badge>
        <Badge variant="secondary">{CLIENT_TIER_LABELS[client.tier]}</Badge>
        {client.industry && <Badge variant="outline">{client.industry}</Badge>}
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Visão geral</TabsTrigger>
          <TabsTrigger value="contacts">Contatos ({client.client_contacts?.length ?? 0})</TabsTrigger>
          <TabsTrigger value="projects" disabled>Projetos</TabsTrigger>
          <TabsTrigger value="files" disabled>Arquivos</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 pt-4">
          {client.website && (
            <div>
              <p className="text-sm text-muted-foreground">Website</p>
              <a href={client.website} target="_blank" rel="noopener noreferrer" className="text-sm hover:underline">
                {client.website}
              </a>
            </div>
          )}
          {client.notes && (
            <div>
              <p className="text-sm text-muted-foreground mb-1">Notas</p>
              <p className="text-sm whitespace-pre-wrap">{client.notes}</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="contacts" className="pt-4">
          <ContactList contacts={client.client_contacts ?? []} clientId={clientId} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
