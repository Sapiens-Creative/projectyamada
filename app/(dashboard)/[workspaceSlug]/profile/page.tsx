'use client'

import { useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Camera } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { updateProfileAction } from '@/lib/actions/profile.actions'
import { useWorkspace } from '@/providers/workspace-provider'
import { getInitials } from '@/lib/utils'

export default function ProfilePage() {
  const { profile } = useWorkspace()
  const [isPending, startTransition] = useTransition()
  const [preview, setPreview] = useState<string | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarFile(file)
    setPreview(URL.createObjectURL(file))
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    if (avatarFile) formData.set('avatar', avatarFile)

    startTransition(async () => {
      const result = await updateProfileAction(formData)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Perfil atualizado')
        setAvatarFile(null)
        setPreview(null)
        router.refresh()
      }
    })
  }

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Meu perfil</h1>
        <p className="text-muted-foreground text-sm">Edite seu nome e foto de perfil</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Avatar */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <Avatar className="h-20 w-20">
              <AvatarImage src={preview ?? profile.avatar_url ?? undefined} />
              <AvatarFallback className="text-lg">
                {getInitials(profile.full_name ?? profile.email)}
              </AvatarFallback>
            </Avatar>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="absolute -bottom-1 -right-1 rounded-full bg-primary p-1.5 text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
            >
              <Camera className="h-3 w-3" />
            </button>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>
          <div>
            <p className="font-medium text-sm">{profile.full_name ?? 'Sem nome'}</p>
            <p className="text-xs text-muted-foreground">{profile.email}</p>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="text-xs text-primary hover:underline mt-1"
            >
              Alterar foto
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="full_name">Nome completo</Label>
          <Input
            id="full_name"
            name="full_name"
            defaultValue={profile.full_name ?? ''}
            placeholder="Seu nome"
            required
            minLength={2}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">E-mail</Label>
          <Input
            id="email"
            name="email"
            value={profile.email}
            disabled
            className="bg-muted"
          />
          <p className="text-xs text-muted-foreground">O e-mail não pode ser alterado por aqui.</p>
        </div>

        <Button type="submit" disabled={isPending}>
          {isPending ? 'Salvando...' : 'Salvar alterações'}
        </Button>
      </form>
    </div>
  )
}
