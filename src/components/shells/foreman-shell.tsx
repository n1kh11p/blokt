'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import {
  LayoutDashboard,
  Users,
  CheckSquare,
  Shield,
  Upload,
  Calendar,
  LogOut,
} from 'lucide-react'
import { transitions } from '@/components/core/motion'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface ForemanShellProps {
  children: React.ReactNode
  userName?: string
  userAvatar?: string
  crewCount?: number
  todayDate?: string
}

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Overview' },
  { href: '/team', icon: Users, label: 'Crew' },
  { href: '/review', icon: CheckSquare, label: 'Tasks' },
  { href: '/safety', icon: Shield, label: 'Safety' },
  { href: '/upload', icon: Upload, label: 'Upload' },
]

export function ForemanShell({ 
  children, 
  userName, 
  userAvatar,
  crewCount = 0,
  todayDate,
}: ForemanShellProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const initials = userName?.split(' ').map(n => n[0]).join('').toUpperCase() || 'FM'
  const displayDate = todayDate || new Date().toLocaleDateString('en-US', { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric' 
  })

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header with crew status */}
      <header className="sticky top-0 z-30 border-b border-border bg-card/95 backdrop-blur-lg">
        <div className="flex h-16 items-center justify-between px-4">
          {/* Logo + Date */}
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="flex items-center gap-2">
              <Image src="/logo.png" alt="Blokt" width={36} height={36} className="h-9 w-9" />
              <span className="hidden font-bold text-foreground sm:inline">Blokt</span>
            </Link>
            
            <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-1.5">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">{displayDate}</span>
            </div>
          </div>

          {/* Crew count + User */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium text-foreground">{crewCount}</span>
              <span className="hidden text-muted-foreground sm:inline">crew active</span>
            </div>

            <Link href="/settings" className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={userAvatar} />
                <AvatarFallback className="bg-primary/10 text-sm font-medium text-primary">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </Link>

            <button
              onClick={handleSignOut}
              className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
              title="Log out"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="flex gap-1 overflow-x-auto px-4 pb-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'relative flex shrink-0 items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="foremanNav"
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
      </header>

      {/* Content */}
      <main>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={transitions.smooth}
          className="p-4"
        >
          {children}
        </motion.div>
      </main>
    </div>
  )
}
