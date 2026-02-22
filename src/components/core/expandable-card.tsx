'use client'

import { useState } from 'react'
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { transitions } from './motion'

interface ExpandableCardProps {
  id: string
  header: React.ReactNode
  children: React.ReactNode
  defaultExpanded?: boolean
  className?: string
  headerClassName?: string
  contentClassName?: string
  onExpandChange?: (expanded: boolean) => void
}

export function ExpandableCard({
  id,
  header,
  children,
  defaultExpanded = false,
  className,
  headerClassName,
  contentClassName,
  onExpandChange,
}: ExpandableCardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)

  const handleToggle = () => {
    const newState = !isExpanded
    setIsExpanded(newState)
    onExpandChange?.(newState)
  }

  return (
    <motion.div
      layout
      layoutId={`expandable-${id}`}
      transition={transitions.layout}
      className={cn(
        'overflow-hidden rounded-lg border border-border bg-card',
        className
      )}
    >
      <motion.button
        layout="position"
        onClick={handleToggle}
        className={cn(
          'flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-muted/50',
          headerClassName
        )}
      >
        <div className="flex-1">{header}</div>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={transitions.fast}
        >
          <ChevronDown className="h-5 w-5 text-muted-foreground" />
        </motion.div>
      </motion.button>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={transitions.smooth}
          >
            <div className={cn('border-t border-border p-4', contentClassName)}>
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// Card that morphs into a detail view
interface MorphCardProps {
  id: string
  preview: React.ReactNode
  expanded: React.ReactNode
  isSelected: boolean
  onSelect: () => void
  onDeselect: () => void
  className?: string
}

export function MorphCard({
  id,
  preview,
  expanded,
  isSelected,
  onSelect,
  onDeselect,
  className,
}: MorphCardProps) {
  return (
    <LayoutGroup id={id}>
      <AnimatePresence mode="wait">
        {!isSelected ? (
          <motion.div
            layoutId={`morph-card-${id}`}
            onClick={onSelect}
            className={cn(
              'cursor-pointer rounded-lg border border-border bg-card p-4 transition-shadow hover:shadow-md',
              className
            )}
            whileHover={{ y: -2 }}
            transition={transitions.fast}
          >
            {preview}
          </motion.div>
        ) : (
          <motion.div
            layoutId={`morph-card-${id}`}
            className={cn(
              'fixed inset-4 z-50 overflow-hidden rounded-xl border border-border bg-card shadow-2xl md:inset-8 lg:inset-16',
              className
            )}
          >
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-end border-b border-border p-2">
                <button
                  onClick={onDeselect}
                  className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                {expanded}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Backdrop */}
      <AnimatePresence>
        {isSelected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onDeselect}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          />
        )}
      </AnimatePresence>
    </LayoutGroup>
  )
}

// Metric card with animation
interface MetricCardProps {
  label: string
  value: string | number
  trend?: {
    value: number
    isPositive: boolean
  }
  icon?: React.ReactNode
  accentColor?: 'orange' | 'green' | 'blue' | 'red' | 'purple'
  className?: string
  onClick?: () => void
}

const accentClasses = {
  orange: 'bg-primary/10 text-primary',
  green: 'bg-success/10 text-success',
  blue: 'bg-blue-500/10 text-blue-500',
  red: 'bg-destructive/10 text-destructive',
  purple: 'bg-purple-500/10 text-purple-500',
}

export function MetricCard({
  label,
  value,
  trend,
  icon,
  accentColor = 'orange',
  className,
  onClick,
}: MetricCardProps) {
  return (
    <motion.div
      whileHover={onClick ? { y: -2, scale: 1.01 } : undefined}
      whileTap={onClick ? { scale: 0.99 } : undefined}
      transition={transitions.fast}
      onClick={onClick}
      className={cn(
        'rounded-xl border border-border bg-card p-4',
        onClick && 'cursor-pointer',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          {trend && (
            <p className={cn(
              'flex items-center gap-1 text-xs font-medium',
              trend.isPositive ? 'text-success' : 'text-destructive'
            )}>
              <svg 
                className={cn('h-3 w-3', !trend.isPositive && 'rotate-180')} 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
              {trend.isPositive ? '+' : ''}{trend.value}%
            </p>
          )}
        </div>
        {icon && (
          <div className={cn('rounded-lg p-2', accentClasses[accentColor])}>
            {icon}
          </div>
        )}
      </div>
    </motion.div>
  )
}
