'use client'

import { AlertTriangle, AlertCircle, Info, CheckCircle, X, Bell } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
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
    borderColor: 'border-info/30'
  },
  medium: { 
    icon: AlertCircle, 
    color: 'text-warning', 
    bgColor: 'bg-warning/10',
    label: 'Moyen',
    borderColor: 'border-warning/30'
  },
  high: { 
    icon: AlertTriangle, 
    color: 'text-danger', 
    bgColor: 'bg-danger/10',
    label: 'Élevé',
    borderColor: 'border-danger/30'
  },
  critical: { 
    icon: AlertTriangle, 
    color: 'text-danger', 
    bgColor: 'bg-danger/20',
    label: 'Critique',
    borderColor: 'border-danger/50'
  }
}

const typeLabels = {
  high_risk: 'Risque Élevé',
  velocity: 'Vélocité',
  location_anomaly: 'Anomalie Loc.',
  amount_anomaly: 'Montant Anormal',
  pattern_match: 'Pattern Fraude'
}

export function AlertsPanel({ alerts, onAcknowledge }: AlertsPanelProps) {
  const unacknowledgedAlerts = alerts.filter(a => !a.acknowledged)
  const criticalCount = unacknowledgedAlerts.filter(a => a.severity === 'critical').length
  const highCount = unacknowledgedAlerts.filter(a => a.severity === 'high').length

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg font-semibold">Alertes en Temps Réel</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            {criticalCount > 0 && (
              <Badge className="bg-danger text-danger-foreground">
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
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[400px]">
          <div className="space-y-2 p-4 pt-0">
            {unacknowledgedAlerts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <CheckCircle className="mb-2 h-8 w-8 text-success" />
                <p>Aucune alerte active</p>
              </div>
            ) : (
              unacknowledgedAlerts.map((alert) => {
                const config = severityConfig[alert.severity]
                const Icon = config.icon
                
                return (
                  <div
                    key={alert.id}
                    className={`group relative rounded-lg border p-3 transition-all ${config.borderColor} ${config.bgColor} ${
                      alert.severity === 'critical' ? 'animate-pulse' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`mt-0.5 rounded-lg p-1.5 ${config.bgColor}`}>
                        <Icon className={`h-4 w-4 ${config.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {typeLabels[alert.type]}
                          </Badge>
                          <Badge className={`text-xs ${config.bgColor} ${config.color} border-0`}>
                            {config.label}
                          </Badge>
                        </div>
                        <p className="mt-1 text-sm font-medium">{alert.message}</p>
                        <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{alert.transactionId}</span>
                          <span>•</span>
                          <span>{alert.timestamp.toLocaleTimeString('fr-FR')}</span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
                        onClick={() => onAcknowledge(alert.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
