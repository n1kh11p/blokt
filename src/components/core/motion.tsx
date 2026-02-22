'use client'

import { motion, type Variants, type Transition } from 'framer-motion'
import { forwardRef } from 'react'

// Timing tokens
export const timing = {
  fast: 0.15,
  normal: 0.2,
  smooth: 0.3,
  slow: 0.4,
} as const

// Easing presets
export const easing = {
  easeOut: [0.16, 1, 0.3, 1],
  easeInOut: [0.65, 0, 0.35, 1],
  spring: { type: 'spring', stiffness: 300, damping: 30 },
  springSmooth: { type: 'spring', stiffness: 200, damping: 25 },
  springBouncy: { type: 'spring', stiffness: 400, damping: 25 },
} as const

// Standard transitions
export const transitions: Record<string, Transition> = {
  fast: { duration: timing.fast, ease: easing.easeOut },
  normal: { duration: timing.normal, ease: easing.easeOut },
  smooth: { ...easing.spring },
  slow: { ...easing.springSmooth },
  layout: { type: 'spring', stiffness: 300, damping: 30 },
}

// Animation variants
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: transitions.normal },
  exit: { opacity: 0, transition: transitions.fast },
}

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: transitions.smooth },
  exit: { opacity: 0, y: -8, transition: transitions.fast },
}

export const fadeInDown: Variants = {
  hidden: { opacity: 0, y: -16 },
  visible: { opacity: 1, y: 0, transition: transitions.smooth },
  exit: { opacity: 0, y: 8, transition: transitions.fast },
}

export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 24 },
  visible: { opacity: 1, x: 0, transition: transitions.smooth },
  exit: { opacity: 0, x: 24, transition: transitions.fast },
}

export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -24 },
  visible: { opacity: 1, x: 0, transition: transitions.smooth },
  exit: { opacity: 0, x: -24, transition: transitions.fast },
}

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: transitions.smooth },
  exit: { opacity: 0, scale: 0.95, transition: transitions.fast },
}

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
}

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: transitions.smooth,
  },
}

// Hover animations
export const hoverLift = {
  whileHover: { y: -2, transition: transitions.fast },
  whileTap: { scale: 0.98, transition: transitions.fast },
}

export const hoverScale = {
  whileHover: { scale: 1.02, transition: transitions.fast },
  whileTap: { scale: 0.98, transition: transitions.fast },
}

export const hoverGlow = {
  whileHover: { 
    boxShadow: '0 0 20px oklch(0.68 0.19 45 / 0.3)',
    transition: transitions.normal,
  },
}

// Motion components
export const MotionDiv = motion.div
export const MotionSpan = motion.span
export const MotionButton = motion.button
export const MotionUl = motion.ul
export const MotionLi = motion.li

// Animated container with stagger
interface StaggerListProps {
  children: React.ReactNode
  className?: string
  delay?: number
}

export const StaggerList = forwardRef<HTMLDivElement, StaggerListProps>(
  ({ children, className, delay = 0 }, ref) => (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: 0.05,
            delayChildren: delay,
          },
        },
      }}
    >
      {children}
    </motion.div>
  )
)
StaggerList.displayName = 'StaggerList'

// Animated page wrapper
interface PageTransitionProps {
  children: React.ReactNode
  className?: string
}

export function PageTransition({ children, className }: PageTransitionProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={transitions.smooth}
    >
      {children}
    </motion.div>
  )
}

// Presence wrapper for conditional rendering
export { AnimatePresence } from 'framer-motion'
