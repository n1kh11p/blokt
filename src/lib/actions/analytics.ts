'use server'

import { createClient } from '@/lib/supabase/server'

// ============================================
// TYPES
// ============================================

export interface AlignmentDataPoint {
  date: string
  planned: number
  completed: number
  score: number
}

export interface ProjectMetrics {
  name: string
  alignment: number
  efficiency: number
  safety: number
}

export interface TradePerformance {
  trade: string
  tasksCompleted: number
  avgDuration: number
  onTimeRate: number
}

export interface WeeklyTrend {
  week: string
  completion: number
  delays: number
  productivity: number
}

export interface TaskDurationAnalysis {
  task: string
  observed: number
  expected: number
  efficiency: number
}

export interface SafetyViolation {
  type: string
  count: number
  severity: 'critical' | 'high' | 'medium' | 'low'
}

export interface AnalyticsData {
  // Summary metrics
  avgAlignment: number
  efficiencyScore: number
  safetyCompliance: number
  activeWorkers: number
  projectCount: number
  
  // Trend data
  alignmentTrend: string // e.g., "+4%"
  efficiencyTrend: string // e.g., "+2%"
  safetyTrend: string // e.g., "-1%"
  
  // Detailed data
  alignmentData: AlignmentDataPoint[]
  projectMetrics: ProjectMetrics[]
  tradePerformance: TradePerformance[]
  weeklyTrends: WeeklyTrend[]
  taskDurationAnalysis: TaskDurationAnalysis[]
  safetyViolations: SafetyViolation[]
}

interface ApiResponse<T> {
  error: string | null
  data: T | null
}

// ============================================
// HELPER: Get authenticated user
// ============================================

async function getAuthenticatedUser() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    return { user: null, supabase, error: 'Not authenticated' }
  }
  
  return { user, supabase, error: null }
}

// ============================================
// GET ANALYTICS DATA
// Returns analytics data (currently mock data)
// ============================================

export async function getAnalyticsData(): Promise<ApiResponse<AnalyticsData>> {
  const { user, error: authError } = await getAuthenticatedUser()
  
  if (authError || !user) {
    return { error: authError || 'Not authenticated', data: null }
  }

  try {
    // TODO: Replace with real database queries
    // For now, return mock data through the API
    
    const mockAlignmentData: AlignmentDataPoint[] = [
      { date: 'Mon', planned: 24, completed: 22, score: 92 },
      { date: 'Tue', planned: 28, completed: 25, score: 89 },
      { date: 'Wed', planned: 22, completed: 20, score: 91 },
      { date: 'Thu', planned: 30, completed: 24, score: 80 },
      { date: 'Fri', planned: 26, completed: 25, score: 96 },
    ]

    const mockProjects: ProjectMetrics[] = [
      { name: 'Airport Terminal B', alignment: 87, efficiency: 94, safety: 98 },
      { name: 'Downtown Office Complex', alignment: 92, efficiency: 88, safety: 100 },
      { name: 'Riverside Condominiums', alignment: 74, efficiency: 82, safety: 95 },
      { name: 'Highway 101 Expansion', alignment: 91, efficiency: 96, safety: 97 },
    ]

    const mockTradePerformance: TradePerformance[] = [
      { trade: 'Concrete', tasksCompleted: 45, avgDuration: 4.2, onTimeRate: 94 },
      { trade: 'Electrical', tasksCompleted: 38, avgDuration: 3.8, onTimeRate: 91 },
      { trade: 'Steel', tasksCompleted: 32, avgDuration: 6.5, onTimeRate: 88 },
      { trade: 'Plumbing', tasksCompleted: 28, avgDuration: 3.2, onTimeRate: 96 },
      { trade: 'HVAC', tasksCompleted: 22, avgDuration: 5.1, onTimeRate: 85 },
    ]

    const mockWeeklyTrends: WeeklyTrend[] = [
      { week: 'Week 1', completion: 78, delays: 12, productivity: 82 },
      { week: 'Week 2', completion: 82, delays: 9, productivity: 85 },
      { week: 'Week 3', completion: 85, delays: 7, productivity: 88 },
      { week: 'Week 4', completion: 89, delays: 5, productivity: 91 },
    ]

    const mockTaskDurationAnalysis: TaskDurationAnalysis[] = [
      { task: 'Electrical Work', observed: 4.2, expected: 4.5, efficiency: 107 },
      { task: 'Concrete Pour', observed: 6.8, expected: 6.0, efficiency: 88 },
      { task: 'Steel Framing', observed: 8.2, expected: 8.0, efficiency: 98 },
      { task: 'HVAC Installation', observed: 5.5, expected: 5.0, efficiency: 91 },
      { task: 'Plumbing', observed: 3.8, expected: 4.0, efficiency: 105 },
    ]

    const mockSafetyViolations: SafetyViolation[] = [
      { type: 'Missing Hard Hat', count: 3, severity: 'high' },
      { type: 'Improper Fall Protection', count: 2, severity: 'critical' },
      { type: 'Unsafe Ladder Usage', count: 4, severity: 'medium' },
      { type: 'Missing Safety Vest', count: 6, severity: 'low' },
      { type: 'PPE Non-Compliance', count: 2, severity: 'medium' },
    ]

    // Calculate summary metrics
    const avgAlignment = Math.round(
      mockAlignmentData.reduce((acc, d) => acc + d.score, 0) / mockAlignmentData.length
    )

    const analyticsData: AnalyticsData = {
      // Summary metrics
      avgAlignment,
      efficiencyScore: 88,
      safetyCompliance: 97,
      activeWorkers: 48,
      projectCount: 8,
      
      // Trends
      alignmentTrend: '+4%',
      efficiencyTrend: '+2%',
      safetyTrend: '-1%',
      
      // Detailed data
      alignmentData: mockAlignmentData,
      projectMetrics: mockProjects,
      tradePerformance: mockTradePerformance,
      weeklyTrends: mockWeeklyTrends,
      taskDurationAnalysis: mockTaskDurationAnalysis,
      safetyViolations: mockSafetyViolations,
    }

    return { error: null, data: analyticsData }
  } catch (err) {
    console.error('[Analytics] Error fetching analytics data:', err)
    return { error: err instanceof Error ? err.message : 'Failed to fetch analytics data', data: null }
  }
}
