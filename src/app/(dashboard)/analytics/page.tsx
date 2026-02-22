import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { TrendingUp, TrendingDown, Target, Shield, Clock, Users } from 'lucide-react'
import { getAnalyticsData } from '@/lib/actions/analytics'

export default async function AnalyticsPage() {
  const { data: analytics, error } = await getAnalyticsData()

  if (error || !analytics) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-foreground">Unable to load analytics</h2>
          <p className="text-muted-foreground mt-2">{error || 'Unknown error'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 dark:text-white">Analytics</h1>
          <p className="text-stone-600 dark:text-stone-400">
            Track execution performance and safety metrics
          </p>
        </div>
        <div className="flex gap-2">
          <Select defaultValue="week">
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="all">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Project" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Projects</SelectItem>
              <SelectItem value="1">Downtown Tower</SelectItem>
              <SelectItem value="2">Harbor Bridge</SelectItem>
              <SelectItem value="3">Metro Station</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-stone-600">Avg Alignment</CardTitle>
            <Target className="h-4 w-4 text-stone-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.avgAlignment}%</div>
            <p className="text-xs text-green-600 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" /> {analytics.alignmentTrend} from last week
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-stone-600">Efficiency Score</CardTitle>
            <Clock className="h-4 w-4 text-stone-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.efficiencyScore}%</div>
            <p className="text-xs text-green-600 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" /> {analytics.efficiencyTrend} from last week
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-stone-600">Safety Compliance</CardTitle>
            <Shield className="h-4 w-4 text-stone-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.safetyCompliance}%</div>
            <p className="text-xs text-red-600 flex items-center gap-1">
              <TrendingDown className="h-3 w-3" /> {analytics.safetyTrend} from last week
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-stone-600">Active Workers</CardTitle>
            <Users className="h-4 w-4 text-stone-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.activeWorkers}</div>
            <p className="text-xs text-stone-500">across {analytics.projectCount} projects</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="alignment" className="space-y-4">
        <TabsList>
          <TabsTrigger value="alignment">Execution Alignment</TabsTrigger>
          <TabsTrigger value="efficiency">Efficiency</TabsTrigger>
          <TabsTrigger value="safety">Safety</TabsTrigger>
        </TabsList>

        <TabsContent value="alignment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Daily Alignment Score</CardTitle>
              <CardDescription>
                Planned vs completed tasks over the past week
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-end justify-between gap-2 pt-4">
                {analytics.alignmentData.map((day) => (
                  <div key={day.date} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full flex gap-1 h-[200px] items-end">
                      <div
                        className="flex-1 bg-stone-200 dark:bg-stone-700 rounded-t"
                        style={{ height: `${(day.planned / 35) * 100}%` }}
                      />
                      <div
                        className="flex-1 bg-amber-500 rounded-t"
                        style={{ height: `${(day.completed / 35) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-stone-500">{day.date}</span>
                    <span className="text-xs font-medium">{day.score}%</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-center gap-6 mt-4 pt-4 border-t">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-stone-200 dark:bg-stone-700 rounded" />
                  <span className="text-sm text-stone-600">Planned</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-amber-500 rounded" />
                  <span className="text-sm text-stone-600">Completed</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Project Comparison</CardTitle>
              <CardDescription>
                Alignment scores across all active projects
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.projectMetrics.map((project) => (
                  <div key={project.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-stone-900 dark:text-white">
                        {project.name}
                      </span>
                      <span className="text-sm font-medium">{project.alignment}%</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-stone-200 dark:bg-stone-700">
                      <div
                        className="h-full rounded-full bg-amber-500 transition-all"
                        style={{ width: `${project.alignment}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="efficiency" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Trade Performance</CardTitle>
                <CardDescription>
                  Tasks completed and on-time rate by trade
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.tradePerformance.map((item) => (
                    <div key={item.trade} className="flex items-center justify-between rounded-lg border border-stone-200 p-3 dark:border-stone-800">
                      <div>
                        <p className="font-medium text-stone-900 dark:text-white">{item.trade}</p>
                        <p className="text-sm text-stone-500">{item.tasksCompleted} tasks • {item.avgDuration}h avg</p>
                      </div>
                      <div className={`text-lg font-bold ${item.onTimeRate >= 90 ? 'text-green-600' : 'text-amber-600'}`}>
                        {item.onTimeRate}%
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Weekly Productivity Trend</CardTitle>
                <CardDescription>
                  Completion rates improving over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.weeklyTrends.map((week) => (
                    <div key={week.week} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-stone-900 dark:text-white">{week.week}</span>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-green-600">{week.completion}% completed</span>
                          <span className="text-red-500">{week.delays} delays</span>
                        </div>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-stone-200 dark:bg-stone-700">
                        <div
                          className="h-full rounded-full bg-green-500 transition-all"
                          style={{ width: `${week.productivity}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-stone-200 dark:border-stone-800">
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <TrendingUp className="h-4 w-4" />
                    <span>11% improvement over 4 weeks</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Task Duration Analysis</CardTitle>
              <CardDescription>
                Observed duration vs expected duration by task type
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {analytics.taskDurationAnalysis.map((item) => (
                  <div key={item.task} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-stone-900 dark:text-white">{item.task}</span>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-stone-500">
                          {item.observed}h / {item.expected}h expected
                        </span>
                        <span className={`font-medium ${item.efficiency >= 100 ? 'text-green-600' : 'text-amber-600'}`}>
                          {item.efficiency}%
                        </span>
                      </div>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-stone-200 dark:bg-stone-700">
                      <div
                        className={`h-full rounded-full transition-all ${
                          item.efficiency >= 100 ? 'bg-green-500' : 'bg-amber-500'
                        }`}
                        style={{ width: `${Math.min(item.efficiency, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="safety" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Safety Violations by Type</CardTitle>
              <CardDescription>
                Breakdown of safety incidents this week
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.safetyViolations.map((item) => (
                  <div
                    key={item.type}
                    className="flex items-center justify-between rounded-lg border border-stone-200 p-4 dark:border-stone-800"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-2 w-2 rounded-full ${
                          item.severity === 'critical'
                            ? 'bg-red-500'
                            : item.severity === 'high'
                            ? 'bg-orange-500'
                            : item.severity === 'medium'
                            ? 'bg-yellow-500'
                            : 'bg-blue-500'
                        }`}
                      />
                      <span className="text-stone-900 dark:text-white">{item.type}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-bold text-stone-900 dark:text-white">
                        {item.count}
                      </span>
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium ${
                          item.severity === 'critical'
                            ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                            : item.severity === 'high'
                            ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                            : item.severity === 'medium'
                            ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                            : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                        }`}
                      >
                        {item.severity}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
