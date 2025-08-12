'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Candidate } from '@/types'

interface SecondaryNavItem {
  id: string
  title: string
  count?: number
  isActive?: boolean
}

interface CandidateSecondaryNavProps {
  activeTab: string
  onTabChange: (tabId: string) => void
  candidates: Candidate[]
  className?: string
}

export function CandidateSecondaryNav({
  activeTab,
  onTabChange,
  candidates,
  className
}: CandidateSecondaryNavProps) {
  // Calculate dynamic counts based on actual data
  const getCounts = React.useMemo(() => {
    const activeCount = candidates.filter(c => 
      ['contacted', 'interviewing', 'offered'].includes(c.status)
    ).length
    
    const pipelineCount = candidates.filter(c => 
      c.status === 'interviewing'
    ).length
    
    const calendarCount = candidates.filter(c => 
      c.status === 'interviewing' || c.status === 'offered'
    ).length

    return {
      all: candidates.length,
      active: activeCount,
      pipeline: pipelineCount,
      calendar: calendarCount
    }
  }, [candidates])

  const navItems: SecondaryNavItem[] = [
    { id: 'all', title: 'All Candidates', count: getCounts.all },
    { id: 'active', title: 'Active Applications', count: getCounts.active },
    { id: 'pipeline', title: 'Interview Pipeline', count: getCounts.pipeline },
    { id: 'calendar', title: 'Interview Calendar', count: getCounts.calendar },
  ]

  return (
    <div className={cn('border-b bg-background', className)}>
      <div className="flex items-center space-x-1 px-1">
        {navItems.map((item) => (
          <Button
            key={item.id}
            variant={activeTab === item.id ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => onTabChange(item.id)}
            className={cn(
              'relative h-8 px-3',
              activeTab === item.id && 'bg-secondary text-secondary-foreground'
            )}
          >
            {item.title}
            {item.count !== undefined && (
              <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-xs">
                {item.count}
              </span>
            )}
          </Button>
        ))}
      </div>
    </div>
  )
}