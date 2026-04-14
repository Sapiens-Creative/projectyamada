'use client'

import { useState } from 'react'
import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { X } from 'lucide-react'
import { slugify } from '@/lib/utils'
import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { Client, ActionResult } from '@/types/app.types'
import Link from 'next/link'

interface ClientFormProps {
  action: (formData: FormData) => Promise<ActionResult<Client>>
  workspaceSlug: string
  defaultValues?: Partial<Client>
  onSuccess?: () => void
  isSheet?: boolean
}

export function ClientForm({ action, workspaceSlug, defaultValues, onSuccess, isSheet }: ClientFormProps) {
  const [name, setName] = useState(defaultValues?.name ?? '')
  const [slug, setSlug] = useState(defaultValues?.slug ?? '')
  const [slugEdited, setSlugEdited] = useState(!!defaultValues?.slug)
  const [tags, setTags] = useState<string[]>(defaultValues?.tags ?? [])
  const [tagInput, setTagInput] = useState('')
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function addTag(value: string) {
    const trimmed = value.trim()
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed])
    }
    setTagInput('')
  }

  function removeTag(tag: string) {
    setTags(tags.filter((t) => t !== tag))
  }

  function handleTagKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addTag(tagInput)
    }
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    // Override tags with the managed state
    formData.set('tags', tags.join(','))
    startTransition(async () => {
      const result = await action(formData)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(defaultValues?.id ? 'Cliente atualizado' : 'Cliente criado')
        onSuccess?.()
        router.refresh()
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Nome + Slug */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="name">Nome *</Label>
          <Input
            id="name"
            name="name"
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              if (!slugEdited) setSlug(slugify(e.target.value))
            }}
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="slug">Slug *</Label>
          <Input
            id="slug"
            name="slug"
            value={slug}
            onChange={(e) => { setSlug(e.target.value); setSlugEdited(true) }}
            required
          />
        </div>
      </div>

      {/* Razão Social + CNPJ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="razao_social">Razão Social</Label>
          <Input id="razao_social" name="razao_social" defaultValue={defaultValues?.razao_social ?? ''} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="cnpj">CNPJ</Label>
          <Input id="cnpj" name="cnpj" placeholder="00.000.000/0000-00" defaultValue={defaultValues?.cnpj ?? ''} />
        </div>
      </div>

      {/* Status + Tier */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="status">Status</Label>
          <Select name="status" defaultValue={defaultValues?.status ?? 'lead'}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="lead">Lead</SelectItem>
              <SelectItem value="active">Ativo</SelectItem>
              <SelectItem value="paused">Pausado</SelectItem>
              <SelectItem value="churned">Encerrado</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="tier">Tier</Label>
          <Select name="tier" defaultValue={defaultValues?.tier ?? 'standard'}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="basic">Básico</SelectItem>
              <SelectItem value="standard">Padrão</SelectItem>
              <SelectItem value="premium">Premium</SelectItem>
              <SelectItem value="enterprise">Enterprise</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Website + Setor */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="website">Website</Label>
          <Input id="website" name="website" type="url" placeholder="https://..." defaultValue={defaultValues?.website ?? ''} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="industry">Setor</Label>
          <Input id="industry" name="industry" placeholder="ex: E-commerce" defaultValue={defaultValues?.industry ?? ''} />
        </div>
      </div>

      {/* Faturamento estimado */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="revenue_range">Faturamento anual</Label>
          <Select name="revenue_range" defaultValue={defaultValues?.revenue_range ?? ''}>
            <SelectTrigger><SelectValue placeholder="Selecionar..." /></SelectTrigger>
            <SelectContent>
              <SelectItem value="<100k">Até R$ 100k</SelectItem>
              <SelectItem value="100k-500k">R$ 100k – R$ 500k</SelectItem>
              <SelectItem value="500k-2m">R$ 500k – R$ 2M</SelectItem>
              <SelectItem value=">2m">Acima de R$ 2M</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="monthly_fee">Mensalidade (R$)</Label>
          <Input id="monthly_fee" name="monthly_fee" type="number" step="0.01" placeholder="0,00" defaultValue={defaultValues?.monthly_fee ?? ''} />
        </div>
      </div>

      {/* Cidade + Estado */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="space-y-1.5 col-span-1 sm:col-span-2">
          <Label htmlFor="address_city">Cidade</Label>
          <Input id="address_city" name="address_city" defaultValue={defaultValues?.address_city ?? ''} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="address_state">Estado</Label>
          <Input id="address_state" name="address_state" maxLength={2} placeholder="SP" defaultValue={defaultValues?.address_state ?? ''} />
        </div>
      </div>

      {/* Contrato: início + renovação */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="contract_start">Início do contrato</Label>
          <Input id="contract_start" name="contract_start" type="date" defaultValue={defaultValues?.contract_start ?? ''} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="contract_renewal">Renovação</Label>
          <Input id="contract_renewal" name="contract_renewal" type="date" defaultValue={defaultValues?.contract_renewal ?? ''} />
        </div>
      </div>

      {/* Tags */}
      <div className="space-y-1.5">
        <Label>Tags</Label>
        <div className="flex flex-wrap gap-1.5 min-h-[36px] rounded-md border border-white/10 bg-white/[0.04] px-3 py-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 text-xs bg-[#ff5600]/15 text-[#ff5600] rounded-full px-2.5 py-0.5"
            >
              {tag}
              <button type="button" onClick={() => removeTag(tag)} className="hover:text-white ml-0.5">
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagKeyDown}
            onBlur={() => { if (tagInput) addTag(tagInput) }}
            placeholder={tags.length === 0 ? 'Adicionar tag (Enter ou vírgula)' : ''}
            className="flex-1 min-w-[120px] bg-transparent text-sm outline-none text-white/80 placeholder:text-white/30"
          />
        </div>
        <input type="hidden" name="tags" value={tags.join(',')} />
      </div>

      {/* Notas */}
      <div className="space-y-1.5">
        <Label htmlFor="notes">Notas</Label>
        <Textarea id="notes" name="notes" rows={3} defaultValue={defaultValues?.notes ?? ''} />
      </div>

      <div className="flex gap-2 justify-end pt-2">
        {isSheet ? (
          <Button type="button" variant="outline" onClick={() => onSuccess?.()}>Cancelar</Button>
        ) : (
          <Link href={`/${workspaceSlug}/clients`} className={cn(buttonVariants({ variant: 'outline' }))}>
            Cancelar
          </Link>
        )}
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Salvando...' : 'Salvar cliente'}
        </Button>
      </div>
    </form>
  )
}
