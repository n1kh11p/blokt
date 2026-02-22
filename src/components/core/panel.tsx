'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { transitions } from './motion'

interface SlidePanelProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  title?: string
  description?: string
  side?: 'right' | 'bottom'
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  className?: string
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  full: 'max-w-full',
}

const bottomSizeClasses = {
  sm: 'max-h-[30vh]',
  md: 'max-h-[50vh]',
  lg: 'max-h-[70vh]',
  xl: 'max-h-[85vh]',
  full: 'max-h-[95vh]',
}

export function SlidePanel({
  isOpen,
  onClose,
  children,
  title,
  description,
  side = 'right',
  size = 'md',
  className,
}: SlidePanelProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Panel */}
          {side === 'right' ? (
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={transitions.smooth}
              className={cn(
                'fixed right-0 top-0 z-50 h-full w-full bg-card shadow-2xl',
                sizeClasses[size],
                className
              )}
            >
              <div className="flex h-full flex-col">
                {/* Header */}
                <div className="flex items-start justify-between border-b border-border p-4">
                  <div>
                    {title && (
                      <h2 className="text-lg font-semibold text-foreground">{title}</h2>
                    )}
                    {description && (
                      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
                    )}
                  </div>
                  <button
                    onClick={onClose}
                    className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4">
                  {children}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={transitions.smooth}
              className={cn(
                'fixed bottom-0 left-0 right-0 z-50 w-full rounded-t-2xl bg-card shadow-2xl',
                bottomSizeClasses[size],
                className
              )}
            >
              <div className="flex h-full flex-col">
                {/* Drag handle */}
                <div className="flex justify-center py-2">
                  <div className="h-1 w-10 rounded-full bg-muted-foreground/30" />
                </div>

                {/* Header */}
                {(title || description) && (
                  <div className="border-b border-border px-4 pb-3">
                    {title && (
                      <h2 className="text-lg font-semibold text-foreground">{title}</h2>
                    )}
                    {description && (
                      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
                    )}
                  </div>
                )}

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4">
                  {children}
                </div>
              </div>
            </motion.div>
          )}
        </>
      )}
    </AnimatePresence>
  )
}

// Quick action sheet for mobile
interface ActionSheetProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  title?: string
}

export function ActionSheet({ isOpen, onClose, children, title }: ActionSheetProps) {
  return (
    <SlidePanel
      isOpen={isOpen}
      onClose={onClose}
      side="bottom"
      size="sm"
      title={title}
    >
      {children}
    </SlidePanel>
  )
}

// Action sheet button
interface ActionSheetButtonProps {
  onClick: () => void
  icon?: React.ReactNode
  children: React.ReactNode
  variant?: 'default' | 'destructive'
}

export function ActionSheetButton({ 
  onClick, 
  icon, 
  children, 
  variant = 'default' 
}: ActionSheetButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-3 rounded-lg p-3 text-left transition-colors',
        variant === 'destructive'
          ? 'text-destructive hover:bg-destructive/10'
          : 'text-foreground hover:bg-muted'
      )}
    >
      {icon && <span className="text-muted-foreground">{icon}</span>}
      <span className="font-medium">{children}</span>
    </button>
  )
}
