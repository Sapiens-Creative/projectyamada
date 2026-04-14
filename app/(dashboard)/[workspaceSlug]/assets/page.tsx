import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getAssets } from '@/lib/actions/asset.actions'
import { getClients } from '@/lib/actions/client.actions'
import { AssetGrid } from '@/components/assets/asset-grid'
import { UploadAssetButton } from '@/components/assets/upload-asset-button'
import type { Workspace, AssetWithClient, Client } from '@/types/app.types'

interface PageProps {
  params: Promise<{ workspaceSlug: string }>
}

export default async function AssetsPage({ params }: PageProps) {
  const { workspaceSlug } = await params
  const supabase = await createClient()

  const { data: workspaceRaw } = await supabase
    .from('workspaces')
    .select('*')
    .eq('slug', workspaceSlug)
    .single()

  if (!workspaceRaw) notFound()
  const workspace = workspaceRaw as Workspace

  const [assetsResult, clientsResult] = await Promise.all([
    getAssets(workspace.id),
    getClients(workspace.id),
  ])

  const assets = (assetsResult.data ?? []) as AssetWithClient[]
  const clients = (clientsResult.data ?? []) as Client[]

  const totalSize = assets.reduce((sum, a) => sum + a.size, 0)
  const formatTotalSize = totalSize < 1024 * 1024
    ? `${(totalSize / 1024).toFixed(0)} KB`
    : `${(totalSize / (1024 * 1024)).toFixed(1)} MB`

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Assets</h1>
          <p className="text-muted-foreground text-sm">
            {assets.length} arquivo{assets.length !== 1 ? 's' : ''} · {formatTotalSize} total
          </p>
        </div>
        <UploadAssetButton
          workspaceId={workspace.id}
          workspaceSlug={workspaceSlug}
          clients={clients}
        />
      </div>

      <AssetGrid
        assets={assets}
        clients={clients}
        workspaceSlug={workspaceSlug}
      />
    </div>
  )
}
