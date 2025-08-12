# Candidate Feature Implementation Roadmap

## Overview

Based on competitor analysis, candidate features fall into 3 categories:
1. **Candidate Profile Creation** - Enhanced data capture and profile building
2. **Search & Filter** - Advanced candidate discovery capabilities  
3. **Submission Journey** - Candidate-job application tracking (requires F-Submission completion)

## Phase 1: Enhanced Candidate Profiles (Immediate Implementation)

### Database Schema Updates

#### Expand Candidate Table
```sql
-- Replace current basic candidate structure
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS first_name VARCHAR(100);
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS last_name VARCHAR(100);
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS current_title VARCHAR(255);
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS current_company VARCHAR(255);
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS years_experience INTEGER;
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS summary TEXT;
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS availability_status ENUM('active', 'passive', 'not_looking') DEFAULT 'active';
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS available_start_date DATE;
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS notice_period VARCHAR(50);
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS desired_salary_min INTEGER;
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS desired_salary_max INTEGER;
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS salary_currency CHAR(3) DEFAULT 'USD';
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS remote_preference ENUM('office', 'remote', 'hybrid', 'no_preference') DEFAULT 'no_preference';
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS portfolio_urls TEXT[];
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS documents JSONB DEFAULT '[]';
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS source VARCHAR(100);
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS referrer_id UUID REFERENCES users(id);
```

#### Add Experience & Education Tables
```sql
CREATE TABLE candidate_experience (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE,
  company VARCHAR(255) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE,
  is_current BOOLEAN DEFAULT false,
  location VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE candidate_education (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE,
  institution VARCHAR(255) NOT NULL,
  degree VARCHAR(255),
  field_of_study VARCHAR(255),
  start_date DATE,
  end_date DATE,
  gpa DECIMAL(3,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);


### Frontend Components

#### Enhanced Candidate Form
```typescript
// components/candidates/CandidateProfileForm.tsx
interface CandidateFormData {
  // Personal Information
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
  
  // Experience History
  experience: WorkExperience[]
  education: Education[]
  
  // Documents
  resumeFile?: File
  portfolioUrls: string[]
  linkedinUrl?: string
  
  // Availability & Preferences
  availabilityStatus: 'active' | 'passive' | 'not_looking'
  availableStartDate?: Date
  noticePeriod?: string
  desiredSalary?: {
    min: number
    max: number
    currency: string
  }
  remotePreference: 'office' | 'remote' | 'hybrid' | 'no_preference'
}
```

#### Implementation Priority
1. **Week 1**: Update database schema and API endpoints
2. **Week 2**: Build multi-step candidate creation form
3. **Week 3**: Add experience/education sections with dynamic add/remove
4. **Week 4**: File upload for documents and resume parsing (basic)

---

## Phase 2: Advanced Search & Filter (Week 5-8)

### Search Infrastructure

#### Enhanced Search API
```typescript
interface CandidateSearchFilters {
  // Text Search
  query?: string // searches name, email, skills, current title
  
  // Professional Filters
  skills?: string[] // OR logic by default
  skillsOperator?: 'AND' | 'OR'
  experienceLevel?: ('entry' | 'mid' | 'senior' | 'executive')[]
  yearsExperienceMin?: number
  yearsExperienceMax?: number
  currentCompanies?: string[]
  
  // Location & Remote
  locations?: string[] // cities
  states?: string[]
  countries?: string[]
  remoteOk?: boolean
  remotePreference?: ('office' | 'remote' | 'hybrid')[]
  
  // Availability
  availabilityStatus?: ('active' | 'passive' | 'not_looking')[]
  availableBy?: Date
  noticePeriodMax?: number // in weeks
  
  // Salary & Compensation
  salaryMin?: number
  salaryMax?: number
  salaryCurrency?: string
  
  // Application Status (when submissions implemented)
  hasAppliedToJob?: string
  applicationStatus?: string[]
  
  // Meta Filters
  createdAfter?: Date
  lastContactedBefore?: Date
  source?: string[]
  tags?: string[]
}
```

#### Database Indexes for Search Performance
```sql
-- Full-text search on multiple fields
CREATE INDEX idx_candidates_text_search ON candidates USING gin(
  to_tsvector('english', 
    COALESCE(first_name, '') || ' ' || 
    COALESCE(last_name, '') || ' ' || 
    COALESCE(current_title, '') || ' ' || 
    COALESCE(current_company, '') || ' ' ||
    array_to_string(skills, ' ')
  )
);

-- Specific filter indexes
CREATE INDEX idx_candidates_experience_level ON candidates(years_experience);
CREATE INDEX idx_candidates_location ON candidates USING gin((location));
CREATE INDEX idx_candidates_availability ON candidates(availability_status, available_start_date);
CREATE INDEX idx_candidates_salary ON candidates(desired_salary_min, desired_salary_max);
CREATE INDEX idx_candidates_skills ON candidates USING gin(skills);
```

### Frontend Search Components

#### Advanced Search Interface
```typescript
// components/candidates/CandidateSearch.tsx
export default function CandidateSearch() {
  const [filters, setFilters] = useState<CandidateSearchFilters>({})
  const [savedSearches, setSavedSearches] = useState([])
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  
  return (
    <div className="space-y-4">
      {/* Quick Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Search candidates by name, skills, title..."
          className="pl-10"
        />
      </div>
      
      {/* Quick Filters */}
      <div className="flex gap-2 flex-wrap">
        <FilterButton label="Active" active={filters.availabilityStatus?.includes('active')} />
        <FilterButton label="Senior Level" active={filters.experienceLevel?.includes('senior')} />
        <FilterButton label="Remote OK" active={filters.remoteOk} />
      </div>
      
      {/* Advanced Filters Panel */}
      {showAdvancedFilters && (
        <AdvancedFiltersPanel filters={filters} onChange={setFilters} />
      )}
      
      {/* Saved Searches */}
      <SavedSearches searches={savedSearches} onApply={setFilters} />
    </div>
  )
}
```

#### Implementation Priority
1. **Week 5**: Basic text search with existing fields
2. **Week 6**: Add filter components for skills, experience, location
3. **Week 7**: Advanced Boolean search and saved searches
4. **Week 8**: Bulk operations and candidate tagging

---

## Phase 3: Candidate Submission Journey (Future - After F-Submission)

### Dependencies Required
- ✅ Jobs entity structure (F-main-entities)
- ⏳ Submission workflow (F-Submission) 
- ⏳ Interview management integration
- ⏳ Multi-party permissions (agency/employer collaboration)

### Future Schema (Reference Only)
```sql
-- This will be implemented in F-Submission
CREATE TABLE submissions (
  id UUID PRIMARY KEY,
  candidate_id UUID REFERENCES candidates(id),
  job_id UUID REFERENCES jobs(id),
  current_stage VARCHAR(100),
  status ENUM('active', 'withdrawn', 'rejected', 'hired'),
  submitted_by_org UUID REFERENCES organizations(id),
  -- ... additional submission tracking fields
);
```

### Future Components (Reference Only)
- `CandidateSubmissionTimeline.tsx` - Visual journey tracking
- `CandidateInterviewScheduler.tsx` - Interview integration
- `SubmissionCollaborationPanel.tsx` - Agency/employer coordination

---

## API Endpoints to Implement

### Phase 1: Profile Management
```typescript
// Candidate CRUD
POST /api/candidates - Create candidate with full profile
GET /api/candidates/:id - Get complete candidate profile
PUT /api/candidates/:id - Update candidate profile
DELETE /api/candidates/:id - Soft delete candidate

// Experience & Education
POST /api/candidates/:id/experience - Add work experience
PUT /api/candidates/:id/experience/:expId - Update experience
DELETE /api/candidates/:id/experience/:expId - Remove experience

POST /api/candidates/:id/education - Add education
PUT /api/candidates/:id/education/:eduId - Update education
DELETE /api/candidates/:id/education/:eduId - Remove education

// Document Management
POST /api/candidates/:id/documents - Upload documents
DELETE /api/candidates/:id/documents/:docId - Remove document
```

### Phase 2: Search & Discovery
```typescript
// Search & Filter
GET /api/candidates/search - Advanced candidate search
POST /api/candidates/search/save - Save search template
GET /api/candidates/search/saved - Get user's saved searches
DELETE /api/candidates/search/saved/:id - Delete saved search

// Bulk Operations
POST /api/candidates/bulk/update - Bulk status/tag updates
POST /api/candidates/bulk/export - Export candidate lists
```

## Testing Strategy

### Phase 1 Testing
- Unit tests for candidate form validation
- API endpoint testing for CRUD operations
- File upload testing for documents
- Database schema validation

### Phase 2 Testing  
- Search performance testing with large datasets
- Filter combination testing
- Saved search functionality
- Bulk operations testing

## Success Metrics

### Phase 1: Profile Creation
- Time to create complete candidate profile < 5 minutes
- Data completeness: >80% of profiles have experience/education
- User adoption: >90% of users use enhanced profile features

### Phase 2: Search & Discovery
- Search response time < 500ms for 10k+ candidates
- Search accuracy: Users find target candidates in <3 queries
- Feature adoption: >70% use advanced filters, >40% save searches

## Competitive Benchmarking

### Features We'll Match
- ✅ **Greenhouse**: Structured profiles with custom fields
- ✅ **Ashby**: Advanced search with Boolean operators  
- ✅ **RecruiterFlow**: Document management and experience tracking

### Our Unique Advantages
- ✅ **Multi-stakeholder profiles**: Agency and employer views of same candidate
- ✅ **Collaboration-first**: Built for agency-employer partnership
- ✅ **Modern UX**: Consumer-grade experience for professional tools

**Reference**: Detailed competitor analysis in `/docs/Roadmap/Reference/Competitors/`