import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getInviteByToken, acceptInviteAction } from '@/lib/actions/invite.actions'

interface PageProps {
  params: Promise<{ token: string }>
}

export default async function InvitePage({ params }: PageProps) {
  const { token } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const inviteResult = await getInviteByToken(token)

  if (!inviteResult.data) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center space-y-3 max-w-sm">
          <h1 className="text-xl font-bold">Convite inválido</h1>
          <p className="text-muted-foreground text-sm">{inviteResult.error}</p>
          <Link href="/" className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            Ir para o início
          </Link>
        </div>
      </div>
    )
  }

  const invite = inviteResult.data

  if (!user) {
    redirect(`/register?invite=${token}&email=${encodeURIComponent(invite.email)}`)
  }

  const result = await acceptInviteAction(token)
  if (result.success && result.data) {
    redirect(`/${result.data.slug}`)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center space-y-3 max-w-sm">
        <h1 className="text-xl font-bold">Erro ao aceitar convite</h1>
        <p className="text-muted-foreground text-sm">{result.error}</p>
        <Link href="/" className="inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted">
          Ir para o início
        </Link>
      </div>
    </div>
  )
}
