export interface Transaction {
  id: string
  timestamp: Date
  amount: number
  currency: 'XOF' | 'EUR' | 'USD'
  type: 'transfer' | 'withdrawal' | 'deposit' | 'payment' | 'mobile_money'
  status: 'pending' | 'completed' | 'flagged' | 'blocked'
  sender: {
    id: string
    name: string
    accountType: 'individual' | 'business'
    location: string
    region: IvoryCoastRegion
  }
  recipient: {
    id: string
    name: string
    accountType: 'individual' | 'business'
    location: string
    region: IvoryCoastRegion
  }
  riskScore: number // 0-100
  mlPrediction: {
    isFraud: boolean
    confidence: number
    factors: string[]
  }
  metadata: {
    channel: 'mobile' | 'web' | 'atm' | 'pos' | 'agent'
    deviceId?: string
    ipAddress?: string
    userAgent?: string
  }
}

export type IvoryCoastRegion = 
  | 'Abidjan'
  | 'Yamoussoukro'
  | 'Bouaké'
  | 'San-Pédro'
  | 'Daloa'
  | 'Korhogo'
  | 'Man'
  | 'Gagnoa'
  | 'Abengourou'
  | 'Divo'

export interface Alert {
  id: string
  transactionId: string
  type: 'high_risk' | 'velocity' | 'location_anomaly' | 'amount_anomaly' | 'pattern_match'
  severity: 'low' | 'medium' | 'high' | 'critical'
  message: string
  timestamp: Date
  acknowledged: boolean
  assignedTo?: string
}

export interface DashboardStats {
  totalTransactions: number
  totalVolume: number
  flaggedTransactions: number
  blockedTransactions: number
  averageRiskScore: number
  fraudDetectionRate: number
}

export interface RegionStats {
  region: IvoryCoastRegion
  transactionCount: number
  totalVolume: number
  flaggedCount: number
  riskLevel: 'low' | 'medium' | 'high'
}

export interface TimeSeriesData {
  timestamp: Date
  transactions: number
  flagged: number
  volume: number
}

export interface MLModelMetrics {
  accuracy: number
  precision: number
  recall: number
  f1Score: number
  lastUpdated: Date
  totalPredictions: number
  truePositives: number
  falsePositives: number
}
