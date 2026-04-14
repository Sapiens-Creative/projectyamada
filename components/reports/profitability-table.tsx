import Link from 'next/link'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface ProjectProfitRow {
  projectId: string
  projectName: string
  revenue: number
  hoursCost: number
  campaignCosts: number
  margin: number
  marginPct: number
}

interface ProfitabilityTableProps {
  rows: ProjectProfitRow[]
  workspaceSlug: string
}

function formatCurrency(v: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v)
}

export function ProfitabilityTable({ rows, workspaceSlug }: ProfitabilityTableProps) {
  if (rows.length === 0) {
    return (
      <div className="card-sun rounded-xl p-8 text-center">
        <p className="text-sm text-white/40">Nenhum dado de rentabilidade disponível</p>
        <p className="text-xs text-white/25 mt-1">Cadastre faturas, horas e custos nos projetos</p>
      </div>
    )
  }

  return (
    <div className="card-sun rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.06]">
              <th className="text-left px-5 py-3 text-xs text-white/40 font-medium">Projeto</th>
              <th className="text-right px-4 py-3 text-xs text-white/40 font-medium">Receita</th>
              <th className="text-right px-4 py-3 text-xs text-white/40 font-medium">Horas</th>
              <th className="text-right px-4 py-3 text-xs text-white/40 font-medium">Custos</th>
              <th className="text-right px-5 py-3 text-xs text-white/40 font-medium">Margem</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const Icon = row.marginPct >= 30 ? TrendingUp : row.marginPct >= 0 ? Minus : TrendingDown
              const marginColor = row.marginPct >= 30 ? 'text-emerald-400' : row.marginPct >= 0 ? 'text-amber-400' : 'text-red-400'
              return (
                <tr key={row.projectId} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                  <td className="px-5 py-3">
                    <Link
                      href={`/${workspaceSlug}/projects/${row.projectId}`}
                      className="font-medium text-white/80 hover:text-white transition-colors"
                    >
                      {row.projectName}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-right text-blue-400">{formatCurrency(row.revenue)}</td>
                  <td className="px-4 py-3 text-right text-red-400/70">{formatCurrency(row.hoursCost)}</td>
                  <td className="px-4 py-3 text-right text-red-400/70">{formatCurrency(row.campaignCosts)}</td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Icon className={`h-3.5 w-3.5 ${marginColor}`} />
                      <span className={`font-semibold ${marginColor}`}>
                        {formatCurrency(row.margin)} <span className="text-xs font-normal">({row.marginPct.toFixed(0)}%)</span>
                      </span>
                    </div>
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
