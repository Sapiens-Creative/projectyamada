import Link from 'next/link'
import { AlertTriangle } from 'lucide-react'
import type { Client } from '@/types/app.types'

interface ClientRow {
  client: Client
  activeProjects: number
  openTasks: number
  totalRevenue: number
  lastInteraction: string | null
}

interface ClientPerformanceTableProps {
  rows: ClientRow[]
  workspaceSlug: string
}

function formatCurrency(v: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v)
}

function formatDate(d: string | null) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}

function renewalWarning(date: string | null): boolean {
  if (!date) return false
  const diff = new Date(date).getTime() - Date.now()
  return diff > 0 && diff < 90 * 24 * 60 * 60 * 1000 // within 90 days
}

export function ClientPerformanceTable({ rows, workspaceSlug }: ClientPerformanceTableProps) {
  if (rows.length === 0) {
    return (
      <div className="card-sun rounded-xl p-8 text-center">
        <p className="text-sm text-white/40">Nenhum cliente para exibir</p>
      </div>
    )
  }

  return (
    <div className="card-sun rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.06]">
              <th className="text-left px-5 py-3 text-xs text-white/40 font-medium">Cliente</th>
              <th className="text-center px-4 py-3 text-xs text-white/40 font-medium">Projetos</th>
              <th className="text-center px-4 py-3 text-xs text-white/40 font-medium">Tarefas</th>
              <th className="text-right px-4 py-3 text-xs text-white/40 font-medium">Receita</th>
              <th className="text-right px-4 py-3 text-xs text-white/40 font-medium">MRR</th>
              <th className="text-right px-4 py-3 text-xs text-white/40 font-medium">Último contato</th>
              <th className="text-right px-5 py-3 text-xs text-white/40 font-medium">Renovação</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ client, activeProjects, openTasks, totalRevenue, lastInteraction }) => {
              const warn = renewalWarning(client.contract_renewal ?? null)
              return (
                <tr key={client.id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                  <td className="px-5 py-3">
                    <Link
                      href={`/${workspaceSlug}/clients/${client.id}`}
                      className="font-medium text-white/80 hover:text-white transition-colors"
                    >
                      {client.name}
                    </Link>
                    {client.tags && client.tags.length > 0 && (
                      <div className="flex gap-1 mt-0.5 flex-wrap">
                        {client.tags.slice(0, 3).map((tag) => (
                          <span key={tag} className="text-[10px] bg-white/[0.06] text-white/40 px-1.5 py-0.5 rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={activeProjects > 0 ? 'text-blue-400 font-medium' : 'text-white/30'}>{activeProjects}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={openTasks > 0 ? 'text-amber-400' : 'text-white/30'}>{openTasks}</span>
                  </td>
                  <td className="px-4 py-3 text-right text-white/70">{formatCurrency(totalRevenue)}</td>
                  <td className="px-4 py-3 text-right">
                    {client.monthly_fee ? (
                      <span className="text-emerald-400">{formatCurrency(client.monthly_fee)}</span>
                    ) : (
                      <span className="text-white/20">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right text-white/40 text-xs">{formatDate(lastInteraction)}</td>
                  <td className="px-5 py-3 text-right text-xs">
                    {client.contract_renewal ? (
                      <span className={`flex items-center justify-end gap-1 ${warn ? 'text-amber-400' : 'text-white/40'}`}>
                        {warn && <AlertTriangle className="h-3 w-3" />}
                        {formatDate(client.contract_renewal)}
                      </span>
                    ) : (
                      <span className="text-white/20">—</span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
