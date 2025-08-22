# Complete Database Field Specifications

**Status**: ✅ **COMPLETE** - All 14 tables with complete field definitions and constraints  
**Last Updated**: 2025-08-20  
**Cross-Reference**: See `/docs/Architecture/DB-Schema-ADR.md` for architectural decisions and constrained values patterns


## Schema Overview

**Complete ATS Core Schema (14 Tables)**:
- **Person/Identity Layer** (4 tables): canonical_persons, user_profiles, contact_identifiers, contact_history
- **Type-Specific Profiles** (4 tables): candidate_profiles, employer_user_profiles, agency_user_profiles, platform_user_profiles  
- **Tenant/Role Layer** (3 tables): tenants, tenant_roles, user_role_assignments
- **Jobs Layer** (1 table): jobs
- **Submissions Layer** (1 table): submissions
- **Constrained Values** (1 table): user_roles

## Research Sources

**Competitor Analysis**:
- **Greenhouse**: Enterprise ATS standard, custom fields, structured workflows
- **Ashby**: Advanced analytics focus, comprehensive profiles, AI integration  
- **Bullhorn**: Most widely used ATS (189 candidate fields), configurable status values
- **RecruiterFlow**: Agency-focused, performance tracking, client collaboration

**Field Pattern Research**:
- Core identity: first_name, last_name, email, phone across all platforms
- Professional: job_title, department, experience_level standardized
- Status tracking: account/submission status with platform-specific values
- Role-specific: commission_rate (agency), department (employer), admin_rights (platform)

---

## 1. CANONICAL_PERSONS (Identity Management)

**Purpose**: Central identity table for person deduplication across profiles

```sql
-- QQQ: canonical INDEX - mostly empty?
-- QQQ: -> merged_into

CREATE TABLE canonical_persons (
  id UUID PRIMARY KEY,
  canonical_person_id UUID, -- For merging duplicates: points to canonical record
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Indexes for deduplication performance
  INDEX idx_canonical_persons_canonical (canonical_person_id)
);
```

**Field Explanations**:
- **canonical_person_id**: Points to the "master" record when duplicates are merged
- **Purpose**: Supports business-critical candidate deduplication for revenue protection

---

## 2. USER_PROFILES (Parent Table)

**Purpose**: Central user identity table supporting all user types with shared attributes

```sql
CREATE TABLE user_profiles (

  -- QQQ: tenant id - non null
  -- QQQ: canonical id - can be null if we only have name
  -- QQQ: add perfered name. middle name
  --- QQQ: last login can be null
  --- QQQ: index tenant id, profile type
  --- QQQ: CHECK (experience_level IN - can change?
  -- roles
  -- locations
  -- skills


  id UUID PRIMARY KEY,
  person_id UUID REFERENCES canonical_persons(id),
  tenant_id UUID REFERENCES tenants(id),
  
  -- Core Identity (Standardized across Greenhouse/Ashby/Bullhorn)
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  job_title VARCHAR(200),
  
  -- Profile Type Classification
  profile_type VARCHAR(20) CHECK (profile_type IN (
    'candidate',  -- Job seekers, represented by agencies
    'employer',   -- Company hiring team members  
    'agency',     -- Recruiting firm employees
    'platform'    -- Platform administration users
  )) NOT NULL,
  
  -- Account Status (From Bullhorn/Greenhouse patterns)
  account_status VARCHAR(50) CHECK (account_status IN (
    'active',               -- Normal operational state, can login and use system
    'inactive',             -- Temporarily disabled, can be reactivated by admin
    'suspended',            -- Disciplinary action, requires admin intervention to restore
    'pending_approval'      -- Awaiting email verification or admin approval
  )) NOT NULL DEFAULT 'pending_approval',
  
  -- Authentication Integration
  auth_user_id UUID, -- Supabase auth ID (NULL for candidates without login)
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_login_at TIMESTAMP,
  
  -- Indexes for performance
  INDEX idx_user_profiles_tenant_type (tenant_id, profile_type),
  INDEX idx_user_profiles_person (person_id),
  INDEX idx_user_profiles_auth (auth_user_id)
);
```

---

## 3. CANDIDATE_PROFILES (Type-Specific)

**Purpose**: Job seeker specific attributes and career information

```sql
CREATE TABLE candidate_profiles (

  -- QQQ: exp level can change over time & years of exp
  -- QQQ: Y of experience - fractional
  -- QQQ: currency code
  -- QQQ: equity, bonus
  -- QQQ: notes for each type, work experience, education, files (resume, cover, profolio, offer/submission)


  user_profile_id UUID PRIMARY KEY REFERENCES user_profiles(id) ON DELETE CASCADE,
  
  -- Professional Experience (LinkedIn standard extended for tech industry)
  current_company VARCHAR(200),
  experience_level VARCHAR(20) CHECK (experience_level IN (
    'intern',     -- Internship level
    'junior',     -- 0-2 years, recent graduates, career changers  
    'mid',        -- 3-6 years, established in role but not senior
    'senior',     -- 7-12 years, technical/functional expertise
    'staff',      -- 8-15 years, senior individual contributor
    'manager',    -- 5-20 years, people management track
    'director',   -- 10-25 years, multi-team leadership
    'exec'        -- 15+ years, C-level, VP-level, organizational leadership
  )) DEFAULT NULL,
  years_experience DECIMAL(4,1), -- Supports fractional years (1.5 for bootcamp graduates)
  experience_last_updated DATE DEFAULT CURRENT_DATE,
  experience_notes TEXT, -- "2 years Python, 1.5 years React, managing team of 5"
  
  -- Career Preferences
  desired_job_types JSONB, -- ['full-time', 'contract'] array
  salary_expectation_min DECIMAL(12,2),
  salary_expectation_max DECIMAL(12,2),
  currency_code VARCHAR(3) DEFAULT 'USD',
  
  -- Location & Availability  
  current_location JSONB, -- {city, state, country}
  work_location_preference VARCHAR(20) CHECK (work_location_preference IN (
    'remote',     -- 100% remote work required
    'hybrid',     -- Mix of remote and office work
    'on_site',    -- Office-based work only  
    'flexible'    -- Open to any arrangement
  )),
  available_start_date DATE,
  
  -- Skills & Qualifications (Structured for search)
  skills JSONB, -- ['JavaScript', 'React', 'Node.js'] searchable array
  education JSONB, -- [{degree, school, year, field}] structured
  certifications JSONB, -- [{name, issuer, date, expiry}] structured
  
  -- Work Authorization (Pattern 3: Regional values)
  work_authorization VARCHAR(100), -- Values from country-specific config
  
  -- Candidate Status (From Ashby/Bullhorn patterns)
  availability_status VARCHAR(20) CHECK (availability_status IN (
    'active',     -- Actively job searching, responsive to outreach
    'passive',    -- Open to opportunities but not actively searching
    'unavailable', -- Not interested in new opportunities currently
    'placed'      -- Successfully hired through platform, temporarily off-market
  )) DEFAULT 'active',
  
  -- Documents & Portfolio
  resume_url TEXT,
  portfolio_url TEXT,
  cover_letter_url TEXT,
  
  -- Privacy & Preferences
  profile_visibility VARCHAR(20) CHECK (profile_visibility IN (
    'public',     -- Visible to all platform users
    'private',    -- Only visible to connected agencies/employers
    'hidden'      -- Not discoverable in searches
  )) DEFAULT 'public',
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## 4. EMPLOYER_USER_PROFILES (Type-Specific)

**Purpose**: Company hiring team member attributes and permissions

```sql
CREATE TABLE employer_user_profiles (
  user_profile_id UUID PRIMARY KEY REFERENCES user_profiles(id) ON DELETE CASCADE,
  
  -- Organizational Structure
  department VARCHAR(100), -- Engineering, Sales, Marketing, HR, etc.
  reporting_manager_id UUID REFERENCES user_profiles(id),
  cost_center VARCHAR(50),
  
  -- Hiring Permissions & Roles
  can_post_jobs BOOLEAN DEFAULT FALSE,
  can_review_candidates BOOLEAN DEFAULT TRUE,
  can_schedule_interviews BOOLEAN DEFAULT FALSE,
  can_make_offers BOOLEAN DEFAULT FALSE,
  interviewer_flag BOOLEAN DEFAULT FALSE,
  
  -- Approval Levels (From enterprise ATS patterns)
  approval_level VARCHAR(20) CHECK (approval_level IN (
    'none',       -- Cannot approve anything, execution only
    'basic',      -- Can approve candidate progression to next stage
    'advanced',   -- Can approve offers up to certain salary threshold
    'executive'   -- Can approve any offers, budget changes
  )) DEFAULT 'none',
  
  max_salary_approval DECIMAL(12,2), -- Maximum offer amount can approve
  
  -- Specializations & Expertise
  hiring_specializations JSONB, -- ['Engineering', 'Product'] areas of expertise
  interview_types JSONB, -- ['technical', 'behavioral', 'cultural'] types they conduct
  
  -- Preferences
  notification_preferences JSONB, -- Email, SMS, in-app notification settings
  timezone VARCHAR(50),
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Field Explanations**:
- **approval_level**:
  - `none`: Individual contributor, no approval authority
  - `basic`: Team lead, can advance candidates through hiring stages
  - `advanced`: Manager, can approve offers within budget limits
  - `executive`: Senior leadership, unlimited approval authority

---

## 5. AGENCY_USER_PROFILES (Type-Specific)

**Purpose**: Recruiting firm employee attributes and performance tracking

```sql
CREATE TABLE agency_user_profiles (
  user_profile_id UUID PRIMARY KEY REFERENCES user_profiles(id) ON DELETE CASCADE,
  
  -- Business Structure  
  commission_rate DECIMAL(5,2), -- Percentage commission on successful placements
  base_salary DECIMAL(12,2),
  territory VARCHAR(200), -- Geographic or industry territory assignment
  
  -- Performance Tracking (From RecruiterFlow patterns)
  placement_quota_annual INTEGER, -- Expected placements per year
  current_year_placements INTEGER DEFAULT 0,
  total_career_placements INTEGER DEFAULT 0,
  average_time_to_fill INTEGER, -- Days average to fill positions
  
  -- Specializations
  industry_focus JSONB, -- ['Technology', 'Healthcare'] industry expertise  
  role_focus JSONB, -- ['Engineering', 'Sales'] functional expertise
  seniority_focus VARCHAR(20) CHECK (seniority_focus IN (
    'junior',     -- Entry to mid-level positions
    'senior',     -- Senior individual contributors  
    'leadership', -- Management and executive roles
    'all'         -- No specialization, works all levels
  )) DEFAULT 'all',
  
  -- Client Management
  active_client_count INTEGER DEFAULT 0,
  client_retention_rate DECIMAL(5,2), -- Percentage of clients retained year-over-year
  
  -- Sourcing Capabilities
  sourcing_tools_access JSONB, -- ['LinkedIn Recruiter', 'GitHub'] tool access
  sourcing_specialties JSONB, -- ['Technical sourcing', 'Executive search'] capabilities
  
  -- Status & Availability
  recruiter_status VARCHAR(20) CHECK (recruiter_status IN (
    'active',     -- Currently taking new assignments
    'at_capacity', -- Temporarily not accepting new searches
    'on_leave',   -- Temporary absence, not available
    'inactive'    -- No longer actively recruiting
  )) DEFAULT 'active',
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Field Explanations**:
- **recruiter_status**:
  - `active`: Available for new client assignments and searches
  - `at_capacity`: Temporarily full but still servicing existing clients
  - `on_leave`: Vacation, medical leave, temporarily unavailable
  - `inactive`: No longer with company or not currently recruiting

---

## 6. PLATFORM_USER_PROFILES (Type-Specific)

**Purpose**: Platform administration and operations team attributes

```sql
CREATE TABLE platform_user_profiles (
  user_profile_id UUID PRIMARY KEY REFERENCES user_profiles(id) ON DELETE CASCADE,
  
  -- Administrative Access (Pattern 1: Lookup table for granular permissions)
  admin_level VARCHAR(20) CHECK (admin_level IN (
    'super_admin',    -- Full system access, can modify any data
    'system_admin',   -- System configuration, user management
    'support_admin',  -- Customer support, limited data access  
    'read_only'       -- Reporting and analytics access only
  )) NOT NULL,
  
  -- System Permissions
  can_manage_tenants BOOLEAN DEFAULT FALSE,
  can_view_all_data BOOLEAN DEFAULT FALSE,
  can_modify_settings BOOLEAN DEFAULT FALSE,
  can_access_financials BOOLEAN DEFAULT FALSE,
  
  -- Operational Scope
  assigned_tenants JSONB, -- [] empty = all tenants, specific UUIDs for limited access
  support_queue_access JSONB, -- ['billing', 'technical', 'onboarding'] queue types
  
  -- Technical Access
  database_access_level VARCHAR(20) CHECK (database_access_level IN (
    'none',       -- No direct database access
    'read_only',  -- Can run SELECT queries for support
    'read_write', -- Can modify data for critical support issues
    'admin'       -- Full database administrative access
  )) DEFAULT 'none',
  
  api_access_level VARCHAR(20) CHECK (api_access_level IN (
    'none',       -- No API access
    'internal',   -- Internal API endpoints only
    'full'        -- Full API access including tenant data
  )) DEFAULT 'none',
  
  -- Responsibilities & Specializations
  primary_responsibilities JSONB, -- ['Customer Success', 'Technical Support'] areas
  escalation_priority INTEGER, -- 1=highest, 5=lowest for support escalations
  
  -- Security & Compliance
  security_clearance_level VARCHAR(20) CHECK (security_clearance_level IN (
    'standard',   -- Normal employee access
    'elevated',   -- Access to sensitive customer data
    'critical'    -- Access to financial and compliance data
  )) DEFAULT 'standard',
  
  last_security_training DATE,
  compliance_certifications JSONB, -- ['SOX', 'GDPR', 'HIPAA'] relevant certs
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Field Explanations**:
- **admin_level**:
  - `super_admin`: CEO, CTO level access to everything
  - `system_admin`: DevOps, engineering team system management
  - `support_admin`: Customer success team with limited access
  - `read_only`: Analytics team, reporting access only

---

## 7. CONTACT_IDENTIFIERS (Contact Management)

**Purpose**: Multi-contact support with audit trail for all user types

```sql
CREATE TABLE contact_identifiers (
  id UUID PRIMARY KEY,
  user_profile_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  
  -- Contact Classification
  contact_type VARCHAR(20) CHECK (contact_type IN (
    'email',      -- Email addresses (primary and secondary)
    'phone',      -- Phone numbers (mobile, work, home)
    'linkedin',   -- LinkedIn profile URLs
    'github',     -- GitHub profile URLs  
    'twitter',    -- Twitter/X profile URLs
    'portfolio',  -- Personal portfolio websites
    'website'     -- Company or personal websites
  )) NOT NULL,
  
  -- Contact Details
  contact_value TEXT NOT NULL, -- The actual email, phone, URL
  is_primary BOOLEAN DEFAULT FALSE, -- Primary contact for this type
  is_verified BOOLEAN DEFAULT FALSE, -- Email verified, phone confirmed
  
  -- Status & Privacy
  contact_status VARCHAR(20) CHECK (contact_status IN (
    'active',     -- Valid and usable contact method
    'inactive',   -- Temporarily disabled or unresponsive
    'bounced',    -- Email bounced, phone disconnected
    'unsubscribed' -- User opted out of communications
  )) DEFAULT 'active',
  
  visibility VARCHAR(20) CHECK (visibility IN (
    'public',     -- Visible to all authorized platform users
    'private',    -- Only visible to user's organization
    'restricted'  -- Only visible to user and direct managers
  )) DEFAULT 'public',
  
  -- Usage Tracking
  last_contacted_at TIMESTAMP,
  contact_frequency_preference VARCHAR(20) CHECK (contact_frequency_preference IN (
    'immediate',  -- Real-time notifications OK
    'daily',      -- Once per day maximum
    'weekly',     -- Weekly digest only
    'never'       -- No automated contact
  )) DEFAULT 'immediate',
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(user_profile_id, contact_type, contact_value),
  INDEX idx_contact_lookup (contact_type, contact_value), -- For deduplication
  INDEX idx_contact_user (user_profile_id)
);
```

**Field Explanations**:
- **contact_status**:
  - `active`: Working contact, can be used for outreach
  - `inactive`: Temporarily not responsive, try other methods
  - `bounced`: Technical failure, invalid contact information
  - `unsubscribed`: User explicitly opted out of communications

---

## 8. CONTACT_HISTORY (Audit Trail)

**Purpose**: Complete audit trail of all contact information changes

```sql
CREATE TABLE contact_change_history (
  id UUID PRIMARY KEY,
  contact_id UUID REFERENCES contact_identifiers(id),
  old_value TEXT,
  new_value TEXT NOT NULL,
  changed_at TIMESTAMP DEFAULT NOW(),
  changed_by_user_id UUID,
  reason TEXT, -- Why the change was made
  
  -- Index for performance
  INDEX idx_contact_history_contact (contact_id),
  INDEX idx_contact_history_user (changed_by_user_id)
);
```

**Purpose**: Business-critical audit trail for candidate deduplication and compliance

---

## 9. TENANTS (Organization Management)

**Purpose**: Multi-tenant organization management and isolation

```sql
CREATE TABLE tenants (
  id UUID PRIMARY KEY,
  
  -- Organization Classification
  tenant_type VARCHAR(20) CHECK (tenant_type IN (
    'employer',   -- Companies hiring directly
    'agency',     -- Recruiting firms
    'platform'    -- Platform administration
  )) NOT NULL,
  
  -- Basic Information
  name VARCHAR(200) NOT NULL,
  domain VARCHAR(100), -- Email domain for verification (e.g., 'company.com')
  
  -- Subscription & Access
  subscription_tier VARCHAR(20) CHECK (subscription_tier IN (
    'free',       -- Limited features, trial access
    'basic',      -- Standard features for small teams  
    'premium',    -- Advanced features for growing companies
    'enterprise'  -- Full features with custom support
  )) DEFAULT 'free',
  
  -- Configuration
  settings JSONB DEFAULT '{}', -- Tenant-specific configurations
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Indexes
  INDEX idx_tenants_type (tenant_type),
  INDEX idx_tenants_domain (domain)
);
```

**Field Explanations**:
- **subscription_tier**: Determines feature access and usage limits
- **domain**: Used for automatic user verification and SSO integration

---

## 10. TENANT_ROLES (Role Definitions)

**Purpose**: Centralized role management with tenant-specific customization

```sql
CREATE TABLE tenant_roles (
  id UUID PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  
  -- Role Definition
  role_name VARCHAR(100) NOT NULL, -- 'Admin', 'Senior Recruiter', 'Coordinator'
  description TEXT,
  
  -- Permissions (Pattern 1: Tenant-customizable)
  permissions JSONB NOT NULL, -- {"can_edit_candidates": true, "can_view_reports": false}
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(tenant_id, role_name),
  INDEX idx_tenant_roles_tenant (tenant_id)
);
```

**Purpose**: Enables company-level role customization while centralizing permission management

---

## 11. USER_ROLE_ASSIGNMENTS (User-Role Mapping)

**Purpose**: Many-to-many relationship between users and roles per tenant

```sql
CREATE TABLE user_role_assignments (
  -- QQQQ - tenent_id - nornmalize
  id UUID PRIMARY KEY,
  user_profile_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  tenant_role_id UUID REFERENCES tenant_roles(id) ON DELETE CASCADE,
  
  -- Assignment Tracking
  assigned_at TIMESTAMP DEFAULT NOW(),
  assigned_by_user_id UUID REFERENCES user_profiles(id),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(user_profile_id, tenant_id, tenant_role_id),
  INDEX idx_user_roles_user (user_profile_id),
  INDEX idx_user_roles_tenant (tenant_id),
  INDEX idx_user_roles_role (tenant_role_id)
);
```

**Purpose**: Supports users with multiple roles across different tenants

---

## 12. JOBS (Job Postings)

**Purpose**: Job posting management with full lifecycle support

```sql
CREATE TABLE jobs (
  id UUID PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  created_by_user_id UUID REFERENCES user_profiles(id),
  
  -- Basic Job Information
  title VARCHAR(500) NOT NULL,
  description TEXT,
  
  -- Job Classification (Pattern 2: Application constants)
  job_type VARCHAR(20) CHECK (job_type IN (
    'full_time',   -- Regular full-time employment
    'part_time',   -- Part-time work arrangements
    'contract',    -- Fixed-term contract work
    'temporary'    -- Short-term temporary positions
  )),
  
  job_category VARCHAR(50) CHECK (job_category IN (
    'Engineering & Technology',
    'Sales & Business Development', 
    'Marketing & Communications',
    'Operations & Management',
    'Customer Success & Support',
    'Finance & Accounting',
    'Human Resources',
    'Other'
  )),
  
  -- Job Requirements & Details (Structured for flexibility)
  requirements JSONB, -- skills, experience, education, travel, visa requirements
  compensation JSONB, -- salary range, benefits, equity
  location_details JSONB, -- remote/office/hybrid, specific locations
  custom_tags JSONB, -- additional searchable attributes
  
  -- Job Lifecycle (Pattern 2: Application constants)
  status VARCHAR(20) CHECK (status IN (
    'draft',      -- Being created, not visible to candidates
    'active',     -- Published and accepting applications
    'paused',     -- Temporarily not accepting applications
    'closed',     -- No longer accepting applications
    'filled',     -- Position has been filled
    'cancelled'   -- Job posting cancelled/withdrawn
  )) DEFAULT 'draft',
  
  job_access_level VARCHAR(20) DEFAULT 'marketplace', -- Future-proof for private/approved jobs
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  closed_at TIMESTAMP, -- NULL when active
  
  -- Search Optimization
  search_vector TSVECTOR, -- For full-text search performance
  
  -- Indexes
  INDEX idx_jobs_tenant_status (tenant_id, status),
  INDEX idx_jobs_created_by (created_by_user_id),
  INDEX idx_jobs_search (search_vector)
);
```

**Field Explanations**:
- **status**: Complete job lifecycle management
- **job_access_level**: Future-proofs for private job postings between specific partners

---

## 13. SUBMISSIONS (Candidate Applications)

**Purpose**: Core business process tracking candidate applications to jobs

```sql
CREATE TABLE submissions (
  -- QQQ - submitted by vs platfom
  -- QQQ - tenent id not clear
  --- QQQ - candidate id -> canonical id
  id UUID PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE, -- Tenant isolation (denormalized for performance)
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  candidate_profile_id UUID REFERENCES candidate_profiles(user_profile_id) ON DELETE CASCADE,
  submitted_by_user_id UUID REFERENCES user_profiles(id), -- Recruiter who made submission
  
  -- Submission Workflow Tracking
  submission_stage VARCHAR(50) DEFAULT 'submitted', -- Current stage in hiring process
  submission_status VARCHAR(50) DEFAULT 'pending_review', -- Current status within stage
  stage_history JSONB, -- [{stage, timestamp, changed_by}] complete audit trail
  
  -- Business Tracking
  fee_percentage DECIMAL(5,2), -- Commission rate for this placement
  expected_salary DECIMAL(12,2), -- Candidate salary expectation
  
  -- Submission Details
  cover_letter TEXT,
  submission_notes TEXT, -- Recruiter notes about why candidate is good fit
  
  -- Timestamps
  submitted_at TIMESTAMP DEFAULT NOW(),
  last_stage_change_at TIMESTAMP DEFAULT NOW(),
  
  -- Business Rules
  UNIQUE(job_id, candidate_profile_id, tenant_id), -- Prevent duplicate submissions
  
  -- Indexes for performance
  INDEX idx_submissions_job (job_id),
  INDEX idx_submissions_candidate (candidate_profile_id),
  INDEX idx_submissions_tenant_status (tenant_id, submission_status),
  INDEX idx_submissions_recruiter (submitted_by_user_id)
);
```

**Field Explanations**:
- **submission_stage**: High-level hiring process stage
- **submission_status**: Detailed status within current stage
- **stage_history**: Complete audit trail for compliance and analytics

---

## 14. USER_ROLES (Company-Customizable Roles)

**Purpose**: Lookup table for company-specific role definitions (Pattern 1)

```sql
CREATE TABLE user_roles (
  id SERIAL PRIMARY KEY,
  company_id UUID REFERENCES tenants(id), -- Links to tenant for company-specific roles
  role_name VARCHAR(100) NOT NULL,
  description TEXT,
  permissions_json JSONB, -- Detailed permissions structure
  active BOOLEAN DEFAULT true,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(company_id, role_name),
  INDEX idx_user_roles_company (company_id)
);
```

===============================================
# Constrained Values - Field Data Type

## Sample Data (Pattern 1 Implementation)**:
```sql
-- Agency roles (companies customize these)
INSERT INTO user_roles (company_id, role_name, description) VALUES
  (agency_id, 'admin', 'Full administrative access'),
  (agency_id, 'account_manager', 'Client relationship management'),
  (agency_id, 'candidate_recruiter', 'Candidate sourcing and screening'),
  (agency_id, 'recruiting_coordinator', 'Process coordination and scheduling');

-- Employer roles (companies customize these)  
INSERT INTO user_roles (company_id, role_name, description) VALUES
  (employer_id, 'admin', 'Full administrative access'),
  (employer_id, 'hiring_manager', 'Job posting and candidate review'),
  (employer_id, 'recruiter', 'Candidate sourcing and initial screening'),
  (employer_id, 'hr_coordinator', 'Process management and compliance');
```

---

## Application Constants (Pattern 2 Implementation)

**Purpose**: Industry-standard values that rarely change, implemented as application constants with database CHECK constraints

```typescript
// Industry standard values - rarely change
const ACCOUNT_STATUS = {
  ACTIVE: 'active',                    // Normal operational state, can login and use system
  INACTIVE: 'inactive',                // Temporarily disabled, can be reactivated by admin
  SUSPENDED: 'suspended',              // Disciplinary action, requires admin intervention
  PENDING: 'pending_verification'      // Awaiting email verification or admin approval
} as const;

const APPLICATION_STATUS = {
  ACTIVE: 'active',                    // Application in progress through hiring process
  REJECTED: 'rejected',                // Application declined at some stage
  HIRED: 'hired',                      // Candidate successfully hired
  CONVERTED: 'converted'               // Hired candidate converted to employee record
} as const;

const TENANT_TYPES = {
  EMPLOYER: 'employer',                // Companies hiring directly for their own teams
  AGENCY: 'agency',                    // Recruiting firms representing candidates
  PLATFORM: 'platform'                // Platform administration and operations
} as const;

const EXPERIENCE_LEVEL = {
  ENTRY: 'entry',                      // 0-2 years, recent graduates, career changers
  MID: 'mid',                          // 3-5 years, established in role but not senior
  SENIOR: 'senior',                    // 6-10 years, technical/functional expertise
  STAFF: 'staff',                      // 10+ years, cross-functional leadership
  PRINCIPAL: 'principal',              // 12+ years, strategic influence, technical authority
  EXECUTIVE: 'executive'               // C-level, VP-level, organizational leadership
} as const;

const CONTACT_TYPES = {
  EMAIL: 'email',                      // Email addresses (primary and secondary)
  PHONE: 'phone',                      // Phone numbers (mobile, work, home)
  LINKEDIN: 'linkedin',                // LinkedIn profile URLs
  GITHUB: 'github',                    // GitHub profile URLs
  TWITTER: 'twitter',                  // Twitter/X profile URLs
  PORTFOLIO: 'portfolio',              // Personal portfolio websites
  WEBSITE: 'website'                   // Company or personal websites
} as const;

const JOB_TYPE = {
  FULL_TIME: 'full-time',              // Regular full-time employment
  PART_TIME: 'part-time',              // Part-time work arrangements
  CONTRACT: 'contract',                // Fixed-term contract work
  INTERNSHIP: 'internship',            // Student internship programs
  TEMPORARY: 'temporary'               // Short-term temporary positions
} as const;

const INTERVIEW_TYPE = {
  PHONE: 'phone',                      // Phone interview
  VIDEO: 'video',                      // Video conference interview
  IN_PERSON: 'in-person',              // Face-to-face interview
  TECHNICAL: 'technical',              // Technical assessment/coding interview
  PANEL: 'panel'                       // Multiple interviewer panel
} as const;

const INTERVIEW_STATUS = {
  SCHEDULED: 'scheduled',              // Interview scheduled, not yet conducted
  COMPLETED: 'completed',              // Interview completed successfully
  CANCELLED: 'cancelled',              // Interview cancelled by either party
  NO_SHOW: 'no_show'                  // Candidate failed to attend scheduled interview
} as const;
```

---

## Regional Configuration (Pattern 3 Implementation)

**Purpose**: Country/region-specific values that change based on local requirements

**US Market Configuration (MVP)**:
```json
// config/countries/us.json
{
  "work_authorization": [
    "citizen",              // US citizen, no work restrictions
    "permanent_resident",   // Green card holder
    "h1b",                 // H1B visa holder
    "opt",                 // F1 student on Optional Practical Training
    "no_authorization"     // Requires work authorization sponsorship
  ],
  "education_level": [
    "high_school",         // High school diploma or equivalent
    "associates",          // 2-year associate degree
    "bachelors",          // 4-year bachelor's degree
    "masters",            // Master's degree
    "phd"                 // Doctoral degree
  ]
}
```

**UK Market Configuration (Future)**:
```json
// config/countries/uk.json  
{
  "work_authorization": [
    "citizen",              // UK citizen or right to work
    "settled_status",       // EU settled status
    "tier2_visa",          // Tier 2 work visa
    "student_visa",        // Student visa with work rights
    "no_authorization"     // Requires sponsorship
  ],
  "education_level": [
    "secondary",           // Secondary school qualifications
    "a_levels",           // A-level qualifications
    "bachelors",          // Bachelor's degree
    "masters",            // Master's degree
    "phd"                 // Doctoral degree
  ]
}
```

---

## Database Indexes and Performance Optimization

**Critical Indexes for Performance**:
```sql
-- User lookup performance
CREATE INDEX idx_user_profiles_tenant_type ON user_profiles(tenant_id, profile_type);
CREATE INDEX idx_user_profiles_person ON user_profiles(person_id);

-- Contact deduplication performance  
CREATE INDEX idx_contact_lookup ON contact_identifiers(contact_type, contact_value);

-- Job search performance
CREATE INDEX idx_jobs_tenant_status ON jobs(tenant_id, status);
CREATE INDEX idx_jobs_search ON jobs USING gin(search_vector);

-- Submission tracking performance
CREATE INDEX idx_submissions_job ON submissions(job_id);
CREATE INDEX idx_submissions_tenant_status ON submissions(tenant_id, submission_status);

-- Role assignment performance
CREATE INDEX idx_user_roles_user ON user_role_assignments(user_profile_id);
CREATE INDEX idx_tenant_roles_tenant ON tenant_roles(tenant_id);
```

---

## Summary of Constrained Values Patterns Applied

**Pattern 1 (Lookup Tables)**: 
- `user_roles` - Company-level role customization
- `tenant_roles` - Tenant-specific role definitions

**Pattern 2 (Application Constants)**: 
- All classification and status fields across tables
- Industry-standard values with low change frequency
- Implemented with CHECK constraints + TypeScript constants

**Pattern 3 (Regional Config)**: 
- `work_authorization` - Country-specific employment authorization
- `education_level` - Regional education system differences

**Implementation Status**: ✅ **COMPLETE** - All 14 tables with comprehensive field specifications, constraints, and performance optimizations ready for development.