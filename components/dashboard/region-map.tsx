'use client'

import { useState, memo } from 'react'
import { MapPin, TrendingUp, AlertTriangle, X, ExternalLink, Eye } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import type { RegionStats } from '@/lib/types'
import { formatCurrency } from '@/lib/fraud-simulation'

interface RegionMapProps {
  regionStats: RegionStats[]
  onFilterRegion?: (region: string) => void
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
  low: { color: 'bg-success', textColor: 'text-success', label: 'Faible', hex: 'oklch(0.55 0.18 250)' },
  medium: { color: 'bg-warning', textColor: 'text-warning', label: 'Moyen', hex: 'oklch(0.80 0.16 85)' },
  high: { color: 'bg-danger', textColor: 'text-danger', label: 'Élevé', hex: 'oklch(0.60 0.22 25)' }
}

function RegionMapComponent({ regionStats, onFilterRegion }: RegionMapProps) {
  const [selectedRegion, setSelectedRegion] = useState<RegionStats | null>(null)
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null)
  
  const sortedRegions = [...regionStats].sort((a, b) => b.transactionCount - a.transactionCount)
  const maxTransactions = Math.max(...regionStats.map(r => r.transactionCount), 1)

  const getRegionByName = (name: string) => regionStats.find(r => r.region === name)

  return (
    <TooltipProvider>
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg font-semibold">Activité par Région</CardTitle>
            </div>
            {selectedRegion && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setSelectedRegion(null)}
                className="gap-1"
              >
                <X className="h-4 w-4" />
                Fermer
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 lg:grid-cols-2">
            {/* Visual Map */}
            <div className="relative h-[280px] sm:h-[320px] rounded-lg bg-secondary/50 p-4">
              <svg viewBox="0 0 100 100" className="h-full w-full">
                {/* Simplified Côte d'Ivoire outline */}
                <path
                  d="M10,30 Q5,50 15,70 L25,85 Q40,95 60,90 L80,80 Q90,70 85,55 L80,35 Q75,20 60,15 L40,15 Q20,20 10,30"
                  fill="oklch(0.20 0.01 250)"
                  stroke="oklch(0.35 0.01 250)"
                  strokeWidth="0.5"
                  className="transition-all duration-300"
                />
                
                {/* Connection lines between regions when one is selected */}
                {selectedRegion && regionCoordinates[selectedRegion.region] && (
                  <>
                    {regionStats
                      .filter(r => r.region !== selectedRegion.region)
                      .map(region => {
                        const from = regionCoordinates[selectedRegion.region]
                        const to = regionCoordinates[region.region]
                        if (!from || !to) return null
                        
                        return (
                          <line
                            key={region.region}
                            x1={from.x}
                            y1={from.y}
                            x2={to.x}
                            y2={to.y}
                            stroke="oklch(0.55 0.18 250)"
                            strokeWidth="0.3"
                            strokeDasharray="2 2"
                            opacity="0.3"
                            className="animate-pulse"
                          />
                        )
                      })}
                  </>
                )}
                
                {/* Region markers */}
                {regionStats.map(region => {
                  const coords = regionCoordinates[region.region]
                  if (!coords) return null
                  
                  const size = Math.max(4, (region.transactionCount / maxTransactions) * 10)
                  const riskConfig = riskLevelConfig[region.riskLevel]
                  const isSelected = selectedRegion?.region === region.region
                  const isHovered = hoveredRegion === region.region
                  
                  return (
                    <g key={region.region}>
                      {/* Pulse animation for high risk or selected */}
                      {(region.riskLevel === 'high' || isSelected) && (
                        <circle
                          cx={coords.x}
                          cy={coords.y}
                          r={size + 3}
                          fill="none"
                          stroke={riskConfig.hex}
                          strokeWidth="1"
                          opacity="0.5"
                          className="animate-ping"
                        />
                      )}
                      
                      {/* Hover ring */}
                      {isHovered && (
                        <circle
                          cx={coords.x}
                          cy={coords.y}
                          r={size + 2}
                          fill="none"
                          stroke="oklch(0.95 0 0)"
                          strokeWidth="0.5"
                        />
                      )}
                      
                      {/* Main circle */}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <circle
                            cx={coords.x}
                            cy={coords.y}
                            r={isSelected ? size + 1 : size}
                            fill={riskConfig.hex}
                            opacity={isSelected ? 1 : 0.8}
                            className="cursor-pointer transition-all duration-300 hover:opacity-100"
                            onClick={() => setSelectedRegion(isSelected ? null : region)}
                            onMouseEnter={() => setHoveredRegion(region.region)}
                            onMouseLeave={() => setHoveredRegion(null)}
                          />
                        </TooltipTrigger>
                        <TooltipContent side="top" className="text-xs">
                          <p className="font-medium">{region.region}</p>
                          <p>{region.transactionCount} transactions</p>
                          <p>Risque: {riskConfig.label}</p>
                        </TooltipContent>
                      </Tooltip>
                      
                      {/* Region label */}
                      <text
                        x={coords.x}
                        y={coords.y - size - 3}
                        textAnchor="middle"
                        fill={isHovered || isSelected ? 'oklch(0.95 0 0)' : 'oklch(0.75 0 0)'}
                        fontSize="3"
                        fontWeight={isSelected ? '600' : '500'}
                        className="pointer-events-none transition-all"
                      >
                        {region.region}
                      </text>
                    </g>
                  )
                })}
              </svg>
              
              {/* Legend */}
              <div className="absolute bottom-2 left-2 flex flex-wrap items-center gap-2 sm:gap-3 rounded-md bg-background/80 px-2 py-1 text-[10px] sm:text-xs backdrop-blur-sm">
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
              
              {/* Quick info on hover */}
              {hoveredRegion && !selectedRegion && (
                <div className="absolute top-2 right-2 rounded-md bg-background/90 px-3 py-2 text-xs backdrop-blur-sm">
                  <p className="font-medium">{hoveredRegion}</p>
                  <p className="text-muted-foreground">Cliquez pour plus de détails</p>
                </div>
              )}
            </div>
            
            {/* Region List / Details */}
            <ScrollArea className="h-[280px] sm:h-[320px]">
              {selectedRegion ? (
                <div className="space-y-4 pr-4">
                  <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">{selectedRegion.region}</h3>
                      <Badge className={riskLevelConfig[selectedRegion.riskLevel].textColor}>
                        Risque {riskLevelConfig[selectedRegion.riskLevel].label}
                      </Badge>
                    </div>
                    
                    <div className="mt-4 grid gap-3 grid-cols-2">
                      <div className="rounded-lg bg-secondary p-3">
                        <p className="text-xs text-muted-foreground">Transactions</p>
                        <p className="text-xl font-bold">{selectedRegion.transactionCount}</p>
                      </div>
                      <div className="rounded-lg bg-secondary p-3">
                        <p className="text-xs text-muted-foreground">Signalées</p>
                        <p className="text-xl font-bold text-warning">{selectedRegion.flaggedCount}</p>
                      </div>
                      <div className="col-span-2 rounded-lg bg-secondary p-3">
                        <p className="text-xs text-muted-foreground">Volume Total</p>
                        <p className="text-xl font-bold">{formatCurrency(selectedRegion.totalVolume)} XOF</p>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <p className="text-sm text-muted-foreground mb-2">Taux de fraude</p>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                        <div 
                          className={`h-full rounded-full ${riskLevelConfig[selectedRegion.riskLevel].color}`}
                          style={{ width: `${(selectedRegion.flaggedCount / Math.max(selectedRegion.transactionCount, 1)) * 100}%` }}
                        />
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {((selectedRegion.flaggedCount / Math.max(selectedRegion.transactionCount, 1)) * 100).toFixed(1)}% des transactions
                      </p>
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-4 w-full gap-2"
                      onClick={() => {
                        onFilterRegion?.(selectedRegion.region)
                        setSelectedRegion(null)
                        document.querySelector('[data-transaction-table]')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                      }}
                    >
                      <ExternalLink className="h-4 w-4" />
                      Voir les transactions de {selectedRegion.region}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2 pr-4">
                  {sortedRegions.map(region => {
                    const riskConfig = riskLevelConfig[region.riskLevel]
                    const percentage = maxTransactions > 0 
                      ? (region.transactionCount / maxTransactions) * 100 
                      : 0
                    
                    return (
                      <div
                        key={region.region}
                        className="group cursor-pointer rounded-lg border border-border bg-secondary/30 p-3 transition-all duration-200 hover:bg-secondary/50 hover:border-primary/30 active:scale-[0.98]"
                        onClick={() => setSelectedRegion(region)}
                        onMouseEnter={() => setHoveredRegion(region.region)}
                        onMouseLeave={() => setHoveredRegion(null)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={`h-2.5 w-2.5 rounded-full ${riskConfig.color} transition-transform group-hover:scale-125`} />
                            <span className="font-medium">{region.region}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className={`${riskConfig.textColor} text-xs`}>
                              {riskConfig.label}
                            </Badge>
                            <Eye className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                          </div>
                        </div>
                        
                        <div className="mt-2 flex items-center gap-4 text-xs sm:text-sm text-muted-foreground">
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
                              className={`h-full rounded-full transition-all duration-500 ${riskConfig.color}`}
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
              )}
            </ScrollArea>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  )
}

export const RegionMap = memo(RegionMapComponent)
