'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MapPin, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ProjectCardProps {
  id: string
  name: string
  location: string
  status: string
  tasksCompleted: number
  totalTasks: number
}

const statusConfig: Record<string, { label: string; className: string; dotColor: string }> = {
  active: { 
    label: 'Active', 
    className: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    dotColor: 'bg-emerald-500'
  },
  completed: { 
    label: 'Completed', 
    className: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    dotColor: 'bg-blue-500'
  },
  on_hold: { 
    label: 'On Hold', 
    className: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    dotColor: 'bg-amber-500'
  },
  planning: { 
    label: 'Planning', 
    className: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
    dotColor: 'bg-purple-500'
  },
  cancelled: { 
    label: 'Cancelled', 
    className: 'bg-red-500/10 text-red-500 border-red-500/20',
    dotColor: 'bg-red-500'
  },
}

export function ProjectCard({
  id,
  name,
  location,
  status,
  tasksCompleted,
  totalTasks,
}: ProjectCardProps) {
  const progress = totalTasks > 0 ? (tasksCompleted / totalTasks) * 100 : 0
  const config = statusConfig[status] || statusConfig.active

  return (
    <Link href={`/projects/${id}`}>
      <motion.div
        whileHover={{ y: -4 }}
        transition={{ duration: 0.2 }}
      >
        <Card className="group relative cursor-pointer overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
          {/* Progress bar at top */}
          <div className="absolute left-0 right-0 top-0 h-1 bg-muted">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="h-full bg-primary"
            />
          </div>

          <CardHeader className="pb-3 pt-5">
            <div className="flex items-start justify-between gap-2">
              <CardTitle className="text-base font-semibold text-foreground line-clamp-1">
                {name}
              </CardTitle>
              <Badge 
                variant="outline" 
                className={cn('shrink-0 border', config.className)}
              >
                <span className={cn('mr-1.5 h-1.5 w-1.5 rounded-full', config.dotColor)} />
                {config.label}
              </Badge>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" />
              <span className="line-clamp-1">{location}</span>
            </div>
          </CardHeader>

          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-2xl font-bold text-foreground">
                  {tasksCompleted}<span className="text-muted-foreground">/{totalTasks}</span>
                </p>
                <p className="text-xs text-muted-foreground">tasks completed</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted/50 text-muted-foreground transition-all group-hover:bg-primary group-hover:text-primary-foreground">
                <ArrowRight className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </Link>
  )
}
