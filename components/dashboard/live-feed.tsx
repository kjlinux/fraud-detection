'use client'

import { Radio, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import type { Transaction } from '@/lib/types'
import { formatCurrency } from '@/lib/fraud-simulation'

interface LiveFeedProps {
  transactions: Transaction[]
}

const statusConfig = {
  completed: { label: 'OK', className: 'bg-success/20 text-success' },
  pending: { label: 'En cours', className: 'bg-info/20 text-info' },
  flagged: { label: 'Signalé', className: 'bg-warning/20 text-warning' },
  blocked: { label: 'Bloqué', className: 'bg-danger/20 text-danger' }
}

export function LiveFeed({ transactions }: LiveFeedProps) {
  const recentTransactions = transactions.slice(0, 15)

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Radio className="h-5 w-5 text-primary" />
            <span className="absolute -right-0.5 -top-0.5 flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-success"></span>
            </span>
          </div>
          <CardTitle className="text-lg font-semibold">Flux en Direct</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[320px]">
          <div className="space-y-1 p-4 pt-0">
            {recentTransactions.map((tx, index) => {
              const status = statusConfig[tx.status]
              const isNew = index === 0
              
              return (
                <div
                  key={tx.id}
                  className={`flex items-center justify-between rounded-lg border p-2 text-sm transition-all ${
                    isNew ? 'animate-pulse border-primary/50 bg-primary/5' : 'border-border'
                  } ${tx.status === 'blocked' ? 'border-danger/30' : tx.status === 'flagged' ? 'border-warning/30' : ''}`}
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <Badge variant="outline" className={`shrink-0 text-xs ${status.className}`}>
                      {status.label}
                    </Badge>
                    <div className="flex items-center gap-1 truncate text-xs text-muted-foreground">
                      <span className="truncate">{tx.sender.region}</span>
                      <ArrowRight className="h-3 w-3 shrink-0" />
                      <span className="truncate">{tx.recipient.region}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-mono text-xs">
                      {formatCurrency(tx.amount)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {tx.timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
