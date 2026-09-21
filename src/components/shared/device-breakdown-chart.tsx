"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import type { DeviceBreakdown } from "../../../domain/types/reports"
interface DeviceBreakdownChartProps {
  data: DeviceBreakdown[]
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-white/10 bg-[#18181b] p-3 shadow-xl">
        <p className="text-sm font-bold text-white">{payload[0].name}</p>
        <p className="text-xs text-zinc-400">{payload[0].value}% of total devices</p>
      </div>
    )
  }
  return null
}

export function DeviceBreakdownChart({ data }: DeviceBreakdownChartProps) {
  return (
    <div className="h-[250px] w-full flex items-center">
      <div className="w-1/2 h-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="w-1/2 space-y-3 pl-4">
        {data.map((item, index) => (
          <div key={index} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-zinc-300">{item.name}</span>
            </div>
            <span className="font-bold text-white">{item.value}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}