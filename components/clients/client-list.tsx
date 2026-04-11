'use client'

import Link from 'next/link'
import { useState } from 'react'
import type { Client } from '@/types/app.types'
import { CLIENT_STATUS_LABELS, CLIENT_TIER_LABELS } from '@/lib/constants'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { getInitials } from '@/lib/utils'
import { Search } from 'lucide-react'

interface ClientListProps {
  clients: Client[]
  workspaceSlug: string
}

export function ClientList({ clients, workspaceSlug }: ClientListProps) {
  const [search, setSearch] = useState('')

  const filtered = clients.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.industry ?? '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar clientes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          {search ? 'Nenhum cliente encontrado' : 'Nenhum cliente ainda. Crie o primeiro!'}
        </div>
      ) : (
        <div className="rounded-md border divide-y">
          {filtered.map((client) => (
            <Link
              key={client.id}
              href={`/${workspaceSlug}/clients/${client.id}`}
              className="flex items-center gap-4 px-4 py-3 hover:bg-muted/50 transition-colors"
            >
              <Avatar className="h-9 w-9 flex-shrink-0">
                <AvatarFallback className="text-sm">{getInitials(client.name)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{client.name}</p>
                {client.industry && (
                  <p className="text-xs text-muted-foreground truncate">{client.industry}</p>
                )}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Badge variant="outline" className="text-xs hidden sm:inline-flex">
                  {CLIENT_TIER_LABELS[client.tier]}
                </Badge>
                <Badge
                  variant={client.status === 'active' ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  {CLIENT_STATUS_LABELS[client.status]}
                </Badge>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
