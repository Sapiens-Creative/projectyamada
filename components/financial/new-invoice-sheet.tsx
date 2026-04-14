'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { InvoiceForm } from './invoice-form'
import { createInvoiceAction } from '@/lib/actions/invoice.actions'
import type { Client, Project } from '@/types/app.types'

interface NewInvoiceSheetProps {
  workspaceId: string
  workspaceSlug: string
  clients: Client[]
  projects: Project[]
  nextNumber?: string
}

export function NewInvoiceSheet({ workspaceId, workspaceSlug, clients, projects, nextNumber }: NewInvoiceSheetProps) {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger render={
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nova fatura
        </Button>
      } />
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Nova fatura</SheetTitle>
        </SheetHeader>
        <div className="mt-6">
          <InvoiceForm
            workspaceId={workspaceId}
            workspaceSlug={workspaceSlug}
            clients={clients}
            projects={projects}
            nextNumber={nextNumber}
            action={createInvoiceAction}
            onSuccess={() => setOpen(false)}
          />
        </div>
      </SheetContent>
    </Sheet>
  )
}
