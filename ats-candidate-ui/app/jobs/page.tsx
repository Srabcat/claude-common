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
  MapPin,
  Building2,
  DollarSign,
  Calendar,
  Users,
  Eye,
  Edit,
  MoreHorizontal,
  Briefcase,
  Clock,
  CheckCircle2,
  Pause,
  X
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { mockJobs, getCurrentUser, Job } from '@/lib/mock-data'

export default function JobsPage() {
  const currentUser = getCurrentUser()
  const [searchQuery, setSearchQuery] = React.useState('')
  const [statusFilter, setStatusFilter] = React.useState<'all' | 'active' | 'paused' | 'filled' | 'cancelled'>('all')
  const [jobs, setJobs] = React.useState<Job[]>(mockJobs)

  // Filter jobs based on role
  const getFilteredJobs = () => {
    let filteredJobs = jobs

    // Role-based filtering
    if (currentUser.role === 'agency_recruiter') {
      filteredJobs = jobs.filter(job => job.recruiterId === currentUser.id)
    } else if (currentUser.role === 'employer_recruiter') {
      filteredJobs = jobs.filter(job => job.recruiterId === currentUser.id)
    }

    // Status filtering
    if (statusFilter !== 'all') {
      filteredJobs = filteredJobs.filter(job => job.status === statusFilter)
    }

    // Search filtering
    if (searchQuery) {
      filteredJobs = filteredJobs.filter(job => 
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.location.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    return filteredJobs
  }

  const filteredJobs = getFilteredJobs()

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case 'paused':
        return <Pause className="h-4 w-4 text-yellow-500" />
      case 'filled':
        return <CheckCircle2 className="h-4 w-4 text-blue-500" />
      case 'cancelled':
        return <X className="h-4 w-4 text-red-500" />
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
      case 'filled':
        return 'outline'
      case 'cancelled':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  const formatSalary = (salary?: { min: number; max: number; currency: string }) => {
    if (!salary) return 'Salary not specified'
    return `$${salary.min.toLocaleString()} - $${salary.max.toLocaleString()}`
  }

  const formatDatePosted = (date: Date) => {
    const days = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24))
    if (days === 0) return 'Today'
    if (days === 1) return '1 day ago'
    return `${days} days ago`
  }

  // Job stats
  const jobStats = [
    {
      label: 'Total Jobs',
      value: filteredJobs.length,
      icon: Briefcase
    },
    {
      label: 'Active Jobs',
      value: filteredJobs.filter(j => j.status === 'active').length,
      icon: CheckCircle2
    },
    {
      label: 'Total Applications',
      value: filteredJobs.reduce((acc, job) => acc + job.submissions, 0),
      icon: Users
    },
    {
      label: 'Interviews Scheduled',
      value: filteredJobs.reduce((acc, job) => acc + job.interviews, 0),
      icon: Calendar
    }
  ]

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {currentUser.role === 'platform_admin' || currentUser.role === 'platform_prototype' 
              ? 'All Jobs' 
              : currentUser.role === 'agency_recruiter'
              ? 'My Jobs'
              : 'Jobs'
            }
          </h1>
          <p className="text-muted-foreground">
            {currentUser.role === 'platform_admin' || currentUser.role === 'platform_prototype'
              ? 'Manage all job postings across the platform'
              : currentUser.role === 'agency_recruiter'
              ? 'Jobs you are working on'
              : 'Your job postings and hiring pipeline'
            }
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          {currentUser.role === 'agency_recruiter' ? 'Find Jobs' : 'Post Job'}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {jobStats.map((stat, index) => (
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

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search jobs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-1 bg-muted p-1 rounded-lg">
          {(['all', 'active', 'paused', 'filled', 'cancelled'] as const).map((status) => (
            <Button
              key={status}
              variant={statusFilter === status ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setStatusFilter(status)}
              className="capitalize"
            >
              {status}
            </Button>
          ))}
        </div>

        <Button variant="outline" size="icon">
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      {/* Jobs List */}
      <div className="space-y-4">
        {filteredJobs.length === 0 ? (
          <Card>
            <CardContent className="py-10">
              <div className="text-center">
                <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium">No jobs found</h3>
                <p className="text-muted-foreground">
                  {searchQuery 
                    ? 'Try adjusting your search or filters'
                    : 'Get started by posting your first job'
                  }
                </p>
                <Button className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  Post New Job
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredJobs.map((job) => (
            <Card key={job.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <CardTitle className="text-lg">{job.title}</CardTitle>
                      {getStatusIcon(job.status)}
                      <Badge variant={getStatusVariant(job.status)}>
                        {job.status}
                      </Badge>
                    </div>
                    <CardDescription className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Building2 className="h-3 w-3" />
                        {job.company}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {job.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDatePosted(job.postedAt)}
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
                        Edit Job
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Users className="mr-2 h-4 w-4" />
                        View Candidates
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {job.description}
                  </p>
                  
                  {/* Requirements */}
                  <div>
                    <div className="text-sm font-medium mb-2">Requirements:</div>
                    <div className="flex flex-wrap gap-1">
                      {job.requirements.slice(0, 3).map((req, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {req}
                        </Badge>
                      ))}
                      {job.requirements.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{job.requirements.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Job Metrics */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
                    <div>
                      <div className="text-sm font-medium">Salary</div>
                      <div className="text-sm text-muted-foreground">
                        {formatSalary(job.salary)}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium">Applications</div>
                      <div className="text-sm text-muted-foreground">
                        {job.submissions} submitted
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium">Interviews</div>
                      <div className="text-sm text-muted-foreground">
                        {job.interviews} scheduled
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium">Offers</div>
                      <div className="text-sm text-muted-foreground">
                        {job.offers} extended
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm">
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </Button>
                    <Button variant="outline" size="sm">
                      <Users className="mr-2 h-4 w-4" />
                      {job.submissions} Candidates
                    </Button>
                    {(currentUser.role === 'platform_admin' || currentUser.role === 'platform_prototype') && (
                      <Button variant="outline" size="sm">
                        <Building2 className="mr-2 h-4 w-4" />
                        Assign Agency
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Pagination placeholder */}
      {filteredJobs.length > 10 && (
        <div className="flex justify-center pt-4">
          <Button variant="outline">Load More Jobs</Button>
        </div>
      )}
    </div>
  )
}