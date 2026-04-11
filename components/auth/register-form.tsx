'use client'

import { useActionState } from 'react'
import { signUp } from '@/lib/actions/auth.actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import type { ActionResult } from '@/types/app.types'

const initialState: ActionResult = { data: null, error: null, success: false }

export function RegisterForm() {
  const [state, action, pending] = useActionState(signUp, initialState)

  return (
    <form action={action} className="space-y-4">
      {state.error && (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}
      <div className="space-y-2">
        <Label htmlFor="full_name">Nome completo</Label>
        <Input id="full_name" name="full_name" placeholder="João Silva" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" placeholder="voce@agencia.com" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Senha</Label>
        <Input id="password" name="password" type="password" required minLength={6} />
      </div>
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? 'Criando conta...' : 'Criar conta'}
      </Button>
    </form>
  )
}
