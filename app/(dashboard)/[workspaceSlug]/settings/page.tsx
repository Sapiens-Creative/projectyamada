import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Workspace } from '@/types/app.types'
import { WorkspaceSettingsForm } from '@/components/settings/workspace-settings-form'
import { Separator } from '@/components/ui/separator'

interface PageProps {
  params: Promise<{ workspaceSlug: string }>
}

export default async function SettingsPage({ params }: PageProps) {
  const { workspaceSlug } = await params
  const supabase = await createClient()

  const { data: workspaceRaw } = await supabase
    .from('workspaces')
    .select('*')
    .eq('slug', workspaceSlug)
    .single()

  if (!workspaceRaw) notFound()
  const workspace = workspaceRaw as Workspace

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Configurações</h1>
        <p className="text-muted-foreground text-sm">Gerencie as configurações do workspace</p>
      </div>

      <Separator />

      <div className="space-y-2">
        <h2 className="font-semibold">Workspace</h2>
        <WorkspaceSettingsForm workspace={workspace} workspaceSlug={workspaceSlug} />
      </div>
    </div>
  )
}
