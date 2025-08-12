'use client'

import * as React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  Users, 
  Briefcase, 
  Building2, 
  UserCheck, 
  Calendar, 
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Target,
  DollarSign,
  Activity
} from 'lucide-react'
import { mockJobs, mockCandidates, mockEmployers, mockAgencies, mockInterviews, getCurrentUser } from '@/lib/mock-data'

interface MetricCard {
  title: string
  value: string | number
  change?: string
  changeType?: 'positive' | 'negative' | 'neutral'
  icon: React.ComponentType<any>
  description?: string
}

export default function DashboardPage() {
  const currentUser = getCurrentUser()
  
  // Calculate metrics based on role
  const getMetrics = (): MetricCard[] => {
    const activeJobs = mockJobs.filter(j => j.status === 'active').length
    const totalCandidates = mockCandidates.length
    const scheduledInterviews = mockInterviews.filter(i => i.status === 'scheduled').length
    const placementsPending = mockJobs.reduce((acc, job) => acc + job.offers, 0)
    
    const baseMetrics: MetricCard[] = [
      {
        title: 'Active Jobs',
        value: activeJobs,
        change: '+12%',
        changeType: 'positive',
        icon: Briefcase,
        description: 'Jobs currently accepting applications'
      },
      {
        title: 'Total Candidates',
        value: totalCandidates,
        change: '+8%',
        changeType: 'positive',
        icon: Users,
        description: 'Candidates in the system'
      },
      {
        title: 'Interviews This Week',
        value: scheduledInterviews,
        change: '+3',
        changeType: 'positive',
        icon: Calendar,
        description: 'Scheduled interviews'
      },
      {
        title: 'Placements Pending',
        value: placementsPending,
        change: '2',
        changeType: 'neutral',
        icon: UserCheck,
        description: 'Offers extended, awaiting response'
      }
    ]

    if (currentUser.role === 'platform_admin' || currentUser.role === 'platform_prototype') {
      return [
        ...baseMetrics,
        {
          title: 'Active Employers',
          value: mockEmployers.length,
          change: '+2',
          changeType: 'positive',
          icon: Building2,
          description: 'Companies actively hiring'
        },
        {
          title: 'Partner Agencies',
          value: mockAgencies.length,
          change: '+1',
          changeType: 'positive',
          icon: Target,
          description: 'Recruiting agencies in network'
        },
        {
          title: 'Monthly Revenue',
          value: '$127K',
          change: '+18%',
          changeType: 'positive',
          icon: DollarSign,
          description: 'Platform commission revenue'
        },
        {
          title: 'System Health',
          value: '99.9%',
          change: 'Stable',
          changeType: 'positive',
          icon: Activity,
          description: 'Platform uptime this month'
        }
      ]
    }

    return baseMetrics
  }

  const metrics = getMetrics()

  // Recent activity based on role
  const getRecentActivity = () => {
    return [
      { 
        action: 'New candidate added', 
        item: 'Sarah Davis - UI/UX Designer', 
        time: '2 hours ago',
        type: 'candidate' as const
      },
      { 
        action: 'Interview scheduled', 
        item: 'John Doe - TechCorp Inc', 
        time: '4 hours ago',
        type: 'interview' as const
      },
      { 
        action: 'Job posted', 
        item: 'Backend Engineer - ScaleUp Tech', 
        time: '6 hours ago',
        type: 'job' as const
      },
      { 
        action: 'Candidate submitted', 
        item: 'Mike Johnson - DevOps Engineer', 
        time: '8 hours ago',
        type: 'submission' as const
      },
      { 
        action: 'Offer extended', 
        item: 'Jane Smith - Product Manager', 
        time: '1 day ago',
        type: 'offer' as const
      }
    ]
  }

  const recentActivity = getRecentActivity()

  // Pipeline stats
  const pipelineStats = [
    { stage: 'Sourced', count: 45, percentage: 100 },
    { stage: 'Contacted', count: 38, percentage: 84 },
    { stage: 'Interviewing', count: 22, percentage: 49 },
    { stage: 'Offers', count: 8, percentage: 18 },
    { stage: 'Hired', count: 5, percentage: 11 }
  ]

  // Top performing items
  const getTopPerformers = () => {
    if (currentUser.role === 'platform_admin' || currentUser.role === 'platform_prototype') {
      return {
        title: 'Top Performing Agencies',
        items: mockAgencies.slice(0, 3).map(agency => ({
          name: agency.name,
          metric: `${agency.successRate}% success rate`,
          value: agency.totalPlacements,
          badge: agency.tier
        }))
      }
    } else if (currentUser.role === 'agency_recruiter') {
      return {
        title: 'Your Top Candidates',
        items: mockCandidates.slice(0, 3).map(candidate => ({
          name: candidate.name,
          metric: candidate.status,
          value: candidate.skills?.length || 0,
          badge: candidate.tags[0]
        }))
      }
    } else {
      return {
        title: 'Top Jobs',
        items: mockJobs.slice(0, 3).map(job => ({
          name: job.title,
          metric: `${job.submissions} applications`,
          value: job.interviews,
          badge: job.status
        }))
      }
    }
  }

  const topPerformers = getTopPerformers()

  const getChangeIcon = (type?: 'positive' | 'negative' | 'neutral') => {
    switch (type) {
      case 'positive':
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case 'negative':
        return <TrendingUp className="h-4 w-4 text-red-600 rotate-180" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'candidate':
        return <Users className="h-4 w-4 text-blue-600" />
      case 'interview':
        return <Calendar className="h-4 w-4 text-purple-600" />
      case 'job':
        return <Briefcase className="h-4 w-4 text-green-600" />
      case 'submission':
        return <UserCheck className="h-4 w-4 text-orange-600" />
      case 'offer':
        return <CheckCircle2 className="h-4 w-4 text-emerald-600" />
      default:
        return <Activity className="h-4 w-4 text-gray-600" />
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {currentUser.name}! Here's your recruiting overview.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Calendar className="mr-2 h-4 w-4" />
            Schedule Interview
          </Button>
          <Button>
            <Users className="mr-2 h-4 w-4" />
            Add Candidate
          </Button>
        </div>
      </div>

      {/* Metrics Grid */}
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
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  {getChangeIcon(metric.changeType)}
                  {metric.change} from last month
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pipeline Overview */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recruitment Pipeline</CardTitle>
            <CardDescription>
              Candidate progression through hiring stages
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {pipelineStats.map((stage, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{stage.stage}</span>
                  <span className="text-muted-foreground">{stage.count} candidates</span>
                </div>
                <Progress value={stage.percentage} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Top Performers */}
        <Card>
          <CardHeader>
            <CardTitle>{topPerformers.title}</CardTitle>
            <CardDescription>
              {currentUser.role === 'platform_admin' || currentUser.role === 'platform_prototype' 
                ? 'Highest performing recruiting partners'
                : 'Your best performing items'
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {topPerformers.items.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{item.name}</span>
                    <Badge variant="secondary" className="text-xs">
                      {item.badge}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{item.metric}</p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">{item.value}</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Latest actions across your recruiting workflow
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center gap-4">
                {getActivityIcon(activity.type)}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{activity.action}</span>
                    <Badge variant="outline" className="text-xs">
                      {activity.type}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{activity.item}</p>
                </div>
                <span className="text-xs text-muted-foreground">{activity.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions for Platform Prototype */}
      {(currentUser.role === 'platform_prototype') && (
        <Card>
          <CardHeader>
            <CardTitle>Prototype Features</CardTitle>
            <CardDescription>
              Future AI-powered features and advanced capabilities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" className="h-auto flex-col gap-2 p-4">
                <Activity className="h-6 w-6" />
                <div className="text-center">
                  <div className="font-medium">AI Matching</div>
                  <div className="text-xs text-muted-foreground">Smart candidate-job matching</div>
                </div>
              </Button>
              <Button variant="outline" className="h-auto flex-col gap-2 p-4">
                <TrendingUp className="h-6 w-6" />
                <div className="text-center">
                  <div className="font-medium">Predictive Analytics</div>
                  <div className="text-xs text-muted-foreground">Hiring success predictions</div>
                </div>
              </Button>
              <Button variant="outline" className="h-auto flex-col gap-2 p-4">
                <AlertTriangle className="h-6 w-6" />
                <div className="text-center">
                  <div className="font-medium">Voice Commands</div>
                  <div className="text-xs text-muted-foreground">Voice-driven workflows</div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}