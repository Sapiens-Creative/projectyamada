import Link from 'next/link'
import { LoginForm } from '@/components/auth/login-form'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert } from '@/components/ui/alert'
import { APP_NAME } from '@/lib/constants'

interface PageProps {
  searchParams: Promise<{ error?: string; message?: string; workspace?: string }>
}

export default async function LoginPage({ searchParams }: PageProps) {
  const { error, message, workspace: workspaceSlug } = await searchParams

  // Humanize slug for display (e.g. "minha-agencia" → "Minha Agencia")
  const workspaceName = workspaceSlug
    ? workspaceSlug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
    : null

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">
          {workspaceName ?? APP_NAME}
        </CardTitle>
        <CardDescription>
          {workspaceName ? `Entre para acessar ${workspaceName}` : 'Entre na sua conta'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error === 'confirmation_failed' && (
          <Alert variant="destructive">
            Falha ao confirmar email. Tente solicitar um novo link de confirmação.
          </Alert>
        )}
        {message === 'check_email' && (
          <Alert>
            Verifique seu email — enviamos um link de confirmação.
          </Alert>
        )}
        {message === 'email_confirmed' && (
          <Alert>
            Email confirmado! Faça login para continuar.
          </Alert>
        )}
        <LoginForm workspaceSlug={workspaceSlug} />
      </CardContent>
      <CardFooter className="justify-center">
        <p className="text-sm text-muted-foreground">
          Não tem conta?{' '}
          <Link href="/register" className="text-foreground font-medium hover:underline">
            Criar conta
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
}
