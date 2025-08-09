'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface SecondaryNavItem {
  id: string
  title: string
  count?: number
  isActive?: boolean
}

interface CandidateSecondaryNavProps {
  activeTab: string
  onTabChange: (tabId: string) => void
  className?: string
}

const NAV_ITEMS: SecondaryNavItem[] = [
  { id: 'all', title: 'All Candidates' },
  { id: 'active', title: 'Active Applications', count: 24 },
  { id: 'pipeline', title: 'Interview Pipeline', count: 8 },
  { id: 'calendar', title: 'Interview Calendar', count: 3 },
]

export function CandidateSecondaryNav({
  activeTab,
  onTabChange,
  className
}: CandidateSecondaryNavProps) {
  return (
    <div className={cn('border-b bg-background', className)}>
      <div className="flex items-center space-x-1 px-1">
        {NAV_ITEMS.map((item) => (
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
            {item.count && (
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