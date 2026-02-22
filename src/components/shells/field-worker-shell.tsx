'use client'

import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import { 
  LayoutDashboard, 
  FolderKanban, 
  Upload, 
  Shield,
  User,
  LogOut,
} from 'lucide-react'
import { transitions } from '@/components/core/motion'

interface FieldWorkerShellProps {
  children: React.ReactNode
  userName?: string
}

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Today' },
  { href: '/projects', icon: FolderKanban, label: 'Projects' },
  { href: '/upload', icon: Upload, label: 'Upload', isAction: true },
  { href: '/safety', icon: Shield, label: 'Safety' },
  { href: '/settings', icon: User, label: 'Profile' },
]

export function FieldWorkerShell({ children, userName }: FieldWorkerShellProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Compact Header */}
      <header className="sticky top-0 z-30 border-b border-border bg-card/95 backdrop-blur-lg safe-area-top">
        <div className="flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Image 
              src="/logo.png" 
              alt="Blokt" 
              width={32} 
              height={32} 
              className="h-8 w-8"
            />
            <span className="font-semibold text-foreground">Blokt</span>
          </div>
          <div className="flex items-center gap-3">
            {userName && (
              <span className="text-sm text-muted-foreground">
                Hi, {userName.split(' ')[0]}
              </span>
            )}
            <button
              onClick={handleSignOut}
              className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
              title="Log out"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content - Full width, scrollable */}
      <main className="flex-1 overflow-y-auto pb-24">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={transitions.smooth}
          className="p-4"
        >
          {children}
        </motion.div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-card/95 backdrop-blur-lg safe-area-bottom">
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
            
            if (item.isAction) {
              return (
                <Link key={item.href} href={item.href}>
                  <motion.div
                    whileTap={{ scale: 0.9 }}
                    className="flex h-14 w-14 items-center justify-center rounded-full bg-primary shadow-lg shadow-primary/30"
                  >
                    <item.icon className="h-6 w-6 text-primary-foreground" />
                  </motion.div>
                </Link>
              )
            }

            return (
              <Link key={item.href} href={item.href} className="relative flex flex-col items-center gap-1 px-4 py-2">
                {isActive && (
                  <motion.div
                    layoutId="fieldWorkerNav"
                    className="absolute inset-0 rounded-xl bg-primary/10"
                    transition={transitions.smooth}
                  />
                )}
                <item.icon className={cn(
                  'relative h-5 w-5 transition-colors',
                  isActive ? 'text-primary' : 'text-muted-foreground'
                )} />
                <span className={cn(
                  'relative text-[10px] font-medium',
                  isActive ? 'text-primary' : 'text-muted-foreground'
                )}>
                  {item.label}
                </span>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
