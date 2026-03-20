'use client'

import { useState, memo } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, BarChart3, PieChart as PieChartIcon, Maximize2, ZoomIn, ZoomOut, RefreshCw } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { TimeSeriesData, RegionStats } from '@/lib/types'
import { formatCurrency } from '@/lib/fraud-simulation'

interface AnalyticsChartsProps {
  timeSeriesData: TimeSeriesData[]
  regionStats: RegionStats[]
}

const COLORS = {
  primary: 'oklch(0.55 0.18 250)',
  info: 'oklch(0.65 0.15 220)',
  warning: 'oklch(0.80 0.16 85)',
  danger: 'oklch(0.60 0.22 25)',
  success: 'oklch(0.55 0.18 250)'
}

const PIE_COLORS = ['#1e3a5f', '#2563eb', '#1d4ed8', '#1e40af', '#1e3a8a', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#dbeafe']

function AnalyticsChartsComponent({ timeSeriesData, regionStats }: AnalyticsChartsProps) {
  const [activeTab, setActiveTab] = useState('timeline')
  const [fullscreenChart, setFullscreenChart] = useState<string | null>(null)
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null)
  const [selectedTimePoint, setSelectedTimePoint] = useState<TimeSeriesData | null>(null)

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
        <div className="rounded-lg border border-border bg-popover p-3 shadow-lg backdrop-blur-sm">
          <p className="mb-2 text-sm font-medium text-foreground">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm flex items-center gap-2" style={{ color: entry.color }}>
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
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

  const handleAreaClick = (data: { activePayload?: { payload: TimeSeriesData }[] }) => {
    if (data?.activePayload?.[0]) {
      setSelectedTimePoint(data.activePayload[0].payload)
    }
  }

  const handleBarClick = (data: { name?: string }) => {
    if (data?.name) {
      setSelectedRegion(selectedRegion === data.name ? null : data.name)
    }
  }

  const renderChart = (isFullscreen = false) => {
    const height = isFullscreen ? 500 : 300
    
    return (
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <TabsList className="grid w-full sm:w-auto grid-cols-3 bg-secondary">
            <TabsTrigger value="timeline" className="gap-1.5 text-xs sm:text-sm">
              <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Chronologie</span>
              <span className="sm:hidden">Temps</span>
            </TabsTrigger>
            <TabsTrigger value="regions" className="gap-1.5 text-xs sm:text-sm">
              <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Régions</span>
              <span className="sm:hidden">Régions</span>
            </TabsTrigger>
            <TabsTrigger value="distribution" className="gap-1.5 text-xs sm:text-sm">
              <PieChartIcon className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Distribution</span>
              <span className="sm:hidden">Dist.</span>
            </TabsTrigger>
          </TabsList>
          
          {!isFullscreen && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setFullscreenChart(activeTab)}
              className="gap-2 hidden sm:flex"
            >
              <Maximize2 className="h-4 w-4" />
              Agrandir
            </Button>
          )}
        </div>
        
        <TabsContent value="timeline" className="mt-0">
          <div style={{ height }} className="w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart 
                data={formattedTimeData}
                onClick={handleAreaClick}
                style={{ cursor: 'crosshair' }}
              >
                <defs>
                  <linearGradient id="colorTransactions" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.4}/>
                    <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorFlagged" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.danger} stopOpacity={0.4}/>
                    <stop offset="95%" stopColor={COLORS.danger} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.25 0.01 250)" />
                <XAxis 
                  dataKey="time" 
                  stroke="oklch(0.65 0 0)" 
                  tick={{ fill: 'oklch(0.65 0 0)', fontSize: 11 }}
                  interval="preserveStartEnd"
                />
                <YAxis 
                  stroke="oklch(0.65 0 0)" 
                  tick={{ fill: 'oklch(0.65 0 0)', fontSize: 11 }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="transactions"
                  stroke={COLORS.primary}
                  fillOpacity={1}
                  fill="url(#colorTransactions)"
                  strokeWidth={2}
                  animationDuration={1000}
                  dot={false}
                  activeDot={{ r: 6, strokeWidth: 2, stroke: 'white' }}
                />
                <Area
                  type="monotone"
                  dataKey="flagged"
                  stroke={COLORS.danger}
                  fillOpacity={1}
                  fill="url(#colorFlagged)"
                  strokeWidth={2}
                  animationDuration={1000}
                  dot={false}
                  activeDot={{ r: 6, strokeWidth: 2, stroke: 'white' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS.primary }} />
              <span className="text-muted-foreground">Transactions</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS.danger }} />
              <span className="text-muted-foreground">Signalées</span>
            </div>
          </div>
          {selectedTimePoint && (
            <div className="mt-3 rounded-lg bg-secondary/50 p-3 text-sm">
              <p className="font-medium">Point sélectionné: {selectedTimePoint.timestamp.toLocaleTimeString('fr-FR')}</p>
              <p className="text-muted-foreground">
                {selectedTimePoint.transactions} transactions, {selectedTimePoint.flagged} signalées
              </p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="regions" className="mt-0">
          <div style={{ height }} className="w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={regionChartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.25 0.01 250)" />
                <XAxis 
                  type="number" 
                  stroke="oklch(0.65 0 0)"
                  tick={{ fill: 'oklch(0.65 0 0)', fontSize: 11 }}
                />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  stroke="oklch(0.65 0 0)"
                  tick={{ fill: 'oklch(0.65 0 0)', fontSize: 11 }}
                  width={80}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="transactions" 
                  fill={COLORS.primary} 
                  radius={[0, 4, 4, 0]}
                  onClick={handleBarClick}
                  style={{ cursor: 'pointer' }}
                  animationDuration={800}
                />
                <Bar 
                  dataKey="flagged" 
                  fill={COLORS.danger} 
                  radius={[0, 4, 4, 0]}
                  onClick={handleBarClick}
                  style={{ cursor: 'pointer' }}
                  animationDuration={800}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS.primary }} />
              <span className="text-muted-foreground">Total</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS.danger }} />
              <span className="text-muted-foreground">Signalées</span>
            </div>
          </div>
          {selectedRegion && (
            <div className="mt-3 rounded-lg bg-primary/10 border border-primary/30 p-3 text-sm">
              <p className="font-medium">Région: {selectedRegion}</p>
              <p className="text-muted-foreground">Cliquez à nouveau pour désélectionner</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="distribution" className="mt-0">
          <div style={{ height }} className="w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={isFullscreen ? 80 : 50}
                  outerRadius={isFullscreen ? 140 : 90}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) => isFullscreen ? `${name} ${(percent * 100).toFixed(0)}%` : `${(percent * 100).toFixed(0)}%`}
                  labelLine={{ stroke: 'oklch(0.65 0 0)' }}
                  animationDuration={1000}
                  animationBegin={0}
                >
                  {pieData.map((_, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={PIE_COLORS[index % PIE_COLORS.length]}
                      style={{ cursor: 'pointer', outline: 'none' }}
                    />
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
                {isFullscreen && <Legend />}
              </PieChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-2 text-center text-xs sm:text-sm text-muted-foreground">
            Distribution des transactions par région
          </p>
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            {pieData.slice(0, 5).map((entry, index) => (
              <Badge 
                key={entry.name} 
                variant="outline" 
                className="text-xs cursor-pointer hover:bg-secondary transition-colors"
                style={{ borderColor: PIE_COLORS[index] }}
              >
                {entry.name}: {entry.value}
              </Badge>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    )
  }

  return (
    <>
      <Card className="border-border bg-card">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">Analyses Visuelles</CardTitle>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {renderChart()}
        </CardContent>
      </Card>

      {/* Fullscreen Dialog */}
      <Dialog open={!!fullscreenChart} onOpenChange={() => setFullscreenChart(null)}>
        <DialogContent className="max-w-[95vw] sm:max-w-4xl h-[90vh] sm:h-auto">
          <DialogHeader>
            <DialogTitle>Analyses Détaillées</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            {renderChart(true)}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

export const AnalyticsCharts = memo(AnalyticsChartsComponent)
