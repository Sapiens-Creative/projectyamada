'use client'

import { useActionState } from 'react'
import { signIn } from '@/lib/actions/auth.actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import type { ActionResult } from '@/types/app.types'

const initialState: ActionResult = { data: null, error: null, success: false }

export function LoginForm({ workspaceSlug }: { workspaceSlug?: string }) {
  const [state, action, pending] = useActionState(signIn, initialState)

  return (
    <form action={action} className="space-y-4">
      {workspaceSlug && (
        <input type="hidden" name="workspace_slug" value={workspaceSlug} />
      )}
      {state.error && (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" placeholder="voce@agencia.com" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Senha</Label>
        <Input id="password" name="password" type="password" required />
      </div>
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? 'Entrando...' : 'Entrar'}
      </Button>
    </form>
  )
}
