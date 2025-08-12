'use client'

import * as React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { 
  Bot,
  Zap,
  Play,
  Pause,
  Settings,
  Activity,
  TrendingUp,
  Users,
  Calendar,
  Search,
  MessageSquare,
  Target,
  Briefcase,
  Clock,
  CheckCircle2,
  AlertCircle,
  Cpu,
  BarChart3,
  Workflow,
  Eye,
  Edit,
  MoreHorizontal
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { getCurrentUser } from '@/lib/mock-data'

interface AIAgent {
  id: string
  name: string
  type: 'sourcing' | 'matching' | 'screening' | 'scheduling' | 'communication' | 'analytics'
  status: 'active' | 'paused' | 'training' | 'error'
  description: string
  capabilities: string[]
  metrics: {
    tasksCompleted: number
    successRate: number
    timeSaved: string
    accuracy: number
  }
  lastActive: Date
  version: string
}

export default function AIAgentsPage() {
  const currentUser = getCurrentUser()

  // Mock AI Agents data
  const aiAgents: AIAgent[] = [
    {
      id: 'agent-sourcing',
      name: 'Talent Sourcing Agent',
      type: 'sourcing',
      status: 'active',
      description: 'Automatically discovers and pre-qualifies candidates from multiple sources including LinkedIn, GitHub, and job boards.',
      capabilities: ['LinkedIn scraping', 'GitHub analysis', 'Skills matching', 'Contact extraction', 'Duplicate detection'],
      metrics: {
        tasksCompleted: 1247,
        successRate: 87,
        timeSaved: '32 hours',
        accuracy: 94
      },
      lastActive: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
      version: '2.1.0'
    },
    {
      id: 'agent-matching',
      name: 'Smart Matching Agent',
      type: 'matching',
      status: 'active',
      description: 'Intelligently matches candidates to job opportunities using advanced ML algorithms and semantic analysis.',
      capabilities: ['Semantic matching', 'Skill analysis', 'Culture fit scoring', 'Salary alignment', 'Location matching'],
      metrics: {
        tasksCompleted: 892,
        successRate: 91,
        timeSaved: '28 hours',
        accuracy: 89
      },
      lastActive: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago
      version: '1.8.3'
    },
    {
      id: 'agent-screening',
      name: 'Resume Screening Agent',
      type: 'screening',
      status: 'active',
      description: 'Automatically reviews and scores resumes based on job requirements and company preferences.',
      capabilities: ['Resume parsing', 'Experience evaluation', 'Skills extraction', 'Education verification', 'Red flag detection'],
      metrics: {
        tasksCompleted: 2156,
        successRate: 83,
        timeSaved: '45 hours',
        accuracy: 92
      },
      lastActive: new Date(Date.now() - 1 * 60 * 1000), // 1 minute ago
      version: '3.0.1'
    },
    {
      id: 'agent-scheduling',
      name: 'Interview Scheduling Agent',
      type: 'scheduling',
      status: 'active',
      description: 'Handles interview scheduling, rescheduling, and coordination across multiple time zones.',
      capabilities: ['Calendar integration', 'Timezone handling', 'Conflict resolution', 'Reminder sending', 'Room booking'],
      metrics: {
        tasksCompleted: 534,
        successRate: 96,
        timeSaved: '18 hours',
        accuracy: 98
      },
      lastActive: new Date(Date.now() - 12 * 60 * 1000), // 12 minutes ago
      version: '1.4.7'
    },
    {
      id: 'agent-communication',
      name: 'Communication Agent',
      type: 'communication',
      status: 'training',
      description: 'Manages candidate communication, follow-ups, and basic inquiries through natural language processing.',
      capabilities: ['Email automation', 'Response generation', 'Sentiment analysis', 'Multi-language support', 'Template customization'],
      metrics: {
        tasksCompleted: 823,
        successRate: 78,
        timeSaved: '22 hours',
        accuracy: 85
      },
      lastActive: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
      version: '0.9.2'
    },
    {
      id: 'agent-analytics',
      name: 'Predictive Analytics Agent',
      type: 'analytics',
      status: 'paused',
      description: 'Analyzes recruiting patterns and predicts hiring outcomes, market trends, and optimization opportunities.',
      capabilities: ['Trend analysis', 'Success prediction', 'Market intelligence', 'Performance optimization', 'Risk assessment'],
      metrics: {
        tasksCompleted: 156,
        successRate: 94,
        timeSaved: '15 hours',
        accuracy: 91
      },
      lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      version: '1.2.0'
    }
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case 'paused':
        return <Pause className="h-4 w-4 text-yellow-500" />
      case 'training':
        return <Activity className="h-4 w-4 text-blue-500" />
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'active':
        return 'default'
      case 'paused':
        return 'secondary'
      case 'training':
        return 'outline'
      case 'error':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'sourcing':
        return <Search className="h-5 w-5 text-blue-500" />
      case 'matching':
        return <Target className="h-5 w-5 text-green-500" />
      case 'screening':
        return <Briefcase className="h-5 w-5 text-purple-500" />
      case 'scheduling':
        return <Calendar className="h-5 w-5 text-orange-500" />
      case 'communication':
        return <MessageSquare className="h-5 w-5 text-pink-500" />
      case 'analytics':
        return <BarChart3 className="h-5 w-5 text-indigo-500" />
      default:
        return <Bot className="h-5 w-5 text-gray-500" />
    }
  }

  const formatLastActive = (date: Date) => {
    const now = new Date()
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffMinutes < 1) return 'Just now'
    if (diffMinutes < 60) return `${diffMinutes}m ago`
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`
    return `${Math.floor(diffMinutes / 1440)}d ago`
  }

  // Overall stats
  const overallStats = [
    {
      label: 'Active Agents',
      value: aiAgents.filter(a => a.status === 'active').length,
      icon: Bot
    },
    {
      label: 'Tasks Completed',
      value: aiAgents.reduce((acc, agent) => acc + agent.metrics.tasksCompleted, 0).toLocaleString(),
      icon: CheckCircle2
    },
    {
      label: 'Time Saved',
      value: aiAgents.reduce((acc, agent) => acc + parseInt(agent.metrics.timeSaved), 0) + ' hours',
      icon: Clock
    },
    {
      label: 'Avg Success Rate',
      value: Math.round(aiAgents.reduce((acc, agent) => acc + agent.metrics.successRate, 0) / aiAgents.length) + '%',
      icon: TrendingUp
    }
  ]

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Agents</h1>
          <p className="text-muted-foreground">
            Manage and monitor your autonomous AI recruiting assistants
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Settings className="mr-2 h-4 w-4" />
            Configure
          </Button>
          <Button>
            <Zap className="mr-2 h-4 w-4" />
            Deploy Agent
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {overallStats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* AI Agents Grid */}
      <div className="grid gap-6">
        {aiAgents.map((agent) => (
          <Card key={agent.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary/10 to-primary/20 rounded-lg flex items-center justify-center">
                    {getTypeIcon(agent.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <CardTitle className="text-lg">{agent.name}</CardTitle>
                      {getStatusIcon(agent.status)}
                      <Badge variant={getStatusVariant(agent.status)} className="capitalize">
                        {agent.status}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        v{agent.version}
                      </Badge>
                    </div>
                    <CardDescription className="max-w-2xl">
                      {agent.description}
                    </CardDescription>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Edit className="mr-2 h-4 w-4" />
                      Configure
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Activity className="mr-2 h-4 w-4" />
                      View Logs
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Capabilities */}
                <div>
                  <div className="text-sm font-medium mb-2">Capabilities:</div>
                  <div className="flex flex-wrap gap-1">
                    {agent.capabilities.slice(0, 4).map((capability, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {capability}
                      </Badge>
                    ))}
                    {agent.capabilities.length > 4 && (
                      <Badge variant="outline" className="text-xs">
                        +{agent.capabilities.length - 4} more
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Performance Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
                  <div>
                    <div className="text-sm font-medium">Tasks Completed</div>
                    <div className="text-lg font-bold text-blue-600">
                      {agent.metrics.tasksCompleted.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium">Success Rate</div>
                    <div className="flex items-center gap-2">
                      <div className="text-lg font-bold text-green-600">
                        {agent.metrics.successRate}%
                      </div>
                      <div className="flex-1">
                        <Progress value={agent.metrics.successRate} className="h-2" />
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium">Time Saved</div>
                    <div className="text-lg font-bold text-orange-600">
                      {agent.metrics.timeSaved}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium">Accuracy</div>
                    <div className="flex items-center gap-2">
                      <div className="text-lg font-bold text-purple-600">
                        {agent.metrics.accuracy}%
                      </div>
                      <div className="flex-1">
                        <Progress value={agent.metrics.accuracy} className="h-2" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status and Actions */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="text-sm text-muted-foreground">
                    Last active: {formatLastActive(agent.lastActive)}
                  </div>
                  <div className="flex gap-2">
                    {agent.status === 'active' ? (
                      <Button variant="outline" size="sm">
                        <Pause className="mr-2 h-4 w-4" />
                        Pause
                      </Button>
                    ) : (
                      <Button variant="outline" size="sm">
                        <Play className="mr-2 h-4 w-4" />
                        Resume
                      </Button>
                    )}
                    <Button variant="outline" size="sm">
                      <Settings className="mr-2 h-4 w-4" />
                      Configure
                    </Button>
                    <Button variant="outline" size="sm">
                      <Activity className="mr-2 h-4 w-4" />
                      View Logs
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* System Health */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>System Health</CardTitle>
            <CardDescription>
              Overall AI system performance and resource utilization
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span>CPU Usage</span>
                  <span className="font-bold">34%</span>
                </div>
                <Progress value={34} className="h-2" />
              </div>
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span>Memory Usage</span>
                  <span className="font-bold">67%</span>
                </div>
                <Progress value={67} className="h-2" />
              </div>
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span>API Response Time</span>
                  <span className="font-bold">145ms</span>
                </div>
                <Progress value={85} className="h-2" />
              </div>
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span>System Uptime</span>
                  <span className="font-bold">99.8%</span>
                </div>
                <Progress value={99.8} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest actions performed by AI agents
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Search className="h-4 w-4 text-blue-500" />
                <span className="font-medium">Sourcing Agent found 12 new candidates</span>
                <span className="text-muted-foreground">2 min ago</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Target className="h-4 w-4 text-green-500" />
                <span className="font-medium">Matching Agent created 5 high-confidence matches</span>
                <span className="text-muted-foreground">5 min ago</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Briefcase className="h-4 w-4 text-purple-500" />
                <span className="font-medium">Screening Agent processed 23 resumes</span>
                <span className="text-muted-foreground">8 min ago</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="h-4 w-4 text-orange-500" />
                <span className="font-medium">Scheduling Agent booked 3 interviews</span>
                <span className="text-muted-foreground">12 min ago</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <MessageSquare className="h-4 w-4 text-pink-500" />
                <span className="font-medium">Communication Agent sent 15 follow-ups</span>
                <span className="text-muted-foreground">18 min ago</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Agent Deployment */}
      <Card>
        <CardHeader>
          <CardTitle>Deploy New Agent</CardTitle>
          <CardDescription>
            Create and configure a new AI agent for your recruiting workflow
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-auto flex-col gap-2 p-6">
              <Workflow className="h-8 w-8" />
              <div className="text-center">
                <div className="font-medium">Custom Workflow Agent</div>
                <div className="text-xs text-muted-foreground">Build a custom automation</div>
              </div>
            </Button>
            <Button variant="outline" className="h-auto flex-col gap-2 p-6">
              <Cpu className="h-8 w-8" />
              <div className="text-center">
                <div className="font-medium">Pre-trained Specialist</div>
                <div className="text-xs text-muted-foreground">Deploy industry-specific agent</div>
              </div>
            </Button>
            <Button variant="outline" className="h-auto flex-col gap-2 p-6">
              <Bot className="h-8 w-8" />
              <div className="text-center">
                <div className="font-medium">Agent Template</div>
                <div className="text-xs text-muted-foreground">Start from proven template</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}