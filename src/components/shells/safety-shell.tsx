'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import {
  Shield,
  AlertTriangle,
  TrendingUp,
  FileText,
  Settings,
  Bell,
  Filter,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from 'lucide-react'
import { transitions } from '@/components/core/motion'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface SafetyShellProps {
  children: React.ReactNode
  userName?: string
  userAvatar?: string
  alertCounts?: {
    critical: number
    high: number
    medium: number
    low: number
  }
}

const navItems = [
  { href: '/dashboard', icon: Shield, label: 'Monitor' },
  { href: '/safety', icon: AlertTriangle, label: 'Alerts' },
  { href: '/analytics', icon: TrendingUp, label: 'Trends' },
  { href: '/review', icon: FileText, label: 'Reports' },
]

export function SafetyShell({ 
  children, 
  userName, 
  userAvatar,
  alertCounts = { critical: 0, high: 0, medium: 0, low: 0 },
}: SafetyShellProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const initials = userName?.split(' ').map(n => n[0]).join('').toUpperCase() || 'SM'
  
  const totalAlerts = alertCounts.critical + alertCounts.high + alertCounts.medium + alertCounts.low

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar with alert summary */}
      <motion.aside
        initial={false}
        animate={{ width: isCollapsed ? 72 : 280 }}
        transition={transitions.smooth}
        className="fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-sidebar-border bg-sidebar"
      >
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-4">
          <Image src="/logo.png" alt="Blokt" width={40} height={40} className="h-10 w-10 shrink-0" />
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
              >
                <span className="text-xl font-bold text-sidebar-foreground">Blokt</span>
                <p className="text-xs text-sidebar-foreground/60">Safety Monitor</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Alert Summary */}
        {!isCollapsed && (
          <div className="border-b border-sidebar-border p-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/50">
              Active Alerts
            </p>
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-lg bg-red-500/10 p-2 text-center">
                <p className="text-lg font-bold text-red-400">{alertCounts.critical}</p>
                <p className="text-[10px] text-red-400/70">Critical</p>
              </div>
              <div className="rounded-lg bg-orange-500/10 p-2 text-center">
                <p className="text-lg font-bold text-orange-400">{alertCounts.high}</p>
                <p className="text-[10px] text-orange-400/70">High</p>
              </div>
              <div className="rounded-lg bg-yellow-500/10 p-2 text-center">
                <p className="text-lg font-bold text-yellow-400">{alertCounts.medium}</p>
                <p className="text-[10px] text-yellow-400/70">Medium</p>
              </div>
              <div className="rounded-lg bg-blue-500/10 p-2 text-center">
                <p className="text-lg font-bold text-blue-400">{alertCounts.low}</p>
                <p className="text-[10px] text-blue-400/70">Low</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                  isCollapsed && 'justify-center px-2',
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-primary'
                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'
                )}
                title={isCollapsed ? item.label : undefined}
              >
                {isActive && (
                  <motion.div
                    layoutId="safetyNavActive"
                    className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-sidebar-primary"
                    transition={transitions.smooth}
                  />
                )}
                <item.icon className={cn(
                  'h-5 w-5 shrink-0',
                  isActive ? 'text-sidebar-primary' : 'text-sidebar-foreground/60'
                )} />
                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            )
          })}
        </nav>

        {/* Bottom */}
        <div className="border-t border-sidebar-border p-3">
          <Link
            href="/settings"
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/70 transition-all hover:bg-sidebar-accent hover:text-sidebar-foreground',
              isCollapsed && 'justify-center px-2'
            )}
          >
            <Settings className="h-5 w-5 shrink-0" />
            {!isCollapsed && <span>Settings</span>}
          </Link>

          <button
            onClick={handleSignOut}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-destructive/80 transition-all hover:bg-destructive/10 hover:text-destructive',
              isCollapsed && 'justify-center px-2'
            )}
            title={isCollapsed ? 'Log out' : undefined}
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {!isCollapsed && <span>Log out</span>}
          </button>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg p-2 text-sidebar-foreground/60 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <>
                <ChevronLeft className="h-4 w-4" />
                <span className="text-xs">Collapse</span>
              </>
            )}
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <motion.div 
        className="flex flex-1 flex-col"
        initial={false}
        animate={{ marginLeft: isCollapsed ? 72 : 280 }}
        transition={transitions.smooth}
      >
        {/* Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-card/95 px-6 backdrop-blur-lg">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-semibold text-foreground">Safety Dashboard</h1>
            {totalAlerts > 0 && (
              <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">
                {totalAlerts} active alerts
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
              <Filter className="h-4 w-4" />
              <span>Filter</span>
            </button>

            <button className="relative rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
              <Bell className="h-5 w-5" />
              {totalAlerts > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white">
                  {totalAlerts > 9 ? '9+' : totalAlerts}
                </span>
              )}
            </button>

            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={userAvatar} />
                <AvatarFallback className="bg-primary/10 text-sm font-medium text-primary">
                  {initials}
                </AvatarFallback>
              </Avatar>
              {userName && (
                <span className="hidden text-sm font-medium text-foreground lg:inline">
                  {userName}
                </span>
              )}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={transitions.smooth}
            className="p-6"
          >
            {children}
          </motion.div>
        </main>
      </motion.div>
    </div>
  )
}
