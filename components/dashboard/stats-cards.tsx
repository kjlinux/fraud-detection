'use client'

import { useState } from 'react'
import { TrendingUp, TrendingDown, Activity, AlertTriangle, ShieldCheck, DollarSign, BarChart3, Target, Info } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import type { DashboardStats } from '@/lib/types'
import { formatCurrency } from '@/lib/fraud-simulation'

interface StatsCardsProps {
  stats: DashboardStats
}

interface CardDetail {
  title: string
  description: string
  details: string[]
  value: string
  trend: string
}

export function StatsCards({ stats }: StatsCardsProps) {
  const [selectedCard, setSelectedCard] = useState<CardDetail | null>(null)

  const cards = [
    {
      title: 'Transactions Totales',
      value: stats.totalTransactions.toLocaleString('fr-FR'),
      change: '+12.5%',
      trend: 'up' as const,
      icon: Activity,
      color: 'text-info',
      bgColor: 'bg-info/10',
      hoverBg: 'hover:bg-info/5',
      borderHover: 'hover:border-info/50',
      description: 'Nombre total de transactions traitées',
      details: [
        'Transactions aujourd\'hui: ' + stats.totalTransactions,
        'Moyenne horaire: ' + Math.round(stats.totalTransactions / 24),
        'Pic d\'activité: 14h-16h'
      ],
      progressValue: 75
    },
    {
      title: 'Volume Total',
      value: `${formatCurrency(stats.totalVolume)} XOF`,
      change: '+8.2%',
      trend: 'up' as const,
      icon: DollarSign,
      color: 'text-success',
      bgColor: 'bg-success/10',
      hoverBg: 'hover:bg-success/5',
      borderHover: 'hover:border-success/50',
      description: 'Volume total des transactions en XOF',
      details: [
        'Volume moyen par tx: ' + formatCurrency(stats.totalVolume / Math.max(stats.totalTransactions, 1)) + ' XOF',
        'Plus grande tx: 15,000,000 XOF',
        'Limite quotidienne: 80%'
      ],
      progressValue: 80
    },
    {
      title: 'Transactions Signalées',
      value: stats.flaggedTransactions.toLocaleString('fr-FR'),
      change: '-3.1%',
      trend: 'down' as const,
      icon: AlertTriangle,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
      hoverBg: 'hover:bg-warning/5',
      borderHover: 'hover:border-warning/50',
      description: 'Transactions nécessitant une vérification',
      details: [
        'En attente de revue: ' + Math.floor(stats.flaggedTransactions * 0.6),
        'Revues aujourd\'hui: ' + Math.floor(stats.flaggedTransactions * 0.4),
        'Taux de faux positifs: 12%'
      ],
      progressValue: 45
    },
    {
      title: 'Transactions Bloquées',
      value: stats.blockedTransactions.toLocaleString('fr-FR'),
      change: '+2.4%',
      trend: 'up' as const,
      icon: ShieldCheck,
      color: 'text-danger',
      bgColor: 'bg-danger/10',
      hoverBg: 'hover:bg-danger/5',
      borderHover: 'hover:border-danger/50',
      description: 'Transactions bloquées automatiquement',
      details: [
        'Bloquées par ML: ' + Math.floor(stats.blockedTransactions * 0.85),
        'Bloquées manuellement: ' + Math.floor(stats.blockedTransactions * 0.15),
        'Montant économisé: ' + formatCurrency(stats.blockedTransactions * 250000) + ' XOF'
      ],
      progressValue: 30
    },
    {
      title: 'Score de Risque Moyen',
      value: `${stats.averageRiskScore.toFixed(1)}%`,
      change: '-1.8%',
      trend: 'down' as const,
      icon: BarChart3,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      hoverBg: 'hover:bg-primary/5',
      borderHover: 'hover:border-primary/50',
      description: 'Score de risque moyen des transactions',
      details: [
        'Score médian: ' + (stats.averageRiskScore - 5).toFixed(1) + '%',
        'Écart-type: 15.2%',
        'Seuil d\'alerte: 60%'
      ],
      progressValue: stats.averageRiskScore
    },
    {
      title: 'Taux de Détection',
      value: `${stats.fraudDetectionRate.toFixed(1)}%`,
      change: '+0.5%',
      trend: 'up' as const,
      icon: Target,
      color: 'text-success',
      bgColor: 'bg-success/10',
      hoverBg: 'hover:bg-success/5',
      borderHover: 'hover:border-success/50',
      description: 'Efficacité du modèle de détection',
      details: [
        'Précision: 94.2%',
        'Rappel: 91.8%',
        'Score F1: 93.0%'
      ],
      progressValue: stats.fraudDetectionRate
    }
  ]

  return (
    <TooltipProvider>
      <div className="grid gap-3 sm:gap-4 grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
        {cards.map((card) => (
          <Card 
            key={card.title} 
            className={`border-border bg-card cursor-pointer transition-all duration-300 ${card.hoverBg} ${card.borderHover} hover:shadow-lg hover:shadow-black/20 hover:-translate-y-1 active:scale-95`}
            onClick={() => setSelectedCard({
              title: card.title,
              description: card.description,
              details: card.details,
              value: card.value,
              trend: card.change
            })}
          >
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-start justify-between">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className={`rounded-lg p-1.5 sm:p-2 ${card.bgColor} transition-transform hover:scale-110`}>
                      <card.icon className={`h-3 w-3 sm:h-4 sm:w-4 ${card.color}`} />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p>{card.description}</p>
                  </TooltipContent>
                </Tooltip>
                <div className={`flex items-center gap-0.5 sm:gap-1 text-[10px] sm:text-xs ${
                  card.trend === 'up' ? 'text-success' : 'text-danger'
                }`}>
                  {card.trend === 'up' ? (
                    <TrendingUp className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                  ) : (
                    <TrendingDown className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                  )}
                  <span className="font-medium">{card.change}</span>
                </div>
              </div>
              <div className="mt-2 sm:mt-3">
                <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{card.title}</p>
                <p className="mt-0.5 sm:mt-1 text-sm sm:text-lg font-semibold tracking-tight truncate">{card.value}</p>
                <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-secondary">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ${card.bgColor.replace('/10', '')}`}
                    style={{ width: `${card.progressValue}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={!!selectedCard} onOpenChange={() => setSelectedCard(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Info className="h-5 w-5 text-primary" />
              {selectedCard?.title}
            </DialogTitle>
            <DialogDescription>
              {selectedCard?.description}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">{selectedCard?.value}</p>
              <p className="text-sm text-muted-foreground">Variation: {selectedCard?.trend}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Détails:</p>
              <ul className="space-y-1">
                {selectedCard?.details.map((detail, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    {detail}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  )
}
