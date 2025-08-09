'use client'

import * as React from 'react'
import { Plus, Download, MoreHorizontal, Trash2, Edit, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { CandidateTable } from '@/components/candidates/candidate-table'
import { CandidateFilters } from '@/components/candidates/candidate-filters'
import { AddCandidateForm } from '@/components/candidates/add-candidate-form'
import { CandidateSecondaryNav } from '@/components/candidates/candidate-secondary-nav'
import { mockCandidates } from '@/lib/mock-data'
import { Candidate, SearchFilters, AddCandidateData } from '@/types'
import { cn, generateId } from '@/lib/utils'

type SortField = keyof Candidate
type SortDirection = 'asc' | 'desc'

export default function CandidatesPage() {
  const [candidates, setCandidates] = React.useState<Candidate[]>(mockCandidates)
  const [filteredCandidates, setFilteredCandidates] = React.useState<Candidate[]>(mockCandidates)
  const [selectedIds, setSelectedIds] = React.useState<string[]>([])
  const [showAddForm, setShowAddForm] = React.useState(false)
  const [sortField, setSortField] = React.useState<SortField>('addedAt')
  const [sortDirection, setSortDirection] = React.useState<SortDirection>('desc')
  const [activeSecondaryTab, setActiveSecondaryTab] = React.useState('all')
  const [filters, setFilters] = React.useState<SearchFilters>({
    query: '',
    status: undefined,
    tags: undefined,
    dateRange: undefined
  })

  // Filter candidates based on search and filters
  React.useEffect(() => {
    let filtered = [...candidates]

    // Search filter
    if (filters.query) {
      const query = filters.query.toLowerCase()
      filtered = filtered.filter(candidate =>
        candidate.name.toLowerCase().includes(query) ||
        candidate.email.toLowerCase().includes(query) ||
        candidate.location?.toLowerCase().includes(query) ||
        candidate.notes?.toLowerCase().includes(query) ||
        candidate.skills?.some(skill => skill.toLowerCase().includes(query))
      )
    }

    // Status filter
    if (filters.status && filters.status.length > 0) {
      filtered = filtered.filter(candidate =>
        filters.status!.includes(candidate.status)
      )
    }

    // Tags filter
    if (filters.tags && filters.tags.length > 0) {
      filtered = filtered.filter(candidate =>
        filters.tags!.some(tag =>
          candidate.tags.includes(tag)
        )
      )
    }

    // Date range filter (if implemented)
    if (filters.dateRange) {
      // Implementation depends on specific date range logic
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const aVal = a[sortField]
      const bVal = b[sortField]

      if (aVal === undefined || aVal === null) return 1
      if (bVal === undefined || bVal === null) return -1

      let comparison = 0
      if (aVal < bVal) comparison = -1
      if (aVal > bVal) comparison = 1

      return sortDirection === 'desc' ? -comparison : comparison
    })

    setFilteredCandidates(filtered)
  }, [candidates, filters, sortField, sortDirection])

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  const handleAddCandidate = (data: AddCandidateData) => {
    const newCandidate: Candidate = {
      id: generateId(),
      ...data,
      status: 'sourced',
      addedAt: new Date(),
      recruiterId: 'current-user-id',
      recruiterName: 'Current User',
      organizationId: 'current-org-id',
      organizationName: 'Current Organization',
    }

    setCandidates([newCandidate, ...candidates])
    
    // Show success notification (could be replaced with toast)
    console.log('Candidate added successfully:', newCandidate)
  }

  const handleBulkDelete = () => {
    setCandidates(candidates.filter(c => !selectedIds.includes(c.id)))
    setSelectedIds([])
  }

  const handleBulkExport = () => {
    const selectedCandidates = candidates.filter(c => selectedIds.includes(c.id))
    console.log('Exporting candidates:', selectedCandidates)
    // Implement CSV/Excel export logic
  }

  const handleBulkEmail = () => {
    const selectedCandidates = candidates.filter(c => selectedIds.includes(c.id))
    console.log('Sending bulk email to:', selectedCandidates)
    // Implement bulk email logic
  }

  return (
    <div className="container mx-auto py-6 px-4 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Candidates</h1>
        </div>
        
        <div className="flex items-center gap-2">
          {selectedIds.length > 0 && (
            <>
              <Badge variant="secondary" className="mr-2">
                {selectedIds.length} selected
              </Badge>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <MoreHorizontal className="h-4 w-4" />
                    Bulk Actions
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={handleBulkEmail}>
                    <Mail className="mr-2 h-4 w-4" />
                    Send Email
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleBulkExport}>
                    <Download className="mr-2 h-4 w-4" />
                    Export Selected
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Edit className="mr-2 h-4 w-4" />
                    Bulk Edit
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={handleBulkDelete}
                    className="text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Selected
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
          
          <Button
            onClick={() => setShowAddForm(true)}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Candidate
          </Button>
        </div>
      </div>

      {/* Secondary Navigation (like Paraform) */}
      <CandidateSecondaryNav
        activeTab={activeSecondaryTab}
        onTabChange={setActiveSecondaryTab}
      />

      {/* Filters */}
      <CandidateFilters
        filters={filters}
        onFiltersChange={setFilters}
        totalCount={candidates.length}
        filteredCount={filteredCandidates.length}
      />

      {/* Candidates Table */}
      <div className="space-y-4">
        <CandidateTable
          candidates={filteredCandidates}
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          sortField={sortField}
          sortDirection={sortDirection}
          onSort={handleSort}
        />

        {/* Pagination would go here */}
        {filteredCandidates.length > 0 && (
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div>
              Showing {Math.min(50, filteredCandidates.length)} of {filteredCandidates.length} results
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled>
                Previous
              </Button>
              <Button variant="outline" size="sm" disabled>
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Add Candidate Form */}
      <AddCandidateForm
        open={showAddForm}
        onOpenChange={setShowAddForm}
        onSubmit={handleAddCandidate}
      />
    </div>
  )
}