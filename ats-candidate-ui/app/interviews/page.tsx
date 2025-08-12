'use client'

import * as React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Search,
  Filter,
  Plus,
  Calendar,
  Clock,
  Video,
  Phone,
  MapPin,
  User,
  Building2,
  CheckCircle2,
  X,
  AlertCircle,
  Eye,
  Edit,
  MoreHorizontal,
  Users,
  Star,
  MessageCircle,
  Zap
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { mockInterviews, getCurrentUser, Interview } from '@/lib/mock-data'

export default function InterviewsPage() {
  const currentUser = getCurrentUser()
  const [searchQuery, setSearchQuery] = React.useState('')
  const [statusFilter, setStatusFilter] = React.useState<'all' | 'scheduled' | 'completed' | 'cancelled' | 'no-show'>('all')
  const [interviews, setInterviews] = React.useState<Interview[]>(mockInterviews)

  const getFilteredInterviews = () => {
    let filteredInterviews = interviews

    // Status filtering
    if (statusFilter !== 'all') {
      filteredInterviews = filteredInterviews.filter(interview => interview.status === statusFilter)
    }

    // Search filtering
    if (searchQuery) {
      filteredInterviews = filteredInterviews.filter(interview =>
        interview.candidateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        interview.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        interview.company.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    return filteredInterviews.sort((a, b) => {
      // Sort by date (upcoming first, then past)
      return b.scheduledAt.getTime() - a.scheduledAt.getTime()
    })
  }

  const filteredInterviews = getFilteredInterviews()

  const formatInterviewDate = (date: Date) => {
    const now = new Date()
    const diffDays = Math.floor((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) {
      return `Today at ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`
    } else if (diffDays === 1) {
      return `Tomorrow at ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`
    } else if (diffDays === -1) {
      return `Yesterday at ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`
    } else if (diffDays > 0) {
      return `${date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })} at ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`
    } else {
      return `${date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })} at ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Calendar className="h-4 w-4 text-blue-500" />
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case 'cancelled':
        return <X className="h-4 w-4 text-red-500" />
      case 'no-show':
        return <AlertCircle className="h-4 w-4 text-orange-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'scheduled':
        return 'default'
      case 'completed':
        return 'outline'
      case 'cancelled':
        return 'destructive'
      case 'no-show':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="h-4 w-4 text-purple-500" />
      case 'phone':
        return <Phone className="h-4 w-4 text-green-500" />
      case 'in-person':
        return <MapPin className="h-4 w-4 text-blue-500" />
      case 'technical':
        return <Zap className="h-4 w-4 text-orange-500" />
      default:
        return <Calendar className="h-4 w-4 text-gray-500" />
    }
  }

  const isUpcoming = (date: Date) => {
    return date.getTime() > Date.now()
  }

  // Interview stats
  const interviewStats = [
    {
      label: 'Total Interviews',
      value: filteredInterviews.length,
      icon: Calendar
    },
    {
      label: 'Scheduled',
      value: filteredInterviews.filter(i => i.status === 'scheduled').length,
      icon: Clock
    },
    {
      label: 'Completed',
      value: filteredInterviews.filter(i => i.status === 'completed').length,
      icon: CheckCircle2
    },
    {
      label: 'Success Rate',
      value: Math.round((filteredInterviews.filter(i => i.status === 'completed').length / Math.max(filteredInterviews.filter(i => i.status !== 'scheduled').length, 1)) * 100) + '%',
      icon: Star
    }
  ]

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Interviews</h1>
          <p className="text-muted-foreground">
            Manage your interview schedule and candidate evaluations
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Schedule Interview
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {interviewStats.map((stat, index) => (
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

      {/* Search and Filters */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search interviews..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-1 bg-muted p-1 rounded-lg">
          {(['all', 'scheduled', 'completed', 'cancelled', 'no-show'] as const).map((status) => (
            <Button
              key={status}
              variant={statusFilter === status ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setStatusFilter(status)}
              className="capitalize"
            >
              {status === 'no-show' ? 'No Show' : status}
            </Button>
          ))}
        </div>

        <Button variant="outline" size="icon">
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      {/* Upcoming Interviews Section */}
      {filteredInterviews.filter(i => i.status === 'scheduled' && isUpcoming(i.scheduledAt)).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Upcoming Interviews
            </CardTitle>
            <CardDescription>
              Interviews scheduled for the next 7 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredInterviews
                .filter(i => i.status === 'scheduled' && isUpcoming(i.scheduledAt))
                .slice(0, 3)
                .map((interview) => (
                  <div key={interview.id} className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                    <div className="flex items-center gap-3">
                      {getTypeIcon(interview.type)}
                      <div>
                        <div className="font-medium">{interview.candidateName}</div>
                        <div className="text-sm text-muted-foreground">
                          {interview.jobTitle} • {interview.company}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        {formatInterviewDate(interview.scheduledAt)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {interview.type} interview
                      </div>
                    </div>
                  </div>
                ))
              }
            </div>
          </CardContent>
        </Card>
      )}

      {/* Interviews List */}
      <div className="space-y-4">
        {filteredInterviews.length === 0 ? (
          <Card>
            <CardContent className="py-10">
              <div className="text-center">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium">No interviews found</h3>
                <p className="text-muted-foreground">
                  {searchQuery 
                    ? 'Try adjusting your search terms or filters'
                    : 'Get started by scheduling your first interview'
                  }
                </p>
                <Button className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  Schedule Interview
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredInterviews.map((interview) => (
            <Card key={interview.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <CardTitle className="text-lg">{interview.candidateName}</CardTitle>
                      {getStatusIcon(interview.status)}
                      <Badge variant={getStatusVariant(interview.status)}>
                        {interview.status === 'no-show' ? 'No Show' : interview.status}
                      </Badge>
                      {getTypeIcon(interview.type)}
                      <Badge variant="outline" className="capitalize">
                        {interview.type}
                      </Badge>
                    </div>
                    <CardDescription className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Building2 className="h-3 w-3" />
                        {interview.jobTitle} at {interview.company}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatInterviewDate(interview.scheduledAt)}
                      </span>
                    </CardDescription>
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
                        Edit Interview
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <MessageCircle className="mr-2 h-4 w-4" />
                        Add Notes
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Interviewers */}
                  <div>
                    <div className="text-sm font-medium mb-2">Interviewers:</div>
                    <div className="flex flex-wrap gap-1">
                      {interview.interviewers.map((interviewer, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          <User className="mr-1 h-3 w-3" />
                          {interviewer}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Notes */}
                  {interview.notes && (
                    <div className="bg-muted/30 rounded-lg p-3">
                      <div className="text-sm font-medium mb-1">Notes:</div>
                      <p className="text-sm text-muted-foreground">{interview.notes}</p>
                    </div>
                  )}

                  {/* Feedback and Rating */}
                  {interview.status === 'completed' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                      {interview.rating && (
                        <div>
                          <div className="text-sm font-medium mb-1">Rating:</div>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < interview.rating!
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                            <span className="text-sm text-muted-foreground ml-1">
                              ({interview.rating}/5)
                            </span>
                          </div>
                        </div>
                      )}
                      {interview.feedback && (
                        <div>
                          <div className="text-sm font-medium mb-1">Feedback:</div>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {interview.feedback}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm">
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </Button>
                    {interview.status === 'scheduled' && (
                      <>
                        <Button variant="outline" size="sm">
                          <Edit className="mr-2 h-4 w-4" />
                          Reschedule
                        </Button>
                        <Button variant="outline" size="sm">
                          <Video className="mr-2 h-4 w-4" />
                          Join Call
                        </Button>
                      </>
                    )}
                    {interview.status === 'completed' && !interview.feedback && (
                      <Button variant="outline" size="sm">
                        <Star className="mr-2 h-4 w-4" />
                        Add Feedback
                      </Button>
                    )}
                    <Button variant="outline" size="sm">
                      <MessageCircle className="mr-2 h-4 w-4" />
                      Notes
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Interview Calendar View Option */}
      <Card>
        <CardHeader>
          <CardTitle>Calendar View</CardTitle>
          <CardDescription>
            Switch to calendar view for better schedule management
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline">
            <Calendar className="mr-2 h-4 w-4" />
            Open Calendar View
          </Button>
        </CardContent>
      </Card>

      {/* Pagination placeholder */}
      {filteredInterviews.length > 10 && (
        <div className="flex justify-center pt-4">
          <Button variant="outline">Load More Interviews</Button>
        </div>
      )}
    </div>
  )
}