'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { LeadForm } from './lead-form'
import { createLeadAction } from '@/lib/actions/lead.actions'
import type { WorkspaceMemberWithProfile } from '@/types/app.types'

interface NewLeadSheetProps {
  workspaceId: string
  workspaceSlug: string
  members: WorkspaceMemberWithProfile[]
}

export function NewLeadSheet({ workspaceId, workspaceSlug, members }: NewLeadSheetProps) {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger render={<Button><Plus className="h-4 w-4" />Novo lead</Button>} />
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader><SheetTitle>Novo lead</SheetTitle></SheetHeader>
        <div className="mt-6">
          <LeadForm
            workspaceId={workspaceId}
            workspaceSlug={workspaceSlug}
            members={members}
            action={createLeadAction}
            onSuccess={() => setOpen(false)}
          />
        </div>
      </SheetContent>
    </Sheet>
  )
}
