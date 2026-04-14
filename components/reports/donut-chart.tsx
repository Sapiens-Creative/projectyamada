'use client'

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'

interface DonutChartProps {
  data: { name: string; value: number; color: string }[]
}

export function DonutChart({ data }: DonutChartProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0)

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="45%"
          innerRadius={55}
          outerRadius={80}
          paddingAngle={2}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={index} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip formatter={(v) => {
          const num = typeof v === 'number' ? v : 0
          return [`${num} (${total > 0 ? Math.round((num / total) * 100) : 0}%)`, '']
        }} />
        <Legend iconType="circle" iconSize={8} formatter={(value) => <span style={{ fontSize: 12 }}>{value}</span>} />
      </PieChart>
    </ResponsiveContainer>
  )
}
