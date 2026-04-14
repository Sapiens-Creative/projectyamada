'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Building2, FolderKanban, CheckSquare, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from '@/components/ui/command'
import { createClient } from '@/lib/supabase/client'

interface SearchResult {
  id: string
  label: string
  sublabel?: string
  type: 'client' | 'project' | 'task' | 'invoice'
  href: string
}

interface GlobalSearchProps {
  workspaceId: string
  workspaceSlug: string
}

export function GlobalSearch({ workspaceId, workspaceSlug }: GlobalSearchProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen((o) => !o)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const search = useCallback(async (q: string) => {
    if (!q.trim()) { setResults([]); return }
    setLoading(true)
    const supabase = createClient()
    const term = `%${q}%`

    const [clients, projects, tasks, invoices] = await Promise.all([
      supabase.from('clients').select('id, name, status').eq('workspace_id', workspaceId).ilike('name', term).limit(5),
      supabase.from('projects').select('id, name, status').eq('workspace_id', workspaceId).ilike('name', term).limit(5),
      supabase.from('tasks').select('id, title, status').eq('workspace_id', workspaceId).ilike('title', term).limit(5),
      supabase.from('invoices').select('id, number, title, status').eq('workspace_id', workspaceId).or(`title.ilike.${term},number.ilike.${term}`).limit(5),
    ])

    const all: SearchResult[] = [
      ...(clients.data ?? []).map((c: { id: string; name: string; status: string }) => ({
        id: c.id, label: c.name, sublabel: c.status, type: 'client' as const,
        href: `/${workspaceSlug}/clients/${c.id}`,
      })),
      ...(projects.data ?? []).map((p: { id: string; name: string; status: string }) => ({
        id: p.id, label: p.name, sublabel: p.status, type: 'project' as const,
        href: `/${workspaceSlug}/projects/${p.id}`,
      })),
      ...(tasks.data ?? []).map((t: { id: string; title: string; status: string }) => ({
        id: t.id, label: t.title, sublabel: t.status, type: 'task' as const,
        href: `/${workspaceSlug}/tasks`,
      })),
      ...(invoices.data ?? []).map((i: { id: string; number: string; title: string; status: string }) => ({
        id: i.id, label: i.title, sublabel: `${i.number} · ${i.status}`, type: 'invoice' as const,
        href: `/${workspaceSlug}/financial`,
      })),
    ]
    setResults(all)
    setLoading(false)
  }, [workspaceId, workspaceSlug])

  useEffect(() => {
    const t = setTimeout(() => search(query), 200)
    return () => clearTimeout(t)
  }, [query, search])

  function handleSelect(href: string) {
    setOpen(false)
    setQuery('')
    router.push(href)
  }

  const byType = {
    client: results.filter((r) => r.type === 'client'),
    project: results.filter((r) => r.type === 'project'),
    task: results.filter((r) => r.type === 'task'),
    invoice: results.filter((r) => r.type === 'invoice'),
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="h-8 w-48 justify-start text-muted-foreground font-normal gap-2 hidden sm:flex"
        onClick={() => setOpen(true)}
      >
        <Search className="h-3.5 w-3.5" />
        <span className="flex-1 text-left text-xs">Buscar...</span>
        <kbd className="text-xs bg-muted px-1 rounded">⌘K</kbd>
      </Button>
      <Button variant="ghost" size="icon" className="h-8 w-8 sm:hidden" onClick={() => setOpen(true)}>
        <Search className="h-4 w-4" />
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen} title="Busca global" description="Buscar clientes, projetos, tarefas e faturas">
        <CommandInput
          placeholder="Buscar clientes, projetos, tarefas..."
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          {loading && <div className="py-6 text-center text-sm text-muted-foreground">Buscando...</div>}
          {!loading && query && results.length === 0 && (
            <CommandEmpty>Nenhum resultado para "{query}"</CommandEmpty>
          )}
          {!loading && !query && (
            <div className="py-6 text-center text-sm text-muted-foreground">Digite para buscar</div>
          )}
          {byType.client.length > 0 && (
            <>
              <CommandGroup heading="Clientes">
                {byType.client.map((r) => (
                  <CommandItem key={r.id} onSelect={() => handleSelect(r.href)}>
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span>{r.label}</span>
                    {r.sublabel && <span className="ml-auto text-xs text-muted-foreground">{r.sublabel}</span>}
                  </CommandItem>
                ))}
              </CommandGroup>
              <CommandSeparator />
            </>
          )}
          {byType.project.length > 0 && (
            <>
              <CommandGroup heading="Projetos">
                {byType.project.map((r) => (
                  <CommandItem key={r.id} onSelect={() => handleSelect(r.href)}>
                    <FolderKanban className="h-4 w-4 text-muted-foreground" />
                    <span>{r.label}</span>
                    {r.sublabel && <span className="ml-auto text-xs text-muted-foreground">{r.sublabel}</span>}
                  </CommandItem>
                ))}
              </CommandGroup>
              <CommandSeparator />
            </>
          )}
          {byType.task.length > 0 && (
            <>
              <CommandGroup heading="Tarefas">
                {byType.task.map((r) => (
                  <CommandItem key={r.id} onSelect={() => handleSelect(r.href)}>
                    <CheckSquare className="h-4 w-4 text-muted-foreground" />
                    <span>{r.label}</span>
                    {r.sublabel && <span className="ml-auto text-xs text-muted-foreground">{r.sublabel}</span>}
                  </CommandItem>
                ))}
              </CommandGroup>
              <CommandSeparator />
            </>
          )}
          {byType.invoice.length > 0 && (
            <CommandGroup heading="Faturas">
              {byType.invoice.map((r) => (
                <CommandItem key={r.id} onSelect={() => handleSelect(r.href)}>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span>{r.label}</span>
                  {r.sublabel && <span className="ml-auto text-xs text-muted-foreground">{r.sublabel}</span>}
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  )
}
