'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

interface ForecastDataPoint {
  month: string
  confirmado: number
  estimado: number
}

interface RevenueForecastProps {
  data: ForecastDataPoint[]
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(value)
}

export function RevenueForecast({ data }: RevenueForecastProps) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 4, right: 8, left: 8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.06)" />
        <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'rgba(255,255,255,0.4)' }} axisLine={false} tickLine={false} />
        <YAxis
          tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`}
          tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.3)' }}
          axisLine={false}
          tickLine={false}
          width={52}
        />
        <Tooltip
          formatter={(v, name) => [formatCurrency(typeof v === 'number' ? v : 0), name === 'confirmado' ? 'Confirmado' : 'Estimado']}
          contentStyle={{ background: 'rgba(20,20,20,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
          labelStyle={{ fontWeight: 600, color: 'white' }}
        />
        <Legend
          formatter={(value) => value === 'confirmado' ? 'Confirmado' : 'Estimado'}
          wrapperStyle={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}
        />
        <Bar dataKey="confirmado" fill="#22c55e" radius={[3, 3, 0, 0]} stackId="a" />
        <Bar dataKey="estimado" fill="rgba(34,197,94,0.25)" radius={[3, 3, 0, 0]} stackId="a" />
      </BarChart>
    </ResponsiveContainer>
  )
}
