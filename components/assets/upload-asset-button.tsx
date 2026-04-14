'use client'

import { useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { uploadAssetAction } from '@/lib/actions/asset.actions'
import type { Client } from '@/types/app.types'

interface UploadAssetButtonProps {
  workspaceId: string
  workspaceSlug: string
  clients: Client[]
}

export function UploadAssetButton({ workspaceId, workspaceSlug, clients }: UploadAssetButtonProps) {
  const [open, setOpen] = useState(false)
  const [clientId, setClientId] = useState<string>('none')
  const [file, setFile] = useState<File | null>(null)
  const [dragging, setDragging] = useState(false)
  const [isPending, startTransition] = useTransition()
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  function handleFile(f: File) {
    setFile(f)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!file) return
    const formData = new FormData()
    formData.set('file', file)
    formData.set('client_id', clientId)
    startTransition(async () => {
      const result = await uploadAssetAction(workspaceId, workspaceSlug, formData)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Arquivo enviado')
        setFile(null)
        setClientId('none')
        setOpen(false)
        router.refresh()
      }
    })
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger render={
        <Button>
          <Upload className="h-4 w-4 mr-2" />
          Enviar arquivo
        </Button>
      } />
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Enviar arquivo</SheetTitle>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {/* Drop zone */}
          <div
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              dragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'
            }`}
          >
            <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            {file ? (
              <div>
                <p className="font-medium text-sm truncate">{file.name}</p>
                <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(0)} KB</p>
              </div>
            ) : (
              <div>
                <p className="text-sm font-medium">Clique ou arraste um arquivo</p>
                <p className="text-xs text-muted-foreground mt-1">Qualquer tipo · máx. 50MB</p>
              </div>
            )}
            <input
              ref={inputRef}
              type="file"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />
          </div>

          <div className="space-y-2">
            <Label>Cliente (opcional)</Label>
            <Select value={clientId} onValueChange={(v) => setClientId(v ?? 'none')}>
              <SelectTrigger>
                <SelectValue placeholder="Sem cliente" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sem cliente</SelectItem>
                {clients.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" disabled={!file || isPending} className="w-full">
            {isPending ? 'Enviando...' : 'Enviar'}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  )
}
