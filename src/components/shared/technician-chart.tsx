"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import type { TechnicianPerformance } from "../../../domain/types/reports"

interface TechnicianChartProps {
  data: TechnicianPerformance[]
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-white/10 bg-[#18181b] p-3 shadow-xl">
        <p className="text-sm font-bold text-white mb-1">{label}</p>
        <p className="text-xs text-emerald-500">{payload[0].value} Jobs Completed</p>
        <p className="text-xs text-blue-500">{(payload[1].value / 1000).toFixed(1)}k ETB Revenue</p>
      </div>
    )
  }
  return null
}

export function TechnicianChart({ data }: TechnicianChartProps) {
  return (
    <div className="h-[250px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
          <XAxis dataKey="name" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "#27272a" }} />
          <Bar dataKey="completed" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
          <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={40} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}