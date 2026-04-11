'use client'

import { useActionState } from 'react'
import { forgotPassword } from '@/lib/actions/auth.actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import type { ActionResult } from '@/types/app.types'

const initialState: ActionResult = { data: null, error: null, success: false }

export function ForgotPasswordForm() {
  const [state, action, pending] = useActionState(forgotPassword, initialState)

  if (state.success) {
    return (
      <Alert>
        <AlertDescription>
          Link enviado! Verifique seu email para redefinir a senha.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <form action={action} className="space-y-4">
      {state.error && (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" placeholder="voce@agencia.com" required />
      </div>
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? 'Enviando...' : 'Enviar link'}
      </Button>
    </form>
  )
}
