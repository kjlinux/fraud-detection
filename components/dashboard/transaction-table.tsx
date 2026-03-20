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
  Eye,
  Filter,
  Search,
  Download,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import type { Transaction } from '@/lib/types'
import { formatCurrency } from '@/lib/fraud-simulation'

interface TransactionTableProps {
  transactions: Transaction[]
  regionFilter?: string | null
  onClearRegionFilter?: () => void
}

const channelIcons = {
  mobile: Smartphone,
  web: Globe,
  atm: CreditCard,
  pos: Store,
  agent: Users
}

const statusConfig = {
  completed: { 
    label: 'Complété', 
    icon: CheckCircle,
    className: 'bg-success/20 text-success border-success/30' 
  },
  pending: { 
    label: 'En cours', 
    icon: Clock,
    className: 'bg-info/20 text-info border-info/30' 
  },
  flagged: { 
    label: 'Signalé', 
    icon: AlertTriangle,
    className: 'bg-warning/20 text-warning border-warning/30' 
  },
  blocked: { 
    label: 'Bloqué', 
    icon: XCircle,
    className: 'bg-danger/20 text-danger border-danger/30' 
  }
}

const typeLabels = {
  transfer: 'Virement',
  withdrawal: 'Retrait',
  deposit: 'Dépôt',
  payment: 'Paiement',
  mobile_money: 'Mobile Money'
}

function exportTransactionPDF(transaction: Transaction) {
  const statusLabel = statusConfig[transaction.status].label
  const typeLabel = typeLabels[transaction.type]
  const fraudLabel = transaction.mlPrediction.isFraud ? 'Suspect' : 'Légitime'
  const senderType = transaction.sender.accountType === 'individual' ? 'Particulier' : 'Entreprise'
  const recipientType = transaction.recipient.accountType === 'individual' ? 'Particulier' : 'Entreprise'

  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <title>Transaction ${transaction.id}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, sans-serif; font-size: 12px; color: #111; padding: 32px; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; border-bottom: 2px solid #1e3a5f; padding-bottom: 16px; }
    .logo { font-size: 20px; font-weight: 700; color: #1e3a5f; }
    .logo-sub { font-size: 11px; color: #666; margin-top: 2px; }
    .title { font-size: 16px; font-weight: 700; margin-bottom: 4px; }
    .subtitle { font-size: 11px; color: #555; }
    .section { margin-bottom: 20px; }
    .section-title { font-size: 11px; font-weight: 700; text-transform: uppercase; color: #1e3a5f; letter-spacing: 0.05em; margin-bottom: 8px; border-bottom: 1px solid #e5e7eb; padding-bottom: 4px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .box { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 12px; }
    .label { font-size: 10px; color: #6b7280; margin-bottom: 2px; }
    .value { font-size: 12px; font-weight: 600; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: 600; }
    .badge-fraud { background: #fef2f2; color: #b91c1c; border: 1px solid #fca5a5; }
    .badge-legit { background: #eff6ff; color: #1d4ed8; border: 1px solid #93c5fd; }
    .badge-status { background: #eff6ff; color: #1d4ed8; border: 1px solid #93c5fd; }
    .factors { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 6px; }
    .factor { background: #f3f4f6; border: 1px solid #d1d5db; border-radius: 4px; padding: 2px 6px; font-size: 10px; }
    .progress-bar { height: 6px; background: #e5e7eb; border-radius: 3px; margin-top: 4px; }
    .progress-fill { height: 100%; background: #1e3a5f; border-radius: 3px; }
    .footer { margin-top: 32px; border-top: 1px solid #e5e7eb; padding-top: 12px; font-size: 10px; color: #9ca3af; display: flex; justify-content: space-between; }
    .amount { font-size: 22px; font-weight: 700; color: #1e3a5f; }
    @media print { body { padding: 16px; } button { display: none; } }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="logo">SecurePay CI</div>
      <div class="logo-sub">Système de Détection de Fraude</div>
    </div>
    <div style="text-align:right">
      <div class="title">Rapport de Transaction</div>
      <div class="subtitle">${transaction.id}</div>
      <div class="subtitle">${transaction.timestamp.toLocaleString('fr-FR')}</div>
    </div>
  </div>

  <div class="section">
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
      <div>
        <div class="label">Type</div>
        <div class="value">${typeLabel}</div>
      </div>
      <div style="text-align:center;">
        <div class="amount">${transaction.amount.toLocaleString('fr-FR')} XOF</div>
      </div>
      <div style="text-align:right;">
        <div class="label">Statut</div>
        <span class="badge badge-status">${statusLabel}</span>
      </div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Parties Impliquées</div>
    <div class="grid">
      <div class="box">
        <div class="label">Expéditeur</div>
        <div class="value">${transaction.sender.name}</div>
        <div style="font-size:10px; color:#6b7280; font-family:monospace; margin-top:2px;">${transaction.sender.id}</div>
        <div style="font-size:11px; margin-top:4px;">${transaction.sender.region} · ${senderType}</div>
      </div>
      <div class="box">
        <div class="label">Bénéficiaire</div>
        <div class="value">${transaction.recipient.name}</div>
        <div style="font-size:10px; color:#6b7280; font-family:monospace; margin-top:2px;">${transaction.recipient.id}</div>
        <div style="font-size:11px; margin-top:4px;">${transaction.recipient.region} · ${recipientType}</div>
      </div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Analyse ML & Risque</div>
    <div class="box">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
        <span>Prédiction de fraude :</span>
        <span class="badge ${transaction.mlPrediction.isFraud ? 'badge-fraud' : 'badge-legit'}">${fraudLabel}</span>
      </div>
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
        <span>Score de risque :</span>
        <strong>${transaction.riskScore.toFixed(0)}%</strong>
      </div>
      <div class="progress-bar"><div class="progress-fill" style="width:${transaction.riskScore}%"></div></div>
      <div style="display:flex; justify-content:space-between; align-items:center; margin-top:8px; margin-bottom:4px;">
        <span>Confiance ML :</span>
        <strong>${(transaction.mlPrediction.confidence * 100).toFixed(1)}%</strong>
      </div>
      <div class="progress-bar"><div class="progress-fill" style="width:${transaction.mlPrediction.confidence * 100}%"></div></div>
      <div style="margin-top:10px;">
        <div class="label">Facteurs de risque détectés</div>
        <div class="factors">
          ${transaction.mlPrediction.factors.map(f => `<span class="factor">${f}</span>`).join('')}
        </div>
      </div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Métadonnées Techniques</div>
    <div class="grid">
      <div class="box">
        <div class="label">Canal</div>
        <div class="value">${transaction.metadata.channel}</div>
      </div>
      <div class="box">
        <div class="label">Identifiant appareil</div>
        <div class="value" style="font-size:10px; font-family:monospace;">${transaction.metadata.deviceId}</div>
      </div>
      <div class="box">
        <div class="label">Adresse IP</div>
        <div class="value" style="font-family:monospace;">${transaction.metadata.ipAddress}</div>
      </div>
      <div class="box">
        <div class="label">User Agent</div>
        <div class="value" style="font-size:9px; word-break:break-all;">${transaction.metadata.userAgent}</div>
      </div>
    </div>
  </div>

  <div class="footer">
    <span>SecurePay CI · Système de Détection de Fraude · Conforme BCEAO</span>
    <span>Généré le ${new Date().toLocaleString('fr-FR')}</span>
  </div>

  <script>window.onload = () => { window.print(); }</script>
</body>
</html>`

  const win = window.open('', '_blank', 'width=900,height=700')
  if (win) {
    win.document.write(html)
    win.document.close()
  }
}

function TransactionDetails({ transaction }: { transaction: Transaction }) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">Expéditeur</h4>
          <div className="rounded-lg bg-secondary p-3 transition-all hover:bg-secondary/80">
            <p className="font-medium">{transaction.sender.name}</p>
            <p className="text-sm text-muted-foreground font-mono">{transaction.sender.id}</p>
            <p className="text-sm text-muted-foreground">{transaction.sender.region}</p>
            <Badge variant="outline" className="mt-2">
              {transaction.sender.accountType === 'individual' ? 'Particulier' : 'Entreprise'}
            </Badge>
          </div>
        </div>
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">Bénéficiaire</h4>
          <div className="rounded-lg bg-secondary p-3 transition-all hover:bg-secondary/80">
            <p className="font-medium">{transaction.recipient.name}</p>
            <p className="text-sm text-muted-foreground font-mono">{transaction.recipient.id}</p>
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
            <Badge className={`${transaction.mlPrediction.isFraud ? 'bg-danger' : 'bg-success'} transition-all`}>
              {transaction.mlPrediction.isFraud ? 'Suspect' : 'Légitime'}
            </Badge>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <span>Confiance:</span>
            <div className="flex items-center gap-2">
              <div className="h-2 w-24 rounded-full bg-muted overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-500"
                  style={{ width: `${transaction.mlPrediction.confidence * 100}%` }}
                />
              </div>
              <span className="font-mono text-sm">{(transaction.mlPrediction.confidence * 100).toFixed(1)}%</span>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm text-muted-foreground mb-2">Facteurs de risque:</p>
            <div className="flex flex-wrap gap-2">
              {transaction.mlPrediction.factors.map((factor, i) => (
                <Badge key={i} variant="outline" className="text-xs">
                  {factor}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-muted-foreground">Métadonnées</h4>
        <div className="grid gap-2 rounded-lg bg-secondary p-3 text-sm grid-cols-1 sm:grid-cols-2">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Canal:</span> 
            <Badge variant="outline">{transaction.metadata.channel}</Badge>
          </div>
          <div className="truncate"><span className="text-muted-foreground">Appareil:</span> {transaction.metadata.deviceId}</div>
          <div className="font-mono text-xs"><span className="text-muted-foreground">IP:</span> {transaction.metadata.ipAddress}</div>
          <div className="truncate text-xs"><span className="text-muted-foreground">Agent:</span> {transaction.metadata.userAgent}</div>
        </div>
      </div>
    </div>
  )
}

export function TransactionTable({ transactions, regionFilter, onClearRegionFilter }: TransactionTableProps) {
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [sortBy, setSortBy] = useState<'timestamp' | 'amount' | 'riskScore'>('timestamp')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<Set<string>>(new Set(['completed', 'pending', 'flagged', 'blocked']))
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  
  const filteredTransactions = transactions.filter(t => {
    if (!statusFilter.has(t.status)) return false
    if (regionFilter && t.sender.region !== regionFilter && t.recipient.region !== regionFilter) return false
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        t.sender.name.toLowerCase().includes(query) ||
        t.recipient.name.toLowerCase().includes(query) ||
        t.id.toLowerCase().includes(query) ||
        t.sender.region.toLowerCase().includes(query)
      )
    }
    return true
  })
  
  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
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

  const toggleStatus = (status: string) => {
    const newFilter = new Set(statusFilter)
    if (newFilter.has(status)) {
      newFilter.delete(status)
    } else {
      newFilter.add(status)
    }
    setStatusFilter(newFilter)
  }

  const SortIcon = sortOrder === 'asc' ? ChevronUp : ChevronDown

  return (
    <TooltipProvider>
      <Card className="border-border bg-card" data-transaction-table>
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <CardTitle className="text-lg font-semibold">Transactions Récentes</CardTitle>
              <div className="flex items-center gap-2">
                {regionFilter && (
                  <Badge
                    className="gap-1 cursor-pointer bg-primary/20 text-primary border-primary/30 hover:bg-primary/30"
                    onClick={onClearRegionFilter}
                  >
                    {regionFilter} ×
                  </Badge>
                )}
                <Badge variant="outline" className="text-xs">
                  {sortedTransactions.length} résultats
                </Badge>
              </div>
            </div>
            
            {/* Search and Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Rechercher..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 h-9 text-sm"
                />
              </div>
              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2 h-9">
                      <Filter className="h-4 w-4" />
                      <span className="hidden sm:inline">Filtrer</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Filtrer par statut</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {Object.entries(statusConfig).map(([key, config]) => (
                      <DropdownMenuCheckboxItem
                        key={key}
                        checked={statusFilter.has(key)}
                        onCheckedChange={() => toggleStatus(key)}
                      >
                        <config.icon className="mr-2 h-4 w-4" />
                        {config.label}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                
                <div className="hidden sm:flex items-center border rounded-md">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => toggleSort('timestamp')}
                        className={`h-9 px-2 rounded-none ${sortBy === 'timestamp' ? 'bg-secondary' : ''}`}
                      >
                        <Clock className="h-4 w-4" />
                        {sortBy === 'timestamp' && <SortIcon className="ml-1 h-3 w-3" />}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Trier par temps</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => toggleSort('amount')}
                        className={`h-9 px-2 rounded-none border-x ${sortBy === 'amount' ? 'bg-secondary' : ''}`}
                      >
                        XOF
                        {sortBy === 'amount' && <SortIcon className="ml-1 h-3 w-3" />}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Trier par montant</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => toggleSort('riskScore')}
                        className={`h-9 px-2 rounded-none ${sortBy === 'riskScore' ? 'bg-secondary' : ''}`}
                      >
                        <AlertTriangle className="h-4 w-4" />
                        {sortBy === 'riskScore' && <SortIcon className="ml-1 h-3 w-3" />}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Trier par risque</TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[350px] sm:h-[400px]">
            <div className="space-y-1 p-3 sm:p-4 pt-0">
              {sortedTransactions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                  <Search className="h-8 w-8 mb-2" />
                  <p>Aucune transaction trouvée</p>
                </div>
              ) : (
                sortedTransactions.map((transaction) => {
                  const ChannelIcon = channelIcons[transaction.metadata.channel]
                  const status = statusConfig[transaction.status]
                  const StatusIcon = status.icon
                  
                  return (
                    <div
                      key={transaction.id}
                      className={`group flex flex-col sm:flex-row sm:items-center justify-between rounded-lg border p-3 transition-all duration-200 hover:bg-secondary/50 hover:shadow-md cursor-pointer active:scale-[0.99] ${
                        transaction.status === 'blocked' ? 'border-danger/30 bg-danger/5' :
                        transaction.status === 'flagged' ? 'border-warning/30 bg-warning/5' :
                        'border-border'
                      }`}
                      onClick={() => setSelectedTransaction(transaction)}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-lg transition-transform group-hover:scale-110 ${
                          transaction.type === 'withdrawal' || transaction.type === 'payment' 
                            ? 'bg-danger/10' 
                            : 'bg-success/10'
                        }`}>
                          {transaction.type === 'withdrawal' || transaction.type === 'payment' ? (
                            <ArrowUpRight className="h-4 w-4 sm:h-5 sm:w-5 text-danger" />
                          ) : (
                            <ArrowDownRight className="h-4 w-4 sm:h-5 sm:w-5 text-success" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                            <span className="font-medium text-sm sm:text-base">{typeLabels[transaction.type]}</span>
                            <Badge variant="outline" className={`${status.className} text-[10px] sm:text-xs`}>
                              <StatusIcon className="mr-1 h-3 w-3" />
                              {status.label}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-muted-foreground mt-0.5">
                            <span className="truncate max-w-[80px] sm:max-w-[120px]">{transaction.sender.name}</span>
                            <span>→</span>
                            <span className="truncate max-w-[80px] sm:max-w-[120px]">{transaction.recipient.name}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-4 mt-2 sm:mt-0">
                        <div className="hidden md:flex items-center gap-1 text-xs sm:text-sm text-muted-foreground">
                          <ChannelIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          <span>{transaction.sender.region}</span>
                        </div>
                        
                        <div className="text-right">
                          <p className="font-mono text-sm sm:text-base font-medium">
                            {formatCurrency(transaction.amount)} <span className="text-[10px] sm:text-xs text-muted-foreground">XOF</span>
                          </p>
                          <div className="flex items-center justify-end gap-1">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div 
                                  className="h-1.5 w-6 sm:w-8 rounded-full bg-gradient-to-r from-success via-warning to-danger overflow-hidden"
                                >
                                  <div 
                                    className="h-full bg-background/80"
                                    style={{ 
                                      marginLeft: `${transaction.riskScore}%`,
                                      width: `${100 - transaction.riskScore}%`
                                    }}
                                  />
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Score de risque: {transaction.riskScore.toFixed(0)}%</p>
                              </TooltipContent>
                            </Tooltip>
                            <span className="text-[10px] sm:text-xs text-muted-foreground">{transaction.riskScore.toFixed(0)}%</span>
                          </div>
                        </div>
                        
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedTransaction(transaction)
                          }}
                        >
                          <Eye className="h-4 w-4" />
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

      {/* Transaction Detail Dialog */}
      <Dialog open={!!selectedTransaction} onOpenChange={() => setSelectedTransaction(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Détails de la Transaction</DialogTitle>
            <DialogDescription>
              {selectedTransaction?.id} • {selectedTransaction?.timestamp.toLocaleString('fr-FR')}
            </DialogDescription>
          </DialogHeader>
          {selectedTransaction && (
            <>
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge>{typeLabels[selectedTransaction.type]}</Badge>
                <Badge variant="outline" className={statusConfig[selectedTransaction.status].className}>
                  {statusConfig[selectedTransaction.status].label}
                </Badge>
                <Badge variant="secondary" className="font-mono">
                  {formatCurrency(selectedTransaction.amount)} XOF
                </Badge>
              </div>
              <TransactionDetails transaction={selectedTransaction} />
            </>
          )}
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setSelectedTransaction(null)} className="w-full sm:w-auto">
              Fermer
            </Button>
            <Button
              className="w-full sm:w-auto gap-2"
              onClick={() => selectedTransaction && exportTransactionPDF(selectedTransaction)}
            >
              <Download className="h-4 w-4" />
              Exporter PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  )
}
