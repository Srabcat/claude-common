'use client'

import * as React from 'react'
import { Search, Filter, X, Calendar, Tag, User, Building } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from '@/components/ui/dropdown-menu'
import { Checkbox } from '@/components/ui/checkbox'
import { cn, debounce } from '@/lib/utils'
import { SearchFilters, CandidateStatus } from '@/types'

interface CandidateFiltersProps {
  filters: SearchFilters
  onFiltersChange: (filters: SearchFilters) => void
  totalCount: number
  filteredCount: number
  className?: string
}

const STATUS_OPTIONS: { value: CandidateStatus; label: string; color: string }[] = [
  { value: 'sourced', label: 'Sourced', color: 'bg-gray-500' },
  { value: 'contacted', label: 'Contacted', color: 'bg-blue-500' },
  { value: 'interviewing', label: 'Interviewing', color: 'bg-yellow-500' },
  { value: 'offered', label: 'Offered', color: 'bg-orange-500' },
  { value: 'hired', label: 'Hired', color: 'bg-green-500' },
  { value: 'declined', label: 'Declined', color: 'bg-red-500' },
]

const TAG_OPTIONS = [
  'Senior', 'Mid-level', 'Junior', 'Remote', 'Full-time', 'Contract',
  'Frontend', 'Backend', 'Full-stack', 'Mobile', 'DevOps', 'AI/ML',
  'Product', 'Design', 'Marketing', 'Sales', 'Data', 'Security'
]

export function CandidateFilters({
  filters,
  onFiltersChange,
  totalCount,
  filteredCount,
  className
}: CandidateFiltersProps) {
  const [searchQuery, setSearchQuery] = React.useState(filters.query)

  // Debounced search to avoid too many filter updates
  const debouncedSearchUpdate = React.useMemo(
    () => debounce((query: string) => {
      onFiltersChange({ ...filters, query })
    }, 300),
    [filters, onFiltersChange]
  )

  React.useEffect(() => {
    debouncedSearchUpdate(searchQuery)
  }, [searchQuery, debouncedSearchUpdate])

  const handleStatusChange = (status: CandidateStatus, checked: boolean) => {
    const currentStatuses = filters.status || []
    const newStatuses = checked
      ? [...currentStatuses, status]
      : currentStatuses.filter(s => s !== status)
    
    onFiltersChange({
      ...filters,
      status: newStatuses.length > 0 ? newStatuses : undefined
    })
  }

  const handleTagChange = (tag: string, checked: boolean) => {
    const currentTags = filters.tags || []
    const newTags = checked
      ? [...currentTags, tag]
      : currentTags.filter(t => t !== tag)
    
    onFiltersChange({
      ...filters,
      tags: newTags.length > 0 ? newTags : undefined
    })
  }

  const clearAllFilters = () => {
    setSearchQuery('')
    onFiltersChange({
      query: '',
      status: undefined,
      tags: undefined,
      dateRange: undefined
    })
  }

  const removeFilter = (type: 'status' | 'tags', value: string) => {
    if (type === 'status') {
      const newStatuses = (filters.status || []).filter(s => s !== value)
      onFiltersChange({
        ...filters,
        status: newStatuses.length > 0 ? newStatuses : undefined
      })
    } else if (type === 'tags') {
      const newTags = (filters.tags || []).filter(t => t !== value)
      onFiltersChange({
        ...filters,
        tags: newTags.length > 0 ? newTags : undefined
      })
    }
  }

  const hasActiveFilters = !!(filters.status?.length || filters.tags?.length || filters.dateRange)

  return (
    <div className={cn('space-y-4', className)}>
      {/* Search and Filter Row */}
      <div className="flex items-center gap-4">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-muted/50"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 hover:bg-accent"
              onClick={() => setSearchQuery('')}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>

        {/* Status Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <User className="h-4 w-4" />
              Status
              {filters.status?.length && (
                <Badge variant="secondary" className="ml-1 text-xs px-1.5 h-5">
                  {filters.status.length}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuGroup>
              {STATUS_OPTIONS.map((option) => (
                <DropdownMenuItem key={option.value} className="flex items-center space-x-2">
                  <Checkbox
                    checked={filters.status?.includes(option.value) || false}
                    onCheckedChange={(checked) => handleStatusChange(option.value, checked as boolean)}
                  />
                  <div className={cn('h-2 w-2 rounded-full', option.color)} />
                  <span className="text-sm">{option.label}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Tags Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Tag className="h-4 w-4" />
              Tags
              {filters.tags?.length && (
                <Badge variant="secondary" className="ml-1 text-xs px-1.5 h-5">
                  {filters.tags.length}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuGroup>
              {TAG_OPTIONS.map((tag) => (
                <DropdownMenuItem key={tag} className="flex items-center space-x-2">
                  <Checkbox
                    checked={filters.tags?.includes(tag) || false}
                    onCheckedChange={(checked) => handleTagChange(tag, checked as boolean)}
                  />
                  <span className="text-sm">{tag}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Date Range Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Calendar className="h-4 w-4" />
              Date Range
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-48">
            <DropdownMenuGroup>
              <DropdownMenuItem>Last 7 days</DropdownMenuItem>
              <DropdownMenuItem>Last 30 days</DropdownMenuItem>
              <DropdownMenuItem>Last 3 months</DropdownMenuItem>
              <DropdownMenuItem>Custom range...</DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* More Filters */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="h-4 w-4" />
              More filters
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-48">
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <Building className="mr-2 h-4 w-4" />
                Organization
              </DropdownMenuItem>
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                Recruiter
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                Saved searches
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="text-muted-foreground hover:text-foreground"
          >
            Clear all
          </Button>
        )}
      </div>

      {/* Active Filters */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          
          {filters.status?.map((status) => {
            const statusOption = STATUS_OPTIONS.find(opt => opt.value === status)
            return (
              <Badge
                key={status}
                variant="secondary"
                className="gap-2 pl-2"
              >
                <div className={cn('h-1.5 w-1.5 rounded-full', statusOption?.color)} />
                {statusOption?.label}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 hover:bg-secondary-foreground/10"
                  onClick={() => removeFilter('status', status)}
                >
                  <X className="h-2.5 w-2.5" />
                </Button>
              </Badge>
            )
          })}

          {filters.tags?.map((tag) => (
            <Badge key={tag} variant="outline" className="gap-2">
              <Tag className="h-2.5 w-2.5" />
              {tag}
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 hover:bg-accent"
                onClick={() => removeFilter('tags', tag)}
              >
                <X className="h-2.5 w-2.5" />
              </Button>
            </Badge>
          ))}
        </div>
      )}

      {/* Results Count */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Showing {filteredCount.toLocaleString()} of {totalCount.toLocaleString()} candidates
        </span>
        
        {filteredCount !== totalCount && (
          <span className="text-xs">
            {Math.round((filteredCount / totalCount) * 100)}% match your filters
          </span>
        )}
      </div>
    </div>
  )
}