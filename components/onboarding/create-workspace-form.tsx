'use client'

import { useState } from 'react'
import { useFormStatus } from 'react-dom'
import { createWorkspace } from '@/lib/actions/workspace.actions'
import { slugify } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { APP_NAME } from '@/lib/constants'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? 'Criando...' : 'Criar workspace'}
    </Button>
  )
}

export function CreateWorkspaceForm() {
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [slugEdited, setSlugEdited] = useState(false)

  function handleNameChange(value: string) {
    setName(value)
    if (!slugEdited) {
      setSlug(slugify(value))
    }
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Bem-vindo ao {APP_NAME}</CardTitle>
        <CardDescription>Crie seu workspace para começar</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={createWorkspace} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do workspace</Label>
            <Input
              id="name"
              name="name"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Minha Agência"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="slug">URL do workspace</Label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground whitespace-nowrap">okei.app/</span>
              <Input
                id="slug"
                name="slug"
                value={slug}
                onChange={(e) => {
                  setSlug(e.target.value)
                  setSlugEdited(true)
                }}
                placeholder="minha-agencia"
                required
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Apenas letras minúsculas, números e hífens
            </p>
          </div>
          <SubmitButton />
        </form>
      </CardContent>
    </Card>
  )
}
