'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { toast } from 'sonner'
import type { Transaction, Alert, DashboardStats, RegionStats, TimeSeriesData, MLModelMetrics } from '@/lib/types'
import {
  generateTransaction,
  generateAlert,
  calculateStats,
  calculateRegionStats,
  generateTimeSeriesData,
  generateMLMetrics,
  formatCurrency,
  TransactionSimulator
} from '@/lib/fraud-simulation'

const MAX_TRANSACTIONS = 200
const MAX_ALERTS = 50

export function useFraudDetection() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [stats, setStats] = useState<DashboardStats>({
    totalTransactions: 0,
    totalVolume: 0,
    flaggedTransactions: 0,
    blockedTransactions: 0,
    averageRiskScore: 0,
    fraudDetectionRate: 0
  })
  const [regionStats, setRegionStats] = useState<RegionStats[]>([])
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData[]>([])
  const [mlMetrics, setMlMetrics] = useState<MLModelMetrics>(generateMLMetrics())
  const [isSimulationRunning, setIsSimulationRunning] = useState(true)
  const [simulationSpeed, setSimulationSpeed] = useState(2000)
  
  const simulatorRef = useRef<TransactionSimulator | null>(null)
  
  // Initialize with batch of transactions
  useEffect(() => {
    const initialTransactions = Array.from({ length: 50 }, () => {
      const tx = generateTransaction()
      tx.timestamp = new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000)
      return tx
    }).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    
    const initialAlerts = initialTransactions
      .map(tx => generateAlert(tx))
      .filter((a): a is Alert => a !== null)
      .slice(0, 10)
    
    setTransactions(initialTransactions)
    setAlerts(initialAlerts)
    setStats(calculateStats(initialTransactions))
    setRegionStats(calculateRegionStats(initialTransactions))
    setTimeSeriesData(generateTimeSeriesData(initialTransactions))
  }, [])
  
  // Handle new transaction
  const handleNewTransaction = useCallback((transaction: Transaction) => {
    setTransactions(prev => {
      const updated = [transaction, ...prev].slice(0, MAX_TRANSACTIONS)
      
      // Update stats
      setStats(calculateStats(updated))
      setRegionStats(calculateRegionStats(updated))
      
      return updated
    })
    
    // Generate alert if needed
    const alert = generateAlert(transaction)
    if (alert) {
      setAlerts(prev => [alert, ...prev].slice(0, MAX_ALERTS))
      
      // Show toast notification for high severity alerts
      if (alert.severity === 'critical') {
        toast.error(`ALERTE CRITIQUE: ${alert.message}`, {
          description: `Transaction ${transaction.id} - ${formatCurrency(transaction.amount)} XOF`,
          duration: 8000,
        })
      } else if (alert.severity === 'high') {
        toast.warning(`Alerte: ${alert.message}`, {
          description: `Transaction ${transaction.id}`,
          duration: 5000,
        })
      }
    }
  }, [])
  
  // Simulation control
  useEffect(() => {
    if (!simulatorRef.current) {
      simulatorRef.current = new TransactionSimulator()
    }
    
    const simulator = simulatorRef.current
    
    if (isSimulationRunning) {
      const unsubscribe = simulator.subscribe(handleNewTransaction)
      simulator.start(simulationSpeed)
      
      return () => {
        unsubscribe()
        simulator.stop()
      }
    } else {
      simulator.stop()
    }
  }, [isSimulationRunning, simulationSpeed, handleNewTransaction])
  
  // Update ML metrics periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setMlMetrics(prev => ({
        ...prev,
        totalPredictions: prev.totalPredictions + Math.floor(Math.random() * 10),
        lastUpdated: new Date()
      }))
    }, 10000)
    
    return () => clearInterval(interval)
  }, [])
  
  // Update time series data periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeSeriesData(prev => {
        const newPoint: TimeSeriesData = {
          timestamp: new Date(),
          transactions: Math.floor(Math.random() * 30) + 20,
          flagged: Math.floor(Math.random() * 4),
          volume: Math.floor(Math.random() * 30000000) + 15000000
        }
        return [...prev.slice(1), newPoint]
      })
    }, 60000) // Update every minute
    
    return () => clearInterval(interval)
  }, [])
  
  const acknowledgeAlert = useCallback((alertId: string) => {
    setAlerts(prev => 
      prev.map(a => a.id === alertId ? { ...a, acknowledged: true } : a)
    )
  }, [])
  
  const toggleSimulation = useCallback(() => {
    setIsSimulationRunning(prev => !prev)
  }, [])
  
  const changeSimulationSpeed = useCallback((speed: number) => {
    setSimulationSpeed(speed)
    if (simulatorRef.current && isSimulationRunning) {
      simulatorRef.current.stop()
      simulatorRef.current.start(speed)
    }
  }, [isSimulationRunning])
  
  const generateTestTransaction = useCallback((forceFraud: boolean = false) => {
    const transaction = generateTransaction(forceFraud)
    handleNewTransaction(transaction)
  }, [handleNewTransaction])
  
  return {
    transactions,
    alerts,
    stats,
    regionStats,
    timeSeriesData,
    mlMetrics,
    isSimulationRunning,
    simulationSpeed,
    acknowledgeAlert,
    toggleSimulation,
    changeSimulationSpeed,
    generateTestTransaction
  }
}
