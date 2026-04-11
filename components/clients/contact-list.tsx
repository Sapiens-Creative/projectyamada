'use client'

import { useState } from 'react'
import { useFormStatus } from 'react-dom'
import { createContactAction } from '@/lib/actions/client.actions'
import type { ClientContact } from '@/types/app.types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { getInitials } from '@/lib/utils'
import { Plus, Mail, Phone } from 'lucide-react'

function AddContactButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'Adicionando...' : 'Adicionar'}
    </Button>
  )
}

interface ContactListProps {
  contacts: ClientContact[]
  clientId: string
}

export function ContactList({ contacts, clientId }: ContactListProps) {
  const [open, setOpen] = useState(false)

  async function action(formData: FormData) {
    await createContactAction(clientId, formData)
    setOpen(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger className="inline-flex items-center justify-center rounded-lg border border-transparent bg-primary text-primary-foreground text-sm font-medium px-2.5 h-8 gap-1.5 transition-all">
            <Plus className="h-4 w-4 mr-1" />
            Novo contato
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Adicionar contato</SheetTitle>
            </SheetHeader>
            <form action={action} className="space-y-4 mt-6">
              <div className="space-y-2">
                <Label htmlFor="full_name">Nome *</Label>
                <Input id="full_name" name="full_name" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input id="phone" name="phone" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Cargo</Label>
                <Input id="role" name="role" placeholder="ex: CEO, Marketing" />
              </div>
              <AddContactButton />
            </form>
          </SheetContent>
        </Sheet>
      </div>

      {contacts.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">Nenhum contato cadastrado</p>
      ) : (
        <div className="space-y-2">
          {contacts.map((contact) => (
            <div key={contact.id} className="flex items-start gap-3 rounded-lg border p-3">
              <Avatar className="h-9 w-9 flex-shrink-0">
                <AvatarFallback className="text-xs">{getInitials(contact.full_name)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm">{contact.full_name}</p>
                  {contact.is_primary && <Badge variant="secondary" className="text-xs">Principal</Badge>}
                </div>
                {contact.role && <p className="text-xs text-muted-foreground">{contact.role}</p>}
                <div className="flex gap-3 mt-1">
                  {contact.email && (
                    <a href={`mailto:${contact.email}`} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
                      <Mail className="h-3 w-3" />
                      {contact.email}
                    </a>
                  )}
                  {contact.phone && (
                    <a href={`tel:${contact.phone}`} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
                      <Phone className="h-3 w-3" />
                      {contact.phone}
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
