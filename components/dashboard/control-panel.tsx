'use client'

import { useState } from 'react'
import { Play, Pause, Zap, AlertTriangle, RotateCcw, Gauge, Settings2, Info, ChevronRight, Sparkles } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'

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
  const [advancedOpen, setAdvancedOpen] = useState(false)
  const [autoAcknowledge, setAutoAcknowledge] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)
  
  const speedLabel = simulationSpeed <= 500 ? 'Très Rapide' : 
                     simulationSpeed <= 1000 ? 'Rapide' :
                     simulationSpeed <= 2000 ? 'Normal' :
                     simulationSpeed <= 3000 ? 'Lent' : 'Très Lent'

  const speedColor = simulationSpeed <= 1000 ? 'text-success' : 
                     simulationSpeed <= 2000 ? 'text-info' :
                     simulationSpeed <= 3000 ? 'text-warning' : 'text-danger'

  return (
    <TooltipProvider>
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`p-1.5 rounded-lg transition-colors ${isSimulationRunning ? 'bg-success/10' : 'bg-secondary'}`}>
                <Gauge className={`h-5 w-5 ${isSimulationRunning ? 'text-success' : 'text-muted-foreground'}`} />
              </div>
              <CardTitle className="text-lg font-semibold">Contrôle de Simulation</CardTitle>
            </div>
            <Badge 
              variant={isSimulationRunning ? 'default' : 'secondary'}
              className={`transition-all ${isSimulationRunning ? 'bg-success text-success-foreground animate-pulse' : ''}`}
            >
              {isSimulationRunning ? 'Active' : 'Suspendue'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Main Controls */}
          <div className="flex items-center gap-2">
            <Button
              variant={isSimulationRunning ? 'secondary' : 'default'}
              className={`flex-1 gap-2 transition-all ${!isSimulationRunning ? 'bg-success hover:bg-success/90' : ''}`}
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
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => window.location.reload()}
                  className="transition-transform hover:rotate-180 duration-500"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Réinitialiser la simulation</p>
              </TooltipContent>
            </Tooltip>
          </div>
          
          <Separator />
          
          {/* Speed Control */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Vitesse de simulation</span>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-3.5 w-3.5 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Intervalle entre chaque transaction générée</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <Badge variant="outline" className={speedColor}>
                {speedLabel}
              </Badge>
            </div>
            <div className="relative pt-1">
              <Slider
                value={[simulationSpeed]}
                onValueChange={([value]) => onChangeSpeed(value)}
                min={500}
                max={5000}
                step={500}
                className="py-2"
              />
              <div className="absolute -bottom-1 left-0 right-0 flex justify-between text-[10px] text-muted-foreground">
                <span>0.5s</span>
                <span>2.5s</span>
                <span>5s</span>
              </div>
            </div>
          </div>
          
          <Separator />
          
          {/* Manual Test Buttons */}
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Test manuel
            </p>
            <div className="grid gap-2 grid-cols-1 sm:grid-cols-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-2 group transition-all hover:bg-success/10 hover:border-success/50"
                onClick={() => onGenerateTransaction(false)}
              >
                <Zap className="h-4 w-4 transition-transform group-hover:scale-110" />
                <span className="truncate">Transaction normale</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 group border-danger/50 text-danger hover:bg-danger/10 transition-all"
                onClick={() => onGenerateTransaction(true)}
              >
                <AlertTriangle className="h-4 w-4 transition-transform group-hover:scale-110 group-hover:animate-pulse" />
                <span className="truncate">Transaction fraude</span>
              </Button>
            </div>
          </div>
          
          {/* Advanced Settings */}
          <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="w-full justify-between text-muted-foreground hover:text-foreground">
                <span className="flex items-center gap-2">
                  <Settings2 className="h-4 w-4" />
                  Paramètres avancés
                </span>
                <ChevronRight className={`h-4 w-4 transition-transform ${advancedOpen ? 'rotate-90' : ''}`} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-3 pt-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="text-sm">Auto-acquittement</p>
                  <p className="text-xs text-muted-foreground">Acquitter automatiquement les alertes faibles</p>
                </div>
                <Switch checked={autoAcknowledge} onCheckedChange={setAutoAcknowledge} />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="text-sm">Notifications sonores</p>
                  <p className="text-xs text-muted-foreground">Son pour les alertes critiques</p>
                </div>
                <Switch checked={soundEnabled} onCheckedChange={setSoundEnabled} />
              </div>
            </CollapsibleContent>
          </Collapsible>
          
          {/* Info Box */}
          <div className="rounded-lg bg-gradient-to-br from-secondary/80 to-secondary/30 p-3 text-xs border border-border/50">
            <p className="font-medium text-foreground flex items-center gap-2">
              <Info className="h-4 w-4 text-primary" />
              Mode Démonstration
            </p>
            <p className="mt-1 text-muted-foreground leading-relaxed">
              Les transactions sont générées automatiquement avec un taux de fraude simulé de ~8%. 
              Le modèle ML analyse chaque transaction en temps réel.
            </p>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  )
}
