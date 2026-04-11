import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function RootPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data } = await supabase
    .from('workspace_members')
    .select('workspace_id, workspaces(slug)')
    .eq('user_id', user.id)
    .limit(1)
    .single()

  const slug = (data as { workspaces: { slug: string } | null } | null)?.workspaces?.slug
  if (slug) redirect(`/${slug}`)

  redirect('/create-workspace')
}
