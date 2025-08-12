# API Architecture Patterns from Competitors

## REST vs GraphQL Approaches

### Greenhouse (REST + Webhooks)
**API Architecture:**
- RESTful API with comprehensive endpoints
- Webhook system for real-time updates
- Rate limiting: 150 requests per minute
- Bulk operations for candidate/job management

**Example Endpoints:**
```
GET /v1/candidates - List candidates with filtering
POST /v1/candidates - Create candidate
GET /v1/candidates/{id}/applications - Get candidate applications
POST /v1/candidates/{id}/applications - Add application
```

**Authentication:**
- API key authentication
- OAuth 2.0 for integrations
- Scoped permissions per API key

### Ashby (GraphQL + REST Hybrid)
**Modern API Design:**
- GraphQL for complex queries and real-time data
- REST for simple CRUD operations  
- Subscription support for live updates
- Type-safe API with generated SDKs

**GraphQL Examples:**
```graphql
query GetCandidate($id: ID!) {
  candidate(id: $id) {
    id
    name
    applications {
      job { title company }
      currentStage
      interviews { scheduledAt status }
    }
    analytics {
      responseRate
      interviewPerformance
    }
  }
}
```

### RecruiterFlow (Agency-Focused API)
**Multi-Tenant Architecture:**
- Organization-scoped endpoints
- Client context switching
- Agency-client data isolation
- Bulk submission operations

**Endpoint Patterns:**
```
GET /api/v1/orgs/{orgId}/candidates
POST /api/v1/orgs/{orgId}/submissions
GET /api/v1/clients/{clientId}/candidates - Agency view of client candidates
POST /api/v1/clients/{clientId}/presentations - Candidate presentations
```

## Real-Time Communication Patterns

### WebSocket Implementation (Ashby/Modern Platforms)
```typescript
interface WebSocketMessage {
  type: 'submission_update' | 'interview_scheduled' | 'candidate_viewed'
  data: any
  timestamp: Date
  userId: string
  organizationId: string
}

// Subscription channels
const subscriptions = {
  'submissions:job:{jobId}': ['agency_recruiter', 'employer_recruiter'],
  'candidates:new': ['platform_admin'],
  'interviews:today': ['hiring_manager', 'interviewer']
}
```

### Webhook Patterns (Greenhouse Standard)
```json
{
  "action": "candidate_stage_change",
  "payload": {
    "candidate_id": "12345",
    "job_id": "67890", 
    "from_stage": "application_review",
    "to_stage": "phone_screen",
    "changed_by": "recruiter@company.com"
  },
  "occurred_at": "2024-08-10T10:30:00Z"
}
```

## Integration Patterns

### ATS Integration (Standard Approach)
**Data Sync Patterns:**
- Candidate data push/pull
- Job posting synchronization
- Application status updates
- Interview scheduling coordination

**Common Integration Points:**
```typescript
interface ATSIntegration {
  // Candidate sync
  syncCandidate(candidate: Candidate): Promise<void>
  getCandidateUpdates(since: Date): Promise<Candidate[]>
  
  // Job sync
  syncJob(job: Job): Promise<void>
  getJobApplications(jobId: string): Promise<Application[]>
  
  // Status updates
  updateApplicationStatus(appId: string, status: string): Promise<void>
}
```

### Calendar Integration (Universal Need)
**OAuth 2.0 Flow for Google/Outlook:**
```typescript
interface CalendarIntegration {
  // Authentication
  getAuthUrl(): string
  exchangeCodeForToken(code: string): Promise<TokenSet>
  
  // Calendar operations  
  createEvent(interview: Interview): Promise<CalendarEvent>
  updateEvent(eventId: string, updates: Partial<Interview>): Promise<void>
  getAvailability(userId: string, timeRange: TimeRange): Promise<AvailableSlot[]>
}
```

## Our API Architecture Recommendations

### Hybrid Approach (REST + GraphQL + WebSockets)
```typescript
// REST for simple CRUD
POST /api/v1/candidates
GET /api/v1/candidates/{id}
PUT /api/v1/candidates/{id}

// GraphQL for complex queries
query GetSubmissionPipeline($jobId: ID!) {
  job(id: $jobId) {
    submissions {
      candidate { name skills }
      currentStage
      agency { name performance }
      interviews { scheduledAt feedback }
    }
  }
}

// WebSockets for real-time collaboration
const wsMessage = {
  type: 'submission_feedback',
  channel: `collaboration:${agencyId}:${employerId}`,
  data: { submissionId, feedback, rating }
}
```

### Multi-Tenant API Design
```typescript
// Organization context in all endpoints
GET /api/v1/orgs/{orgId}/candidates
POST /api/v1/orgs/{orgId}/jobs

// Collaboration endpoints across organizations
GET /api/v1/collaborations/{agencyId}/{employerId}/submissions
POST /api/v1/collaborations/{agencyId}/{employerId}/messages

// Cross-organization permissions
interface CollaborationPermissions {
  agencyId: string
  employerId: string
  permissions: ('read_candidates' | 'submit_candidates' | 'schedule_interviews')[]
  contractId: string
}
```

## Performance & Scalability Patterns

### Caching Strategies
**Redis Patterns from Enterprise Platforms:**
```typescript
// Candidate search results caching
const cacheKey = `search:${organizationId}:${hashFilters(filters)}`
await redis.setex(cacheKey, 300, JSON.stringify(results)) // 5 min cache

// Real-time activity caching
const activityKey = `activity:${userId}`
await redis.zadd(activityKey, Date.now(), activityData) // Sorted set for timeline

// Collaboration state caching
const collabKey = `collab:${agencyId}:${employerId}`
await redis.hmset(collabKey, { activeSubmissions, unreadMessages, lastActivity })
```

### Database Query Optimization
**Indexing Strategies:**
```sql
-- Full-text search (Postgres)
CREATE INDEX idx_candidates_search ON candidates USING gin(
  to_tsvector('english', first_name || ' ' || last_name || ' ' || array_to_string(skills, ' '))
);

-- Multi-column indexes for filtering
CREATE INDEX idx_candidates_filter ON candidates(organization_id, availability_status, years_experience);

-- Partial indexes for active records
CREATE INDEX idx_active_submissions ON submissions(job_id, status) WHERE status IN ('active', 'interviewing');
```

## Authentication & Authorization

### Multi-Organization Auth (Our Requirement)
```typescript
interface JWTPayload {
  userId: string
  organizationId: string
  role: string
  permissions: string[]
  
  // Collaboration context
  activeCollaborations: {
    partnerId: string
    permissions: string[]
    contractId: string
  }[]
}

// Route-level authorization
const requirePermission = (permission: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user.permissions.includes(permission)) {
      return res.status(403).json({ error: 'Insufficient permissions' })
    }
    next()
  }
}
```

### API Rate Limiting
```typescript
// Different limits for different user types
const rateLimits = {
  'platform_admin': { requests: 1000, window: '15m' },
  'employer_recruiter': { requests: 500, window: '15m' },
  'agency_recruiter': { requests: 300, window: '15m' }
}

// Collaboration-specific limits
const collaborationLimits = {
  'submissions': { requests: 50, window: '1h' }, // Prevent spam submissions
  'messages': { requests: 200, window: '15m' }   // Allow active communication
}
```

## Error Handling & Monitoring

### Standardized Error Responses
```typescript
interface APIError {
  error: {
    code: string
    message: string
    details?: any
    timestamp: Date
    requestId: string
  }
}

// Example errors
const errors = {
  CANDIDATE_NOT_FOUND: { code: 'E001', message: 'Candidate not found' },
  COLLABORATION_FORBIDDEN: { code: 'E002', message: 'Agency not authorized for this employer' },
  SUBMISSION_DUPLICATE: { code: 'E003', message: 'Candidate already submitted to this job' }
}
```

### API Monitoring (Enterprise Standard)
```typescript
interface APIMetrics {
  endpoint: string
  method: string
  responseTime: number
  statusCode: number
  organizationId: string
  userId: string
  timestamp: Date
  
  // Business metrics
  businessContext?: {
    submissionCreated?: boolean
    interviewScheduled?: boolean
    candidateCreated?: boolean
  }
}
```

## Implementation Priority

### Phase 1: Core REST API (Immediate)
- Candidate CRUD with search
- Job management endpoints  
- Basic submission workflow
- Organization-scoped authentication

### Phase 2: Real-Time Features (Month 2-3)
- WebSocket implementation for live updates
- Collaboration messaging endpoints
- Real-time notification system

### Phase 3: Advanced Integration (Month 4-6) 
- Calendar integration (Google/Outlook)
- ATS sync capabilities
- Webhook system for external integrations
- GraphQL layer for complex queries