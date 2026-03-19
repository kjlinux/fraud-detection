'use client'

import { useState } from 'react'
import { Shield, Bell, Settings, User, Activity, Search, Moon, Sun, HelpCircle, LogOut, Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'

interface DashboardHeaderProps {
  alertCount: number
  isSimulationRunning: boolean
}

export function DashboardHeader({ alertCount, isSimulationRunning }: DashboardHeaderProps) {
  const [searchOpen, setSearchOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)

  const notifications = [
    { id: 1, title: 'Nouvelle alerte critique', message: 'Transaction suspecte détectée à Abidjan', time: 'Il y a 2 min', unread: true },
    { id: 2, title: 'Rapport généré', message: 'Le rapport hebdomadaire est disponible', time: 'Il y a 1h', unread: true },
    { id: 3, title: 'Mise à jour système', message: 'Modèle ML mis à jour avec succès', time: 'Il y a 3h', unread: false },
  ]

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 sm:h-16 items-center justify-between px-3 sm:px-6">
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Mobile Menu Button */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px]">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    SecurePay CI
                  </SheetTitle>
                </SheetHeader>
                <nav className="mt-6 space-y-2">
                  <Button variant="ghost" className="w-full justify-start gap-2">
                    <Activity className="h-4 w-4" />
                    Tableau de bord
                  </Button>
                  <Button variant="ghost" className="w-full justify-start gap-2">
                    <Bell className="h-4 w-4" />
                    Alertes
                    {alertCount > 0 && (
                      <Badge variant="destructive" className="ml-auto">
                        {alertCount}
                      </Badge>
                    )}
                  </Button>
                  <Button variant="ghost" className="w-full justify-start gap-2">
                    <Settings className="h-4 w-4" />
                    Paramètres
                  </Button>
                  <Button variant="ghost" className="w-full justify-start gap-2">
                    <HelpCircle className="h-4 w-4" />
                    Aide
                  </Button>
                </nav>
                <div className="absolute bottom-4 left-4 right-4">
                  <div className={`flex items-center gap-2 rounded-lg p-3 ${isSimulationRunning ? 'bg-success/10' : 'bg-muted'}`}>
                    <div className={`flex h-2 w-2 rounded-full ${isSimulationRunning ? 'animate-pulse bg-success' : 'bg-muted-foreground'}`} />
                    <span className="text-sm">
                      {isSimulationRunning ? 'Surveillance Active' : 'Surveillance Suspendue'}
                    </span>
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg bg-primary transition-transform hover:scale-105 active:scale-95">
                <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-primary-foreground" />
              </div>
              <div className="flex flex-col">
                <span className="text-base sm:text-lg font-semibold tracking-tight">SecurePay CI</span>
                <span className="text-[10px] sm:text-xs text-muted-foreground hidden sm:block">Détection de Fraude</span>
              </div>
            </div>
            
            {/* Status Indicator - Desktop */}
            <div className="ml-4 sm:ml-8 hidden md:flex items-center gap-2 rounded-lg bg-secondary/50 px-3 py-1.5 transition-all hover:bg-secondary">
              <div className={`flex h-2 w-2 rounded-full ${isSimulationRunning ? 'animate-pulse bg-success' : 'bg-muted-foreground'}`} />
              <span className="text-sm text-muted-foreground">
                {isSimulationRunning ? 'Surveillance Active' : 'Surveillance Suspendue'}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Search - Desktop */}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setSearchOpen(true)}
              className="hidden sm:flex items-center gap-2 text-muted-foreground hover:text-foreground"
            >
              <Search className="h-4 w-4" />
              <span className="hidden lg:inline">Rechercher...</span>
              <kbd className="hidden lg:inline-flex pointer-events-none h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium">
                <span className="text-xs">⌘</span>K
              </kbd>
            </Button>
            
            {/* Search - Mobile */}
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setSearchOpen(true)}
              className="sm:hidden"
            >
              <Search className="h-5 w-5" />
            </Button>
            
            {/* System Status - Desktop */}
            <div className="mr-2 hidden lg:flex items-center gap-2 rounded-lg bg-success/10 px-3 py-1.5">
              <Activity className="h-4 w-4 text-success animate-pulse" />
              <span className="text-sm font-medium text-success">Opérationnel</span>
            </div>
            
            {/* Notifications */}
            <DropdownMenu open={notificationsOpen} onOpenChange={setNotificationsOpen}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  {alertCount > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 sm:h-5 sm:w-5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
                      <Badge 
                        variant="destructive" 
                        className="relative flex h-4 w-4 sm:h-5 sm:w-5 items-center justify-center p-0 text-[10px] sm:text-xs"
                      >
                        {alertCount > 9 ? '9+' : alertCount}
                      </Badge>
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel className="flex items-center justify-between">
                  <span>Notifications</span>
                  <Badge variant="secondary">{notifications.filter(n => n.unread).length} nouvelles</Badge>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {notifications.map(notification => (
                  <DropdownMenuItem key={notification.id} className="flex flex-col items-start gap-1 p-3 cursor-pointer">
                    <div className="flex items-center gap-2 w-full">
                      {notification.unread && <div className="h-2 w-2 rounded-full bg-primary" />}
                      <span className="font-medium text-sm">{notification.title}</span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-1">{notification.message}</p>
                    <p className="text-[10px] text-muted-foreground">{notification.time}</p>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem className="justify-center text-primary">
                  Voir toutes les notifications
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            {/* Settings - Desktop */}
            <Button variant="ghost" size="icon" className="hidden sm:flex">
              <Settings className="h-5 w-5" />
            </Button>
            
            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="ml-1 sm:ml-2">
                  <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-primary transition-transform hover:scale-105">
                    <User className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary-foreground" />
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
                <DropdownMenuItem className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  Profil
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  Paramètres
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  <HelpCircle className="mr-2 h-4 w-4" />
                  Aide & Support
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Déconnexion
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Search Command Dialog */}
      <CommandDialog open={searchOpen} onOpenChange={setSearchOpen}>
        <CommandInput placeholder="Rechercher une transaction, un client..." />
        <CommandList>
          <CommandEmpty>Aucun résultat trouvé.</CommandEmpty>
          <CommandGroup heading="Actions rapides">
            <CommandItem>
              <Search className="mr-2 h-4 w-4" />
              Rechercher une transaction
            </CommandItem>
            <CommandItem>
              <User className="mr-2 h-4 w-4" />
              Rechercher un client
            </CommandItem>
            <CommandItem>
              <Bell className="mr-2 h-4 w-4" />
              Voir les alertes récentes
            </CommandItem>
          </CommandGroup>
          <CommandGroup heading="Navigation">
            <CommandItem>Tableau de bord</CommandItem>
            <CommandItem>Transactions</CommandItem>
            <CommandItem>Alertes</CommandItem>
            <CommandItem>Rapports</CommandItem>
            <CommandItem>Paramètres</CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}
