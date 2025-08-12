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
  Users,
  Globe,
  Star,
  Briefcase,
  TrendingUp,
  Clock,
  Mail,
  Phone,
  Eye,
  Edit,
  MoreHorizontal,
  CheckCircle2
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { mockEmployers, getCurrentUser, Employer } from '@/lib/mock-data'

export default function EmployersPage() {
  const currentUser = getCurrentUser()
  const [searchQuery, setSearchQuery] = React.useState('')
  const [employers, setEmployers] = React.useState<Employer[]>(mockEmployers)

  const filteredEmployers = employers.filter(employer =>
    employer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    employer.industry.toLowerCase().includes(searchQuery.toLowerCase()) ||
    employer.location.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const formatJoinDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    })
  }

  const getRatingStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`h-3 w-3 ${
          i < Math.floor(rating)
            ? 'fill-yellow-400 text-yellow-400'
            : i < rating
            ? 'fill-yellow-200 text-yellow-400'
            : 'text-gray-300'
        }`}
      />
    ))
  }

  // Employer stats
  const employerStats = [
    {
      label: 'Total Employers',
      value: filteredEmployers.length,
      icon: Building2
    },
    {
      label: 'Active Jobs',
      value: filteredEmployers.reduce((acc, emp) => acc + emp.activeJobs, 0),
      icon: Briefcase
    },
    {
      label: 'Total Hires',
      value: filteredEmployers.reduce((acc, emp) => acc + emp.totalHires, 0),
      icon: Users
    },
    {
      label: 'Avg Time to Hire',
      value: Math.round(filteredEmployers.reduce((acc, emp) => acc + emp.averageTimeToHire, 0) / filteredEmployers.length) + ' days',
      icon: Clock
    }
  ]

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Employers</h1>
          <p className="text-muted-foreground">
            Manage your employer relationships and partnerships
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Employer
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {employerStats.map((stat, index) => (
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
            placeholder="Search employers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Button variant="outline" size="icon">
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      {/* Employers List */}
      <div className="space-y-4">
        {filteredEmployers.length === 0 ? (
          <Card>
            <CardContent className="py-10">
              <div className="text-center">
                <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium">No employers found</h3>
                <p className="text-muted-foreground">
                  {searchQuery 
                    ? 'Try adjusting your search terms'
                    : 'Get started by adding your first employer partner'
                  }
                </p>
                <Button className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  Add New Employer
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredEmployers.map((employer) => (
            <Card key={employer.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
                      <Building2 className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <CardTitle className="text-lg">{employer.name}</CardTitle>
                        <div className="flex items-center gap-1">
                          {getRatingStars(employer.rating)}
                          <span className="text-sm text-muted-foreground ml-1">
                            ({employer.rating})
                          </span>
                        </div>
                      </div>
                      <CardDescription className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Building2 className="h-3 w-3" />
                          {employer.industry}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {employer.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {employer.size} employees
                        </span>
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
                        View Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Employer
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Mail className="mr-2 h-4 w-4" />
                        Send Message
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {employer.description}
                  </p>

                  {/* Key Metrics */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
                    <div>
                      <div className="text-sm font-medium">Active Jobs</div>
                      <div className="flex items-center gap-1">
                        <div className="text-lg font-bold text-green-600">
                          {employer.activeJobs}
                        </div>
                        <Briefcase className="h-3 w-3 text-muted-foreground" />
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium">Total Hires</div>
                      <div className="flex items-center gap-1">
                        <div className="text-lg font-bold text-blue-600">
                          {employer.totalHires}
                        </div>
                        <CheckCircle2 className="h-3 w-3 text-muted-foreground" />
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium">Time to Hire</div>
                      <div className="flex items-center gap-1">
                        <div className="text-lg font-bold text-orange-600">
                          {employer.averageTimeToHire}d
                        </div>
                        <Clock className="h-3 w-3 text-muted-foreground" />
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium">Member Since</div>
                      <div className="text-sm text-muted-foreground">
                        {formatJoinDate(employer.joinedAt)}
                      </div>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="bg-muted/30 rounded-lg p-3">
                    <div className="text-sm font-medium mb-2">Primary Contact</div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="h-3 w-3 text-muted-foreground" />
                        <span className="font-medium">{employer.contactPerson}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="h-3 w-3" />
                        {employer.email}
                      </div>
                      {employer.phone && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          {employer.phone}
                        </div>
                      )}
                      {employer.website && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Globe className="h-3 w-3" />
                          <a 
                            href={employer.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="hover:text-primary hover:underline"
                          >
                            {employer.website.replace('https://', '')}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm">
                      <Eye className="mr-2 h-4 w-4" />
                      View Profile
                    </Button>
                    <Button variant="outline" size="sm">
                      <Briefcase className="mr-2 h-4 w-4" />
                      View Jobs ({employer.activeJobs})
                    </Button>
                    <Button variant="outline" size="sm">
                      <Mail className="mr-2 h-4 w-4" />
                      Contact
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Pagination placeholder */}
      {filteredEmployers.length > 10 && (
        <div className="flex justify-center pt-4">
          <Button variant="outline">Load More Employers</Button>
        </div>
      )}
    </div>
  )
}