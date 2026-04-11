'use client'

import Link from 'next/link'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { buttonVariants } from '@/components/ui/button'
import { ChevronLeft, ExternalLink } from 'lucide-react'
import { cn, getInitials } from '@/lib/utils'
import type { Client, ClientContact } from '@/types/app.types'

interface ClientDetailHeaderProps {
  client: Client & { client_contacts: ClientContact[] }
  workspaceSlug: string
}

export function ClientDetailHeader({ client, workspaceSlug }: ClientDetailHeaderProps) {
  return (
    <div className="space-y-4">
      <Link href={`/${workspaceSlug}/clients`} className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), '-ml-2')}>
        <ChevronLeft className="h-4 w-4 mr-1" />
        Clientes
      </Link>

      <div className="flex items-start gap-4">
        <Avatar className="h-14 w-14">
          <AvatarFallback className="text-lg">{getInitials(client.name)}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-semibold">{client.name}</h1>
            {client.website && (
              <a
                href={client.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            )}
          </div>
          {client.industry && (
            <p className="text-sm text-muted-foreground">{client.industry}</p>
          )}
        </div>
      </div>
    </div>
  )
}
