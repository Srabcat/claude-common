'use client'

import * as React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Briefcase,
  Calendar,
  Clock,
  DollarSign,
  Target,
  Award,
  Filter,
  Download,
  RefreshCw,
  Eye,
  ArrowUp,
  ArrowDown,
  Activity
} from 'lucide-react'
import { getCurrentUser, mockJobs, mockCandidates, mockEmployers, mockAgencies, mockInterviews } from '@/lib/mock-data'

interface AnalyticsMetric {
  title: string
  value: string | number
  change?: string
  changeType?: 'positive' | 'negative' | 'neutral'
  icon: React.ComponentType<any>
  description?: string
}

interface ChartData {
  label: string
  value: number
  percentage?: number
  color?: string
}

export default function AnalyticsPage() {
  const currentUser = getCurrentUser()
  const [timeRange, setTimeRange] = React.useState<'7d' | '30d' | '90d' | '1y'>('30d')

  // Core metrics calculation
  const getCoreMetrics = (): AnalyticsMetric[] => {
    const totalJobs = mockJobs.length
    const activeJobs = mockJobs.filter(j => j.status === 'active').length
    const totalCandidates = mockCandidates.length
    const totalPlacements = mockJobs.reduce((acc, job) => acc + job.offers, 0)
    const totalInterviews = mockInterviews.length
    
    const baseMetrics: AnalyticsMetric[] = [
      {
        title: 'Total Jobs Posted',
        value: totalJobs,
        change: '+12%',
        changeType: 'positive',
        icon: Briefcase,
        description: 'All job postings created'
      },
      {
        title: 'Active Candidates',
        value: totalCandidates,
        change: '+8%',
        changeType: 'positive',
        icon: Users,
        description: 'Candidates actively being processed'
      },
      {
        title: 'Interviews Conducted',
        value: totalInterviews,
        change: '+15%',
        changeType: 'positive',
        icon: Calendar,
        description: 'Total interviews scheduled and completed'
      },
      {
        title: 'Successful Placements',
        value: totalPlacements,
        change: '+22%',
        changeType: 'positive',
        icon: Award,
        description: 'Candidates successfully placed'
      }
    ]

    if (currentUser.role === 'platform_admin' || currentUser.role === 'platform_prototype') {
      return [
        ...baseMetrics,
        {
          title: 'Platform Revenue',
          value: '$127,450',
          change: '+18%',
          changeType: 'positive',
          icon: DollarSign,
          description: 'Total commission revenue'
        },
        {
          title: 'Agency Partners',
          value: mockAgencies.length,
          change: '+2',
          changeType: 'positive',
          icon: Target,
          description: 'Active recruiting agencies'
        },
        {
          title: 'Avg Time to Fill',
          value: '23 days',
          change: '-3 days',
          changeType: 'positive',
          icon: Clock,
          description: 'Average time from job post to hire'
        },
        {
          title: 'Platform Health Score',
          value: '92%',
          change: '+2%',
          changeType: 'positive',
          icon: Activity,
          description: 'Overall platform performance metric'
        }
      ]
    }

    return baseMetrics
  }

  const metrics = getCoreMetrics()

  // Funnel data
  const funnelData: ChartData[] = [
    { label: 'Job Posted', value: 100, percentage: 100, color: 'bg-blue-500' },
    { label: 'Applications', value: 347, percentage: 85, color: 'bg-green-500' },
    { label: 'Screening', value: 156, percentage: 45, color: 'bg-yellow-500' },
    { label: 'Interviews', value: 89, percentage: 26, color: 'bg-orange-500' },
    { label: 'Offers', value: 23, percentage: 7, color: 'bg-red-500' },
    { label: 'Hires', value: 18, percentage: 5, color: 'bg-purple-500' }
  ]

  // Performance by source
  const sourceData: ChartData[] = [
    { label: 'TechTalent Agency', value: 45, percentage: 35 },
    { label: 'Executive Search Pro', value: 32, percentage: 25 },
    { label: 'Direct Applications', value: 28, percentage: 22 },
    { label: 'Creative Collective', value: 23, percentage: 18 }
  ]

  // Job category performance
  const categoryData: ChartData[] = [
    { label: 'Engineering', value: 42, percentage: 38 },
    { label: 'Product', value: 28, percentage: 25 },
    { label: 'Design', value: 22, percentage: 20 },
    { label: 'Marketing', value: 18, percentage: 17 }
  ]

  const getChangeIcon = (type?: 'positive' | 'negative' | 'neutral') => {
    switch (type) {
      case 'positive':
        return <ArrowUp className="h-3 w-3 text-green-600" />
      case 'negative':
        return <ArrowDown className="h-3 w-3 text-red-600" />
      default:
        return <TrendingUp className="h-3 w-3 text-gray-500" />
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">
            Insights and performance metrics for your recruiting operations
          </p>
        </div>
        <div className="flex gap-2">
          <div className="flex gap-1 bg-muted p-1 rounded-lg">
            {(['7d', '30d', '90d', '1y'] as const).map((range) => (
              <Button
                key={range}
                variant={timeRange === range ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setTimeRange(range)}
              >
                {range}
              </Button>
            ))}
          </div>
          <Button variant="outline" size="icon">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {metric.title}
              </CardTitle>
              <metric.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              {metric.change && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                  {getChangeIcon(metric.changeType)}
                  {metric.change} from last period
                </div>
              )}
              {metric.description && (
                <p className="text-xs text-muted-foreground mt-1">
                  {metric.description}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recruitment Funnel */}
        <Card>
          <CardHeader>
            <CardTitle>Recruitment Funnel</CardTitle>
            <CardDescription>
              Candidate progression through hiring stages (Last 30 days)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {funnelData.map((stage, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{stage.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">{stage.value}</span>
                    <span className="text-xs text-muted-foreground">({stage.percentage}%)</span>
                  </div>
                </div>
                <div className="relative">
                  <Progress value={stage.percentage} className="h-3" />
                  <div 
                    className={`absolute top-0 left-0 h-3 rounded-full ${stage.color}`}
                    style={{ width: `${stage.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Performance by Source */}
        <Card>
          <CardHeader>
            <CardTitle>Performance by Source</CardTitle>
            <CardDescription>
              Top performing recruiting sources and channels
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {sourceData.map((source, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-primary" />
                  <span className="text-sm font-medium">{source.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <div className="text-sm font-bold">{source.value}</div>
                    <div className="text-xs text-muted-foreground">{source.percentage}%</div>
                  </div>
                  <div className="w-16">
                    <Progress value={source.percentage} className="h-2" />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Job Categories */}
        <Card>
          <CardHeader>
            <CardTitle>Job Categories</CardTitle>
            <CardDescription>
              Performance by job category
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {categoryData.map((category, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{category.label}</span>
                  <span className="text-muted-foreground">{category.value} hires</span>
                </div>
                <Progress value={category.percentage} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Time to Fill Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Time to Fill</CardTitle>
            <CardDescription>
              Average days from job post to hire
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">23</div>
                <div className="text-sm text-muted-foreground">Days Average</div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Engineering</span>
                  <span className="font-medium">28 days</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Design</span>
                  <span className="font-medium">19 days</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Product</span>
                  <span className="font-medium">25 days</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Marketing</span>
                  <span className="font-medium">21 days</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Success Rates */}
        <Card>
          <CardHeader>
            <CardTitle>Success Rates</CardTitle>
            <CardDescription>
              Key performance indicators
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span>Interview to Hire</span>
                  <span className="font-bold">20%</span>
                </div>
                <Progress value={20} className="h-2" />
              </div>
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span>Offer Acceptance</span>
                  <span className="font-bold">78%</span>
                </div>
                <Progress value={78} className="h-2" />
              </div>
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span>90-Day Retention</span>
                  <span className="font-bold">94%</span>
                </div>
                <Progress value={94} className="h-2" />
              </div>
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span>Client Satisfaction</span>
                  <span className="font-bold">4.6/5</span>
                </div>
                <Progress value={92} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics Table */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Performance Report</CardTitle>
          <CardDescription>
            Comprehensive breakdown of all recruiting activities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border">
            <table className="w-full">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="text-left p-3 font-medium">Metric</th>
                  <th className="text-left p-3 font-medium">Current Period</th>
                  <th className="text-left p-3 font-medium">Previous Period</th>
                  <th className="text-left p-3 font-medium">Change</th>
                  <th className="text-left p-3 font-medium">Trend</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-3">Total Applications</td>
                  <td className="p-3 font-medium">1,247</td>
                  <td className="p-3">1,156</td>
                  <td className="p-3 text-green-600">+7.9%</td>
                  <td className="p-3">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="p-3">Interview Rate</td>
                  <td className="p-3 font-medium">18.2%</td>
                  <td className="p-3">16.8%</td>
                  <td className="p-3 text-green-600">+1.4%</td>
                  <td className="p-3">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="p-3">Cost per Hire</td>
                  <td className="p-3 font-medium">$2,450</td>
                  <td className="p-3">$2,680</td>
                  <td className="p-3 text-green-600">-8.6%</td>
                  <td className="p-3">
                    <TrendingDown className="h-4 w-4 text-green-600" />
                  </td>
                </tr>
                <tr>
                  <td className="p-3">Quality Score</td>
                  <td className="p-3 font-medium">4.2/5.0</td>
                  <td className="p-3">4.1/5.0</td>
                  <td className="p-3 text-green-600">+0.1</td>
                  <td className="p-3">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* AI Insights for Platform Prototype */}
      {currentUser.role === 'platform_prototype' && (
        <Card>
          <CardHeader>
            <CardTitle>AI-Powered Insights</CardTitle>
            <CardDescription>
              Machine learning driven recommendations and predictions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-4">
                <h4 className="font-medium mb-2">Predictive Hiring Success</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Frontend developer roles in San Francisco have 87% likelihood of successful placement within 21 days
                </p>
                <Badge variant="outline">92% Confidence</Badge>
              </div>
              <div className="bg-green-50 dark:bg-green-950 rounded-lg p-4">
                <h4 className="font-medium mb-2">Optimization Opportunity</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Increasing TechTalent Agency allocation could improve overall fill rate by 12%
                </p>
                <Badge variant="outline">High Impact</Badge>
              </div>
              <div className="bg-yellow-50 dark:bg-yellow-950 rounded-lg p-4">
                <h4 className="font-medium mb-2">Market Intelligence</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  DevOps salary expectations increased 8% this quarter - adjust posting ranges
                </p>
                <Badge variant="outline">Action Required</Badge>
              </div>
              <div className="bg-purple-50 dark:bg-purple-950 rounded-lg p-4">
                <h4 className="font-medium mb-2">Quality Alert</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Creative Collective showing decreased performance - may need additional support
                </p>
                <Badge variant="outline">Monitor</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}