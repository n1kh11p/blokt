'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  FolderKanban,
  Video,
  PlaySquare,
  BarChart3,
  Settings,
  Shield,
  Users,
  HardHat,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import type { UserRole } from '@/types/database'

interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  roles?: UserRole[]
  section?: 'main' | 'tools' | 'settings'
}

const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    section: 'main',
  },
  {
    title: 'Projects',
    href: '/projects',
    icon: FolderKanban,
    section: 'main',
  },
  {
    title: 'Videos',
    href: '/videos',
    icon: Video,
    section: 'main',
  },
  {
    title: 'Review',
    href: '/review',
    icon: PlaySquare,
    roles: ['project_manager', 'foreman', 'safety_manager'],
    section: 'tools',
  },
  {
    title: 'Analytics',
    href: '/analytics',
    icon: BarChart3,
    section: 'tools',
  },
  {
    title: 'Safety',
    href: '/safety',
    icon: Shield,
    section: 'tools',
  },
  {
    title: 'Team',
    href: '/team',
    icon: Users,
    roles: ['project_manager', 'foreman', 'executive'],
    section: 'tools',
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: Settings,
    section: 'settings',
  },
]

const roleLabels: Record<UserRole, string> = {
  project_manager: 'Project Manager',
  foreman: 'Foreman',
  field_worker: 'Field Worker',
  safety_manager: 'Safety Manager',
  executive: 'Executive',
}

const roleColors: Record<UserRole, string> = {
  project_manager: 'bg-blue-500/20 text-blue-400',
  foreman: 'bg-amber-500/20 text-amber-400',
  field_worker: 'bg-green-500/20 text-green-400',
  safety_manager: 'bg-red-500/20 text-red-400',
  executive: 'bg-purple-500/20 text-purple-400',
}

interface SidebarProps {
  userRole?: UserRole
  collapsed?: boolean
  onCollapsedChange?: (collapsed: boolean) => void
}

export function Sidebar({ userRole, collapsed = false, onCollapsedChange }: SidebarProps) {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(collapsed)

  const handleCollapse = () => {
    const newState = !isCollapsed
    setIsCollapsed(newState)
    onCollapsedChange?.(newState)
  }

  const filteredNavItems = navItems.filter((item) => {
    if (!item.roles) return true
    if (!userRole) return true
    return item.roles.includes(userRole)
  })

  const mainItems = filteredNavItems.filter(i => i.section === 'main')
  const toolItems = filteredNavItems.filter(i => i.section === 'tools')
  const settingsItems = filteredNavItems.filter(i => i.section === 'settings')

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 72 : 256 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      className="fixed left-0 top-0 z-40 h-screen border-r border-sidebar-border bg-sidebar"
    >
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
          <Link href="/dashboard" className="flex items-center gap-3">
            <motion.div 
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <HardHat className="h-5 w-5 text-primary-foreground" />
            </motion.div>
            <AnimatePresence>
              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="text-xl font-bold text-sidebar-foreground"
                >
                  Blokt
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
        </div>

        {/* Role Badge */}
        {userRole && (
          <div className="px-3 py-3">
            <AnimatePresence mode="wait">
              {isCollapsed ? (
                <motion.div
                  key="collapsed-role"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className={cn(
                    'mx-auto flex h-8 w-8 items-center justify-center rounded-lg text-xs font-medium',
                    roleColors[userRole]
                  )}
                  title={roleLabels[userRole]}
                >
                  {roleLabels[userRole].charAt(0)}
                </motion.div>
              ) : (
                <motion.div
                  key="expanded-role"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className={cn(
                    'rounded-lg px-3 py-2 text-xs font-medium',
                    roleColors[userRole]
                  )}
                >
                  {roleLabels[userRole]}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-2">
          {/* Main Section */}
          <div className="space-y-1">
            {!isCollapsed && (
              <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/50">
                Main
              </p>
            )}
            {mainItems.map((item) => (
              <NavLink key={item.href} item={item} isCollapsed={isCollapsed} pathname={pathname} />
            ))}
          </div>

          {/* Tools Section */}
          {toolItems.length > 0 && (
            <div className="space-y-1">
              {!isCollapsed && (
                <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/50">
                  Tools
                </p>
              )}
              {toolItems.map((item) => (
                <NavLink key={item.href} item={item} isCollapsed={isCollapsed} pathname={pathname} />
              ))}
            </div>
          )}
        </nav>

        {/* Settings & Collapse */}
        <div className="border-t border-sidebar-border p-3">
          {settingsItems.map((item) => (
            <NavLink key={item.href} item={item} isCollapsed={isCollapsed} pathname={pathname} />
          ))}
          
          <button
            onClick={handleCollapse}
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
      </div>
    </motion.aside>
  )
}

function NavLink({ 
  item, 
  isCollapsed, 
  pathname 
}: { 
  item: NavItem
  isCollapsed: boolean
  pathname: string 
}) {
  const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
  
  return (
    <Link
      href={item.href}
      className={cn(
        'group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
        isCollapsed && 'justify-center px-2',
        isActive
          ? 'bg-sidebar-accent text-sidebar-primary'
          : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'
      )}
      title={isCollapsed ? item.title : undefined}
    >
      {/* Active indicator */}
      {isActive && (
        <motion.div
          layoutId="activeNav"
          className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-sidebar-primary"
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        />
      )}
      
      <item.icon className={cn(
        'h-5 w-5 shrink-0 transition-colors',
        isActive ? 'text-sidebar-primary' : 'text-sidebar-foreground/60 group-hover:text-sidebar-foreground'
      )} />
      
      <AnimatePresence>
        {!isCollapsed && (
          <motion.span
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 'auto' }}
            exit={{ opacity: 0, width: 0 }}
            className="truncate"
          >
            {item.title}
          </motion.span>
        )}
      </AnimatePresence>
    </Link>
  )
}
