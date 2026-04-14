'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Trash2, Download, FileText, FileImage, FileVideo, FileArchive, File } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { EmptyState } from '@/components/shared/empty-state'
import { deleteAssetAction } from '@/lib/actions/asset.actions'
import type { AssetWithClient, Client } from '@/types/app.types'

function FileIcon({ type }: { type: string }) {
  if (type.startsWith('image/')) return <FileImage className="h-8 w-8 text-blue-500" />
  if (type.startsWith('video/')) return <FileVideo className="h-8 w-8 text-purple-500" />
  if (type.includes('pdf') || type.includes('document') || type.includes('text')) return <FileText className="h-8 w-8 text-red-500" />
  if (type.includes('zip') || type.includes('rar') || type.includes('tar')) return <FileArchive className="h-8 w-8 text-yellow-500" />
  return <File className="h-8 w-8 text-gray-500" />
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

interface AssetGridProps {
  assets: AssetWithClient[]
  clients: Client[]
  workspaceSlug: string
}

export function AssetGrid({ assets, clients, workspaceSlug }: AssetGridProps) {
  const router = useRouter()
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [clientFilter, setClientFilter] = useState<string>('all')

  const filtered = clientFilter === 'all'
    ? assets
    : clientFilter === 'none'
      ? assets.filter((a) => !a.client_id)
      : assets.filter((a) => a.client_id === clientFilter)

  async function handleDelete(asset: AssetWithClient) {
    setDeletingId(asset.id)
    const result = await deleteAssetAction(asset.id, asset.storage_path, workspaceSlug)
    setDeletingId(null)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Arquivo excluído')
      router.refresh()
    }
  }

  return (
    <div className="space-y-4">
      {/* Filter */}
      <div className="flex items-center gap-3">
        <Select value={clientFilter} onValueChange={(v) => setClientFilter(v ?? 'all')}>
          <SelectTrigger className="w-52">
            <SelectValue placeholder="Todos os clientes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os clientes</SelectItem>
            <SelectItem value="none">Sem cliente</SelectItem>
            {clients.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground">{filtered.length} arquivo{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="Nenhum arquivo ainda"
          description="Envie logos, guias de marca, criativos e outros arquivos do workspace."
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filtered.map((asset) => (
            <div key={asset.id} className="group border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
              {/* Preview */}
              <div className="aspect-square bg-muted flex items-center justify-center relative overflow-hidden">
                {asset.file_type.startsWith('image/') ? (
                  <Image
                    src={asset.file_url}
                    alt={asset.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                  />
                ) : (
                  <FileIcon type={asset.file_type} />
                )}
                {/* Hover actions */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button
                    size="icon"
                    variant="secondary"
                    className="h-8 w-8"
                    onClick={() => window.open(asset.file_url, '_blank')}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="destructive"
                    className="h-8 w-8"
                    disabled={deletingId === asset.id}
                    onClick={() => handleDelete(asset)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              {/* Info */}
              <div className="p-2 space-y-1">
                <p className="text-xs font-medium truncate" title={asset.name}>{asset.name}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{formatSize(asset.size)}</span>
                  {asset.clients && (
                    <Badge variant="secondary" className="text-xs py-0 px-1.5 truncate max-w-[80px]">
                      {asset.clients.name}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
