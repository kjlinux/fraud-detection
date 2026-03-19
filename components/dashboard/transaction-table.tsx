'use client'

import { useState } from 'react'
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  Smartphone, 
  Globe, 
  CreditCard,
  Store,
  Users,
  ChevronDown,
  ChevronUp,
  Eye
} from 'lucide-react'
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
  DialogTrigger,
} from '@/components/ui/dialog'
import type { Transaction } from '@/lib/types'
import { formatCurrency } from '@/lib/fraud-simulation'

interface TransactionTableProps {
  transactions: Transaction[]
}

const channelIcons = {
  mobile: Smartphone,
  web: Globe,
  atm: CreditCard,
  pos: Store,
  agent: Users
}

const statusConfig = {
  completed: { label: 'Complété', variant: 'default' as const, className: 'bg-success/20 text-success border-success/30' },
  pending: { label: 'En cours', variant: 'secondary' as const, className: 'bg-info/20 text-info border-info/30' },
  flagged: { label: 'Signalé', variant: 'outline' as const, className: 'bg-warning/20 text-warning border-warning/30' },
  blocked: { label: 'Bloqué', variant: 'destructive' as const, className: 'bg-danger/20 text-danger border-danger/30' }
}

const typeLabels = {
  transfer: 'Virement',
  withdrawal: 'Retrait',
  deposit: 'Dépôt',
  payment: 'Paiement',
  mobile_money: 'Mobile Money'
}

function TransactionDetails({ transaction }: { transaction: Transaction }) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">Expéditeur</h4>
          <div className="rounded-lg bg-secondary p-3">
            <p className="font-medium">{transaction.sender.name}</p>
            <p className="text-sm text-muted-foreground">{transaction.sender.id}</p>
            <p className="text-sm text-muted-foreground">{transaction.sender.region}</p>
            <Badge variant="outline" className="mt-2">
              {transaction.sender.accountType === 'individual' ? 'Particulier' : 'Entreprise'}
            </Badge>
          </div>
        </div>
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">Bénéficiaire</h4>
          <div className="rounded-lg bg-secondary p-3">
            <p className="font-medium">{transaction.recipient.name}</p>
            <p className="text-sm text-muted-foreground">{transaction.recipient.id}</p>
            <p className="text-sm text-muted-foreground">{transaction.recipient.region}</p>
            <Badge variant="outline" className="mt-2">
              {transaction.recipient.accountType === 'individual' ? 'Particulier' : 'Entreprise'}
            </Badge>
          </div>
        </div>
      </div>
      
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-muted-foreground">Analyse ML</h4>
        <div className="rounded-lg bg-secondary p-3">
          <div className="flex items-center justify-between">
            <span>Prédiction de fraude:</span>
            <Badge className={transaction.mlPrediction.isFraud ? 'bg-danger' : 'bg-success'}>
              {transaction.mlPrediction.isFraud ? 'Suspect' : 'Légitime'}
            </Badge>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span>Confiance:</span>
            <span className="font-mono">{(transaction.mlPrediction.confidence * 100).toFixed(1)}%</span>
          </div>
          <div className="mt-3">
            <p className="text-sm text-muted-foreground">Facteurs de risque:</p>
            <ul className="mt-1 space-y-1">
              {transaction.mlPrediction.factors.map((factor, i) => (
                <li key={i} className="text-sm">• {factor}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-muted-foreground">Métadonnées</h4>
        <div className="grid gap-2 rounded-lg bg-secondary p-3 text-sm md:grid-cols-2">
          <div><span className="text-muted-foreground">Canal:</span> {transaction.metadata.channel}</div>
          <div><span className="text-muted-foreground">Appareil:</span> {transaction.metadata.deviceId}</div>
          <div><span className="text-muted-foreground">IP:</span> {transaction.metadata.ipAddress}</div>
          <div><span className="text-muted-foreground">Agent:</span> {transaction.metadata.userAgent}</div>
        </div>
      </div>
    </div>
  )
}

export function TransactionTable({ transactions }: TransactionTableProps) {
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [sortBy, setSortBy] = useState<'timestamp' | 'amount' | 'riskScore'>('timestamp')
  
  const sortedTransactions = [...transactions].sort((a, b) => {
    const multiplier = sortOrder === 'asc' ? 1 : -1
    if (sortBy === 'timestamp') {
      return multiplier * (a.timestamp.getTime() - b.timestamp.getTime())
    }
    if (sortBy === 'amount') {
      return multiplier * (a.amount - b.amount)
    }
    return multiplier * (a.riskScore - b.riskScore)
  })

  const toggleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('desc')
    }
  }

  const SortIcon = sortOrder === 'asc' ? ChevronUp : ChevronDown

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Transactions Récentes</CardTitle>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => toggleSort('timestamp')}
              className={sortBy === 'timestamp' ? 'text-primary' : ''}
            >
              Temps {sortBy === 'timestamp' && <SortIcon className="ml-1 h-3 w-3" />}
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => toggleSort('amount')}
              className={sortBy === 'amount' ? 'text-primary' : ''}
            >
              Montant {sortBy === 'amount' && <SortIcon className="ml-1 h-3 w-3" />}
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => toggleSort('riskScore')}
              className={sortBy === 'riskScore' ? 'text-primary' : ''}
            >
              Risque {sortBy === 'riskScore' && <SortIcon className="ml-1 h-3 w-3" />}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[400px]">
          <div className="space-y-1 p-4 pt-0">
            {sortedTransactions.map((transaction) => {
              const ChannelIcon = channelIcons[transaction.metadata.channel]
              const status = statusConfig[transaction.status]
              
              return (
                <div
                  key={transaction.id}
                  className={`group flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-secondary/50 ${
                    transaction.status === 'blocked' ? 'border-danger/30 bg-danger/5' :
                    transaction.status === 'flagged' ? 'border-warning/30 bg-warning/5' :
                    'border-border'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                      transaction.type === 'withdrawal' || transaction.type === 'payment' 
                        ? 'bg-danger/10' 
                        : 'bg-success/10'
                    }`}>
                      {transaction.type === 'withdrawal' || transaction.type === 'payment' ? (
                        <ArrowUpRight className="h-5 w-5 text-danger" />
                      ) : (
                        <ArrowDownRight className="h-5 w-5 text-success" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{typeLabels[transaction.type]}</span>
                        <Badge variant="outline" className={status.className}>
                          {status.label}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{transaction.sender.name}</span>
                        <span>→</span>
                        <span>{transaction.recipient.name}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="hidden items-center gap-1 text-sm text-muted-foreground md:flex">
                      <ChannelIcon className="h-4 w-4" />
                      <span>{transaction.sender.region}</span>
                    </div>
                    
                    <div className="text-right">
                      <p className="font-mono font-medium">
                        {formatCurrency(transaction.amount)} <span className="text-xs text-muted-foreground">XOF</span>
                      </p>
                      <div className="flex items-center justify-end gap-1">
                        <div 
                          className={`h-1.5 w-8 rounded-full ${
                            transaction.riskScore > 70 ? 'bg-danger' :
                            transaction.riskScore > 50 ? 'bg-warning' :
                            'bg-success'
                          }`}
                          style={{ 
                            background: `linear-gradient(to right, var(--success) 0%, var(--warning) 50%, var(--danger) 100%)`,
                            clipPath: `inset(0 ${100 - transaction.riskScore}% 0 0)`
                          }}
                        />
                        <span className="text-xs text-muted-foreground">{transaction.riskScore.toFixed(0)}%</span>
                      </div>
                    </div>
                    
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="opacity-0 transition-opacity group-hover:opacity-100"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Détails de la Transaction</DialogTitle>
                          <DialogDescription>
                            {transaction.id} • {transaction.timestamp.toLocaleString('fr-FR')}
                          </DialogDescription>
                        </DialogHeader>
                        <TransactionDetails transaction={transaction} />
                      </DialogContent>
                    </Dialog>
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
