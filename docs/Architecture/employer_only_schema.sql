-- =================================================================
-- EMPLOYER ATS SCHEMA (Specialized)
-- Optimized for internal hiring teams like Greenhouse/Ashby
-- Focus: Internal hiring, structured interviews, team collaboration
-- =================================================================

-- =================================================================
-- COMPANY AND ORGANIZATIONAL STRUCTURE
-- =================================================================

-- Company configuration and settings
CREATE TABLE company_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name VARCHAR(255) NOT NULL,
    industry VARCHAR(100),
    company_size VARCHAR(50),
    headquarters_location VARCHAR(255),
    website VARCHAR(255),
    
    -- Hiring configuration
    default_hiring_process_id UUID, -- Will reference hiring_processes table
    approval_workflows_enabled BOOLEAN DEFAULT true,
    structured_interviews_required BOOLEAN DEFAULT true,
    diversity_tracking_enabled BOOLEAN DEFAULT true,
    
    -- Compliance and legal
    eeoc_tracking BOOLEAN DEFAULT true,
    gdpr_compliance BOOLEAN DEFAULT false,
    background_check_required BOOLEAN DEFAULT false,
    
    -- Integrations
    slack_integration JSONB DEFAULT '{}',
    calendar_integration VARCHAR(50), -- 'google', 'outlook', 'calendly'
    hris_integration VARCHAR(100), -- 'workday', 'bamboohr', 'adp'
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Departments and teams (hierarchical structure)
CREATE TABLE departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id UUID REFERENCES departments(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    department_head_id UUID, -- Will reference users table
    budget_allocated DECIMAL(12,2),
    headcount_target INTEGER,
    headcount_current INTEGER DEFAULT 0,
    cost_center_code VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =================================================================
-- USER MANAGEMENT (Employees and Candidates)
-- =================================================================

-- All users in the system (employees, candidates, contractors)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255), -- For employee accounts
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(50),
    personal_email VARCHAR(255), -- For candidates
    
    -- Profile information
    avatar_url VARCHAR(500),
    timezone VARCHAR(100) DEFAULT 'UTC',
    locale VARCHAR(10) DEFAULT 'en',
    
    -- Account status
    account_type VARCHAR(50) CHECK (account_type IN ('employee', 'candidate', 'contractor', 'interviewer')),
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    last_login_at TIMESTAMP WITH TIME ZONE,
    
    -- Employee specific
    employee_id VARCHAR(100), -- Company employee ID
    start_date DATE,
    manager_id UUID REFERENCES users(id),
    department_id UUID REFERENCES departments(id),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Employee roles and permissions (fine-grained access control)
CREATE TABLE user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    department_id UUID REFERENCES departments(id),
    role_name VARCHAR(50) NOT NULL CHECK (role_name IN (
        'admin', 'recruiter', 'hiring_manager', 'interviewer', 
        'coordinator', 'sourcer', 'analytics_viewer', 'candidate'
    )),
    permissions JSONB DEFAULT '{}', -- Granular permissions
    scope VARCHAR(50) DEFAULT 'department' CHECK (scope IN ('global', 'department', 'team', 'own')),
    is_primary BOOLEAN DEFAULT false,
    granted_by UUID REFERENCES users(id),
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =================================================================
-- CANDIDATE MANAGEMENT (Internal Hiring Focus)
-- =================================================================

-- Candidate profiles (external candidates applying for jobs)
CREATE TABLE candidates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    source VARCHAR(100), -- 'career_site', 'referral', 'linkedin', 'recruiter'
    source_details JSONB, -- Additional source information
    referrer_id UUID REFERENCES users(id), -- Employee who referred them
    
    -- Personal information
    headline VARCHAR(500),
    summary TEXT,
    location VARCHAR(255),
    willing_to_relocate BOOLEAN DEFAULT false,
    
    -- Experience and skills
    total_experience_years DECIMAL(4,2),
    current_company VARCHAR(255),
    current_title VARCHAR(255),
    skills JSONB DEFAULT '[]', -- Array of skill objects with proficiency
    
    -- Preferences
    desired_salary_min DECIMAL(12,2),
    desired_salary_max DECIMAL(12,2),
    salary_currency VARCHAR(10) DEFAULT 'USD',
    preferred_locations JSONB DEFAULT '[]',
    remote_work_preference VARCHAR(20) CHECK (remote_work_preference IN ('onsite', 'hybrid', 'remote', 'flexible')),
    
    -- Availability
    availability_date DATE,
    notice_period_weeks INTEGER,
    
    -- Legal and compliance
    work_authorization VARCHAR(100),
    requires_sponsorship BOOLEAN DEFAULT false,
    veteran_status VARCHAR(50),
    disability_status VARCHAR(50),
    gender_identity VARCHAR(50),
    ethnicity VARCHAR(50),
    
    -- Tracking
    resume_url VARCHAR(500),
    portfolio_url VARCHAR(500),
    linkedin_url VARCHAR(500),
    github_url VARCHAR(500),
    
    -- Internal candidate handling (employees applying internally)
    is_internal_candidate BOOLEAN DEFAULT false,
    current_employee_id UUID REFERENCES users(id),
    internal_referral BOOLEAN DEFAULT false,
    
    -- Status
    candidate_status VARCHAR(50) DEFAULT 'active' CHECK (candidate_status IN (
        'active', 'hired', 'withdrawn', 'rejected', 'inactive'
    )),
    
    -- Duplicate prevention for internal transfers
    primary_record_id UUID REFERENCES candidates(id),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Candidate work history
CREATE TABLE candidate_work_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
    company_name VARCHAR(255) NOT NULL,
    job_title VARCHAR(255) NOT NULL,
    description TEXT,
    start_date DATE NOT NULL,
    end_date DATE,
    is_current BOOLEAN DEFAULT false,
    location VARCHAR(255),
    achievements JSONB DEFAULT '[]', -- Structured achievements
    technologies_used JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Candidate education
CREATE TABLE candidate_education (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
    institution_name VARCHAR(255) NOT NULL,
    degree_type VARCHAR(100), -- 'Bachelor', 'Master', 'PhD', 'Certificate'
    field_of_study VARCHAR(255),
    graduation_date DATE,
    gpa DECIMAL(3,2),
    honors VARCHAR(255),
    is_current BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =================================================================
-- JOB REQUISITIONS AND POSTINGS
-- =================================================================

-- Job requisitions (internal job requests)
CREATE TABLE job_requisitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    requisition_number VARCHAR(100) UNIQUE NOT NULL,
    department_id UUID NOT NULL REFERENCES departments(id),
    hiring_manager_id UUID NOT NULL REFERENCES users(id),
    recruiter_id UUID REFERENCES users(id),
    
    -- Job details
    job_title VARCHAR(255) NOT NULL,
    job_level VARCHAR(50) CHECK (job_level IN ('entry', 'mid', 'senior', 'staff', 'principal', 'director', 'vp')),
    employment_type VARCHAR(50) CHECK (employment_type IN ('full_time', 'part_time', 'contract', 'internship')),
    
    -- Job description
    job_description TEXT NOT NULL,
    responsibilities TEXT,
    required_qualifications TEXT,
    preferred_qualifications TEXT,
    
    -- Requirements
    minimum_experience_years INTEGER,
    required_skills JSONB DEFAULT '[]',
    preferred_skills JSONB DEFAULT '[]',
    education_requirements TEXT,
    certifications_required JSONB DEFAULT '[]',
    
    -- Location and remote work
    primary_location VARCHAR(255),
    remote_work_allowed BOOLEAN DEFAULT false,
    hybrid_work_model VARCHAR(50), -- 'fully_remote', 'hybrid', 'onsite'
    travel_requirements VARCHAR(100),
    
    -- Compensation
    salary_min DECIMAL(12,2),
    salary_max DECIMAL(12,2),
    salary_currency VARCHAR(10) DEFAULT 'USD',
    equity_offered BOOLEAN DEFAULT false,
    bonus_eligible BOOLEAN DEFAULT false,
    benefits_summary TEXT,
    
    -- Headcount and urgency
    positions_to_fill INTEGER DEFAULT 1,
    priority_level VARCHAR(20) DEFAULT 'medium' CHECK (priority_level IN ('low', 'medium', 'high', 'urgent')),
    business_justification TEXT,
    
    -- Timeline
    target_start_date DATE,
    target_fill_date DATE,
    approval_deadline DATE,
    
    -- Approval workflow
    approval_status VARCHAR(50) DEFAULT 'draft' CHECK (approval_status IN (
        'draft', 'pending_approval', 'approved', 'rejected', 'on_hold'
    )),
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    
    -- Status
    requisition_status VARCHAR(50) DEFAULT 'open' CHECK (requisition_status IN (
        'open', 'filled', 'cancelled', 'on_hold', 'expired'
    )),
    positions_filled INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Job postings (public job listings)
CREATE TABLE job_postings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    requisition_id UUID NOT NULL REFERENCES job_requisitions(id) ON DELETE CASCADE,
    
    -- Publishing details
    posting_title VARCHAR(255) NOT NULL, -- May differ from internal title
    public_description TEXT NOT NULL,    -- May differ from internal description
    posting_url VARCHAR(500),
    
    -- Posting channels
    post_to_career_site BOOLEAN DEFAULT true,
    post_to_job_boards BOOLEAN DEFAULT false,
    job_board_configuration JSONB DEFAULT '{}',
    
    -- SEO and branding
    meta_description TEXT,
    keywords JSONB DEFAULT '[]',
    posting_image_url VARCHAR(500),
    
    -- Application settings
    application_deadline DATE,
    custom_application_questions JSONB DEFAULT '[]',
    require_cover_letter BOOLEAN DEFAULT false,
    
    -- Status and metrics
    posting_status VARCHAR(50) DEFAULT 'draft' CHECK (posting_status IN (
        'draft', 'published', 'paused', 'expired', 'archived'
    )),
    published_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Analytics
    page_views INTEGER DEFAULT 0,
    unique_visitors INTEGER DEFAULT 0,
    applications_received INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =================================================================
-- HIRING PROCESSES AND WORKFLOWS
-- =================================================================

-- Hiring process templates (reusable workflows)
CREATE TABLE hiring_processes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    process_name VARCHAR(255) NOT NULL,
    description TEXT,
    department_id UUID REFERENCES departments(id),
    job_level VARCHAR(50),
    
    -- Process configuration
    is_default BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    requires_approval BOOLEAN DEFAULT false,
    
    -- SLA and timing
    target_days_to_hire INTEGER, -- Expected timeline
    
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Stages within hiring processes
CREATE TABLE hiring_stages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    process_id UUID NOT NULL REFERENCES hiring_processes(id) ON DELETE CASCADE,
    stage_name VARCHAR(255) NOT NULL,
    description TEXT,
    stage_order INTEGER NOT NULL,
    
    -- Stage configuration
    stage_type VARCHAR(50) CHECK (stage_type IN (
        'application', 'screening', 'phone_interview', 'technical_assessment',
        'onsite_interview', 'panel_interview', 'reference_check', 'background_check',
        'approval', 'offer', 'hired', 'rejected'
    )),
    
    -- Automation and requirements
    auto_advance BOOLEAN DEFAULT false,
    requires_feedback BOOLEAN DEFAULT false,
    requires_scorecard BOOLEAN DEFAULT false,
    minimum_interviewers INTEGER DEFAULT 1,
    
    -- SLA
    sla_hours INTEGER, -- Expected time in this stage
    escalation_enabled BOOLEAN DEFAULT false,
    escalation_hours INTEGER,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =================================================================
-- APPLICATIONS AND CANDIDATE PIPELINE
-- =================================================================

-- Job applications
CREATE TABLE applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
    requisition_id UUID NOT NULL REFERENCES job_requisitions(id) ON DELETE CASCADE,
    
    -- Application details
    current_stage_id UUID REFERENCES hiring_stages(id),
    source VARCHAR(100), -- How they applied
    applied_via VARCHAR(50), -- 'career_site', 'referral', 'recruiter', 'linkedin'
    
    -- Application content
    cover_letter TEXT,
    resume_url VARCHAR(500),
    custom_responses JSONB DEFAULT '{}', -- Responses to custom questions
    
    -- Status and scoring
    application_status VARCHAR(50) DEFAULT 'new' CHECK (application_status IN (
        'new', 'in_review', 'phone_screen', 'interviewing', 'assessment', 
        'reference_check', 'background_check', 'offer', 'hired', 'rejected', 'withdrawn'
    )),
    
    -- Scoring and evaluation
    overall_rating DECIMAL(3,2), -- 1-5 rating
    fit_score DECIMAL(5,2), -- Algorithm-generated fit score
    interviewer_recommendation VARCHAR(50), -- 'strong_hire', 'hire', 'no_hire', 'strong_no_hire'
    
    -- Timing
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    time_in_process_days INTEGER, -- Calculated field
    
    -- Rejection handling
    rejected_at TIMESTAMP WITH TIME ZONE,
    rejection_reason_category VARCHAR(100),
    rejection_reason_details TEXT,
    rejection_feedback_sent BOOLEAN DEFAULT false,
    
    -- Referral tracking
    referrer_id UUID REFERENCES users(id),
    referral_bonus_eligible BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Prevent duplicate applications
    UNIQUE(candidate_id, requisition_id)
);

-- Application stage progression tracking
CREATE TABLE application_stage_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    stage_id UUID NOT NULL REFERENCES hiring_stages(id),
    
    -- Timing
    entered_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    exited_at TIMESTAMP WITH TIME ZONE,
    duration_hours DECIMAL(8,2),
    
    -- Who moved the application
    moved_by UUID REFERENCES users(id),
    move_reason TEXT,
    
    -- Stage outcome
    stage_outcome VARCHAR(50), -- 'advanced', 'rejected', 'withdrawn', 'on_hold'
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =================================================================
-- INTERVIEW MANAGEMENT
-- =================================================================

-- Interview kits/templates
CREATE TABLE interview_kits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kit_name VARCHAR(255) NOT NULL,
    description TEXT,
    department_id UUID REFERENCES departments(id),
    job_level VARCHAR(50),
    
    -- Kit configuration
    interview_type VARCHAR(50) CHECK (interview_type IN (
        'phone_screen', 'technical', 'behavioral', 'panel', 'case_study', 'presentation'
    )),
    duration_minutes INTEGER DEFAULT 60,
    
    -- Content
    questions JSONB DEFAULT '[]', -- Structured interview questions
    evaluation_criteria JSONB DEFAULT '[]', -- What to evaluate
    scorecard_template JSONB DEFAULT '{}', -- Scoring framework
    
    -- Usage tracking
    times_used INTEGER DEFAULT 0,
    average_rating DECIMAL(3,2),
    
    created_by UUID REFERENCES users(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Scheduled interviews
CREATE TABLE interviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    kit_id UUID REFERENCES interview_kits(id),
    
    -- Interview details
    interview_title VARCHAR(255) NOT NULL,
    interview_type VARCHAR(50) CHECK (interview_type IN (
        'phone_screen', 'video', 'onsite', 'technical', 'behavioral', 'panel'
    )),
    
    -- Scheduling
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_minutes INTEGER DEFAULT 60,
    timezone VARCHAR(100),
    
    -- Location/logistics
    meeting_location VARCHAR(255), -- Physical address or video link
    meeting_instructions TEXT,
    dial_in_info JSONB, -- Phone/video conference details
    
    -- Status
    interview_status VARCHAR(50) DEFAULT 'scheduled' CHECK (interview_status IN (
        'scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show', 'rescheduled'
    )),
    
    -- Outcome
    overall_recommendation VARCHAR(50), -- 'strong_hire', 'hire', 'no_hire', 'strong_no_hire'
    structured_feedback JSONB DEFAULT '{}', -- Scorecard responses
    
    -- Logistics
    created_by UUID REFERENCES users(id),
    cancelled_reason TEXT,
    rescheduled_from UUID REFERENCES interviews(id),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Interview participants and feedback
CREATE TABLE interview_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    interview_id UUID NOT NULL REFERENCES interviews(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    
    -- Participation details
    role VARCHAR(50) NOT NULL CHECK (role IN ('interviewer', 'observer', 'coordinator', 'candidate')),
    is_required BOOLEAN DEFAULT true,
    
    -- Response status
    invitation_status VARCHAR(50) DEFAULT 'pending' CHECK (invitation_status IN (
        'pending', 'accepted', 'declined', 'tentative'
    )),
    attendance_status VARCHAR(50) CHECK (attendance_status IN (
        'attended', 'no_show', 'late', 'left_early'
    )),
    
    -- Feedback
    individual_recommendation VARCHAR(50), -- Personal recommendation
    feedback_text TEXT,
    scorecard_responses JSONB DEFAULT '{}', -- Structured feedback
    feedback_submitted_at TIMESTAMP WITH TIME ZONE,
    
    -- Debrief participation
    participated_in_debrief BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =================================================================
-- OFFERS AND ONBOARDING
-- =================================================================

-- Job offers
CREATE TABLE offers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES users(id), -- Who created the offer
    approved_by UUID REFERENCES users(id), -- Who approved the offer
    
    -- Offer details
    offer_type VARCHAR(50) CHECK (offer_type IN ('full_time', 'part_time', 'contract', 'internship')),
    job_title VARCHAR(255) NOT NULL,
    department_id UUID REFERENCES departments(id),
    reporting_manager_id UUID REFERENCES users(id),
    start_date DATE,
    
    -- Compensation
    base_salary DECIMAL(12,2) NOT NULL,
    salary_currency VARCHAR(10) DEFAULT 'USD',
    bonus_target DECIMAL(12,2),
    equity_shares INTEGER,
    equity_percentage DECIMAL(8,4),
    signing_bonus DECIMAL(12,2),
    relocation_amount DECIMAL(12,2),
    
    -- Benefits
    vacation_days INTEGER,
    benefits_summary TEXT,
    other_benefits JSONB DEFAULT '{}',
    
    -- Offer logistics
    offer_letter_template TEXT,
    offer_expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    
    -- Status tracking
    offer_status VARCHAR(50) DEFAULT 'draft' CHECK (offer_status IN (
        'draft', 'pending_approval', 'approved', 'sent', 'accepted', 'declined', 'expired', 'withdrawn'
    )),
    
    -- Response tracking
    sent_at TIMESTAMP WITH TIME ZONE,
    candidate_response_at TIMESTAMP WITH TIME ZONE,
    candidate_notes TEXT,
    
    -- Negotiation
    negotiation_rounds INTEGER DEFAULT 0,
    final_offer BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Offer approvals (for approval workflows)
CREATE TABLE offer_approvals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    offer_id UUID NOT NULL REFERENCES offers(id) ON DELETE CASCADE,
    approver_id UUID NOT NULL REFERENCES users(id),
    
    -- Approval details
    approval_level INTEGER NOT NULL, -- 1st level, 2nd level, etc.
    approval_status VARCHAR(50) DEFAULT 'pending' CHECK (approval_status IN (
        'pending', 'approved', 'rejected', 'delegated'
    )),
    
    -- Response
    approved_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    comments TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =================================================================
-- COMMUNICATION AND COLLABORATION
-- =================================================================

-- Activities and communications log
CREATE TABLE activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id), -- Who performed the activity
    
    -- Context - what this activity relates to
    related_to_type VARCHAR(50) NOT NULL CHECK (related_to_type IN (
        'candidate', 'application', 'requisition', 'interview', 'offer'
    )),
    related_to_id UUID NOT NULL,
    
    -- Activity details
    activity_type VARCHAR(50) NOT NULL CHECK (activity_type IN (
        'note', 'email', 'call', 'meeting', 'task', 'system_event', 'status_change'
    )),
    subject VARCHAR(255),
    content TEXT,
    
    -- Metadata
    metadata JSONB DEFAULT '{}', -- Email headers, call duration, etc.
    is_system_generated BOOLEAN DEFAULT false,
    visibility VARCHAR(50) DEFAULT 'team' CHECK (visibility IN ('private', 'team', 'hiring_team', 'all')),
    
    -- Task specific fields
    task_due_date DATE,
    task_assignee_id UUID REFERENCES users(id),
    task_completed BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Email templates for automated communications
CREATE TABLE email_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_name VARCHAR(255) NOT NULL,
    description TEXT,
    department_id UUID REFERENCES departments(id), -- Department-specific templates
    
    -- Template content
    subject_template VARCHAR(255) NOT NULL,
    body_template TEXT NOT NULL,
    
    -- Template configuration
    template_type VARCHAR(50) CHECK (template_type IN (
        'application_received', 'rejection', 'interview_invitation', 
        'interview_reminder', 'offer_letter', 'welcome'
    )),
    trigger_event VARCHAR(50), -- When to auto-send
    
    -- Personalization
    available_variables JSONB DEFAULT '[]', -- List of template variables
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    is_default BOOLEAN DEFAULT false,
    
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =================================================================
-- DUPLICATE DETECTION (Internal Employee Scenarios)
-- =================================================================

-- Handle employees applying for internal positions
CREATE TABLE internal_mobility (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES users(id),
    application_id UUID NOT NULL REFERENCES applications(id),
    
    -- Current role information
    current_department_id UUID REFERENCES departments(id),
    current_title VARCHAR(255),
    current_manager_id UUID REFERENCES users(id),
    current_salary DECIMAL(12,2),
    
    -- Internal mobility details
    mobility_type VARCHAR(50) CHECK (mobility_type IN ('transfer', 'promotion', 'lateral_move', 'return')),
    requires_backfill BOOLEAN DEFAULT true,
    manager_approval_required BOOLEAN DEFAULT true,
    
    -- Approvals
    current_manager_approved BOOLEAN DEFAULT false,
    current_manager_approved_at TIMESTAMP WITH TIME ZONE,
    hr_approved BOOLEAN DEFAULT false,
    hr_approved_at TIMESTAMP WITH TIME ZONE,
    
    -- Timeline
    proposed_transition_date DATE,
    notice_period_days INTEGER DEFAULT 14,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =================================================================
-- ANALYTICS AND REPORTING
-- =================================================================

-- Recruiting metrics view
CREATE VIEW recruiting_metrics AS
SELECT 
    r.id as requisition_id,
    r.job_title,
    d.name as department,
    r.created_at as req_created,
    COUNT(a.id) as total_applications,
    COUNT(a.id) FILTER (WHERE a.application_status = 'hired') as hires_made,
    COUNT(a.id) FILTER (WHERE a.application_status IN ('interviewing', 'offer')) as active_candidates,
    AVG(EXTRACT(days FROM (CURRENT_TIMESTAMP - a.applied_at))) as avg_days_in_process,
    COUNT(DISTINCT i.id) as total_interviews_scheduled
FROM job_requisitions r
LEFT JOIN applications a ON r.id = a.requisition_id
LEFT JOIN interviews i ON a.id = i.application_id
LEFT JOIN departments d ON r.department_id = d.id
WHERE r.requisition_status = 'open'
GROUP BY r.id, r.job_title, d.name, r.created_at;

-- Interviewer performance
CREATE VIEW interviewer_performance AS
SELECT 
    u.id as interviewer_id,
    u.first_name || ' ' || u.last_name as interviewer_name,
    COUNT(ip.id) as interviews_conducted,
    COUNT(ip.id) FILTER (WHERE ip.attendance_status = 'attended') as interviews_attended,
    COUNT(ip.id) FILTER (WHERE ip.feedback_submitted_at IS NOT NULL) as feedback_submitted,
    AVG(CASE 
        WHEN ip.individual_recommendation = 'strong_hire' THEN 5
        WHEN ip.individual_recommendation = 'hire' THEN 4
        WHEN ip.individual_recommendation = 'no_hire' THEN 2
        WHEN ip.individual_recommendation = 'strong_no_hire' THEN 1
        ELSE 3 
    END) as avg_recommendation_score
FROM users u
JOIN interview_participants ip ON u.id = ip.user_id AND ip.role = 'interviewer'
WHERE ip.created_at >= CURRENT_DATE - INTERVAL '90 days'
GROUP BY u.id, u.first_name, u.last_name;

-- =================================================================
-- INDEXES FOR PERFORMANCE
-- =================================================================

-- Core entity indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_department ON users(department_id);
CREATE INDEX idx_candidates_status ON candidates(candidate_status);
CREATE INDEX idx_requisitions_department ON job_requisitions(department_id);
CREATE INDEX idx_requisitions_status ON job_requisitions(requisition_status);
CREATE INDEX idx_applications_candidate_req ON applications(candidate_id, requisition_id);
CREATE INDEX idx_applications_status ON applications(application_status);
CREATE INDEX idx_interviews_scheduled ON interviews(scheduled_at);
CREATE INDEX idx_activities_related_to ON activities(related_to_type, related_to_id);

-- Search indexes
CREATE INDEX idx_candidates_search ON candidates USING GIN(to_tsvector('english', 
    headline || ' ' || summary));
CREATE INDEX idx_requisitions_search ON job_requisitions USING GIN(to_tsvector('english', 
    job_title || ' ' || job_description));

-- Time-based indexes for reporting
CREATE INDEX idx_applications_applied_at ON applications(applied_at);
CREATE INDEX idx_interviews_created_at ON interviews(created_at);
CREATE INDEX idx_offers_created_at ON offers(created_at);