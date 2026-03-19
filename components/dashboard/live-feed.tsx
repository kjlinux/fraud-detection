'use client'

import { useState } from 'react'
import { Radio, ArrowRight, Eye, Pause, Play } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
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
  const [isPaused, setIsPaused] = useState(false)
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null)
  
  const recentTransactions = isPaused 
    ? transactions.slice(0, 15)
    : transactions.slice(0, 15)

  return (
    <TooltipProvider>
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Radio className={`h-5 w-5 ${isPaused ? 'text-muted-foreground' : 'text-primary'}`} />
                {!isPaused && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75"></span>
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-success"></span>
                  </span>
                )}
              </div>
              <CardTitle className="text-lg font-semibold">Flux en Direct</CardTitle>
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8"
                  onClick={() => setIsPaused(!isPaused)}
                >
                  {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {isPaused ? 'Reprendre' : 'Mettre en pause'}
              </TooltipContent>
            </Tooltip>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[280px] sm:h-[320px]">
            <div className="space-y-1 p-3 sm:p-4 pt-0">
              {recentTransactions.map((tx, index) => {
                const status = statusConfig[tx.status]
                const isNew = index === 0 && !isPaused
                
                return (
                  <div
                    key={tx.id}
                    className={`group flex items-center justify-between rounded-lg border p-2 text-sm transition-all cursor-pointer hover:bg-secondary/50 active:scale-[0.98] ${
                      isNew ? 'animate-pulse border-primary/50 bg-primary/5' : 'border-border'
                    } ${tx.status === 'blocked' ? 'border-danger/30 hover:border-danger/50' : tx.status === 'flagged' ? 'border-warning/30 hover:border-warning/50' : 'hover:border-primary/30'}`}
                    onClick={() => setSelectedTx(tx)}
                  >
                    <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
                      <Badge variant="outline" className={`shrink-0 text-[10px] sm:text-xs ${status.className}`}>
                        {status.label}
                      </Badge>
                      <div className="flex items-center gap-1 truncate text-[10px] sm:text-xs text-muted-foreground">
                        <span className="truncate max-w-[50px] sm:max-w-none">{tx.sender.region}</span>
                        <ArrowRight className="h-2.5 w-2.5 sm:h-3 sm:w-3 shrink-0" />
                        <span className="truncate max-w-[50px] sm:max-w-none">{tx.recipient.region}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                      <span className="font-mono text-[10px] sm:text-xs">
                        {formatCurrency(tx.amount)}
                      </span>
                      <span className="text-[10px] sm:text-xs text-muted-foreground hidden sm:inline">
                        {tx.timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                      <Eye className="h-3.5 w-3.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                    </div>
                  </div>
                )
              })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Quick View Dialog */}
      <Dialog open={!!selectedTx} onOpenChange={() => setSelectedTx(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Aperçu Transaction</DialogTitle>
            <DialogDescription>
              {selectedTx?.id}
            </DialogDescription>
          </DialogHeader>
          {selectedTx && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className={statusConfig[selectedTx.status].className}>
                  {statusConfig[selectedTx.status].label}
                </Badge>
                <span className="font-mono text-lg font-bold">
                  {formatCurrency(selectedTx.amount)} XOF
                </span>
              </div>
              <div className="grid gap-2 grid-cols-2 text-sm">
                <div className="rounded-lg bg-secondary p-2">
                  <p className="text-xs text-muted-foreground">Expéditeur</p>
                  <p className="font-medium truncate">{selectedTx.sender.name}</p>
                  <p className="text-xs text-muted-foreground">{selectedTx.sender.region}</p>
                </div>
                <div className="rounded-lg bg-secondary p-2">
                  <p className="text-xs text-muted-foreground">Bénéficiaire</p>
                  <p className="font-medium truncate">{selectedTx.recipient.name}</p>
                  <p className="text-xs text-muted-foreground">{selectedTx.recipient.region}</p>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Score de risque:</span>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-16 rounded-full bg-gradient-to-r from-success via-warning to-danger overflow-hidden">
                    <div 
                      className="h-full bg-background/80"
                      style={{ marginLeft: `${selectedTx.riskScore}%`, width: `${100 - selectedTx.riskScore}%` }}
                    />
                  </div>
                  <span className="font-mono">{selectedTx.riskScore.toFixed(0)}%</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                {selectedTx.timestamp.toLocaleString('fr-FR')}
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  )
}
