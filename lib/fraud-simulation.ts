import type { 
  Transaction, 
  Alert, 
  IvoryCoastRegion, 
  DashboardStats, 
  RegionStats,
  TimeSeriesData,
  MLModelMetrics 
} from './types'

// Ivorian names for realistic simulation
const ivorianFirstNames = [
  'Kouadio', 'Yao', 'Konan', 'Kouassi', 'Akissi', 'Adjoua', 'Aya', 'Amenan',
  'Moussa', 'Ibrahim', 'Fatou', 'Mariam', 'Jean', 'Marie', 'Paul', 'Christelle',
  'Serge', 'Estelle', 'Didier', 'Sandrine', 'Lacina', 'Seydou', 'Oumar', 'Aissata'
]

const ivorianLastNames = [
  'Kouamé', 'Koné', 'Coulibaly', 'Diallo', 'Traoré', 'Bamba', 'Ouattara', 'Dembélé',
  'Koffi', 'Kassi', 'N\'Guessan', 'Yapi', 'Gnahoré', 'Touré', 'Gbagbo', 'Doumbia'
]

const regions: IvoryCoastRegion[] = [
  'Abidjan', 'Yamoussoukro', 'Bouaké', 'San-Pédro', 'Daloa',
  'Korhogo', 'Man', 'Gagnoa', 'Abengourou', 'Divo'
]

const transactionTypes: Transaction['type'][] = [
  'transfer', 'withdrawal', 'deposit', 'payment', 'mobile_money'
]

const channels: Transaction['metadata']['channel'][] = [
  'mobile', 'web', 'atm', 'pos', 'agent'
]

// Fraud patterns for ML simulation
const fraudPatterns = {
  highAmount: { threshold: 5000000, weight: 0.3 },
  unusualTime: { startHour: 1, endHour: 5, weight: 0.2 },
  velocityAnomaly: { maxPerHour: 5, weight: 0.25 },
  locationAnomaly: { weight: 0.15 },
  newAccount: { ageDays: 7, weight: 0.1 }
}

function generateId(): string {
  return `TXN-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`
}

function generateName(): string {
  const firstName = ivorianFirstNames[Math.floor(Math.random() * ivorianFirstNames.length)]
  const lastName = ivorianLastNames[Math.floor(Math.random() * ivorianLastNames.length)]
  return `${firstName} ${lastName}`
}

function generateAccountId(): string {
  return `CI${Math.random().toString().substring(2, 14)}`
}

function generateAmount(isFraudulent: boolean): number {
  if (isFraudulent && Math.random() > 0.5) {
    // High-value suspicious transaction
    return Math.floor(Math.random() * 10000000) + 5000000
  }
  // Normal transaction amounts in XOF
  const ranges = [
    { min: 1000, max: 50000, probability: 0.4 },
    { min: 50000, max: 200000, probability: 0.3 },
    { min: 200000, max: 1000000, probability: 0.2 },
    { min: 1000000, max: 5000000, probability: 0.1 }
  ]
  
  const rand = Math.random()
  let cumulative = 0
  
  for (const range of ranges) {
    cumulative += range.probability
    if (rand <= cumulative) {
      return Math.floor(Math.random() * (range.max - range.min)) + range.min
    }
  }
  
  return Math.floor(Math.random() * 50000) + 1000
}

function calculateRiskScore(transaction: Partial<Transaction>, isFraudulent: boolean): number {
  let baseScore = isFraudulent ? Math.random() * 30 + 70 : Math.random() * 40

  // Amount factor
  if (transaction.amount && transaction.amount > fraudPatterns.highAmount.threshold) {
    baseScore += 15
  }

  // Time factor (unusual hours)
  const hour = new Date().getHours()
  if (hour >= fraudPatterns.unusualTime.startHour && hour <= fraudPatterns.unusualTime.endHour) {
    baseScore += 10
  }

  // Cross-region factor
  if (transaction.sender?.region !== transaction.recipient?.region) {
    baseScore += 5
  }

  return Math.min(100, Math.max(0, baseScore))
}

function generateFraudFactors(riskScore: number, transaction: Partial<Transaction>): string[] {
  const factors: string[] = []
  
  if (riskScore > 80) {
    factors.push('Comportement de transaction hautement suspect')
  }
  if (transaction.amount && transaction.amount > fraudPatterns.highAmount.threshold) {
    factors.push('Montant de transaction anormalement élevé')
  }
  if (transaction.sender?.region !== transaction.recipient?.region) {
    factors.push('Transaction inter-régionale inhabituelle')
  }
  if (Math.random() > 0.7) {
    factors.push('Vélocité de transaction élevée détectée')
  }
  if (Math.random() > 0.8) {
    factors.push('Nouveau bénéficiaire suspect')
  }
  if (Math.random() > 0.85) {
    factors.push('Appareil non reconnu')
  }
  
  return factors.length > 0 ? factors : ['Analyse de pattern de base']
}

export function generateTransaction(forceFraud?: boolean): Transaction {
  const isFraudulent = forceFraud ?? Math.random() < 0.08 // 8% fraud rate
  const senderRegion = regions[Math.floor(Math.random() * regions.length)]
  const recipientRegion = isFraudulent && Math.random() > 0.5 
    ? regions[Math.floor(Math.random() * regions.length)]
    : senderRegion
  
  const amount = generateAmount(isFraudulent)
  
  const partialTransaction: Partial<Transaction> = {
    amount,
    sender: {
      id: generateAccountId(),
      name: generateName(),
      accountType: Math.random() > 0.7 ? 'business' : 'individual',
      location: senderRegion,
      region: senderRegion
    },
    recipient: {
      id: generateAccountId(),
      name: generateName(),
      accountType: Math.random() > 0.8 ? 'business' : 'individual',
      location: recipientRegion,
      region: recipientRegion
    }
  }
  
  const riskScore = calculateRiskScore(partialTransaction, isFraudulent)
  const factors = generateFraudFactors(riskScore, partialTransaction)
  
  const transaction: Transaction = {
    id: generateId(),
    timestamp: new Date(),
    amount,
    currency: 'XOF',
    type: transactionTypes[Math.floor(Math.random() * transactionTypes.length)],
    status: riskScore > 85 ? 'blocked' : riskScore > 70 ? 'flagged' : riskScore > 50 ? 'pending' : 'completed',
    sender: partialTransaction.sender!,
    recipient: partialTransaction.recipient!,
    riskScore,
    mlPrediction: {
      isFraud: riskScore > 70,
      confidence: 0.7 + (Math.random() * 0.25),
      factors
    },
    metadata: {
      channel: channels[Math.floor(Math.random() * channels.length)],
      deviceId: `DEV-${Math.random().toString(36).substring(2, 10)}`,
      ipAddress: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      userAgent: Math.random() > 0.5 ? 'Mobile App v2.4.1' : 'Web Browser'
    }
  }
  
  return transaction
}

export function generateAlert(transaction: Transaction): Alert | null {
  if (transaction.riskScore < 60) return null
  
  const alertTypes: Alert['type'][] = ['high_risk', 'velocity', 'location_anomaly', 'amount_anomaly', 'pattern_match']
  const type = alertTypes[Math.floor(Math.random() * alertTypes.length)]
  
  const messages: Record<Alert['type'], string> = {
    high_risk: `Transaction à haut risque détectée - Score: ${transaction.riskScore.toFixed(0)}%`,
    velocity: `Vélocité anormale - Plusieurs transactions en peu de temps`,
    location_anomaly: `Anomalie de localisation - ${transaction.sender.region} vers ${transaction.recipient.region}`,
    amount_anomaly: `Montant inhabituel - ${formatCurrency(transaction.amount)} XOF`,
    pattern_match: `Pattern de fraude connu détecté - Confiance: ${(transaction.mlPrediction.confidence * 100).toFixed(0)}%`
  }
  
  return {
    id: `ALT-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
    transactionId: transaction.id,
    type,
    severity: transaction.riskScore > 85 ? 'critical' : transaction.riskScore > 75 ? 'high' : transaction.riskScore > 65 ? 'medium' : 'low',
    message: messages[type],
    timestamp: new Date(),
    acknowledged: false
  }
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('fr-CI', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

export function calculateStats(transactions: Transaction[]): DashboardStats {
  const flagged = transactions.filter(t => t.status === 'flagged' || t.status === 'blocked')
  const blocked = transactions.filter(t => t.status === 'blocked')
  
  return {
    totalTransactions: transactions.length,
    totalVolume: transactions.reduce((sum, t) => sum + t.amount, 0),
    flaggedTransactions: flagged.length,
    blockedTransactions: blocked.length,
    averageRiskScore: transactions.length > 0 
      ? transactions.reduce((sum, t) => sum + t.riskScore, 0) / transactions.length 
      : 0,
    fraudDetectionRate: transactions.length > 0 
      ? (flagged.length / transactions.length) * 100 
      : 0
  }
}

export function calculateRegionStats(transactions: Transaction[]): RegionStats[] {
  const regionMap = new Map<IvoryCoastRegion, { count: number; volume: number; flagged: number }>()
  
  regions.forEach(region => {
    regionMap.set(region, { count: 0, volume: 0, flagged: 0 })
  })
  
  transactions.forEach(t => {
    const senderStats = regionMap.get(t.sender.region)!
    senderStats.count++
    senderStats.volume += t.amount
    if (t.status === 'flagged' || t.status === 'blocked') {
      senderStats.flagged++
    }
  })
  
  return regions.map(region => {
    const stats = regionMap.get(region)!
    const flaggedRatio = stats.count > 0 ? stats.flagged / stats.count : 0
    return {
      region,
      transactionCount: stats.count,
      totalVolume: stats.volume,
      flaggedCount: stats.flagged,
      riskLevel: flaggedRatio > 0.15 ? 'high' : flaggedRatio > 0.08 ? 'medium' : 'low'
    }
  })
}

export function generateTimeSeriesData(transactions: Transaction[], hours: number = 24): TimeSeriesData[] {
  const data: TimeSeriesData[] = []
  const now = new Date()
  
  for (let i = hours; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000)
    const hourTransactions = transactions.filter(t => {
      const diff = Math.abs(t.timestamp.getTime() - timestamp.getTime())
      return diff < 60 * 60 * 1000
    })
    
    data.push({
      timestamp,
      transactions: hourTransactions.length || Math.floor(Math.random() * 50) + 10,
      flagged: hourTransactions.filter(t => t.status === 'flagged' || t.status === 'blocked').length || Math.floor(Math.random() * 5),
      volume: hourTransactions.reduce((sum, t) => sum + t.amount, 0) || Math.floor(Math.random() * 50000000) + 10000000
    })
  }
  
  return data
}

export function generateMLMetrics(): MLModelMetrics {
  return {
    accuracy: 0.94 + Math.random() * 0.04,
    precision: 0.91 + Math.random() * 0.05,
    recall: 0.88 + Math.random() * 0.08,
    f1Score: 0.90 + Math.random() * 0.06,
    lastUpdated: new Date(),
    totalPredictions: Math.floor(Math.random() * 100000) + 50000,
    truePositives: Math.floor(Math.random() * 5000) + 2000,
    falsePositives: Math.floor(Math.random() * 200) + 50
  }
}

// Transaction stream simulation
export class TransactionSimulator {
  private intervalId: ReturnType<typeof setInterval> | null = null
  private callbacks: Set<(transaction: Transaction) => void> = new Set()
  
  subscribe(callback: (transaction: Transaction) => void): () => void {
    this.callbacks.add(callback)
    return () => this.callbacks.delete(callback)
  }
  
  start(intervalMs: number = 2000): void {
    if (this.intervalId) return
    
    this.intervalId = setInterval(() => {
      const transaction = generateTransaction()
      this.callbacks.forEach(cb => cb(transaction))
    }, intervalMs)
  }
  
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
  }
  
  generateBatch(count: number): Transaction[] {
    return Array.from({ length: count }, () => generateTransaction())
  }
}
