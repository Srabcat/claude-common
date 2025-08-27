# Unified ATS Database Schema - Table Relationships

## Core Entity Relationship Diagram

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│    TENANTS      │       │ ORGANIZATIONS   │       │     USERS       │
│ ┌─────────────┐ │       │ ┌─────────────┐ │       │ ┌─────────────┐ │
│ │ id (PK)     │ │◄──────┤ │ id (PK)     │ │       │ │ id (PK)     │ │
│ │ name        │ │       │ │ tenant_id   │ │       │ │ tenant_id   │ │──┐
│ │ type        │ │       │ │ parent_id   │ │─┐     │ │ email       │ │  │
│ │ slug        │ │       │ │ name        │ │ │     │ │ first_name  │ │  │
│ └─────────────┘ │       │ │ type        │ │ │     │ │ last_name   │ │  │
└─────────────────┘       │ └─────────────┘ │ │     │ └─────────────┘ │  │
                          └─────────────────┘ │     └─────────────────┘  │
                                    │         │                          │
                                    └─────────┘                          │
                                                                         │
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐  │
│   USER_ROLES    │       │   CANDIDATES    │       │      JOBS       │  │
│ ┌─────────────┐ │       │ ┌─────────────┐ │       │ ┌─────────────┐ │  │
│ │ id (PK)     │ │       │ │ id (PK)     │ │       │ │ id (PK)     │ │  │
│ │ user_id     │ │◄──────┼─│ user_id     │ │       │ │ tenant_id   │ │◄─┘
│ │ org_id      │ │    ┌──┼─│ tenant_id   │ │       │ │ org_id      │ │
│ │ role        │ │    │  │ │ source      │ │       │ │ title       │ │
│ └─────────────┘ │    │  │ │ headline    │ │       │ │ description │ │
└─────────────────┘    │  │ └─────────────┘ │       │ │ status      │ │
                       │  └─────────────────┘       │ └─────────────┘ │
                       │                            └─────────────────┘
                       │                                      │
┌─────────────────┐    │  ┌─────────────────┐               │
│  APPLICATIONS   │    │  │WORKFLOW_TEMPLATES│               │
│ ┌─────────────┐ │    │  │ ┌─────────────┐ │               │
│ │ id (PK)     │ │    └──┼─│ id (PK)     │ │               │
│ │ candidate_id│ │       │ │ tenant_id   │ │               │
│ │ job_id      │ │◄──────┼─│ name        │ │               │
│ │ status      │ │       │ │ type        │ │               │
│ │ rating      │ │       │ └─────────────┘ │               │
│ └─────────────┘ │       └─────────────────┘               │
└─────────────────┘                                         │
         │                                                  │
         │         ┌─────────────────┐                      │
         │         │WORKFLOW_STAGES  │                      │
         │         │ ┌─────────────┐ │                      │
         │         │ │ id (PK)     │ │                      │
         └─────────┼─│ template_id │ │                      │
                   │ │ name        │ │                      │
                   │ │ stage_order │ │                      │
                   │ │ stage_type  │ │                      │
                   │ └─────────────┘ │                      │
                   └─────────────────┘                      │
                                                            │
┌─────────────────┐         ┌─────────────────┐            │
│   INTERVIEWS    │         │INTERVIEW_TEMPLATES│           │
│ ┌─────────────┐ │         │ ┌─────────────┐ │            │
│ │ id (PK)     │ │         │ │ id (PK)     │ │            │
│ │ app_id      │ │◄────────┼─│ tenant_id   │ │            │
│ │ template_id │ │         │ │ name        │ │            │
│ │ title       │ │         │ │ duration    │ │            │
│ │ scheduled_at│ │         │ │ questions   │ │            │
│ │ status      │ │         │ └─────────────┘ │            │
│ └─────────────┘ │         └─────────────────┘            │
└─────────────────┘                                        │
         │                                                 │
         │         ┌─────────────────┐                     │
         │         │INTERVIEW_PARTS  │                     │
         │         │ ┌─────────────┐ │                     │
         │         │ │ id (PK)     │ │                     │
         └─────────┼─│ interview_id│ │                     │
                   │ │ user_id     │ │                     │
                   │ │ role        │ │                     │
                   │ │ feedback    │ │                     │
                   │ └─────────────┘ │                     │
                   └─────────────────┘                     │
                                                           │
                   ┌─────────────────┐                     │
                   │   ACTIVITIES    │                     │
                   │ ┌─────────────┐ │                     │
                   │ │ id (PK)     │ │                     │
                   │ │ tenant_id   │ │◄────────────────────┘
                   │ │ user_id     │ │
                   │ │ related_type│ │
                   │ │ related_id  │ │
                   │ │ activity_type│ │
                   │ └─────────────┘ │
                   └─────────────────┘
```

## Agency-Specific Extensions

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│CLIENT_RELATIONS │       │   PLACEMENTS    │       │   COMMISSIONS   │
│ ┌─────────────┐ │       │ ┌─────────────┐ │       │ ┌─────────────┐ │
│ │ id (PK)     │ │       │ │ id (PK)     │ │       │ │ id (PK)     │ │
│ │ agency_id   │ │◄──────┤ │ app_id      │ │       │ │ placement_id│ │◄─┐
│ │ client_id   │ │       │ │ recruiter_id│ │       │ │ recruiter_id│ │  │
│ │ status      │ │       │ │ client_rel_id│ │       │ │ amount      │ │  │
│ │ commission  │ │       │ │ start_date  │ │       │ │ status      │ │  │
│ └─────────────┘ │       │ │ salary      │ │       │ └─────────────┘ │  │
└─────────────────┘       │ └─────────────┘ │       └─────────────────┘  │
                          └─────────────────┘                          │
                                    │                                  │
                                    └──────────────────────────────────┘

┌─────────────────┐       ┌─────────────────┐
│RECRUITER_NETWORK│       │ JOB_ASSIGNMENTS │
│ ┌─────────────┐ │       │ ┌─────────────┐ │
│ │ id (PK)     │ │       │ │ id (PK)     │ │
│ │ platform_id │ │       │ │ job_id      │ │
│ │ recruiter_id│ │       │ │ recruiter_id│ │
│ │ specializ.  │ │       │ │ comm_rate   │ │
│ │ success_rate│ │       │ │ status      │ │
│ └─────────────┘ │       │ └─────────────┘ │
└─────────────────┘       └─────────────────┘
```

## Table Relationships Summary

### Primary Relationships

| Parent Table | Child Table | Relationship Type | Foreign Key |
|-------------|-------------|------------------|-------------|
| `tenants` | `organizations` | 1:M | `tenant_id` |
| `tenants` | `users` | 1:M | `tenant_id` |
| `tenants` | `candidates` | 1:M | `tenant_id` |
| `tenants` | `jobs` | 1:M | `tenant_id` |
| `organizations` | `organizations` | 1:M (hierarchy) | `parent_id` |
| `organizations` | `jobs` | 1:M | `organization_id` |
| `users` | `candidates` | 1:1 | `user_id` |
| `users` | `user_roles` | 1:M | `user_id` |
| `candidates` | `applications` | 1:M | `candidate_id` |
| `jobs` | `applications` | 1:M | `job_id` |
| `applications` | `interviews` | 1:M | `application_id` |

### Agency-Specific Relationships

| Parent Table | Child Table | Relationship Type | Foreign Key |
|-------------|-------------|------------------|-------------|
| `organizations` | `client_relationships` | 1:M | `agency_id` |
| `organizations` | `client_relationships` | 1:M | `client_id` |
| `applications` | `placements` | 1:1 | `application_id` |
| `placements` | `commissions` | 1:M | `placement_id` |
| `tenants` | `recruiter_networks` | 1:M | `platform_id` |
| `jobs` | `job_assignments` | 1:M | `job_id` |

## Data Flow Patterns

### Candidate Journey
```
User Registration → Candidate Profile → Application → Interview → Offer → Hire
     ↓                    ↓               ↓            ↓         ↓       ↓
   users            candidates      applications  interviews   offers  placements
```

### Agency Workflow
```
Client Onboarding → Job Order → Candidate Sourcing → Submission → Placement → Commission
       ↓               ↓              ↓                ↓           ↓          ↓
client_relationships  jobs        candidates      applications  placements  commissions
```

### Multi-Tenant Data Isolation

```
TENANT A                    TENANT B                    TENANT C
┌─────────────┐            ┌─────────────┐            ┌─────────────┐
│ Employer    │            │ Agency      │            │ Platform    │
│ TechCorp    │            │ Elite       │            │ Marketplace │
├─────────────┤            ├─────────────┤            ├─────────────┤
│ • Users     │            │ • Users     │            │ • Users     │
│ • Jobs      │            │ • Clients   │            │ • Jobs      │
│ • Candidates│            │ • Jobs      │            │ • Recruiters│
│ • Apps      │            │ • Candidates│            │ • Network   │
└─────────────┘            │ • Placements│            └─────────────┘
                           └─────────────┘
```

## Index Strategy

### Core Performance Indexes
```sql
-- Tenant isolation (most critical)
CREATE INDEX idx_users_tenant_email ON users(tenant_id, email);
CREATE INDEX idx_candidates_tenant_active ON candidates(tenant_id, is_active);
CREATE INDEX idx_jobs_tenant_status ON jobs(tenant_id, status);

-- Application pipeline
CREATE INDEX idx_applications_job_status ON applications(job_id, status);
CREATE INDEX idx_applications_candidate_job ON applications(candidate_id, job_id);

-- Activity tracking
CREATE INDEX idx_activities_related_to ON activities(related_to_type, related_to_id);

-- Search capabilities
CREATE INDEX idx_candidates_search ON candidates USING GIN(to_tsvector('english', ...));
CREATE INDEX idx_jobs_search ON jobs USING GIN(to_tsvector('english', ...));
```

## Constraint Patterns

### Unique Constraints
```sql
-- Prevent duplicate applications
UNIQUE(candidate_id, job_id) ON applications

-- Ensure email uniqueness per tenant
UNIQUE(tenant_id, email) ON users

-- Prevent duplicate job assignments
UNIQUE(job_id, recruiter_id) ON job_assignments
```

### Check Constraints
```sql
-- Enum-like constraints for data integrity
CHECK (tenant_type IN ('employer', 'agency', 'platform'))
CHECK (application_status IN ('new', 'in_review', 'hired', 'rejected'))
CHECK (user_role IN ('admin', 'recruiter', 'hiring_manager', 'candidate'))
```

## Scalability Considerations

### Partitioning Strategy
```sql
-- Partition large tables by tenant_id for better performance
CREATE TABLE activities_partitioned (
    LIKE activities INCLUDING ALL
) PARTITION BY HASH (tenant_id);

-- Time-based partitioning for historical data
CREATE TABLE applications_partitioned (
    LIKE applications INCLUDING ALL
) PARTITION BY RANGE (created_at);
```

### Materialized Views
```sql
-- Pre-computed metrics for dashboards
CREATE MATERIALIZED VIEW recruiter_performance AS
SELECT 
    recruiter_id,
    COUNT(*) as total_placements,
    AVG(time_to_fill) as avg_time_to_fill,
    SUM(commission_amount) as total_commission
FROM placements
GROUP BY recruiter_id;
```

This diagram shows how the unified schema can handle all three use cases (employer, agency, platform) while maintaining clear data boundaries and relationships between entities.