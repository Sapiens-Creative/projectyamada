'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { ActionResult } from '@/types/app.types'
import { signInSchema, signUpSchema, forgotPasswordSchema } from '@/lib/validations/auth.schema'

export async function signIn(_prevState: ActionResult, formData: FormData): Promise<ActionResult> {
  const raw = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const parsed = signInSchema.safeParse(raw)
  if (!parsed.success) {
    return { data: null, error: parsed.error.issues[0].message, success: false }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword(parsed.data)

  if (error) {
    return { data: null, error: 'Email ou senha inválidos', success: false }
  }

  // If a workspace slug was passed (e.g. from /login?workspace=slug), go there
  const workspaceSlug = formData.get('workspace_slug') as string | null
  if (workspaceSlug) {
    redirect(`/${workspaceSlug}`)
  }

  redirect('/')
}

export async function signUp(_prevState: ActionResult, formData: FormData): Promise<ActionResult> {
  const raw = {
    full_name: formData.get('full_name') as string,
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const parsed = signUpSchema.safeParse(raw)
  if (!parsed.success) {
    return { data: null, error: parsed.error.issues[0].message, success: false }
  }

  const supabase = await createClient()
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://okei-agency.vercel.app'

  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { full_name: parsed.data.full_name },
      emailRedirectTo: `${appUrl}/auth/callback`,
    },
  })

  if (error) {
    return { data: null, error: error.message, success: false }
  }

  redirect('/login?message=check_email')
}

export async function signOut(): Promise<void> {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export async function forgotPassword(_prevState: ActionResult, formData: FormData): Promise<ActionResult> {
  const raw = { email: formData.get('email') as string }
  const parsed = forgotPasswordSchema.safeParse(raw)

  if (!parsed.success) {
    return { data: null, error: parsed.error.issues[0].message, success: false }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`,
  })

  if (error) {
    return { data: null, error: error.message, success: false }
  }

  return { data: null, error: null, success: true }
}
