'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { ProposalForm } from './proposal-form'
import { createProposalAction } from '@/lib/actions/proposal.actions'
import type { Lead, Client } from '@/types/app.types'

interface NewProposalSheetProps {
  workspaceId: string
  workspaceSlug: string
  leads: Lead[]
  clients: Client[]
}

export function NewProposalSheet({ workspaceId, workspaceSlug, leads, clients }: NewProposalSheetProps) {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger render={<Button><Plus className="h-4 w-4" />Nova proposta</Button>} />
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader><SheetTitle>Nova proposta</SheetTitle></SheetHeader>
        <div className="mt-6">
          <ProposalForm
            workspaceId={workspaceId}
            workspaceSlug={workspaceSlug}
            leads={leads}
            clients={clients}
            action={createProposalAction}
            onSuccess={() => setOpen(false)}
          />
        </div>
      </SheetContent>
    </Sheet>
  )
}
