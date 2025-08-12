'use client'

import * as React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Search,
  Filter,
  Star,
  MapPin,
  Building2,
  Users,
  TrendingUp,
  Target,
  Zap,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Bot,
  BarChart3
} from 'lucide-react'
import { mockJobs, mockAgencies, mockEmployers, getCurrentUser } from '@/lib/mock-data'

interface MatchingOpportunity {
  id: string
  type: 'job-agency' | 'candidate-job' | 'agency-employer'
  title: string
  description: string
  matchScore: number
  priority: 'high' | 'medium' | 'low'
  entities: {
    primary: { id: string; name: string; type: string }
    secondary: { id: string; name: string; type: string }
  }
  potentialValue: string
  timeEstimate: string
  aiConfidence: number
}

export default function MarketplacePage() {
  const currentUser = getCurrentUser()
  const [searchQuery, setSearchQuery] = React.useState('')
  const [activeTab, setActiveTab] = React.useState<'matches' | 'jobs' | 'agencies' | 'ai-insights'>('matches')

  // AI-powered matching opportunities
  const matchingOpportunities: MatchingOpportunity[] = [
    {
      id: 'match-1',
      type: 'job-agency',
      title: 'Perfect Match: Senior Frontend Developer → TechTalent Agency',
      description: 'TechTalent Agency has 85% success rate in frontend roles and 3 similar placements this month',
      matchScore: 94,
      priority: 'high',
      entities: {
        primary: { id: 'job-1', name: 'Senior Frontend Developer', type: 'job' },
        secondary: { id: 'agency-1', name: 'TechTalent Agency', type: 'agency' }
      },
      potentialValue: '$15,000',
      timeEstimate: '12 days',
      aiConfidence: 94
    },
    {
      id: 'match-2', 
      type: 'candidate-job',
      title: 'High-Value Match: John Doe → DevOps Engineer Role',
      description: 'Candidate skills align 92% with job requirements, salary expectations match',
      matchScore: 92,
      priority: 'high',
      entities: {
        primary: { id: 'candidate-1', name: 'John Doe', type: 'candidate' },
        secondary: { id: 'job-3', name: 'DevOps Engineer', type: 'job' }
      },
      potentialValue: '$12,000',
      timeEstimate: '8 days',
      aiConfidence: 89
    },
    {
      id: 'match-3',
      type: 'agency-employer',
      title: 'Partnership Opportunity: Executive Search Pro → AI Innovations',
      description: 'Agency specializes in senior AI roles, employer needs C-level AI talent',
      matchScore: 87,
      priority: 'medium',
      entities: {
        primary: { id: 'agency-2', name: 'Executive Search Pro', type: 'agency' },
        secondary: { id: 'emp-5', name: 'AI Innovations', type: 'employer' }
      },
      potentialValue: '$25,000',
      timeEstimate: '20 days',
      aiConfidence: 82
    },
    {
      id: 'match-4',
      type: 'job-agency',
      title: 'Niche Specialist Match: UI/UX Designer → Creative Collective',
      description: 'Creative Collective has perfect track record with design roles at similar companies',
      matchScore: 91,
      priority: 'high',
      entities: {
        primary: { id: 'job-4', name: 'UI/UX Designer', type: 'job' },
        secondary: { id: 'agency-4', name: 'Creative Collective', type: 'agency' }
      },
      potentialValue: '$8,000',
      timeEstimate: '15 days',
      aiConfidence: 91
    },
    {
      id: 'match-5',
      type: 'candidate-job',
      title: 'Skills Match: Sarah Davis → Product Manager',
      description: 'Candidate\'s product experience and startup background align perfectly',
      matchScore: 86,
      priority: 'medium',
      entities: {
        primary: { id: 'candidate-4', name: 'Sarah Davis', type: 'candidate' },
        secondary: { id: 'job-2', name: 'Product Manager', type: 'job' }
      },
      potentialValue: '$11,000',
      timeEstimate: '10 days',
      aiConfidence: 78
    }
  ]

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case 'medium':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'low':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getMatchTypeIcon = (type: string) => {
    switch (type) {
      case 'job-agency':
        return <Target className="h-4 w-4 text-blue-500" />
      case 'candidate-job':
        return <Users className="h-4 w-4 text-green-500" />
      case 'agency-employer':
        return <Building2 className="h-4 w-4 text-purple-500" />
      default:
        return <Zap className="h-4 w-4 text-gray-500" />
    }
  }

  const marketplaceStats = [
    {
      label: 'Active Matches',
      value: 42,
      change: '+8',
      icon: Target
    },
    {
      label: 'AI Predictions',
      value: 156,
      change: '+23',
      icon: Bot
    },
    {
      label: 'Success Rate',
      value: '84%',
      change: '+5%',
      icon: TrendingUp
    },
    {
      label: 'Avg Match Time',
      value: '11 days',
      change: '-2 days',
      icon: Clock
    }
  ]

  // AI Insights Data
  const aiInsights = [
    {
      title: 'Market Trends',
      insight: 'Frontend developer roles are 35% more active this month',
      confidence: 92,
      actionable: 'Focus agency partnerships on frontend specializations'
    },
    {
      title: 'Salary Intelligence',
      insight: 'DevOps engineers in Austin are commanding 18% premium',
      confidence: 88,
      actionable: 'Adjust salary ranges for Austin-based DevOps roles'
    },
    {
      title: 'Partnership Optimization',
      insight: 'TechTalent Agency has 40% faster placement time for React roles',
      confidence: 95,
      actionable: 'Route React positions to TechTalent first'
    },
    {
      title: 'Candidate Behavior',
      insight: 'Remote-first candidates are 60% more likely to accept offers',
      confidence: 79,
      actionable: 'Prioritize remote-friendly roles in candidate matching'
    }
  ]

  const filteredMatches = matchingOpportunities.filter(match => 
    match.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    match.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Marketplace</h1>
          <p className="text-muted-foreground">
            AI-powered matching and marketplace intelligence hub
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Bot className="mr-2 h-4 w-4" />
            Run AI Matching
          </Button>
          <Button>
            <Zap className="mr-2 h-4 w-4" />
            Create Match
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {marketplaceStats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.change} from last week
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg w-fit">
        {[
          { id: 'matches', label: 'AI Matches', icon: Target },
          { id: 'jobs', label: 'Open Jobs', icon: Building2 },
          { id: 'agencies', label: 'Agency Network', icon: Users },
          { id: 'ai-insights', label: 'AI Insights', icon: BarChart3 }
        ].map((tab) => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab(tab.id as any)}
            className="gap-2"
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Search */}
      <div className="flex gap-2 max-w-md">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search matches, jobs, agencies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" size="icon">
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      {/* Content based on active tab */}
      {activeTab === 'matches' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">AI-Powered Matches</h2>
            <Badge variant="secondary">{filteredMatches.length} opportunities</Badge>
          </div>
          
          <div className="space-y-4">
            {filteredMatches.map((match) => (
              <Card key={match.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      {getMatchTypeIcon(match.type)}
                      <div>
                        <CardTitle className="text-base">{match.title}</CardTitle>
                        <CardDescription className="mt-1">
                          {match.description}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getPriorityIcon(match.priority)}
                      <Badge variant="outline">{match.priority} priority</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <div className="text-sm font-medium">Match Score</div>
                      <div className="flex items-center gap-2">
                        <div className="text-lg font-bold text-green-600">{match.matchScore}%</div>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3 w-3 ${
                                i < Math.floor(match.matchScore / 20)
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium">Potential Value</div>
                      <div className="text-lg font-bold text-blue-600">{match.potentialValue}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium">Est. Time</div>
                      <div className="text-lg font-bold">{match.timeEstimate}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium">AI Confidence</div>
                      <div className="text-lg font-bold text-purple-600">{match.aiConfidence}%</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-4 pt-4 border-t">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{match.entities.primary.name}</span>
                      <TrendingUp className="h-4 w-4" />
                      <span>{match.entities.secondary.name}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                      <Button size="sm">
                        Create Match
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'jobs' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Open Jobs</h2>
            <Badge variant="secondary">{mockJobs.filter(j => j.status === 'active').length} active</Badge>
          </div>
          
          <div className="grid gap-4">
            {mockJobs.filter(job => job.status === 'active').slice(0, 6).map((job) => (
              <Card key={job.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">{job.title}</CardTitle>
                      <CardDescription>{job.company} • {job.location}</CardDescription>
                    </div>
                    <Badge variant="outline">{job.type}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <div className="text-sm font-medium">Salary</div>
                      <div className="text-sm">${job.salary?.min.toLocaleString()} - ${job.salary?.max.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium">Applications</div>
                      <div className="text-sm">{job.submissions} submitted</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium">Interviews</div>
                      <div className="text-sm">{job.interviews} scheduled</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium">Posted</div>
                      <div className="text-sm">{Math.floor((Date.now() - job.postedAt.getTime()) / (1000 * 60 * 60 * 24))} days ago</div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" size="sm">View Details</Button>
                    <Button size="sm">Find Matches</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'agencies' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Agency Network</h2>
            <Badge variant="secondary">{mockAgencies.length} partners</Badge>
          </div>
          
          <div className="grid gap-4">
            {mockAgencies.map((agency) => (
              <Card key={agency.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">{agency.name}</CardTitle>
                      <CardDescription>
                        <MapPin className="inline h-3 w-3 mr-1" />
                        {agency.location}
                      </CardDescription>
                    </div>
                    <Badge variant={
                      agency.tier === 'gold' ? 'default' : 
                      agency.tier === 'silver' ? 'secondary' : 'outline'
                    }>
                      {agency.tier} tier
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-1">
                      {agency.specialization.map((spec, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {spec}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <div className="text-sm font-medium">Success Rate</div>
                        <div className="text-sm font-bold text-green-600">{agency.successRate}%</div>
                      </div>
                      <div>
                        <div className="text-sm font-medium">Total Placements</div>
                        <div className="text-sm font-bold">{agency.totalPlacements}</div>
                      </div>
                      <div>
                        <div className="text-sm font-medium">Active Recruiters</div>
                        <div className="text-sm font-bold">{agency.activeRecruiters}</div>
                      </div>
                      <div>
                        <div className="text-sm font-medium">Rating</div>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-bold">{agency.rating}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">View Profile</Button>
                      <Button size="sm">Send Jobs</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'ai-insights' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">AI Insights & Intelligence</h2>
            <Badge variant="secondary">Real-time analysis</Badge>
          </div>
          
          <div className="grid gap-4">
            {aiInsights.map((insight, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">{insight.title}</CardTitle>
                      <CardDescription className="mt-1">
                        {insight.insight}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Bot className="h-4 w-4 text-blue-500" />
                      <Badge variant="outline">{insight.confidence}% confident</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-3">
                    <div className="text-sm font-medium text-blue-900 dark:text-blue-100">
                      Recommended Action:
                    </div>
                    <div className="text-sm text-blue-700 dark:text-blue-300">
                      {insight.actionable}
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" size="sm">Learn More</Button>
                    <Button size="sm">Apply Insight</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}