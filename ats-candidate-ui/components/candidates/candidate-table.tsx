'use client'

import * as React from 'react'
import { ArrowUpDown, MoreHorizontal, ExternalLink, Mail, Phone, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { formatDateShort, cn } from '@/lib/utils'
import { Candidate, CandidateStatus } from '@/types'

interface CandidateTableProps {
  candidates: Candidate[]
  selectedIds: string[]
  onSelectionChange: (ids: string[]) => void
  sortField: keyof Candidate
  sortDirection: 'asc' | 'desc'
  onSort: (field: keyof Candidate) => void
  className?: string
}

export function CandidateTable({
  candidates,
  selectedIds,
  onSelectionChange,
  sortField,
  sortDirection,
  onSort,
  className
}: CandidateTableProps) {
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange(candidates.map(c => c.id))
    } else {
      onSelectionChange([])
    }
  }

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedIds, id])
    } else {
      onSelectionChange(selectedIds.filter(selectedId => selectedId !== id))
    }
  }

  const getStatusVariant = (status: CandidateStatus) => {
    switch (status) {
      case 'hired':
        return 'success' as const
      case 'offered':
        return 'warning' as const
      case 'interviewing':
        return 'default' as const
      case 'contacted':
        return 'secondary' as const
      case 'declined':
        return 'destructive' as const
      default:
        return 'outline' as const
    }
  }

  const getStatusLabel = (status: CandidateStatus) => {
    switch (status) {
      case 'sourced':
        return 'Sourced'
      case 'contacted':
        return 'Contacted'
      case 'interviewing':
        return 'Interviewing'
      case 'offered':
        return 'Offered'
      case 'hired':
        return 'Hired'
      case 'declined':
        return 'Declined'
      default:
        return status
    }
  }

  const SortButton = ({ field, children }: { field: keyof Candidate; children: React.ReactNode }) => (
    <Button
      variant="ghost"
      size="sm"
      className="h-8 px-2 hover:bg-accent"
      onClick={() => onSort(field)}
    >
      {children}
      <ArrowUpDown className="ml-2 h-3 w-3" />
    </Button>
  )

  return (
    <div className={cn('border rounded-lg overflow-hidden', className)}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr className="border-b">
              <th className="w-12 p-4">
                <Checkbox
                  checked={selectedIds.length === candidates.length && candidates.length > 0}
                  onCheckedChange={handleSelectAll}
                  aria-label="Select all candidates"
                />
              </th>
              <th className="text-left p-4">
                <SortButton field="name">Name</SortButton>
              </th>
              <th className="text-left p-4">
                <SortButton field="status">Status</SortButton>
              </th>
              <th className="text-left p-4">Job / Current Stage</th>
              <th className="text-left p-4">AI Matches</th>
              <th className="text-left p-4">
                <SortButton field="addedAt">Added At</SortButton>
              </th>
              <th className="text-left p-4">
                <SortButton field="recruiterName">Recruiter</SortButton>
              </th>
              <th className="w-12 p-4"></th>
            </tr>
          </thead>
          <tbody>
            {candidates.map((candidate, index) => (
              <tr
                key={candidate.id}
                className={cn(
                  'border-b hover:bg-muted/25 transition-colors cursor-pointer',
                  selectedIds.includes(candidate.id) && 'bg-muted/50'
                )}
              >
                <td className="p-4">
                  <Checkbox
                    checked={selectedIds.includes(candidate.id)}
                    onCheckedChange={(checked) => handleSelectOne(candidate.id, checked as boolean)}
                    aria-label={`Select ${candidate.name}`}
                  />
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                      {candidate.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-sm truncate">{candidate.name}</div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                        {candidate.email && (
                          <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            <span className="truncate max-w-[150px]">{candidate.email}</span>
                          </div>
                        )}
                        {candidate.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            <span className="truncate">{candidate.location}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    {candidate.linkedinUrl && (
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </td>
                <td className="p-4">
                  <Badge variant={getStatusVariant(candidate.status)} className="text-xs">
                    {getStatusLabel(candidate.status)}
                  </Badge>
                </td>
                <td className="p-4">
                  <div className="space-y-1">
                    <div className="text-sm font-medium">Software Engineer</div>
                    <div className="text-xs text-muted-foreground">Sourced</div>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-1">
                    <div className="text-sm font-medium">
                      {Math.floor(Math.random() * 5) + 1}
                    </div>
                    <div className="text-xs text-muted-foreground">matches</div>
                  </div>
                </td>
                <td className="p-4">
                  <div className="text-sm">{formatDateShort(candidate.addedAt)}</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(candidate.addedAt).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs">
                      {candidate.recruiterName.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="text-sm font-medium truncate max-w-[100px]">
                      {candidate.recruiterName}
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem>View Details</DropdownMenuItem>
                      <DropdownMenuItem>Edit Candidate</DropdownMenuItem>
                      <DropdownMenuItem>Send Message</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>Move to Stage</DropdownMenuItem>
                      <DropdownMenuItem>Add to Job</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive">
                        Delete Candidate
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {candidates.length === 0 && (
        <div className="text-center py-12">
          <div className="text-muted-foreground">No candidates found</div>
          <div className="text-sm text-muted-foreground mt-1">
            Try adjusting your search or filters
          </div>
        </div>
      )}
    </div>
  )
}