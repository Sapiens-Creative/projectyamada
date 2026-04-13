import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/create-workspace'

  if (code) {
    const cookieStore = await cookies()

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Check if user already has a workspace
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        const { data: membership } = await supabase
          .from('workspace_members')
          .select('workspaces(slug)')
          .eq('user_id', user.id)
          .limit(1)
          .single()

        if (membership) {
          const ws = (membership as unknown as { workspaces: { slug: string } | null }).workspaces
          if (ws?.slug) {
            return NextResponse.redirect(`${origin}/${ws.slug}`)
          }
        }
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Auth code missing or exchange failed — redirect to login with error
  return NextResponse.redirect(`${origin}/login?error=confirmation_failed`)
}
