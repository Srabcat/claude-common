-- =================================================================
-- UNIFIED ATS DATABASE SCHEMA
-- Supports: Employer ATS, Agency ATS, and Hiring Platform use cases
-- =================================================================

-- =================================================================
-- CORE SYSTEM TABLES
-- =================================================================

-- Platform configuration and multi-tenancy
CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('employer', 'agency', 'platform')),
    slug VARCHAR(100) UNIQUE NOT NULL,
    settings JSONB DEFAULT '{}',
    subscription_tier VARCHAR(50) DEFAULT 'basic',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =================================================================
-- ORGANIZATION & USER MANAGEMENT
-- =================================================================

-- Organizations (companies, agencies, departments)
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES organizations(id), -- For hierarchies/departments
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('company', 'agency', 'department', 'team')),
    industry VARCHAR(100),
    size_range VARCHAR(50),
    website VARCHAR(255),
    logo_url VARCHAR(500),
    address JSONB, -- {street, city, state, country, postal_code}
    settings JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Users (candidates, employees, recruiters, admins)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(50),
    avatar_url VARCHAR(500),
    timezone VARCHAR(100) DEFAULT 'UTC',
    locale VARCHAR(10) DEFAULT 'en',
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User roles and permissions (supports multiple roles per user)
CREATE TABLE user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'recruiter', 'hiring_manager', 'interviewer', 'candidate', 'client_contact')),
    permissions JSONB DEFAULT '{}',
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =================================================================
-- CANDIDATE MANAGEMENT
-- =================================================================

-- Candidate profiles
CREATE TABLE candidates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    source VARCHAR(100), -- How they were found/added
    source_details JSONB,
    headline VARCHAR(500),
    summary TEXT,
    experience_years INTEGER,
    current_company VARCHAR(255),
    current_title VARCHAR(255),
    location JSONB, -- {city, state, country, remote_ok}
    salary_expectations JSONB, -- {min, max, currency, type}
    availability_date DATE,
    work_authorization VARCHAR(100),
    skills JSONB DEFAULT '[]', -- Array of skill objects
    languages JSONB DEFAULT '[]', -- Array of language objects
    social_profiles JSONB DEFAULT '{}', -- {linkedin, github, portfolio, etc}
    tags JSONB DEFAULT '[]',
    custom_fields JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Candidate work history
CREATE TABLE candidate_work_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
    company_name VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_date DATE NOT NULL,
    end_date DATE,
    is_current BOOLEAN DEFAULT false,
    location VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Candidate education
CREATE TABLE candidate_education (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
    institution VARCHAR(255) NOT NULL,
    degree VARCHAR(255),
    field_of_study VARCHAR(255),
    graduation_date DATE,
    gpa DECIMAL(3,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =================================================================
-- JOB MANAGEMENT
-- =================================================================

-- Job posts/requisitions
CREATE TABLE jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    hiring_manager_id UUID REFERENCES users(id),
    recruiter_id UUID REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    requirements TEXT,
    responsibilities TEXT,
    employment_type VARCHAR(50) CHECK (employment_type IN ('full_time', 'part_time', 'contract', 'internship')),
    experience_level VARCHAR(50) CHECK (experience_level IN ('entry', 'mid', 'senior', 'executive')),
    location JSONB, -- {city, state, country, remote_ok}
    salary_range JSONB, -- {min, max, currency, type}
    benefits TEXT,
    skills_required JSONB DEFAULT '[]',
    skills_preferred JSONB DEFAULT '[]',
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'open', 'paused', 'filled', 'cancelled')),
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    positions_count INTEGER DEFAULT 1,
    positions_filled INTEGER DEFAULT 0,
    published_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    custom_fields JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Job posting channels and syndication
CREATE TABLE job_postings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    channel VARCHAR(100) NOT NULL, -- 'internal', 'linkedin', 'indeed', 'company_website'
    external_id VARCHAR(255), -- ID from external job board
    url VARCHAR(500),
    posted_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    metrics JSONB DEFAULT '{}', -- {views, clicks, applications}
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =================================================================
-- APPLICATION & WORKFLOW MANAGEMENT
-- =================================================================

-- Workflow templates (customizable hiring processes)
CREATE TABLE workflow_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) DEFAULT 'hiring' CHECK (type IN ('hiring', 'onboarding', 'agency_placement')),
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Workflow stages (steps in the hiring process)
CREATE TABLE workflow_stages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID NOT NULL REFERENCES workflow_templates(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    stage_order INTEGER NOT NULL,
    stage_type VARCHAR(50) CHECK (stage_type IN ('application', 'screening', 'interview', 'assessment', 'reference', 'offer', 'hired', 'rejected')),
    auto_advance BOOLEAN DEFAULT false,
    required_actions JSONB DEFAULT '[]',
    sla_hours INTEGER, -- Service level agreement in hours
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Applications (candidate applications to jobs)
CREATE TABLE applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    current_stage_id UUID REFERENCES workflow_stages(id),
    source VARCHAR(100), -- How they applied
    cover_letter TEXT,
    resume_url VARCHAR(500),
    status VARCHAR(50) DEFAULT 'new' CHECK (status IN ('new', 'in_review', 'interviewing', 'offered', 'hired', 'rejected', 'withdrawn')),
    rating DECIMAL(3,2), -- 1-5 rating
    fit_score DECIMAL(5,2), -- AI/algorithm generated fit score
    referrer_id UUID REFERENCES users(id), -- Who referred this candidate
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    rejected_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    custom_fields JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(candidate_id, job_id)
);

-- Application stage history (tracks movement through workflow)
CREATE TABLE application_stage_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    stage_id UUID NOT NULL REFERENCES workflow_stages(id),
    user_id UUID REFERENCES users(id), -- Who moved it
    entered_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    exited_at TIMESTAMP WITH TIME ZONE,
    duration_hours DECIMAL(8,2),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =================================================================
-- INTERVIEW & SCHEDULING MANAGEMENT
-- =================================================================

-- Interview types and templates
CREATE TABLE interview_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    duration_minutes INTEGER DEFAULT 60,
    interview_type VARCHAR(50) CHECK (interview_type IN ('phone', 'video', 'onsite', 'panel', 'technical', 'cultural')),
    questions JSONB DEFAULT '[]',
    scorecard_template JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Scheduled interviews
CREATE TABLE interviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    template_id UUID REFERENCES interview_templates(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    interview_type VARCHAR(50) CHECK (interview_type IN ('phone', 'video', 'onsite', 'panel', 'technical', 'cultural')),
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_minutes INTEGER DEFAULT 60,
    location VARCHAR(255), -- Physical address or video link
    status VARCHAR(50) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled', 'no_show')),
    feedback JSONB DEFAULT '{}',
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Interview participants (interviewers and interviewees)
CREATE TABLE interview_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    interview_id UUID NOT NULL REFERENCES interviews(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    role VARCHAR(50) NOT NULL CHECK (role IN ('interviewer', 'candidate', 'observer')),
    status VARCHAR(50) DEFAULT 'invited' CHECK (status IN ('invited', 'confirmed', 'declined', 'attended', 'no_show')),
    feedback JSONB DEFAULT '{}',
    scorecard JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =================================================================
-- COMMUNICATION & ACTIVITY TRACKING
-- =================================================================

-- Activities (notes, emails, calls, meetings)
CREATE TABLE activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id), -- Who created the activity
    related_to_type VARCHAR(50) NOT NULL CHECK (related_to_type IN ('candidate', 'application', 'job', 'organization', 'user')),
    related_to_id UUID NOT NULL,
    activity_type VARCHAR(50) NOT NULL CHECK (activity_type IN ('note', 'email', 'call', 'meeting', 'task', 'system')),
    subject VARCHAR(255),
    content TEXT,
    metadata JSONB DEFAULT '{}', -- Email headers, call duration, etc.
    is_private BOOLEAN DEFAULT false,
    scheduled_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Email templates
CREATE TABLE email_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations(id),
    name VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    template_type VARCHAR(50) CHECK (template_type IN ('application_received', 'interview_invite', 'rejection', 'offer', 'follow_up')),
    variables JSONB DEFAULT '[]', -- Available template variables
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =================================================================
-- AGENCY-SPECIFIC FEATURES
-- =================================================================

-- Client relationships (for agencies)
CREATE TABLE client_relationships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agency_id UUID NOT NULL REFERENCES organizations(id), -- The agency
    client_id UUID NOT NULL REFERENCES organizations(id), -- The client company
    primary_contact_id UUID REFERENCES users(id),
    relationship_status VARCHAR(50) DEFAULT 'active' CHECK (relationship_status IN ('prospect', 'active', 'inactive', 'terminated')),
    contract_start_date DATE,
    contract_end_date DATE,
    billing_terms JSONB DEFAULT '{}',
    commission_structure JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Placements (successful job placements)
CREATE TABLE placements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    recruiter_id UUID NOT NULL REFERENCES users(id),
    client_relationship_id UUID REFERENCES client_relationships(id),
    placement_type VARCHAR(50) CHECK (placement_type IN ('permanent', 'contract', 'temp_to_perm')),
    start_date DATE NOT NULL,
    end_date DATE, -- For contract placements
    salary_amount DECIMAL(12,2) NOT NULL,
    salary_currency VARCHAR(10) DEFAULT 'USD',
    commission_rate DECIMAL(5,2), -- Percentage
    commission_amount DECIMAL(12,2),
    invoice_amount DECIMAL(12,2),
    payment_terms JSONB DEFAULT '{}',
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'terminated', 'replaced')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Commission tracking
CREATE TABLE commissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    placement_id UUID NOT NULL REFERENCES placements(id) ON DELETE CASCADE,
    recruiter_id UUID NOT NULL REFERENCES users(id),
    commission_type VARCHAR(50) CHECK (commission_type IN ('placement', 'replacement', 'bonus')),
    amount DECIMAL(12,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    due_date DATE,
    paid_date DATE,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'disputed', 'cancelled')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =================================================================
-- PLATFORM-SPECIFIC FEATURES (Marketplace)
-- =================================================================

-- Recruiter networks (for hiring platforms)
CREATE TABLE recruiter_networks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    platform_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    recruiter_id UUID NOT NULL REFERENCES users(id),
    specializations JSONB DEFAULT '[]', -- Industry/role specializations
    success_rate DECIMAL(5,2), -- Placement success rate
    average_time_to_fill INTEGER, -- Days
    rating DECIMAL(3,2), -- 1-5 rating from clients
    is_verified BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Job marketplace assignments (connecting jobs to recruiters)
CREATE TABLE job_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    recruiter_id UUID NOT NULL REFERENCES users(id),
    assignment_type VARCHAR(50) CHECK (assignment_type IN ('exclusive', 'retained', 'contingency')),
    commission_rate DECIMAL(5,2),
    max_submissions INTEGER,
    expires_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =================================================================
-- DOCUMENTS & FILES
-- =================================================================

-- File storage (resumes, documents, etc.)
CREATE TABLE files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    uploaded_by UUID NOT NULL REFERENCES users(id),
    related_to_type VARCHAR(50) CHECK (related_to_type IN ('candidate', 'application', 'job', 'organization')),
    related_to_id UUID,
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    file_size INTEGER NOT NULL,
    mime_type VARCHAR(100),
    file_url VARCHAR(500) NOT NULL,
    is_public BOOLEAN DEFAULT false,
    parsed_content TEXT, -- For searchable content
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =================================================================
-- REPORTING & ANALYTICS
-- =================================================================

-- Saved reports and dashboards
CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES users(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    report_type VARCHAR(50) CHECK (report_type IN ('pipeline', 'performance', 'financial', 'custom')),
    configuration JSONB NOT NULL,
    is_shared BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =================================================================
-- INDEXES FOR PERFORMANCE
-- =================================================================

-- Core lookup indexes
CREATE INDEX idx_users_tenant_email ON users(tenant_id, email);
CREATE INDEX idx_candidates_tenant_active ON candidates(tenant_id, is_active);
CREATE INDEX idx_jobs_tenant_status ON jobs(tenant_id, status);
CREATE INDEX idx_applications_job_status ON applications(job_id, status);
CREATE INDEX idx_applications_candidate_job ON applications(candidate_id, job_id);
CREATE INDEX idx_activities_related_to ON activities(related_to_type, related_to_id);
CREATE INDEX idx_interviews_scheduled_at ON interviews(scheduled_at);
CREATE INDEX idx_placements_recruiter_status ON placements(recruiter_id, status);

-- Search indexes
CREATE INDEX idx_candidates_search ON candidates USING GIN(to_tsvector('english', first_name || ' ' || last_name || ' ' || headline || ' ' || summary));
CREATE INDEX idx_jobs_search ON jobs USING GIN(to_tsvector('english', title || ' ' || description));

-- =================================================================
-- VIEWS FOR COMMON QUERIES
-- =================================================================

-- Active applications with candidate and job details
CREATE VIEW active_applications AS
SELECT 
    a.*,
    c.first_name || ' ' || c.last_name as candidate_name,
    c.email as candidate_email,
    j.title as job_title,
    j.organization_id,
    ws.name as current_stage_name
FROM applications a
JOIN candidates c ON a.candidate_id = c.id
JOIN jobs j ON a.job_id = j.id
LEFT JOIN workflow_stages ws ON a.current_stage_id = ws.id
WHERE a.status NOT IN ('hired', 'rejected', 'withdrawn');

-- Recruiter performance metrics
CREATE VIEW recruiter_metrics AS
SELECT 
    u.id as recruiter_id,
    u.first_name || ' ' || u.last_name as recruiter_name,
    COUNT(p.id) as total_placements,
    SUM(p.commission_amount) as total_commission,
    AVG(EXTRACT(days FROM (p.start_date - a.applied_at))) as avg_time_to_placement
FROM users u
JOIN user_roles ur ON u.id = ur.user_id AND ur.role = 'recruiter'
JOIN placements p ON u.id = p.recruiter_id
JOIN applications a ON p.application_id = a.id
WHERE p.status = 'active'
GROUP BY u.id, u.first_name, u.last_name;