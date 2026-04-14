import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function RootPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data } = await supabase
    .from('workspace_members')
    .select('workspaces(slug)')
    .eq('user_id', user.id)
    .order('joined_at', { ascending: true })

  const memberships = (data ?? []) as unknown as { workspaces: { slug: string } }[]

  if (memberships.length === 0) redirect('/create-workspace')
  if (memberships.length === 1) redirect(`/${memberships[0].workspaces.slug}`)

  redirect('/workspaces')
}
