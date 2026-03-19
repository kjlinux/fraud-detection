'use client'

import { useState } from 'react'
import { AlertTriangle, AlertCircle, Info, CheckCircle, X, Bell, Filter, ChevronDown, Eye, CheckCheck } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import type { Alert } from '@/lib/types'

interface AlertsPanelProps {
  alerts: Alert[]
  onAcknowledge: (alertId: string) => void
}

const severityConfig = {
  low: { 
    icon: Info, 
    color: 'text-info', 
    bgColor: 'bg-info/10',
    label: 'Faible',
    borderColor: 'border-info/30',
    priority: 1
  },
  medium: { 
    icon: AlertCircle, 
    color: 'text-warning', 
    bgColor: 'bg-warning/10',
    label: 'Moyen',
    borderColor: 'border-warning/30',
    priority: 2
  },
  high: { 
    icon: AlertTriangle, 
    color: 'text-danger', 
    bgColor: 'bg-danger/10',
    label: 'Élevé',
    borderColor: 'border-danger/30',
    priority: 3
  },
  critical: { 
    icon: AlertTriangle, 
    color: 'text-danger', 
    bgColor: 'bg-danger/20',
    label: 'Critique',
    borderColor: 'border-danger/50',
    priority: 4
  }
}

const typeLabels = {
  high_risk: 'Risque Élevé',
  velocity: 'Vélocité',
  location_anomaly: 'Anomalie Loc.',
  amount_anomaly: 'Montant Anormal',
  pattern_match: 'Pattern Fraude'
}

const typeDescriptions = {
  high_risk: 'Score de risque supérieur au seuil critique',
  velocity: 'Fréquence anormale de transactions',
  location_anomaly: 'Transaction depuis une localisation inhabituelle',
  amount_anomaly: 'Montant significativement différent du comportement habituel',
  pattern_match: 'Correspond à un pattern de fraude connu'
}

export function AlertsPanel({ alerts, onAcknowledge }: AlertsPanelProps) {
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null)
  const [severityFilter, setSeverityFilter] = useState<Set<string>>(new Set(['critical', 'high', 'medium', 'low']))
  
  const unacknowledgedAlerts = alerts
    .filter(a => !a.acknowledged && severityFilter.has(a.severity))
    .sort((a, b) => severityConfig[b.severity].priority - severityConfig[a.severity].priority)
  
  const criticalCount = alerts.filter(a => !a.acknowledged && a.severity === 'critical').length
  const highCount = alerts.filter(a => !a.acknowledged && a.severity === 'high').length
  const totalUnack = alerts.filter(a => !a.acknowledged).length

  const toggleSeverity = (severity: string) => {
    const newFilter = new Set(severityFilter)
    if (newFilter.has(severity)) {
      newFilter.delete(severity)
    } else {
      newFilter.add(severity)
    }
    setSeverityFilter(newFilter)
  }

  const acknowledgeAll = () => {
    unacknowledgedAlerts.forEach(alert => onAcknowledge(alert.id))
  }

  return (
    <>
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Bell className="h-5 w-5 text-primary" />
                {totalUnack > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-danger opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-danger"></span>
                  </span>
                )}
              </div>
              <CardTitle className="text-lg font-semibold">Alertes en Temps Réel</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              {criticalCount > 0 && (
                <Badge className="bg-danger text-danger-foreground animate-pulse">
                  {criticalCount} Critique{criticalCount > 1 ? 's' : ''}
                </Badge>
              )}
              {highCount > 0 && (
                <Badge className="bg-warning text-warning-foreground">
                  {highCount} Élevé{highCount > 1 ? 's' : ''}
                </Badge>
              )}
            </div>
          </div>
          
          {/* Filter and bulk actions */}
          <div className="mt-3 flex items-center justify-between">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Filter className="h-4 w-4" />
                  <span className="hidden sm:inline">Filtrer</span>
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuLabel>Filtrer par sévérité</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {Object.entries(severityConfig).map(([key, config]) => (
                  <DropdownMenuCheckboxItem
                    key={key}
                    checked={severityFilter.has(key)}
                    onCheckedChange={() => toggleSeverity(key)}
                  >
                    <span className={config.color}>{config.label}</span>
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            
            {unacknowledgedAlerts.length > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="gap-2 text-muted-foreground hover:text-foreground"
                onClick={acknowledgeAll}
              >
                <CheckCheck className="h-4 w-4" />
                <span className="hidden sm:inline">Tout acquitter</span>
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[350px] sm:h-[400px]">
            <div className="space-y-2 p-4 pt-0">
              {unacknowledgedAlerts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                  <div className="rounded-full bg-success/10 p-4 mb-3">
                    <CheckCircle className="h-8 w-8 text-success" />
                  </div>
                  <p className="font-medium">Aucune alerte active</p>
                  <p className="text-sm text-center mt-1">Toutes les alertes ont été traitées</p>
                </div>
              ) : (
                unacknowledgedAlerts.map((alert, index) => {
                  const config = severityConfig[alert.severity]
                  const Icon = config.icon
                  
                  return (
                    <div
                      key={alert.id}
                      className={`group relative rounded-lg border p-3 transition-all duration-300 cursor-pointer ${config.borderColor} ${config.bgColor} hover:shadow-lg hover:shadow-black/10 active:scale-[0.98] ${
                        alert.severity === 'critical' ? 'animate-pulse' : ''
                      }`}
                      style={{ animationDelay: `${index * 100}ms` }}
                      onClick={() => setSelectedAlert(alert)}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`mt-0.5 rounded-lg p-1.5 ${config.bgColor} transition-transform group-hover:scale-110`}>
                          <Icon className={`h-4 w-4 ${config.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                            <Badge variant="outline" className="text-[10px] sm:text-xs">
                              {typeLabels[alert.type]}
                            </Badge>
                            <Badge className={`text-[10px] sm:text-xs ${config.bgColor} ${config.color} border-0`}>
                              {config.label}
                            </Badge>
                          </div>
                          <p className="mt-1 text-sm font-medium line-clamp-2">{alert.message}</p>
                          <div className="mt-1 flex flex-wrap items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-muted-foreground">
                            <span className="font-mono">{alert.transactionId.slice(0, 12)}...</span>
                            <span className="hidden sm:inline">•</span>
                            <span>{alert.timestamp.toLocaleTimeString('fr-FR')}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 opacity-0 transition-opacity group-hover:opacity-100"
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedAlert(alert)
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 opacity-0 transition-opacity group-hover:opacity-100"
                            onClick={(e) => {
                              e.stopPropagation()
                              onAcknowledge(alert.id)
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Alert Detail Dialog */}
      <Dialog open={!!selectedAlert} onOpenChange={() => setSelectedAlert(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedAlert && (
                <>
                  {(() => {
                    const Icon = severityConfig[selectedAlert.severity].icon
                    return <Icon className={`h-5 w-5 ${severityConfig[selectedAlert.severity].color}`} />
                  })()}
                  Détails de l&apos;Alerte
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {selectedAlert?.timestamp.toLocaleString('fr-FR')}
            </DialogDescription>
          </DialogHeader>
          
          {selectedAlert && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">{typeLabels[selectedAlert.type]}</Badge>
                <Badge className={`${severityConfig[selectedAlert.severity].bgColor} ${severityConfig[selectedAlert.severity].color} border-0`}>
                  {severityConfig[selectedAlert.severity].label}
                </Badge>
              </div>
              
              <div className="rounded-lg bg-secondary p-4">
                <p className="font-medium">{selectedAlert.message}</p>
              </div>
              
              <div className="grid gap-3 grid-cols-2">
                <div className="rounded-lg bg-secondary/50 p-3">
                  <p className="text-xs text-muted-foreground">ID Transaction</p>
                  <p className="font-mono text-sm truncate">{selectedAlert.transactionId}</p>
                </div>
                <div className="rounded-lg bg-secondary/50 p-3">
                  <p className="text-xs text-muted-foreground">Type d&apos;alerte</p>
                  <p className="text-sm">{typeLabels[selectedAlert.type]}</p>
                </div>
              </div>
              
              <div className="rounded-lg border border-border p-3">
                <p className="text-xs text-muted-foreground mb-1">Description</p>
                <p className="text-sm">{typeDescriptions[selectedAlert.type]}</p>
              </div>
              
              <div className="rounded-lg bg-warning/10 border border-warning/30 p-3">
                <p className="text-sm text-warning font-medium">Actions recommandées:</p>
                <ul className="mt-2 space-y-1 text-sm">
                  <li>• Vérifier l&apos;identité du client</li>
                  <li>• Examiner l&apos;historique des transactions</li>
                  <li>• Contacter le client si nécessaire</li>
                </ul>
              </div>
            </div>
          )}
          
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setSelectedAlert(null)} className="w-full sm:w-auto">
              Fermer
            </Button>
            <Button 
              onClick={() => {
                if (selectedAlert) {
                  onAcknowledge(selectedAlert.id)
                  setSelectedAlert(null)
                }
              }}
              className="w-full sm:w-auto gap-2"
            >
              <CheckCircle className="h-4 w-4" />
              Acquitter l&apos;alerte
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
