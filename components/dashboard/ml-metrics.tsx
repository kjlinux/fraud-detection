'use client'

import { Brain, Target, Activity, Zap, Clock, CheckCircle, XCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import type { MLModelMetrics } from '@/lib/types'

interface MLMetricsCardProps {
  metrics: MLModelMetrics
}

export function MLMetricsCard({ metrics }: MLMetricsCardProps) {
  const formatPercentage = (value: number) => `${(value * 100).toFixed(1)}%`
  
  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg font-semibold">Performance du Modèle ML</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-1.5">
                <Target className="h-4 w-4 text-success" />
                <span>Précision</span>
              </div>
              <span className="font-mono font-medium">{formatPercentage(metrics.accuracy)}</span>
            </div>
            <Progress value={metrics.accuracy * 100} className="h-2" />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-1.5">
                <Activity className="h-4 w-4 text-info" />
                <span>Rappel</span>
              </div>
              <span className="font-mono font-medium">{formatPercentage(metrics.recall)}</span>
            </div>
            <Progress value={metrics.recall * 100} className="h-2" />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-1.5">
                <Zap className="h-4 w-4 text-warning" />
                <span>Précision (Prec.)</span>
              </div>
              <span className="font-mono font-medium">{formatPercentage(metrics.precision)}</span>
            </div>
            <Progress value={metrics.precision * 100} className="h-2" />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-1.5">
                <Target className="h-4 w-4 text-primary" />
                <span>Score F1</span>
              </div>
              <span className="font-mono font-medium">{formatPercentage(metrics.f1Score)}</span>
            </div>
            <Progress value={metrics.f1Score * 100} className="h-2" />
          </div>
        </div>
        
        <div className="border-t border-border pt-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="flex items-center gap-2 rounded-lg bg-secondary p-2">
              <Activity className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Total Prédictions</p>
                <p className="font-mono text-sm font-medium">{metrics.totalPredictions.toLocaleString('fr-FR')}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-success/10 p-2">
              <CheckCircle className="h-4 w-4 text-success" />
              <div>
                <p className="text-xs text-muted-foreground">Vrais Positifs</p>
                <p className="font-mono text-sm font-medium">{metrics.truePositives.toLocaleString('fr-FR')}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-danger/10 p-2">
              <XCircle className="h-4 w-4 text-danger" />
              <div>
                <p className="text-xs text-muted-foreground">Faux Positifs</p>
                <p className="font-mono text-sm font-medium">{metrics.falsePositives.toLocaleString('fr-FR')}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>Dernière mise à jour: {metrics.lastUpdated.toLocaleTimeString('fr-FR')}</span>
        </div>
      </CardContent>
    </Card>
  )
}
