'use client'

import { Play, Pause, Zap, AlertTriangle, RotateCcw, Gauge } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

interface ControlPanelProps {
  isSimulationRunning: boolean
  simulationSpeed: number
  onToggleSimulation: () => void
  onChangeSpeed: (speed: number) => void
  onGenerateTransaction: (forceFraud: boolean) => void
}

export function ControlPanel({
  isSimulationRunning,
  simulationSpeed,
  onToggleSimulation,
  onChangeSpeed,
  onGenerateTransaction
}: ControlPanelProps) {
  const speedLabel = simulationSpeed <= 500 ? 'Très Rapide' : 
                     simulationSpeed <= 1000 ? 'Rapide' :
                     simulationSpeed <= 2000 ? 'Normal' :
                     simulationSpeed <= 3000 ? 'Lent' : 'Très Lent'

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gauge className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg font-semibold">Contrôle de Simulation</CardTitle>
          </div>
          <Badge 
            variant={isSimulationRunning ? 'default' : 'secondary'}
            className={isSimulationRunning ? 'bg-success text-success-foreground' : ''}
          >
            {isSimulationRunning ? 'Active' : 'Suspendue'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <Button
            variant={isSimulationRunning ? 'secondary' : 'default'}
            className="flex-1 gap-2"
            onClick={onToggleSimulation}
          >
            {isSimulationRunning ? (
              <>
                <Pause className="h-4 w-4" />
                Suspendre
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                Démarrer
              </>
            )}
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => window.location.reload()}
            title="Réinitialiser"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
        
        <Separator />
        
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Vitesse de simulation</span>
            <Badge variant="outline">{speedLabel}</Badge>
          </div>
          <Slider
            value={[simulationSpeed]}
            onValueChange={([value]) => onChangeSpeed(value)}
            min={500}
            max={5000}
            step={500}
            className="py-2"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0.5s</span>
            <span>5s</span>
          </div>
        </div>
        
        <Separator />
        
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Test manuel</p>
          <div className="grid gap-2 sm:grid-cols-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => onGenerateTransaction(false)}
            >
              <Zap className="h-4 w-4" />
              Transaction normale
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 border-danger/50 text-danger hover:bg-danger/10"
              onClick={() => onGenerateTransaction(true)}
            >
              <AlertTriangle className="h-4 w-4" />
              Transaction frauduleuse
            </Button>
          </div>
        </div>
        
        <div className="rounded-lg bg-secondary/50 p-3 text-xs text-muted-foreground">
          <p className="font-medium text-foreground">Mode Démonstration</p>
          <p className="mt-1">
            Les transactions sont générées automatiquement avec un taux de fraude simulé de ~8%. 
            Utilisez les boutons ci-dessus pour tester manuellement.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
