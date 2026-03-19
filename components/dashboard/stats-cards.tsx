'use client'

import { TrendingUp, TrendingDown, Activity, AlertTriangle, ShieldCheck, DollarSign, BarChart3, Target } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import type { DashboardStats } from '@/lib/types'
import { formatCurrency } from '@/lib/fraud-simulation'

interface StatsCardsProps {
  stats: DashboardStats
}

export function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      title: 'Transactions Totales',
      value: stats.totalTransactions.toLocaleString('fr-FR'),
      change: '+12.5%',
      trend: 'up' as const,
      icon: Activity,
      color: 'text-info',
      bgColor: 'bg-info/10'
    },
    {
      title: 'Volume Total',
      value: `${formatCurrency(stats.totalVolume)} XOF`,
      change: '+8.2%',
      trend: 'up' as const,
      icon: DollarSign,
      color: 'text-success',
      bgColor: 'bg-success/10'
    },
    {
      title: 'Transactions Signalées',
      value: stats.flaggedTransactions.toLocaleString('fr-FR'),
      change: '-3.1%',
      trend: 'down' as const,
      icon: AlertTriangle,
      color: 'text-warning',
      bgColor: 'bg-warning/10'
    },
    {
      title: 'Transactions Bloquées',
      value: stats.blockedTransactions.toLocaleString('fr-FR'),
      change: '+2.4%',
      trend: 'up' as const,
      icon: ShieldCheck,
      color: 'text-danger',
      bgColor: 'bg-danger/10'
    },
    {
      title: 'Score de Risque Moyen',
      value: `${stats.averageRiskScore.toFixed(1)}%`,
      change: '-1.8%',
      trend: 'down' as const,
      icon: BarChart3,
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    },
    {
      title: 'Taux de Détection',
      value: `${stats.fraudDetectionRate.toFixed(1)}%`,
      change: '+0.5%',
      trend: 'up' as const,
      icon: Target,
      color: 'text-success',
      bgColor: 'bg-success/10'
    }
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {cards.map((card) => (
        <Card key={card.title} className="border-border bg-card">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className={`rounded-lg p-2 ${card.bgColor}`}>
                <card.icon className={`h-4 w-4 ${card.color}`} />
              </div>
              <div className={`flex items-center gap-1 text-xs ${
                card.trend === 'up' ? 'text-success' : 'text-danger'
              }`}>
                {card.trend === 'up' ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                {card.change}
              </div>
            </div>
            <div className="mt-3">
              <p className="text-xs text-muted-foreground">{card.title}</p>
              <p className="mt-1 text-lg font-semibold tracking-tight">{card.value}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
