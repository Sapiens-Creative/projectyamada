interface ChannelData {
  source: string
  total: number
  won: number
  value: number
}

interface ChannelBreakdownProps {
  data: ChannelData[]
}

const SOURCE_LABELS: Record<string, string> = {
  site: 'Site',
  landing_page: 'Landing Page',
  referral: 'Indicação',
  linkedin: 'LinkedIn',
  facebook: 'Facebook',
  event: 'Evento',
  cold: 'Cold Outreach',
  other: 'Outros',
}

function formatCurrency(v: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v)
}

export function ChannelBreakdown({ data }: ChannelBreakdownProps) {
  if (data.length === 0) {
    return (
      <div className="card-sun rounded-xl p-8 text-center">
        <p className="text-sm text-white/40">Nenhum lead cadastrado ainda</p>
      </div>
    )
  }

  const maxTotal = Math.max(...data.map((d) => d.total), 1)

  return (
    <div className="card-sun rounded-xl divide-y divide-white/[0.06]">
      {data.map((row) => {
        const convRate = row.total > 0 ? Math.round((row.won / row.total) * 100) : 0
        const barWidth = Math.round((row.total / maxTotal) * 100)

        return (
          <div key={row.source} className="px-5 py-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-white/80">{SOURCE_LABELS[row.source] ?? row.source}</span>
              <div className="flex items-center gap-4 text-xs text-white/40">
                <span>{row.total} lead{row.total !== 1 ? 's' : ''}</span>
                <span className="text-emerald-400">{convRate}% conv.</span>
                <span className="text-blue-400">{formatCurrency(row.value)}</span>
              </div>
            </div>
            <div className="h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#ff5600]/60 rounded-full transition-all"
                style={{ width: `${barWidth}%` }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
