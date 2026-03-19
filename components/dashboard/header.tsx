'use client'

import { Shield, Bell, Settings, User, Activity } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface DashboardHeaderProps {
  alertCount: number
  isSimulationRunning: boolean
}

export function DashboardHeader({ alertCount, isSimulationRunning }: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Shield className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-semibold tracking-tight">SecurePay CI</span>
              <span className="text-xs text-muted-foreground">Détection de Fraude</span>
            </div>
          </div>
          
          <div className="ml-8 hidden items-center gap-2 md:flex">
            <div className={`flex h-2 w-2 rounded-full ${isSimulationRunning ? 'animate-pulse bg-success' : 'bg-muted'}`} />
            <span className="text-sm text-muted-foreground">
              {isSimulationRunning ? 'Surveillance Active' : 'Surveillance Suspendue'}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="mr-4 hidden items-center gap-2 rounded-lg bg-secondary px-3 py-1.5 md:flex">
            <Activity className="h-4 w-4 text-success" />
            <span className="text-sm font-medium">Système Opérationnel</span>
          </div>
          
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            {alertCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center p-0 text-xs"
              >
                {alertCount > 9 ? '9+' : alertCount}
              </Badge>
            )}
          </Button>
          
          <Button variant="ghost" size="icon">
            <Settings className="h-5 w-5" />
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="ml-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
                  <User className="h-4 w-4 text-primary-foreground" />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span>Admin Analyste</span>
                  <span className="text-xs font-normal text-muted-foreground">admin@securepay.ci</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profil</DropdownMenuItem>
              <DropdownMenuItem>Paramètres</DropdownMenuItem>
              <DropdownMenuItem>Rapports</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">Déconnexion</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
