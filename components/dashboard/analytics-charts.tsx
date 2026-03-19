'use client'

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TrendingUp, BarChart3, PieChart as PieChartIcon } from 'lucide-react'
import type { TimeSeriesData, RegionStats } from '@/lib/types'
import { formatCurrency } from '@/lib/fraud-simulation'

interface AnalyticsChartsProps {
  timeSeriesData: TimeSeriesData[]
  regionStats: RegionStats[]
}

const COLORS = {
  primary: 'oklch(0.70 0.18 165)',
  info: 'oklch(0.65 0.15 220)',
  warning: 'oklch(0.80 0.16 85)',
  danger: 'oklch(0.60 0.22 25)',
  success: 'oklch(0.70 0.18 165)'
}

const PIE_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#06b6d4', '#84cc16']

export function AnalyticsCharts({ timeSeriesData, regionStats }: AnalyticsChartsProps) {
  const formattedTimeData = timeSeriesData.map(d => ({
    ...d,
    time: d.timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    volumeM: d.volume / 1000000
  }))

  const regionChartData = regionStats
    .filter(r => r.transactionCount > 0)
    .sort((a, b) => b.transactionCount - a.transactionCount)
    .slice(0, 8)
    .map(r => ({
      name: r.region,
      transactions: r.transactionCount,
      flagged: r.flaggedCount,
      volume: r.totalVolume / 1000000
    }))

  const pieData = regionStats
    .filter(r => r.transactionCount > 0)
    .map(r => ({
      name: r.region,
      value: r.transactionCount
    }))

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number; dataKey: string; color: string }[]; label?: string }) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border border-border bg-popover p-3 shadow-lg">
          <p className="mb-2 text-sm font-medium text-foreground">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.dataKey === 'volumeM' ? 'Volume' : entry.dataKey === 'transactions' ? 'Transactions' : 'Signalées'}: {
                entry.dataKey === 'volumeM' 
                  ? `${entry.value.toFixed(1)}M XOF`
                  : entry.value
              }
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">Analyses Visuelles</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="timeline" className="w-full">
          <TabsList className="mb-4 grid w-full grid-cols-3 bg-secondary">
            <TabsTrigger value="timeline" className="gap-1.5">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Chronologie</span>
            </TabsTrigger>
            <TabsTrigger value="regions" className="gap-1.5">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Régions</span>
            </TabsTrigger>
            <TabsTrigger value="distribution" className="gap-1.5">
              <PieChartIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Distribution</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="timeline" className="mt-0">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={formattedTimeData}>
                  <defs>
                    <linearGradient id="colorTransactions" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorFlagged" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS.danger} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={COLORS.danger} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.25 0.01 250)" />
                  <XAxis 
                    dataKey="time" 
                    stroke="oklch(0.65 0 0)" 
                    tick={{ fill: 'oklch(0.65 0 0)', fontSize: 12 }}
                  />
                  <YAxis 
                    stroke="oklch(0.65 0 0)" 
                    tick={{ fill: 'oklch(0.65 0 0)', fontSize: 12 }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="transactions"
                    stroke={COLORS.primary}
                    fillOpacity={1}
                    fill="url(#colorTransactions)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="flagged"
                    stroke={COLORS.danger}
                    fillOpacity={1}
                    fill="url(#colorFlagged)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 flex items-center justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS.primary }} />
                <span className="text-muted-foreground">Transactions</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS.danger }} />
                <span className="text-muted-foreground">Signalées</span>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="regions" className="mt-0">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={regionChartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.25 0.01 250)" />
                  <XAxis 
                    type="number" 
                    stroke="oklch(0.65 0 0)"
                    tick={{ fill: 'oklch(0.65 0 0)', fontSize: 12 }}
                  />
                  <YAxis 
                    type="category" 
                    dataKey="name" 
                    stroke="oklch(0.65 0 0)"
                    tick={{ fill: 'oklch(0.65 0 0)', fontSize: 12 }}
                    width={100}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="transactions" fill={COLORS.primary} radius={[0, 4, 4, 0]} />
                  <Bar dataKey="flagged" fill={COLORS.danger} radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 flex items-center justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS.primary }} />
                <span className="text-muted-foreground">Total</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS.danger }} />
                <span className="text-muted-foreground">Signalées</span>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="distribution" className="mt-0">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={{ stroke: 'oklch(0.65 0 0)' }}
                  >
                    {pieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => [`${value} transactions`, 'Volume']}
                    contentStyle={{ 
                      backgroundColor: 'oklch(0.16 0.01 250)', 
                      border: '1px solid oklch(0.25 0.01 250)',
                      borderRadius: '8px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <p className="mt-2 text-center text-sm text-muted-foreground">
              Distribution des transactions par région
            </p>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
