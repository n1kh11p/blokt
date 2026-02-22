'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import {
  LayoutDashboard,
  BarChart3,
  Shield,
  Settings,
  LogOut,
} from 'lucide-react'
import { transitions } from '@/components/core/motion'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface ExecutiveShellProps {
  children: React.ReactNode
  userName?: string
  userAvatar?: string
}

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Overview' },
  { href: '/analytics', icon: BarChart3, label: 'Analytics' },
  { href: '/safety', icon: Shield, label: 'Safety' },
]

export function ExecutiveShell({ children, userName, userAvatar }: ExecutiveShellProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const initials = userName?.split(' ').map(n => n[0]).join('').toUpperCase() || 'EX'

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Minimal top navigation */}
      <header className="sticky top-0 z-30 border-b border-border bg-card/95 backdrop-blur-lg">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          {/* Logo + Nav */}
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="flex items-center gap-2">
              <Image src="/logo.png" alt="Blokt" width={36} height={36} className="h-9 w-9" />
              <span className="text-lg font-bold text-foreground">Blokt</span>
            </Link>

            <nav className="flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'relative flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors',
                      isActive
                        ? 'text-foreground'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="execNav"
                        className="absolute inset-0 rounded-lg bg-muted"
                        transition={transitions.smooth}
                      />
                    )}
                    <item.icon className="relative h-4 w-4" />
                    <span className="relative">{item.label}</span>
                  </Link>
                )
              })}
            </nav>
          </div>

          {/* User */}
          <div className="flex items-center gap-4">
            <Link
              href="/settings"
              className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <Settings className="h-5 w-5" />
            </Link>

            <button
              onClick={handleSignOut}
              className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
              title="Log out"
            >
              <LogOut className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9 border-2 border-primary/20">
                <AvatarImage src={userAvatar} />
                <AvatarFallback className="bg-primary/10 text-sm font-medium text-primary">
                  {initials}
                </AvatarFallback>
              </Avatar>
              {userName && (
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-foreground">{userName}</p>
                  <p className="text-xs text-muted-foreground">Executive</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Content - Centered, clean */}
      <main className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={transitions.smooth}
          className="px-6 py-8"
        >
          {children}
        </motion.div>
      </main>
    </div>
  )
}
