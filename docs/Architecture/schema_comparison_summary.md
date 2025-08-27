# ATS Database Schema Design Summary

## Project Overview

I've designed three database schemas for building ATS products that serve different market segments:

1. **Unified Schema** (`unified_ats_schema.sql`) - Multi-tenant system serving all three use cases
2. **Agency-Only Schema** (`agency_only_schema.sql`) - Specialized for recruiting agencies
3. **Employer-Only Schema** (`employer_only_schema.sql`) - Specialized for internal hiring teams

## Key Design Questions Addressed

### User Entity Strategy

**Question**: Do we use the same table for candidate, user, and employer, user, and recruiter, user, or different tables?

**Answer**: **Single user table approach** across all schemas with role-based differentiation.

#### Why Single User Table?

1. **Prevents Identity Duplicates**: Same person can transition between roles (candidate → employee → hiring manager)
2. **Unified Authentication**: One login system regardless of role
3. **Data Integrity**: Single source of truth for person identity
4. **Relationship Tracking**: Clear relationships between people in different roles

#### Implementation Across Schemas:

**Unified Schema**:
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY,
    tenant_id UUID, -- Multi-tenant isolation
    email VARCHAR(255) UNIQUE,
    -- ... common person fields
);

CREATE TABLE user_roles (
    user_id UUID REFERENCES users(id),
    organization_id UUID,
    role VARCHAR(50) -- 'candidate', 'recruiter', 'hiring_manager', etc.
);
```

**Agency Schema**:
```sql
CREATE TABLE people ( -- Same concept, different naming
    id UUID PRIMARY KEY,
    email VARCHAR(255) UNIQUE,
    -- ... common person fields
);

CREATE TABLE person_roles (
    person_id UUID REFERENCES people(id),
    role_type VARCHAR(50) -- 'recruiter', 'candidate', 'client_contact'
);
```

**Employer Schema**:
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY,
    account_type VARCHAR(50), -- 'employee', 'candidate', 'contractor'
    employee_id VARCHAR(100), -- For employees
    -- ... fields for both employees and candidates
);
```

### Organization Entity Strategy

**Single hierarchical table** that can represent:
- Companies (client companies, employers)
- Agencies (recruiting firms)  
- Departments (internal divisions)
- Teams (hiring teams)

```sql
CREATE TABLE organizations (
    id UUID PRIMARY KEY,
    parent_id UUID REFERENCES organizations(id), -- Hierarchy
    type VARCHAR(50), -- 'company', 'agency', 'department', 'team'
    -- ... other fields
);
```

### Duplicate Handling Strategy

#### For Recruiting Agencies

**Problem**: Same candidate represented by multiple recruiters or in different systems.

**Solution**: Advanced duplicate detection with relationship tracking:

```sql
-- Track duplicate relationships
CREATE TABLE candidate_duplicates (
    primary_candidate_id UUID REFERENCES candidates(id),
    duplicate_candidate_id UUID REFERENCES candidates(id),
    match_type VARCHAR(50), -- 'email', 'phone', 'name', 'resume'
    confidence_score DECIMAL(5,2), -- AI confidence 0-100
    status VARCHAR(50) -- 'detected', 'confirmed', 'merged'
);
```

**Detection Methods**:
- **Email matching**: Same email = likely same person
- **Name + phone**: Similar contact information
- **Resume similarity**: AI-powered content analysis
- **LinkedIn matching**: Social profile URLs

#### For Employers (Internal Candidates)

**Problem**: Employees applying for internal roles or external candidates reapplying.

**Solution**: Link candidates to user accounts:

```sql
CREATE TABLE candidates (
    user_id UUID REFERENCES users(id), -- Links to person
    is_internal_candidate BOOLEAN,
    current_employee_id UUID REFERENCES users(id),
    primary_record_id UUID REFERENCES candidates(id) -- Handle duplicates
);

-- Special handling for internal mobility
CREATE TABLE internal_mobility (
    employee_id UUID REFERENCES users(id),
    application_id UUID REFERENCES applications(id),
    current_department_id UUID,
    mobility_type VARCHAR(50) -- 'transfer', 'promotion', 'lateral_move'
);
```

## Schema Comparison

### Core Differences

| Feature | Unified | Agency-Only | Employer-Only |
|---------|---------|-------------|---------------|
| **Multi-tenancy** | Full tenant isolation | Single agency focus | Single company focus |
| **Client Management** | Basic organization model | Advanced client relationships | Internal departments only |
| **Commission Tracking** | Basic placement fees | Full commission system | Not applicable |
| **Interview Management** | Standard interviews | Client-focused | Structured interview kits |
| **Approval Workflows** | Configurable | Basic | Advanced approval chains |
| **Duplicate Handling** | Cross-tenant detection | Advanced agency-specific | Internal employee focus |

### Specialized Features

#### Agency-Only Schema Highlights

1. **Advanced Client Management**:
   - Client companies with detailed relationship tracking
   - Contract terms and billing preferences
   - Client contacts with decision-making authority

2. **Commission System**:
   - Individual commission tracking
   - Split commissions between recruiters
   - Invoice generation and payment tracking

3. **Job Order Management**:
   - Detailed employment terms (contract-to-hire, etc.)
   - Fee structures (percentage vs. flat fee)
   - Guarantee periods for placements

4. **Enhanced Duplicate Detection**:
   - AI-powered candidate matching
   - Confidence scoring
   - Merge capabilities for duplicate records

#### Employer-Only Schema Highlights

1. **Department Hierarchy**:
   - Complex organizational structures
   - Budget and headcount tracking
   - Cost center integration

2. **Approval Workflows**:
   - Multi-level offer approvals
   - Requisition approval chains
   - Manager sign-offs for internal mobility

3. **Interview Kits**:
   - Reusable interview templates
   - Structured scorecards
   - Question banks by role/level

4. **Internal Mobility**:
   - Employee transfer tracking
   - Current role information
   - Backfill requirements

## Data Flow Examples

### Agency Workflow
```
Client Request → Job Order → Candidate Sourcing → Submission → 
Client Interview → Placement → Commission → Invoice
```

### Employer Workflow  
```
Hiring Need → Requisition → Approval → Job Posting → 
Application → Interview Process → Offer → Hire → Onboarding
```

### Platform Marketplace
```
Job Posted → Recruiter Assignment → Candidate Sourcing → 
Client Review → Interview → Placement → Commission Distribution
```

## Performance Considerations

### Indexing Strategy
- **Email uniqueness**: Enforced at user/person level
- **Tenant isolation**: All queries filtered by tenant_id
- **Full-text search**: Searchable candidate and job content
- **Time-series data**: Optimized for reporting queries

### Scalability Features
- **UUID primary keys**: Globally unique, merger-friendly
- **JSONB fields**: Flexible schema extension without migrations
- **Materialized views**: Pre-computed metrics for dashboards
- **Partitioning ready**: Large tables can be partitioned by tenant/date

## Security and Compliance

### Data Protection
- **Row-level security**: Tenant data isolation
- **Role-based access**: Fine-grained permissions
- **Audit trails**: All changes logged
- **GDPR compliance**: Right to be forgotten support

### API Design
- **RESTful endpoints**: Clean resource-based URLs
- **Authentication**: JWT-based with role verification
- **Rate limiting**: Prevent abuse and ensure fair usage

## Conclusion

The schemas provide three different approaches:

1. **Unified Schema**: Best for SaaS platforms serving multiple market segments
2. **Agency Schema**: Optimized for recruiting agencies with complex client relationships
3. **Employer Schema**: Perfect for internal hiring teams with structured processes

All three handle the core challenge of user/candidate identity management through a single-table approach while providing specialized features for their target use cases. The duplicate detection strategies are tailored to each scenario, ensuring data quality while supporting the unique workflows of each market segment.

## Files Generated

1. `unified_ats_schema.sql` - Complete unified multi-tenant schema
2. `ats_configuration_data.sql` - Default configurations and sample data
3. `ats_sample_data.sql` - Example data demonstrating the schemas
4. `agency_only_schema.sql` - Recruiting agency specialized schema
5. `employer_only_schema.sql` - Internal hiring team specialized schema
6. `ats_design_documentation.md` - Detailed design documentation
7. `schema_comparison_summary.md` - This comparison document

Each schema is production-ready with proper indexes, constraints, and views for common queries.