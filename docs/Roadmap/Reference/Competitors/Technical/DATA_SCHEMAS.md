# Data Schema & Structure Comparison

## Candidate Data Models

### Greenhouse Schema (Inferred from Features)
```typescript
interface Candidate {
  id: string
  personal: {
    firstName: string
    lastName: string
    email: string
    phone: string
    location: {
      city: string
      state: string
      country: string
    }
  }
  profile: {
    resumeUrl: string
    linkedinUrl?: string
    portfolioUrls: string[]
    summary: string
    customFields: Record<string, any> // Company-defined fields
  }
  experience: {
    currentRole?: string
    yearsExperience: number
    skills: string[]
    education: Education[]
    workHistory: WorkExperience[]
  }
  applications: {
    jobId: string
    appliedDate: Date
    source: string // 'job_board' | 'referral' | 'agency' | 'direct'
    status: 'applied' | 'screening' | 'interviewing' | 'offer' | 'hired' | 'rejected'
    currentStage: string
    interviews: Interview[]
    notes: Note[]
  }[]
  metadata: {
    createdAt: Date
    updatedAt: Date
    tags: string[]
    rating?: number
    diversity?: {
      ethnicity?: string
      gender?: string
      veteran?: boolean
    }
  }
}
```

### Ashby Schema (Advanced Analytics Focus)
```typescript
interface Candidate {
  id: string
  basicInfo: PersonalInfo
  profile: {
    documents: Document[]
    socialProfiles: SocialProfile[]
    aiGeneratedSummary: string // AI-powered
    parsedSkills: Skill[] // AI-extracted
  }
  applicationHistory: {
    applications: Application[]
    touchpoints: Touchpoint[] // All interactions
    sourcePath: SourceAttribution[] // Multi-touch tracking
  }
  analytics: {
    engagementScore: number
    responseRate: number
    interviewPerformance: InterviewScore[]
    predictedSuccess: number // AI-driven
  }
}
```

### RecruiterFlow Schema (Agency-Focused)
```typescript
interface Candidate {
  id: string
  basicInfo: PersonalInfo
  agencyData: {
    representingAgency: string
    agencyNotes: string
    clientSubmissions: ClientSubmission[]
    availabilityStatus: 'active' | 'passive' | 'unavailable'
  }
  clientViews: {
    [clientId: string]: {
      customizedProfile: CandidateProfile
      submissionStatus: string
      clientFeedback: Feedback[]
    }
  }
  nurturingCampaigns: {
    enrolledCampaigns: Campaign[]
    lastContact: Date
    nextFollowUp: Date
  }
}
```

### Our Prototype Schema (Current)
```typescript
// From our mock-data.ts
interface Candidate {
  id: string
  name: string
  email: string
  phone: string
  location: string
  experience: string
  skills: string[]
  status: 'active' | 'interviewing' | 'hired' | 'not-interested'
  appliedJobs: string[]
  notes: string
  resumeUrl?: string
  linkedinUrl?: string
  rating: number
  interviews: string[]
  submittedBy?: string // agency reference
}
```

**Gap Analysis:**
- ❌ **Missing structured experience data** (work history, education)
- ❌ **No application tracking per job** - array of job IDs only
- ❌ **No interaction/touchpoint history** - limited notes field
- ❌ **No analytics/scoring data** - basic rating only
- ❌ **No document management** - single resume URL
- ❌ **No custom fields** - fixed schema only

## Job/Position Data Models

### Enterprise ATS Schema (Greenhouse/Ashby)
```typescript
interface Job {
  id: string
  title: string
  department: string
  location: {
    office?: string
    remote: boolean
    timezone?: string
  }
  details: {
    description: string
    requirements: string[]
    niceToHave: string[]
    responsibilities: string[]
    salaryRange: {
      min: number
      max: number
      currency: string
      equity?: boolean
    }
  }
  hiringTeam: {
    hiringManager: string
    recruiters: string[]
    interviewers: string[]
  }
  process: {
    stages: HiringStage[]
    customFields: Record<string, any>
    approvalRequired: boolean
  }
  analytics: {
    applications: number
    pipeline: StageMetrics[]
    timeToHire: number
    costPerHire: number
  }
  status: 'draft' | 'open' | 'on_hold' | 'closed' | 'filled'
  metadata: {
    createdAt: Date
    publishedAt?: Date
    closedAt?: Date
    priority: 'low' | 'medium' | 'high' | 'urgent'
  }
}
```

### Startup Focus Schema (Wellfound)
```typescript
interface StartupJob {
  id: string
  basicInfo: JobBasics
  startupSpecific: {
    equityRange: {
      min: number
      max: number
      percentage: boolean
    }
    companyStage: 'pre_seed' | 'seed' | 'series_a' | 'series_b+' | 'public'
    cultureAttributes: string[]
    founderMessage: string
    techStack: string[]
  }
  application: {
    oneClickApply: boolean
    customQuestions: Question[]
    founderConnection: boolean // Direct founder outreach
  }
}
```

### Our Prototype Schema (Current)
```typescript
interface Job {
  id: string
  title: string
  company: string
  location: string
  type: 'full-time' | 'part-time' | 'contract' | 'internship'
  experience: 'entry' | 'mid' | 'senior' | 'executive'
  skills: string[]
  description: string
  requirements: string[]
  salary: {
    min: number
    max: number
  }
  remote: boolean
  status: 'active' | 'paused' | 'filled' | 'cancelled'
  applications: number
  interviews: number
  offers: number
  postedDate: Date
  urgent?: boolean
}
```

**Gap Analysis:**
- ❌ **No hiring team structure** - missing role assignments
- ❌ **No process definition** - static hiring stages
- ❌ **No analytics tracking** - basic counts only
- ❌ **No custom fields** - fixed schema
- ❌ **No approval workflows** - direct publishing

## Interview Data Models

### Comprehensive Interview Schema (Greenhouse/Ashby)
```typescript
interface Interview {
  id: string
  candidateId: string
  jobId: string
  scheduling: {
    scheduledAt: Date
    duration: number // minutes
    timezone: string
    location?: string
    videoLink?: string
    calendarEventId?: string
  }
  participants: {
    interviewers: Interviewer[]
    candidate: CandidateInfo
    coordinator?: string
  }
  format: {
    type: 'phone' | 'video' | 'in_person' | 'technical' | 'panel'
    stage: string // e.g., "technical_screen", "final_round"
    focus: string[] // e.g., ["technical_skills", "culture_fit"]
  }
  preparation: {
    interviewGuide: string
    questionsToAsk: Question[]
    evaluationCriteria: Criteria[]
  }
  execution: {
    status: 'scheduled' | 'completed' | 'cancelled' | 'no_show'
    actualStartTime?: Date
    actualEndTime?: Date
    notes: string
    recording?: {
      url: string
      transcription?: string
    }
  }
  evaluation: {
    overallRating: number
    criteriaScores: Record<string, number>
    feedback: string
    recommendation: 'strong_yes' | 'yes' | 'no' | 'strong_no'
    nextSteps: string
  }
  followUp: {
    thankYouSent: boolean
    feedbackDeadline: Date
    decisionMade?: boolean
  }
}
```

### Our Prototype Schema (Current)
```typescript
interface Interview {
  id: string
  candidateName: string
  jobTitle: string
  company: string
  scheduledAt: Date
  type: 'video' | 'phone' | 'in-person' | 'technical'
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show'
  interviewers: string[]
  notes?: string
  rating?: number
  feedback?: string
}
```

**Gap Analysis:**
- ❌ **Missing preparation data** - no interview guides or criteria
- ❌ **No evaluation structure** - basic rating/feedback only
- ❌ **No scheduling integration** - manual coordination
- ❌ **No follow-up tracking** - missing post-interview workflow
- ❌ **No recording/transcription** - external tool required

## Agency & Client Relationship Models

### Agency-Focused Schema (RecruiterFlow)
```typescript
interface Agency {
  id: string
  basicInfo: {
    name: string
    contactInfo: ContactInfo
    specializations: string[]
    geography: string[]
  }
  performance: {
    placementRate: number
    avgTimeToFill: number
    clientSatisfaction: number
    candidateQuality: number
  }
  clientRelationships: {
    activeClients: Client[]
    contracts: Contract[]
    feeStructures: FeeStructure[]
  }
  capabilities: {
    industries: string[]
    roleLevels: string[]
    searchTypes: string[] // contingency, retained, etc.
  }
}
```

### Marketplace Schema (BountyJobs/Paraform)
```typescript
interface Recruiter {
  id: string
  profile: RecruiterProfile
  verification: {
    verified: boolean
    verificationLevel: 'basic' | 'enhanced' | 'elite'
    backgroundCheck: boolean
  }
  performance: {
    successRate: number
    avgTimeToFill: number
    placementHistory: Placement[]
    clientRatings: Rating[]
  }
  specializations: {
    industries: string[]
    roles: string[]
    geography: string[]
    salaryRanges: SalaryRange[]
  }
}
```

### Our Prototype Schema (Current)
```typescript
interface Agency {
  id: string
  name: string
  contactPerson: string
  email: string
  phone: string
  specialization: string[]
  location: string
  website: string
  description: string
  tier: 'premium' | 'standard' | 'basic'
  performance: {
    placementRate: number
    avgTimeToFill: number
    activeJobs: number
    totalPlacements: number
  }
  clients: string[]
}
```

**Gap Analysis:**
- ❌ **No verification system** - self-reported information only
- ❌ **No detailed performance history** - aggregate metrics only
- ❌ **No contract management** - missing business relationships
- ❌ **No fee structure tracking** - no financial modeling
- ❌ **Limited capability mapping** - basic specialization array

## Implementation Recommendations

### Phase 1: Schema Foundation (Immediate)
1. **Expand candidate model** - add work history, education, application tracking
2. **Enhance job structure** - hiring team, process stages, custom fields
3. **Interview model expansion** - preparation, evaluation, follow-up
4. **Relationship modeling** - proper agency-client-candidate links

### Phase 2: Analytics Structure (3-6 months)
1. **Performance tracking** - detailed metrics for all entities
2. **Interaction logging** - comprehensive touchpoint history
3. **Source attribution** - multi-touch candidate journey
4. **Outcome measurement** - success/failure tracking with reasons

### Phase 3: Advanced Features (6-12 months)
1. **Custom field system** - configurable schema extensions
2. **Workflow modeling** - process definition and automation
3. **Integration schemas** - external system compatibility
4. **AI-ready structure** - data prepared for ML algorithms