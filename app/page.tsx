'use client'

import { useState, useEffect } from 'react'
import { DashboardHeader } from '@/components/dashboard/header'
import { StatsCards } from '@/components/dashboard/stats-cards'
import { TransactionTable } from '@/components/dashboard/transaction-table'
import { AlertsPanel } from '@/components/dashboard/alerts-panel'
import { MLMetricsCard } from '@/components/dashboard/ml-metrics'
import { AnalyticsCharts } from '@/components/dashboard/analytics-charts'
import { RegionMap } from '@/components/dashboard/region-map'
import { ControlPanel } from '@/components/dashboard/control-panel'
import { LiveFeed } from '@/components/dashboard/live-feed'
import { useFraudDetection } from '@/hooks/use-fraud-detection'

export default function FraudDetectionDashboard() {
  const [currentTime, setCurrentTime] = useState<string>('')
  
  useEffect(() => {
    // Set initial time on client only to avoid hydration mismatch
    setCurrentTime(new Date().toLocaleTimeString('fr-FR'))
    
    // Update time every second
    const interval = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('fr-FR'))
    }, 1000)
    
    return () => clearInterval(interval)
  }, [])
  
  const {
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
  } = useFraudDetection()

  const unacknowledgedAlerts = alerts.filter(a => !a.acknowledged)

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <DashboardHeader 
        alertCount={unacknowledgedAlerts.length} 
        isSimulationRunning={isSimulationRunning} 
      />
      
      <main className="flex-1 p-4 md:p-6">
        <div className="mx-auto max-w-[1800px] space-y-6">
          {/* Page Title */}
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Tableau de Bord - Détection de Fraude</h1>
              <p className="text-muted-foreground">
                Surveillance en temps réel des transactions financières en Côte d&apos;Ivoire
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Dernière mise à jour:</span>
              <span className="font-mono">{currentTime || '--:--:--'}</span>
            </div>
          </div>

          {/* Stats Overview */}
          <StatsCards stats={stats} />

          {/* Main Grid Layout */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Left Column - Transaction Table */}
            <div className="lg:col-span-2">
              <TransactionTable transactions={transactions} />
            </div>
            
            {/* Right Column - Alerts */}
            <div>
              <AlertsPanel alerts={alerts} onAcknowledge={acknowledgeAlert} />
            </div>
          </div>

          {/* Analytics Section */}
          <div className="grid gap-6 lg:grid-cols-2">
            <AnalyticsCharts 
              timeSeriesData={timeSeriesData} 
              regionStats={regionStats} 
            />
            <RegionMap regionStats={regionStats} />
          </div>

          {/* Bottom Section */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <MLMetricsCard metrics={mlMetrics} />
            <LiveFeed transactions={transactions} />
            <ControlPanel
              isSimulationRunning={isSimulationRunning}
              simulationSpeed={simulationSpeed}
              onToggleSimulation={toggleSimulation}
              onChangeSpeed={changeSimulationSpeed}
              onGenerateTransaction={generateTestTransaction}
            />
          </div>

          {/* Footer */}
          <footer className="border-t border-border pt-6 text-center text-sm text-muted-foreground">
            <p>SecurePay CI - Système de Détection de Fraude Financière</p>
            <p className="mt-1">
              Propulsé par Machine Learning | Conforme aux réglementations BCEAO
            </p>
          </footer>
        </div>
      </main>
    </div>
  )
}
