'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import {
  LayoutDashboard,
  FolderKanban,
  BarChart3,
  Users,
  Video,
  Settings,
  ChevronLeft,
  ChevronRight,
  Search,
  Bell,
  ChevronDown,
  LogOut,
} from 'lucide-react'
import { transitions } from '@/components/core/motion'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface PMShellProps {
  children: React.ReactNode
  userName?: string
  userEmail?: string
  userAvatar?: string
  projects?: { id: string; name: string }[]
  currentProjectId?: string
}

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Workspace' },
  { href: '/projects', icon: FolderKanban, label: 'Projects' },
  { href: '/analytics', icon: BarChart3, label: 'Analytics' },
  { href: '/team', icon: Users, label: 'Team' },
  { href: '/videos', icon: Video, label: 'Videos' },
]

const bottomNavItems = [
  { href: '/settings', icon: Settings, label: 'Settings' },
]

export function PMShell({ 
  children, 
  userName, 
  userEmail,
  userAvatar,
  projects = [],
  currentProjectId,
}: PMShellProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isProjectSwitcherOpen, setIsProjectSwitcherOpen] = useState(false)

  const currentProject = projects.find(p => p.id === currentProjectId)
  const initials = userName?.split(' ').map(n => n[0]).join('').toUpperCase() || 'PM'

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isCollapsed ? 72 : 260 }}
        transition={transitions.smooth}
        className="fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-sidebar-border bg-sidebar"
      >
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-4">
          <motion.div 
            className="shrink-0"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Image src="/logo.png" alt="Blokt" width={40} height={40} className="h-10 w-10" />
          </motion.div>
          <AnimatePresence>
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="text-xl font-bold text-sidebar-foreground"
              >
                Blokt
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Project Switcher */}
        {!isCollapsed && projects.length > 0 && (
          <div className="border-b border-sidebar-border p-3">
            <button
              onClick={() => setIsProjectSwitcherOpen(!isProjectSwitcherOpen)}
              className="flex w-full items-center justify-between rounded-lg bg-sidebar-accent p-3 text-left transition-colors hover:bg-sidebar-accent/80"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-sidebar-foreground">
                  {currentProject?.name || 'Select Project'}
                </p>
                <p className="text-xs text-sidebar-foreground/60">Current workspace</p>
              </div>
              <ChevronDown className={cn(
                'h-4 w-4 shrink-0 text-sidebar-foreground/60 transition-transform',
                isProjectSwitcherOpen && 'rotate-180'
              )} />
            </button>
            
            <AnimatePresence>
              {isProjectSwitcherOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={transitions.fast}
                  className="mt-2 space-y-1 overflow-hidden"
                >
                  {projects.slice(0, 5).map((project) => (
                    <Link
                      key={project.id}
                      href={`/projects/${project.id}`}
                      onClick={() => setIsProjectSwitcherOpen(false)}
                      className={cn(
                        'block rounded-lg px-3 py-2 text-sm transition-colors',
                        project.id === currentProjectId
                          ? 'bg-sidebar-primary/20 text-sidebar-primary'
                          : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'
                      )}
                    >
                      {project.name}
                    </Link>
                  ))}
                  <Link
                    href="/projects"
                    className="block px-3 py-2 text-xs text-sidebar-primary hover:underline"
                  >
                    View all projects →
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
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
                    layoutId="pmNavActive"
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

        {/* Bottom Section */}
        <div className="border-t border-sidebar-border p-3">
          {bottomNavItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                  isCollapsed && 'justify-center px-2',
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-foreground'
                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'
                )}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {!isCollapsed && <span>{item.label}</span>}
              </Link>
            )
          })}

          {/* Logout Button */}
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

          {/* Collapse Button */}
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
        animate={{ marginLeft: isCollapsed ? 72 : 260 }}
        transition={transitions.smooth}
      >
        {/* Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-card/95 px-6 backdrop-blur-lg">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search projects, tasks..."
                className="h-10 w-64 rounded-lg border border-input bg-background pl-10 pr-4 text-sm outline-none ring-ring placeholder:text-muted-foreground focus:ring-2"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="relative rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
              <Bell className="h-5 w-5" />
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                3
              </span>
            </button>

            <div className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-muted">
              <Avatar className="h-8 w-8">
                <AvatarImage src={userAvatar} />
                <AvatarFallback className="bg-primary/10 text-sm font-medium text-primary">
                  {initials}
                </AvatarFallback>
              </Avatar>
              {userName && (
                <div className="hidden lg:block">
                  <p className="text-sm font-medium text-foreground">{userName}</p>
                  <p className="text-xs text-muted-foreground">Project Manager</p>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
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
