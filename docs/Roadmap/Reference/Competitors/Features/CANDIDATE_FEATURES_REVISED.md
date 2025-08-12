# Candidate Features - Three Categories Analysis

## Category 1: Candidate Profile Creation & Attributes

### What Competitors Capture During Candidate Creation

#### Greenhouse (Enterprise Standard)
**Required Fields:**
- Personal: First name, last name, email, phone
- Professional: Current title, company, years of experience
- Location: City, state/province, country

**Enhanced Fields:**
- Skills array with proficiency levels
- Education history (degree, institution, graduation year)
- Work authorization status
- Salary expectations (current and desired)
- Resume/CV upload with parsing
- LinkedIn and portfolio URLs
- Availability date and notice period

**Custom Fields:**
- Company-defined fields (configured per organization)
- Diversity and inclusion data (optional, compliant)
- Source attribution (how they entered system)

#### Ashby (Modern ATS)
**Core Profile:**
- Standard personal/professional info
- AI-parsed resume data automatically extracted
- Skills with AI-suggested additions
- Career timeline with automated gap detection

**Advanced Attributes:**
- Engagement scoring (response rates, interaction quality)
- Interview performance history across applications
- Cultural fit indicators and preferences
- Communication preferences (email, phone, text)

#### RecruiterFlow (Agency Focus)
**Agency-Specific Fields:**
- Representing agency information
- Client submission history and preferences
- Availability status (active, passive, not looking)
- Fee structure and contract terms
- Nurturing campaign enrollment status

**Client Collaboration:**
- Multiple client-specific views of same candidate
- Customized profiles for different client presentations
- Submission authorization and approval status

#### Our Prototype Current State
```typescript
// Current basic fields
interface Candidate {
  id: string
  name: string
  email: string
  phone: string
  location: string
  experience: string
  skills: string[]
  // ... limited additional fields
}
```

### Recommended MVP Candidate Attributes

#### Phase 1: Essential Creation Fields
```typescript
interface CandidateProfile {
  // Required Personal Info
  firstName: string
  lastName: string
  email: string
  phone: string
  location: {
    city: string
    state: string
    country: string
  }
  
  // Professional Summary
  currentTitle?: string
  currentCompany?: string
  yearsExperience: number
  skills: string[]
  summary?: string
  
  // Documents
  resumeUrl?: string
  linkedinUrl?: string
  portfolioUrls: string[]
  
  // Availability
  availabilityStatus: 'active' | 'passive' | 'not_looking'
  availableStartDate?: Date
  noticePeriod?: string
  
  // Preferences
  desiredSalaryRange?: {
    min: number
    max: number
    currency: string
  }
  remotePreference: 'office' | 'remote' | 'hybrid' | 'no_preference'
}
```

---

## Category 2: Search & Filter Capabilities

### How Competitors Handle Candidate Discovery

#### Advanced Search Patterns

**Teamable (AI-Powered Search):**
- Natural language search: "Find senior React developers in SF"
- Boolean operators: (React OR Angular) AND "San Francisco" 
- Skills-based filtering with AND/OR logic
- Experience level ranges with precise year filtering
- Location radius search with remote work options

**Wellfound (Startup Focus):**
- Role-specific filters (equity comfort, startup stage preference)
- Technology stack filtering (specific frameworks, languages)
- Company size preferences (seed, series A, growth, etc.)
- One-click filtering by common startup criteria

**Ashby (Enterprise Search):**
- Saved search templates for repeated queries
- Advanced conditional logic (if X then Y filtering)
- Tag-based organization and filtering
- Source attribution filtering (how candidate entered system)
- Engagement level filtering (highly responsive vs cold)

#### Filter Categories Across Platforms

**1. Basic Demographics:**
- Name, email, phone (exact and partial matching)
- Location (city, state, country, radius search)
- Contact information completeness

**2. Professional Qualifications:**
- Skills (AND/OR logic, proficiency levels)
- Experience level (junior, mid, senior, executive)
- Years of experience (range sliders)
- Current/previous company names
- Job titles (current and historical)
- Industry experience
- Education level and institutions

**3. Availability & Status:**
- Availability status (active, passive, employed)
- Notice period requirements
- Start date availability
- Remote work preferences
- Salary expectations vs budget ranges

**4. Application & Engagement:**
- Application status across jobs
- Interview history and performance
- Response rates and engagement scores
- Last contact date ranges
- Source of candidate entry

**5. Advanced Filtering:**
- Custom tags and labels
- Boolean search across multiple fields
- Saved search combinations
- Exclusion filters (NOT operators)
- Recently viewed/contacted

### Our Prototype Current Search

**Current Capabilities:**
- ✅ Basic name search
- ✅ Skills filtering (simple array matching)
- ✅ Status filtering (active, interviewing, etc.)
- ✅ Role-based result filtering

**Missing MVP Search Features:**
- ❌ Advanced Boolean search
- ❌ Location radius search
- ❌ Experience level ranges
- ❌ Salary range filtering
- ❌ Availability date filtering
- ❌ Saved searches
- ❌ Bulk selection and operations

### Recommended MVP Search & Filter Implementation

#### Phase 1: Essential Filters
```typescript
interface SearchFilters {
  // Text Search
  query?: string // name, email, skills, title
  
  // Professional
  skills?: string[] // OR logic
  experienceLevel?: ('entry' | 'mid' | 'senior' | 'executive')[]
  yearsExperienceMin?: number
  yearsExperienceMax?: number
  
  // Location & Remote
  locations?: string[] // cities
  remoteOk?: boolean
  
  // Availability
  availabilityStatus?: ('active' | 'passive' | 'not_looking')[]
  availableBy?: Date
  
  // Application Status
  hasAppliedToJob?: string // job ID
  applicationStatus?: ('active' | 'interviewing' | 'hired')[]
}
```

#### Phase 2: Advanced Search
- Boolean operators in query string
- Saved search templates
- Advanced location (radius, multiple cities)
- Salary range filtering
- Last contact date ranges

---

## Category 3: Submission Journey & Job Application Tracking

### Dependencies & Prerequisites
**Cannot implement until we have:**
1. ✅ Job entity structure complete
2. ✅ Submission workflow mapping
3. ⏳ Interview process integration
4. ⏳ Multi-party collaboration (agency + employer)

### How Competitors Handle Submission Journey

#### Submission Creation & Management

**BountyJobs (Agency Marketplace):**
- Agency submits candidate to specific job posting
- Employer reviews submission with candidate profile
- Status tracking: submitted → reviewing → interviewing → decision
- Fee structure and terms attached to each submission
- Performance metrics per submission and agency

**RecruiterFlow (Agency CRM):**
- Candidate-job pairing with client approval workflow
- Multiple client submissions for same candidate (with permissions)
- Client-specific candidate presentations and formatting
- Submission performance tracking and optimization

**Greenhouse (Enterprise Workflow):**
- Application creates candidate-job relationship automatically
- Structured hiring stage progression
- Interview scheduling integrated with submission status
- Approval workflows for stage advancement
- Analytics and reporting per submission funnel

#### Interview Integration in Submission Journey

**Ashby (Comprehensive Tracking):**
- Interview scheduling directly from submission view
- Interview feedback aggregation affects submission status
- Multi-round interview tracking with stage progression
- Automated next-step recommendations based on interview outcomes

**Wellfound (Streamlined Process):**
- Direct founder-candidate connections bypass traditional pipeline
- AI-powered interview scheduling from submission
- Rapid feedback loops and decision making
- Simplified submission-to-hire workflow

### Submission Journey Schema (Dependent on Job + Submission)

```typescript
// This category requires the following to be implemented first:
interface SubmissionJourney {
  submissionId: string // from submissions table
  candidateId: string
  jobId: string
  
  // Journey Tracking
  currentStage: string // from job.hiringStages
  stageHistory: StageChange[]
  interviews: Interview[] // linked to this submission
  
  // Multi-party Collaboration
  submittedBy: 'agency' | 'direct' | 'platform'
  agencyId?: string
  permissions: CollaborationPermissions
  
  // Status & Analytics
  timeInStage: number // days
  totalTimeInProcess: number
  nextSteps: string[]
  blockers?: string[]
}
```

## Implementation Priority & Dependencies

### Category 1: Candidate Attributes (Ready for MVP)
**Priority: HIGH** - Can implement immediately
- Enhanced candidate creation form
- Better data structure for profiles
- Document upload and management

### Category 2: Search & Filter (Ready for MVP)
**Priority: HIGH** - Can implement immediately  
- Advanced search UI components
- Filter logic and query building
- Saved searches and bulk operations

### Category 3: Submission Journey (Blocked)
**Priority: MEDIUM** - Dependent on job + submission completion
- **Requires**: Job entity finalization
- **Requires**: Submission workflow design
- **Requires**: Interview process integration
- **After**: Categories 1 & 2 are complete

## Agreement on Categorization ✅

Yes, I completely agree with these three categories because:

1. **Different Data Models**: Each requires different database design
2. **Different UI Patterns**: Profile creation vs search vs workflow tracking
3. **Different Dependencies**: Categories 1&2 are independent, Category 3 requires other systems
4. **Different User Interactions**: Create vs Find vs Track workflows
5. **Phased Implementation**: Allows MVP focus on 1&2 while planning 3 for later

This framework makes much more sense for development planning and user story creation.