# Unified ATS Database Schema Design

## Overview

This document explains the database schema design for a unified Applicant Tracking System (ATS) that can serve three distinct use cases:

1. **Employer ATS** (like Greenhouse/Ashby) - Internal hiring for companies
2. **Recruiting Agency ATS** (like Bullhorn/RecruiterFlow) - External recruiting with client management
3. **Hiring Platform** (like Paraform/Wellfound) - Marketplace connecting recruiters and employers

## Key Design Decisions

### 1. User Entity Strategy

**Single User Table Approach**: We use one `users` table for ALL user types (candidates, employees, recruiters, hiring managers, admins) with role-based differentiation.

**Why this approach?**
- **Prevents duplicates**: Same person can have multiple roles (e.g., a candidate becomes an employee, then a hiring manager)
- **Unified authentication**: Single login system across all roles
- **Data integrity**: One source of truth for person identity
- **Scalability**: Easier to manage permissions and relationships

```sql
-- Users table handles ALL user types
CREATE TABLE users (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL,  -- Multi-tenancy support
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    -- ... other common fields
);

-- Roles define what users can do
CREATE TABLE user_roles (
    user_id UUID REFERENCES users(id),
    organization_id UUID REFERENCES organizations(id),
    role VARCHAR(50) -- 'candidate', 'recruiter', 'hiring_manager', etc.
);
```

### 2. Organization Entity Strategy

**Hierarchical Organization Model**: Organizations can represent companies, agencies, departments, or teams with parent-child relationships.

```sql
CREATE TABLE organizations (
    id UUID PRIMARY KEY,
    parent_id UUID REFERENCES organizations(id), -- Hierarchy support
    type VARCHAR(50), -- 'company', 'agency', 'department', 'team'
    -- ... other fields
);
```

**Benefits:**
- **Flexibility**: Same table handles client companies, recruiting agencies, and internal departments
- **Hierarchy**: Supports complex organizational structures
- **Multi-tenancy**: Different tenants can have their own organization structures

### 3. Duplicate Handling Strategy

#### For Recruiting Agencies

**Problem**: Same candidate might be represented by multiple recruiters or appear in multiple systems.

**Solution**: Candidate deduplication with relationship tracking

```sql
-- Each candidate record is unique per tenant
CREATE TABLE candidates (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id), -- Links to the person
    tenant_id UUID NOT NULL,           -- Which system owns this record
    -- ... candidate-specific fields
);

-- Track relationships between duplicate candidates
CREATE TABLE candidate_relationships (
    id UUID PRIMARY KEY,
    primary_candidate_id UUID REFERENCES candidates(id),
    related_candidate_id UUID REFERENCES candidates(id),
    relationship_type VARCHAR(50), -- 'duplicate', 'similar', 'same_person'
    confidence_score DECIMAL(5,2), -- AI/matching confidence
    verified_by UUID REFERENCES users(id),
    created_at TIMESTAMP
);
```

**Duplicate Detection Features:**
- **Email matching**: Same email = likely same person
- **Name + phone matching**: Similar contact info
- **Resume similarity**: AI-powered content matching
- **Social profile matching**: LinkedIn URLs, etc.

#### For Employers

**Problem**: Internal employees applying for other roles, or external candidates reapplying.

**Solution**: Same user can have multiple candidate records for different jobs/time periods

```sql
-- One person (user) can have multiple candidate profiles
-- This handles re-applications and internal mobility
SELECT u.email, c.created_at, j.title 
FROM users u
JOIN candidates c ON u.id = c.user_id
JOIN applications a ON c.id = a.candidate_id
JOIN jobs j ON a.job_id = j.id
WHERE u.email = 'john.doe@email.com'
ORDER BY c.created_at;
```

### 4. Multi-Tenancy Architecture

**Tenant Isolation**: Each tenant (company, agency, platform) has isolated data while sharing the same database schema.

```sql
CREATE TABLE tenants (
    id UUID PRIMARY KEY,
    type VARCHAR(50), -- 'employer', 'agency', 'platform'
    settings JSONB     -- Tenant-specific configurations
);
```

**Data Access Control:**
- All queries filtered by `tenant_id`
- Row-level security enforced at database level
- API layer enforces tenant boundaries

## Schema Components

### Core System Tables
- `tenants` - Multi-tenant configuration
- `organizations` - Companies, agencies, departments
- `users` - All person records
- `user_roles` - Role assignments

### Candidate Management
- `candidates` - Candidate profiles (linked to users)
- `candidate_work_history` - Employment history
- `candidate_education` - Educational background

### Job Management
- `jobs` - Job postings/requisitions
- `job_postings` - Distribution to job boards
- `workflow_templates` - Hiring process definitions
- `workflow_stages` - Steps in hiring process

### Application Tracking
- `applications` - Candidate applications to jobs
- `application_stage_history` - Movement through hiring process

### Interview Management
- `interview_templates` - Interview formats
- `interviews` - Scheduled interviews
- `interview_participants` - Who participates in interviews

### Communication
- `activities` - Notes, emails, calls, tasks
- `email_templates` - Standardized communications

### Agency-Specific
- `client_relationships` - Agency-to-client connections
- `placements` - Successful job placements
- `commissions` - Commission tracking

### Platform-Specific
- `recruiter_networks` - Recruiter marketplace
- `job_assignments` - Job-to-recruiter assignments

## Use Case Examples

### Employer ATS (TechCorp)
```sql
-- How TechCorp sees their data
SELECT j.title, COUNT(a.id) as applications
FROM jobs j
LEFT JOIN applications a ON j.id = a.job_id
WHERE j.tenant_id = (SELECT id FROM tenants WHERE slug = 'techcorp')
  AND j.status = 'open'
GROUP BY j.title;
```

### Recruiting Agency (Elite Recruiting)
```sql
-- Agency tracking placements and commissions
SELECT 
    p.start_date,
    u_candidate.first_name || ' ' || u_candidate.last_name as candidate_name,
    j.title,
    o_client.name as client_name,
    p.commission_amount
FROM placements p
JOIN applications a ON p.application_id = a.id
JOIN candidates c ON a.candidate_id = c.id
JOIN users u_candidate ON c.user_id = u_candidate.id
JOIN jobs j ON a.job_id = j.id
JOIN organizations o_client ON j.organization_id = o_client.id
WHERE p.recruiter_id = (SELECT id FROM users WHERE email = 'lisa.recruiter@eliterecruiting.com');
```

### Hiring Platform (Marketplace)
```sql
-- Platform showing recruiter performance
SELECT 
    u.first_name || ' ' || u.last_name as recruiter_name,
    rn.success_rate,
    rn.average_time_to_fill,
    COUNT(ja.id) as active_assignments
FROM users u
JOIN recruiter_networks rn ON u.id = rn.recruiter_id
LEFT JOIN job_assignments ja ON u.id = ja.recruiter_id AND ja.status = 'active'
WHERE rn.platform_id = (SELECT id FROM tenants WHERE slug = 'talent-marketplace')
GROUP BY u.id, u.first_name, u.last_name, rn.success_rate, rn.average_time_to_fill;
```

## Advanced Features

### Duplicate Prevention
- **Email uniqueness**: Enforced at user level
- **Fuzzy matching**: AI-powered duplicate detection
- **Merge functionality**: Combine duplicate records
- **Relationship tracking**: Link related candidate records

### Workflow Flexibility
- **Template-based**: Reusable hiring processes
- **Stage customization**: Different stages for different job types
- **Auto-advancement**: Rules-based progression
- **SLA tracking**: Time limits for each stage

### Performance Optimizations
- **Indexes**: Optimized for common query patterns
- **Materialized views**: Pre-computed metrics
- **Partitioning**: Large tables partitioned by tenant/date
- **Full-text search**: Searchable candidate/job content

## Security Considerations

### Data Isolation
- **Tenant boundaries**: Strict data separation
- **Role-based access**: Fine-grained permissions
- **API security**: Authentication and authorization

### Privacy Compliance
- **Data retention**: Configurable retention policies
- **GDPR compliance**: Right to be forgotten
- **Audit trails**: All changes logged

## Scalability Features

### Database Design
- **UUID keys**: Globally unique identifiers
- **JSONB fields**: Flexible schema extension
- **Efficient indexes**: Query optimization

### Architecture
- **Microservices ready**: Clear bounded contexts
- **API-first**: RESTful endpoints
- **Event-driven**: Webhook support for integrations

This unified schema provides a solid foundation for building an ATS that can serve all three market segments while maintaining data integrity, preventing duplicates, and supporting complex business workflows.