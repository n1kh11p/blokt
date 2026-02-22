'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
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
} from 'lucide-react'
import type { UserRole } from '@/types/database'

interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  roles?: UserRole[]
}

const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Projects',
    href: '/projects',
    icon: FolderKanban,
  },
  {
    title: 'Videos',
    href: '/videos',
    icon: Video,
  },
  {
    title: 'Review',
    href: '/review',
    icon: PlaySquare,
    roles: ['project_manager', 'foreman', 'safety_manager'],
  },
  {
    title: 'Analytics',
    href: '/analytics',
    icon: BarChart3,
    roles: ['project_manager', 'safety_manager', 'executive'],
  },
  {
    title: 'Safety',
    href: '/safety',
    icon: Shield,
  },
  {
    title: 'Team',
    href: '/team',
    icon: Users,
    roles: ['project_manager', 'foreman', 'executive'],
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: Settings,
  },
]

interface SidebarProps {
  userRole?: UserRole
}

export function Sidebar({ userRole }: SidebarProps) {
  const pathname = usePathname()

  const filteredNavItems = navItems.filter((item) => {
    if (!item.roles) return true
    if (!userRole) return true
    return item.roles.includes(userRole)
  })

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-950">
      <div className="flex h-full flex-col">
        <div className="flex h-16 items-center gap-2 border-b border-stone-200 px-6 dark:border-stone-800">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500">
            <HardHat className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-stone-900 dark:text-white">Blokt</span>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {filteredNavItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400'
                    : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-white'
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.title}
              </Link>
            )
          })}
        </nav>

        <div className="border-t border-stone-200 p-4 dark:border-stone-800">
          <div className="text-xs text-stone-500 dark:text-stone-400">
            Construction Intelligence
          </div>
        </div>
      </div>
    </aside>
  )
}
