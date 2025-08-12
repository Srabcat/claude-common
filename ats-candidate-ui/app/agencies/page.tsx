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
  TrendingUp,
  Target,
  Award,
  Mail,
  Phone,
  Eye,
  Edit,
  MoreHorizontal,
  CheckCircle2,
  Zap
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { mockAgencies, getCurrentUser, Agency } from '@/lib/mock-data'

export default function AgenciesPage() {
  const currentUser = getCurrentUser()
  const [searchQuery, setSearchQuery] = React.useState('')
  const [tierFilter, setTierFilter] = React.useState<'all' | 'gold' | 'silver' | 'bronze' | 'new'>('all')
  const [agencies, setAgencies] = React.useState<Agency[]>(mockAgencies)

  const getFilteredAgencies = () => {
    let filteredAgencies = agencies

    // Tier filtering
    if (tierFilter !== 'all') {
      filteredAgencies = filteredAgencies.filter(agency => agency.tier === tierFilter)
    }

    // Search filtering
    if (searchQuery) {
      filteredAgencies = filteredAgencies.filter(agency =>
        agency.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agency.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agency.specialization.some(spec => 
          spec.toLowerCase().includes(searchQuery.toLowerCase())
        )
      )
    }

    return filteredAgencies.sort((a, b) => {
      // Sort by tier (gold > silver > bronze > new) then by success rate
      const tierOrder = { gold: 4, silver: 3, bronze: 2, new: 1 }
      const tierDiff = (tierOrder[b.tier] || 0) - (tierOrder[a.tier] || 0)
      if (tierDiff !== 0) return tierDiff
      return b.successRate - a.successRate
    })
  }

  const filteredAgencies = getFilteredAgencies()

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

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'gold':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'silver':
        return 'text-gray-600 bg-gray-50 border-gray-200'
      case 'bronze':
        return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'new':
        return 'text-blue-600 bg-blue-50 border-blue-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'gold':
        return <Award className="h-4 w-4 text-yellow-600" />
      case 'silver':
        return <Award className="h-4 w-4 text-gray-500" />
      case 'bronze':
        return <Award className="h-4 w-4 text-orange-600" />
      case 'new':
        return <Zap className="h-4 w-4 text-blue-600" />
      default:
        return <Target className="h-4 w-4 text-gray-500" />
    }
  }

  // Agency stats
  const agencyStats = [
    {
      label: 'Total Agencies',
      value: filteredAgencies.length,
      icon: Building2
    },
    {
      label: 'Active Recruiters',
      value: filteredAgencies.reduce((acc, agency) => acc + agency.activeRecruiters, 0),
      icon: Users
    },
    {
      label: 'Total Placements',
      value: filteredAgencies.reduce((acc, agency) => acc + agency.totalPlacements, 0),
      icon: CheckCircle2
    },
    {
      label: 'Avg Success Rate',
      value: Math.round(filteredAgencies.reduce((acc, agency) => acc + agency.successRate, 0) / filteredAgencies.length) + '%',
      icon: TrendingUp
    }
  ]

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Agencies</h1>
          <p className="text-muted-foreground">
            Manage your recruiting agency partnerships and network
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Agency
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {agencyStats.map((stat, index) => (
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
            placeholder="Search agencies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-1 bg-muted p-1 rounded-lg">
          {(['all', 'gold', 'silver', 'bronze', 'new'] as const).map((tier) => (
            <Button
              key={tier}
              variant={tierFilter === tier ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setTierFilter(tier)}
              className="capitalize gap-1"
            >
              {tier !== 'all' && getTierIcon(tier)}
              {tier}
            </Button>
          ))}
        </div>

        <Button variant="outline" size="icon">
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      {/* Agencies List */}
      <div className="space-y-4">
        {filteredAgencies.length === 0 ? (
          <Card>
            <CardContent className="py-10">
              <div className="text-center">
                <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium">No agencies found</h3>
                <p className="text-muted-foreground">
                  {searchQuery 
                    ? 'Try adjusting your search terms or filters'
                    : 'Get started by adding your first agency partner'
                  }
                </p>
                <Button className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  Add New Agency
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredAgencies.map((agency) => (
            <Card key={agency.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center border-2 ${getTierColor(agency.tier)}`}>
                      {getTierIcon(agency.tier)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <CardTitle className="text-lg">{agency.name}</CardTitle>
                        <Badge 
                          variant={agency.tier === 'gold' ? 'default' : agency.tier === 'silver' ? 'secondary' : 'outline'}
                          className="capitalize"
                        >
                          {agency.tier} Partner
                        </Badge>
                        <div className="flex items-center gap-1">
                          {getRatingStars(agency.rating)}
                          <span className="text-sm text-muted-foreground ml-1">
                            ({agency.rating})
                          </span>
                        </div>
                      </div>
                      <CardDescription className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {agency.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {agency.activeRecruiters} recruiters
                        </span>
                        <span className="flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" />
                          {agency.successRate}% success rate
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
                        Edit Agency
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
                    {agency.description}
                  </p>

                  {/* Specializations */}
                  <div>
                    <div className="text-sm font-medium mb-2">Specializations:</div>
                    <div className="flex flex-wrap gap-1">
                      {agency.specialization.map((spec, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {spec}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Key Metrics */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
                    <div>
                      <div className="text-sm font-medium">Success Rate</div>
                      <div className="flex items-center gap-1">
                        <div className="text-lg font-bold text-green-600">
                          {agency.successRate}%
                        </div>
                        <TrendingUp className="h-3 w-3 text-muted-foreground" />
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium">Total Placements</div>
                      <div className="flex items-center gap-1">
                        <div className="text-lg font-bold text-blue-600">
                          {agency.totalPlacements}
                        </div>
                        <CheckCircle2 className="h-3 w-3 text-muted-foreground" />
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium">Active Recruiters</div>
                      <div className="flex items-center gap-1">
                        <div className="text-lg font-bold text-purple-600">
                          {agency.activeRecruiters}
                        </div>
                        <Users className="h-3 w-3 text-muted-foreground" />
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium">Partner Since</div>
                      <div className="text-sm text-muted-foreground">
                        {formatJoinDate(agency.joinedAt)}
                      </div>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="bg-muted/30 rounded-lg p-3">
                    <div className="text-sm font-medium mb-2">Primary Contact</div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="h-3 w-3 text-muted-foreground" />
                        <span className="font-medium">{agency.contactPerson}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="h-3 w-3" />
                        {agency.email}
                      </div>
                      {agency.phone && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          {agency.phone}
                        </div>
                      )}
                      {agency.website && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Globe className="h-3 w-3" />
                          <a 
                            href={agency.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="hover:text-primary hover:underline"
                          >
                            {agency.website.replace('https://', '')}
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
                      <Target className="mr-2 h-4 w-4" />
                      Send Jobs
                    </Button>
                    <Button variant="outline" size="sm">
                      <Mail className="mr-2 h-4 w-4" />
                      Contact
                    </Button>
                    {(currentUser.role === 'platform_admin' || currentUser.role === 'platform_prototype') && (
                      <Button variant="outline" size="sm">
                        <Award className="mr-2 h-4 w-4" />
                        Manage Tier
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Performance Summary for Platform Admin/Prototype */}
      {(currentUser.role === 'platform_admin' || currentUser.role === 'platform_prototype') && (
        <Card>
          <CardHeader>
            <CardTitle>Network Performance</CardTitle>
            <CardDescription>
              Overview of your agency network performance metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {agencies.filter(a => a.tier === 'gold').length}
                </div>
                <div className="text-sm text-muted-foreground">Gold Partners</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600">
                  {agencies.filter(a => a.tier === 'silver').length}
                </div>
                <div className="text-sm text-muted-foreground">Silver Partners</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {agencies.filter(a => a.tier === 'bronze').length}
                </div>
                <div className="text-sm text-muted-foreground">Bronze Partners</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {Math.round(agencies.reduce((acc, a) => acc + a.successRate, 0) / agencies.length)}%
                </div>
                <div className="text-sm text-muted-foreground">Network Avg Success</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pagination placeholder */}
      {filteredAgencies.length > 10 && (
        <div className="flex justify-center pt-4">
          <Button variant="outline">Load More Agencies</Button>
        </div>
      )}
    </div>
  )
}