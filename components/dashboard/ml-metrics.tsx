'use client'

import { useState } from 'react'
import { Brain, Target, Activity, Zap, Clock, CheckCircle, XCircle, Info, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { MLModelMetrics } from '@/lib/types'

interface MLMetricsCardProps {
  metrics: MLModelMetrics
}

const metricDescriptions = {
  accuracy: 'Pourcentage de prédictions correctes sur l\'ensemble des données',
  recall: 'Capacité à identifier toutes les fraudes réelles (Sensibilité)',
  precision: 'Pourcentage de fraudes prédites qui sont réellement des fraudes',
  f1Score: 'Moyenne harmonique de la précision et du rappel'
}

export function MLMetricsCard({ metrics }: MLMetricsCardProps) {
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null)
  
  const formatPercentage = (value: number) => `${(value * 100).toFixed(1)}%`

  const getMetricStatus = (value: number) => {
    if (value >= 0.95) return { label: 'Excellent', color: 'text-success' }
    if (value >= 0.90) return { label: 'Très bon', color: 'text-success' }
    if (value >= 0.85) return { label: 'Bon', color: 'text-info' }
    if (value >= 0.80) return { label: 'Acceptable', color: 'text-warning' }
    return { label: 'À améliorer', color: 'text-danger' }
  }

  const metricsData = [
    { key: 'accuracy', label: 'Précision', value: metrics.accuracy, icon: Target, color: 'text-success', bgColor: 'bg-success' },
    { key: 'recall', label: 'Rappel', value: metrics.recall, icon: Activity, color: 'text-info', bgColor: 'bg-info' },
    { key: 'precision', label: 'Précision (Prec.)', value: metrics.precision, icon: Zap, color: 'text-warning', bgColor: 'bg-warning' },
    { key: 'f1Score', label: 'Score F1', value: metrics.f1Score, icon: Target, color: 'text-primary', bgColor: 'bg-primary' }
  ]
  
  return (
    <TooltipProvider>
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-primary/10">
                <Brain className="h-5 w-5 text-primary" />
              </div>
              <CardTitle className="text-base sm:text-lg font-semibold">Performance ML</CardTitle>
            </div>
            <Badge variant="outline" className="text-xs text-success">
              <TrendingUp className="mr-1 h-3 w-3" />
              Actif
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:gap-4 grid-cols-2">
            {metricsData.map((metric) => {
              const Icon = metric.icon
              const status = getMetricStatus(metric.value)
              
              return (
                <Tooltip key={metric.key}>
                  <TooltipTrigger asChild>
                    <div 
                      className="space-y-2 p-2 sm:p-3 rounded-lg bg-secondary/30 cursor-pointer transition-all hover:bg-secondary/50 hover:shadow-md active:scale-[0.98]"
                      onClick={() => setSelectedMetric(metric.key)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <Icon className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${metric.color}`} />
                          <span className="text-xs sm:text-sm">{metric.label}</span>
                        </div>
                        <span className="font-mono text-xs sm:text-sm font-medium">{formatPercentage(metric.value)}</span>
                      </div>
                      <div className="h-1.5 sm:h-2 w-full overflow-hidden rounded-full bg-secondary">
                        <div 
                          className={`h-full rounded-full transition-all duration-1000 ${metric.bgColor}`}
                          style={{ width: `${metric.value * 100}%` }}
                        />
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p className="max-w-[200px] text-xs">{metricDescriptions[metric.key as keyof typeof metricDescriptions]}</p>
                  </TooltipContent>
                </Tooltip>
              )
            })}
          </div>
          
          <div className="border-t border-border pt-3 sm:pt-4">
            <div className="grid gap-2 sm:gap-3 grid-cols-3">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 rounded-lg bg-secondary p-2 cursor-pointer hover:bg-secondary/80 transition-colors">
                    <Activity className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
                    <div className="text-center sm:text-left">
                      <p className="text-[10px] sm:text-xs text-muted-foreground">Total</p>
                      <p className="font-mono text-xs sm:text-sm font-medium">{metrics.totalPredictions.toLocaleString('fr-FR')}</p>
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent>Nombre total de prédictions effectuées</TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 rounded-lg bg-success/10 p-2 cursor-pointer hover:bg-success/20 transition-colors">
                    <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-success" />
                    <div className="text-center sm:text-left">
                      <p className="text-[10px] sm:text-xs text-muted-foreground">VP</p>
                      <p className="font-mono text-xs sm:text-sm font-medium">{metrics.truePositives.toLocaleString('fr-FR')}</p>
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent>Vrais Positifs - Fraudes correctement identifiées</TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 rounded-lg bg-danger/10 p-2 cursor-pointer hover:bg-danger/20 transition-colors">
                    <XCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-danger" />
                    <div className="text-center sm:text-left">
                      <p className="text-[10px] sm:text-xs text-muted-foreground">FP</p>
                      <p className="font-mono text-xs sm:text-sm font-medium">{metrics.falsePositives.toLocaleString('fr-FR')}</p>
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent>Faux Positifs - Transactions légitimes marquées comme fraude</TooltipContent>
              </Tooltip>
            </div>
          </div>
          
          <div className="flex items-center justify-between text-[10px] sm:text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Clock className="h-3 w-3" />
              <span>MAJ: {metrics.lastUpdated.toLocaleTimeString('fr-FR')}</span>
            </div>
            <Badge variant="outline" className={`text-[10px] ${getMetricStatus(metrics.f1Score).color}`}>
              {getMetricStatus(metrics.f1Score).label}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Metric Detail Dialog */}
      <Dialog open={!!selectedMetric} onOpenChange={() => setSelectedMetric(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Info className="h-5 w-5 text-primary" />
              {metricsData.find(m => m.key === selectedMetric)?.label}
            </DialogTitle>
            <DialogDescription>
              Détails de la métrique
            </DialogDescription>
          </DialogHeader>
          {selectedMetric && (
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-4xl font-bold text-primary">
                  {formatPercentage(metricsData.find(m => m.key === selectedMetric)?.value || 0)}
                </p>
                <Badge className={`mt-2 ${getMetricStatus(metricsData.find(m => m.key === selectedMetric)?.value || 0).color}`}>
                  {getMetricStatus(metricsData.find(m => m.key === selectedMetric)?.value || 0).label}
                </Badge>
              </div>
              
              <div className="rounded-lg bg-secondary p-4">
                <p className="text-sm">
                  {metricDescriptions[selectedMetric as keyof typeof metricDescriptions]}
                </p>
              </div>
              
              <div className="rounded-lg border border-border p-3">
                <p className="text-xs text-muted-foreground mb-2">Formule:</p>
                <p className="font-mono text-sm">
                  {selectedMetric === 'accuracy' && 'Accuracy = (VP + VN) / Total'}
                  {selectedMetric === 'recall' && 'Recall = VP / (VP + FN)'}
                  {selectedMetric === 'precision' && 'Precision = VP / (VP + FP)'}
                  {selectedMetric === 'f1Score' && 'F1 = 2 × (Prec × Recall) / (Prec + Recall)'}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  )
}
