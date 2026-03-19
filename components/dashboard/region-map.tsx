'use client'

import { MapPin, TrendingUp, AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import type { RegionStats } from '@/lib/types'
import { formatCurrency } from '@/lib/fraud-simulation'

interface RegionMapProps {
  regionStats: RegionStats[]
}

const regionCoordinates: Record<string, { x: number; y: number }> = {
  'Abidjan': { x: 75, y: 70 },
  'Yamoussoukro': { x: 50, y: 55 },
  'Bouaké': { x: 55, y: 45 },
  'San-Pédro': { x: 35, y: 85 },
  'Daloa': { x: 35, y: 55 },
  'Korhogo': { x: 55, y: 20 },
  'Man': { x: 20, y: 50 },
  'Gagnoa': { x: 40, y: 65 },
  'Abengourou': { x: 75, y: 50 },
  'Divo': { x: 50, y: 70 }
}

const riskLevelConfig = {
  low: { color: 'bg-success', textColor: 'text-success', label: 'Faible' },
  medium: { color: 'bg-warning', textColor: 'text-warning', label: 'Moyen' },
  high: { color: 'bg-danger', textColor: 'text-danger', label: 'Élevé' }
}

export function RegionMap({ regionStats }: RegionMapProps) {
  const sortedRegions = [...regionStats].sort((a, b) => b.transactionCount - a.transactionCount)
  const maxTransactions = Math.max(...regionStats.map(r => r.transactionCount), 1)

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg font-semibold">Activité par Région</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 lg:grid-cols-2">
          {/* Visual Map */}
          <div className="relative h-[280px] rounded-lg bg-secondary/50 p-4">
            <svg viewBox="0 0 100 100" className="h-full w-full">
              {/* Simplified Côte d'Ivoire outline */}
              <path
                d="M10,30 Q5,50 15,70 L25,85 Q40,95 60,90 L80,80 Q90,70 85,55 L80,35 Q75,20 60,15 L40,15 Q20,20 10,30"
                fill="oklch(0.20 0.01 250)"
                stroke="oklch(0.35 0.01 250)"
                strokeWidth="0.5"
              />
              
              {/* Region markers */}
              {regionStats.map(region => {
                const coords = regionCoordinates[region.region]
                if (!coords) return null
                
                const size = Math.max(3, (region.transactionCount / maxTransactions) * 8)
                const riskConfig = riskLevelConfig[region.riskLevel]
                
                return (
                  <g key={region.region}>
                    {/* Pulse animation for high risk */}
                    {region.riskLevel === 'high' && (
                      <circle
                        cx={coords.x}
                        cy={coords.y}
                        r={size + 2}
                        fill="none"
                        stroke="oklch(0.60 0.22 25)"
                        strokeWidth="1"
                        opacity="0.5"
                        className="animate-ping"
                      />
                    )}
                    <circle
                      cx={coords.x}
                      cy={coords.y}
                      r={size}
                      fill={
                        region.riskLevel === 'high' ? 'oklch(0.60 0.22 25)' :
                        region.riskLevel === 'medium' ? 'oklch(0.80 0.16 85)' :
                        'oklch(0.70 0.18 165)'
                      }
                      opacity="0.8"
                    />
                    <text
                      x={coords.x}
                      y={coords.y - size - 2}
                      textAnchor="middle"
                      fill="oklch(0.85 0 0)"
                      fontSize="3"
                      fontWeight="500"
                    >
                      {region.region}
                    </text>
                  </g>
                )
              })}
            </svg>
            
            {/* Legend */}
            <div className="absolute bottom-2 left-2 flex items-center gap-3 rounded-md bg-background/80 px-2 py-1 text-xs">
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-success" />
                <span>Faible</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-warning" />
                <span>Moyen</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-danger" />
                <span>Élevé</span>
              </div>
            </div>
          </div>
          
          {/* Region List */}
          <ScrollArea className="h-[280px]">
            <div className="space-y-2 pr-4">
              {sortedRegions.map(region => {
                const riskConfig = riskLevelConfig[region.riskLevel]
                const percentage = maxTransactions > 0 
                  ? (region.transactionCount / maxTransactions) * 100 
                  : 0
                
                return (
                  <div
                    key={region.region}
                    className="rounded-lg border border-border bg-secondary/30 p-3 transition-colors hover:bg-secondary/50"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${riskConfig.color}`} />
                        <span className="font-medium">{region.region}</span>
                      </div>
                      <Badge variant="outline" className={riskConfig.textColor}>
                        {riskConfig.label}
                      </Badge>
                    </div>
                    
                    <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        <span>{region.transactionCount} tx</span>
                      </div>
                      {region.flaggedCount > 0 && (
                        <div className="flex items-center gap-1 text-warning">
                          <AlertTriangle className="h-3 w-3" />
                          <span>{region.flaggedCount} signalées</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-2">
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                        <div 
                          className={`h-full rounded-full ${riskConfig.color}`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                    
                    <p className="mt-1 text-xs text-muted-foreground">
                      Volume: {formatCurrency(region.totalVolume)} XOF
                    </p>
                  </div>
                )
              })}
            </div>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  )
}
