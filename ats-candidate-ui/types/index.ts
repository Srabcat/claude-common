export type UserRole = 'platform_admin' | 'agency_recruiter' | 'employer_recruiter'

export type CandidateStatus = 'sourced' | 'contacted' | 'interviewing' | 'offered' | 'hired' | 'declined'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  organizationId: string
  organizationName: string
  avatar?: string
}

export interface Organization {
  id: string
  name: string
  type: 'agency' | 'employer' | 'platform'
  logo?: string
}

export interface Candidate {
  id: string
  name: string
  email: string
  phone?: string
  status: CandidateStatus
  addedAt: Date
  recruiterId: string
  recruiterName: string
  organizationId: string
  organizationName: string
  tags: string[]
  notes?: string
  linkedinUrl?: string
  resumeUrl?: string
  location?: string
  experience?: string
  skills?: string[]
}

export interface SearchFilters {
  query: string
  status?: CandidateStatus[]
  tags?: string[]
  dateRange?: {
    from: Date
    to: Date
  }
}

export interface AddCandidateData {
  name: string
  email: string
  phone?: string
  location?: string
  linkedinUrl?: string
  notes?: string
  tags: string[]
  skills?: string[]
}

// Form step for multi-step candidate form
export interface FormStep {
  id: string
  title: string
  description: string
  isCompleted: boolean
  isActive: boolean
}

// Navigation item for different user roles
export interface NavItem {
  id: string
  title: string
  href: string
  icon?: string
  badge?: string
  roles: UserRole[]
}