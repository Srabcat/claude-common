-- =================================================================
-- RECRUITING AGENCY ATS SCHEMA (Specialized)
-- Optimized for recruiting agencies like Bullhorn/RecruiterFlow
-- Focus: Client management, candidate sourcing, placements, commissions
-- =================================================================

-- =================================================================
-- CORE AGENCY TABLES
-- =================================================================

-- Agency configuration
CREATE TABLE agency_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agency_name VARCHAR(255) NOT NULL,
    agency_type VARCHAR(50) CHECK (agency_type IN ('staffing', 'executive_search', 'contingency', 'retained')),
    specializations JSONB DEFAULT '[]', -- ["technology", "finance", "healthcare"]
    default_commission_rate DECIMAL(5,2) DEFAULT 20.00,
    billing_settings JSONB DEFAULT '{}',
    compliance_settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =================================================================
-- PEOPLE MANAGEMENT (Users, Candidates, Contacts)
-- =================================================================

-- All people in the system (recruiters, candidates, client contacts)
CREATE TABLE people (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(50),
    mobile VARCHAR(50),
    linkedin_url VARCHAR(500),
    personal_email VARCHAR(255), -- For candidates
    address JSONB, -- {street, city, state, country, postal_code}
    birth_date DATE,
    ssn_last4 VARCHAR(4), -- For compliance/verification
    emergency_contact JSONB,
    notes TEXT,
    tags JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES people(id)
);

-- Person roles (one person can have multiple roles)
CREATE TABLE person_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    person_id UUID NOT NULL REFERENCES people(id) ON DELETE CASCADE,
    role_type VARCHAR(50) NOT NULL CHECK (role_type IN ('recruiter', 'candidate', 'client_contact', 'admin', 'manager')),
    is_active BOOLEAN DEFAULT true,
    permissions JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =================================================================
-- CANDIDATE MANAGEMENT (Specialized for Agency Use)
-- =================================================================

-- Enhanced candidate profiles for agency recruiting
CREATE TABLE candidates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    person_id UUID NOT NULL REFERENCES people(id) ON DELETE CASCADE,
    recruiter_id UUID REFERENCES people(id), -- Owning recruiter
    candidate_status VARCHAR(50) DEFAULT 'active' CHECK (candidate_status IN ('active', 'inactive', 'placed', 'do_not_contact', 'blacklist')),
    source VARCHAR(100), -- How they were found
    source_details JSONB,
    
    -- Career information
    current_company VARCHAR(255),
    current_title VARCHAR(255),
    current_salary DECIMAL(12,2),
    current_salary_currency VARCHAR(10) DEFAULT 'USD',
    desired_salary DECIMAL(12,2),
    desired_salary_currency VARCHAR(10) DEFAULT 'USD',
    
    -- Availability and preferences
    availability_date DATE,
    open_to_relocation BOOLEAN DEFAULT false,
    willing_to_travel BOOLEAN DEFAULT false,
    remote_work_preference VARCHAR(50) CHECK (remote_work_preference IN ('onsite', 'hybrid', 'remote', 'flexible')),
    preferred_locations JSONB DEFAULT '[]',
    
    -- Skills and experience
    total_experience_years DECIMAL(4,2),
    skills JSONB DEFAULT '[]',
    certifications JSONB DEFAULT '[]',
    languages JSONB DEFAULT '[]',
    
    -- Recruiting specific
    resume_url VARCHAR(500),
    portfolio_url VARCHAR(500),
    availability_for_calls VARCHAR(100), -- Best times to reach
    interview_availability JSONB, -- Available time slots
    salary_negotiable BOOLEAN DEFAULT true,
    relocation_assistance_needed BOOLEAN DEFAULT false,
    
    -- Tracking and compliance
    work_authorization VARCHAR(100),
    visa_status VARCHAR(100),
    security_clearance VARCHAR(100),
    willing_to_background_check BOOLEAN DEFAULT true,
    
    -- Agency workflow
    last_contacted_at TIMESTAMP WITH TIME ZONE,
    next_followup_date DATE,
    marketing_consent BOOLEAN DEFAULT false,
    
    -- Duplicate handling
    master_record_id UUID REFERENCES candidates(id), -- Points to primary record if duplicate
    duplicate_confidence DECIMAL(5,2), -- Confidence this is a duplicate
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Candidate work history (detailed for agency placements)
CREATE TABLE candidate_work_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
    company_name VARCHAR(255) NOT NULL,
    company_size VARCHAR(50), -- "1-10", "11-50", "51-200", etc.
    job_title VARCHAR(255) NOT NULL,
    job_level VARCHAR(50), -- "junior", "mid", "senior", "lead", "manager", "director"
    industry VARCHAR(100),
    start_date DATE NOT NULL,
    end_date DATE,
    is_current BOOLEAN DEFAULT false,
    salary DECIMAL(12,2),
    salary_currency VARCHAR(10) DEFAULT 'USD',
    location VARCHAR(255),
    employment_type VARCHAR(50), -- "full_time", "contract", "part_time"
    reason_for_leaving TEXT,
    achievements TEXT,
    technologies_used JSONB DEFAULT '[]',
    verified BOOLEAN DEFAULT false, -- Reference checked
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Candidate references
CREATE TABLE candidate_references (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
    reference_name VARCHAR(255) NOT NULL,
    reference_title VARCHAR(255),
    reference_company VARCHAR(255),
    reference_phone VARCHAR(50),
    reference_email VARCHAR(255),
    relationship VARCHAR(100), -- "manager", "colleague", "client"
    can_contact BOOLEAN DEFAULT true,
    contacted_at TIMESTAMP WITH TIME ZONE,
    reference_notes TEXT,
    reference_rating INTEGER CHECK (reference_rating >= 1 AND reference_rating <= 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =================================================================
-- CLIENT MANAGEMENT
-- =================================================================

-- Client companies
CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name VARCHAR(255) NOT NULL,
    industry VARCHAR(100),
    company_size VARCHAR(50),
    website VARCHAR(255),
    description TEXT,
    headquarters_location VARCHAR(255),
    
    -- Business information
    annual_revenue DECIMAL(15,2),
    revenue_currency VARCHAR(10) DEFAULT 'USD',
    public_company BOOLEAN DEFAULT false,
    parent_company VARCHAR(255),
    
    -- Client status and relationship
    client_status VARCHAR(50) DEFAULT 'prospect' CHECK (client_status IN ('prospect', 'active', 'inactive', 'former', 'blacklist')),
    client_tier VARCHAR(50) DEFAULT 'standard' CHECK (client_tier IN ('platinum', 'gold', 'silver', 'standard')),
    primary_recruiter_id UUID REFERENCES people(id),
    
    -- Contract and billing
    master_service_agreement BOOLEAN DEFAULT false,
    preferred_payment_terms VARCHAR(50) DEFAULT 'net_30',
    credit_limit DECIMAL(12,2),
    
    -- Preferences
    preferred_communication JSONB DEFAULT '{}', -- Email, phone preferences
    meeting_preferences JSONB DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Client contacts (people who work at client companies)
CREATE TABLE client_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    person_id UUID NOT NULL REFERENCES people(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    job_title VARCHAR(255),
    department VARCHAR(100),
    decision_maker BOOLEAN DEFAULT false,
    hiring_authority BOOLEAN DEFAULT false,
    contact_type VARCHAR(50) CHECK (contact_type IN ('hiring_manager', 'hr', 'executive', 'procurement', 'other')),
    preferred_contact_method VARCHAR(50) DEFAULT 'email',
    is_primary_contact BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =================================================================
-- JOB ORDERS AND REQUIREMENTS
-- =================================================================

-- Job orders from clients
CREATE TABLE job_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    hiring_manager_id UUID REFERENCES client_contacts(id),
    assigned_recruiter_id UUID REFERENCES people(id),
    
    -- Job details
    job_title VARCHAR(255) NOT NULL,
    job_description TEXT NOT NULL,
    required_skills JSONB DEFAULT '[]',
    preferred_skills JSONB DEFAULT '[]',
    minimum_experience_years INTEGER,
    education_requirements TEXT,
    certifications_required JSONB DEFAULT '[]',
    
    -- Employment terms
    employment_type VARCHAR(50) CHECK (employment_type IN ('full_time', 'contract', 'contract_to_hire', 'part_time')),
    contract_duration INTEGER, -- months for contract roles
    salary_min DECIMAL(12,2),
    salary_max DECIMAL(12,2),
    salary_currency VARCHAR(10) DEFAULT 'USD',
    benefits TEXT,
    
    -- Location and remote work
    work_location VARCHAR(255),
    remote_work_allowed BOOLEAN DEFAULT false,
    travel_requirements VARCHAR(100),
    relocation_assistance BOOLEAN DEFAULT false,
    
    -- Order details
    order_type VARCHAR(50) CHECK (order_type IN ('contingency', 'retained', 'exclusive', 'non_exclusive')),
    number_of_positions INTEGER DEFAULT 1,
    priority_level VARCHAR(20) DEFAULT 'medium' CHECK (priority_level IN ('low', 'medium', 'high', 'urgent')),
    
    -- Timeline
    start_date DATE,
    target_fill_date DATE,
    order_expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Commercial terms
    fee_percentage DECIMAL(5,2), -- Commission rate for this job
    fee_structure VARCHAR(50) DEFAULT 'percentage', -- 'percentage', 'flat_fee'
    flat_fee_amount DECIMAL(12,2),
    payment_terms VARCHAR(50) DEFAULT 'net_30',
    guarantee_period_days INTEGER DEFAULT 90, -- Replacement guarantee
    
    -- Status and workflow
    order_status VARCHAR(50) DEFAULT 'open' CHECK (order_status IN ('open', 'on_hold', 'filled', 'cancelled', 'expired')),
    positions_filled INTEGER DEFAULT 0,
    
    -- Internal notes
    client_notes TEXT,
    internal_notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =================================================================
-- CANDIDATE SUBMISSIONS AND TRACKING
-- =================================================================

-- Candidate submissions to job orders
CREATE TABLE submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
    job_order_id UUID NOT NULL REFERENCES job_orders(id) ON DELETE CASCADE,
    recruiter_id UUID NOT NULL REFERENCES people(id),
    
    -- Submission details
    submission_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    candidate_rate DECIMAL(12,2), -- For contract positions
    candidate_salary_expectation DECIMAL(12,2),
    
    -- Client feedback and status
    client_status VARCHAR(50) DEFAULT 'submitted' CHECK (client_status IN (
        'submitted', 'client_reviewing', 'phone_screen', 'interview_scheduled', 
        'interviewing', 'client_interested', 'offer_pending', 'offer_made', 
        'offer_accepted', 'hired', 'rejected', 'withdrawn'
    )),
    
    -- Interview tracking
    phone_screen_completed BOOLEAN DEFAULT false,
    onsite_interview_completed BOOLEAN DEFAULT false,
    client_feedback TEXT,
    rejection_reason TEXT,
    
    -- Offer details
    offer_amount DECIMAL(12,2),
    offer_currency VARCHAR(10) DEFAULT 'USD',
    offer_made_date DATE,
    offer_expiry_date DATE,
    offer_accepted_date DATE,
    
    -- Commission calculation
    billable_amount DECIMAL(12,2), -- What client pays
    candidate_pay DECIMAL(12,2),   -- What candidate gets (for contracts)
    gross_margin DECIMAL(12,2),    -- Agency margin
    commission_rate DECIMAL(5,2),  -- Recruiter commission %
    recruiter_commission DECIMAL(12,2), -- Calculated commission
    
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Prevent duplicate submissions
    UNIQUE(candidate_id, job_order_id)
);

-- =================================================================
-- PLACEMENTS AND ONGOING MANAGEMENT
-- =================================================================

-- Successful placements
CREATE TABLE placements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
    candidate_id UUID NOT NULL REFERENCES candidates(id),
    job_order_id UUID NOT NULL REFERENCES job_orders(id),
    recruiter_id UUID NOT NULL REFERENCES people(id),
    client_id UUID NOT NULL REFERENCES clients(id),
    
    -- Placement details
    placement_type VARCHAR(50) CHECK (placement_type IN ('permanent', 'contract', 'contract_to_hire')),
    start_date DATE NOT NULL,
    end_date DATE, -- For contracts
    
    -- Financial terms
    annual_salary DECIMAL(12,2), -- For permanent placements
    hourly_rate DECIMAL(8,2),    -- For contract placements
    salary_currency VARCHAR(10) DEFAULT 'USD',
    
    -- Agency fees and commissions
    placement_fee DECIMAL(12,2) NOT NULL,
    fee_percentage DECIMAL(5,2),
    payment_schedule VARCHAR(100), -- "net_30", "split_payment", etc.
    
    -- Guarantee terms
    guarantee_period_days INTEGER DEFAULT 90,
    replacement_guarantee BOOLEAN DEFAULT true,
    
    -- Status tracking
    placement_status VARCHAR(50) DEFAULT 'active' CHECK (placement_status IN ('active', 'completed', 'terminated', 'converted')),
    termination_date DATE,
    termination_reason TEXT,
    
    -- Performance tracking
    client_satisfaction_rating INTEGER CHECK (client_satisfaction_rating >= 1 AND client_satisfaction_rating <= 5),
    candidate_satisfaction_rating INTEGER CHECK (candidate_satisfaction_rating >= 1 AND candidate_satisfaction_rating <= 5),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =================================================================
-- COMMISSION AND BILLING MANAGEMENT
-- =================================================================

-- Individual commission records
CREATE TABLE commissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    placement_id UUID NOT NULL REFERENCES placements(id) ON DELETE CASCADE,
    recruiter_id UUID NOT NULL REFERENCES people(id),
    
    -- Commission details
    commission_type VARCHAR(50) CHECK (commission_type IN ('placement', 'split', 'override', 'bonus')),
    gross_commission DECIMAL(12,2) NOT NULL,
    net_commission DECIMAL(12,2) NOT NULL,
    commission_percentage DECIMAL(5,2),
    
    -- Payment tracking
    due_date DATE,
    payment_status VARCHAR(50) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'disputed', 'cancelled')),
    paid_date DATE,
    payment_method VARCHAR(50),
    
    -- Splits (for team commissions)
    split_with_recruiter_id UUID REFERENCES people(id),
    split_percentage DECIMAL(5,2),
    
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Client invoices
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id),
    placement_id UUID REFERENCES placements(id), -- Can be null for other services
    
    -- Invoice details
    invoice_number VARCHAR(100) UNIQUE NOT NULL,
    invoice_date DATE NOT NULL,
    due_date DATE NOT NULL,
    
    -- Financial
    subtotal DECIMAL(12,2) NOT NULL,
    tax_amount DECIMAL(12,2) DEFAULT 0,
    total_amount DECIMAL(12,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    
    -- Status
    invoice_status VARCHAR(50) DEFAULT 'draft' CHECK (invoice_status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled')),
    payment_date DATE,
    
    -- Details
    description TEXT,
    terms TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =================================================================
-- COMMUNICATION AND ACTIVITY TRACKING
-- =================================================================

-- All interactions and activities
CREATE TABLE activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES people(id), -- Who performed the activity
    
    -- What the activity relates to
    related_to_type VARCHAR(50) NOT NULL CHECK (related_to_type IN ('candidate', 'client', 'job_order', 'placement', 'submission')),
    related_to_id UUID NOT NULL,
    
    -- Activity details
    activity_type VARCHAR(50) NOT NULL CHECK (activity_type IN ('call', 'email', 'meeting', 'note', 'task', 'interview')),
    subject VARCHAR(255),
    description TEXT,
    
    -- Scheduling
    scheduled_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    duration_minutes INTEGER,
    
    -- Call/email specific
    direction VARCHAR(20) CHECK (direction IN ('inbound', 'outbound')), -- For calls/emails
    outcome VARCHAR(100), -- Call outcome
    
    -- Task specific
    priority VARCHAR(20) CHECK (priority IN ('low', 'medium', 'high')),
    assigned_to UUID REFERENCES people(id),
    due_date DATE,
    
    is_private BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =================================================================
-- DUPLICATE CANDIDATE DETECTION AND MANAGEMENT
-- =================================================================

-- Advanced duplicate detection for recruiting agencies
CREATE TABLE candidate_duplicates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    primary_candidate_id UUID NOT NULL REFERENCES candidates(id),
    duplicate_candidate_id UUID NOT NULL REFERENCES candidates(id),
    
    -- Matching details
    match_type VARCHAR(50) CHECK (match_type IN ('email', 'phone', 'name', 'resume', 'linkedin')),
    confidence_score DECIMAL(5,2) NOT NULL, -- 0-100 confidence
    matching_fields JSONB, -- Which fields matched
    
    -- Resolution
    status VARCHAR(50) DEFAULT 'detected' CHECK (status IN ('detected', 'confirmed', 'merged', 'false_positive')),
    resolved_by UUID REFERENCES people(id),
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolution_notes TEXT,
    
    -- Auto-detection metadata
    detection_algorithm VARCHAR(100), -- Which algorithm found this
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Prevent duplicate detection records
    UNIQUE(primary_candidate_id, duplicate_candidate_id)
);

-- =================================================================
-- REPORTING AND ANALYTICS VIEWS
-- =================================================================

-- Recruiter performance metrics
CREATE VIEW recruiter_performance AS
SELECT 
    p.id as recruiter_id,
    p.first_name || ' ' || p.last_name as recruiter_name,
    COUNT(DISTINCT pl.id) as total_placements,
    COUNT(DISTINCT jo.id) as jobs_worked,
    COUNT(DISTINCT s.id) as total_submissions,
    ROUND(COUNT(DISTINCT pl.id)::decimal / NULLIF(COUNT(DISTINCT s.id), 0) * 100, 2) as conversion_rate,
    SUM(c.net_commission) as total_commissions_ytd,
    AVG(EXTRACT(days FROM (pl.start_date - s.submission_date))) as avg_time_to_placement
FROM people p
JOIN person_roles pr ON p.id = pr.person_id AND pr.role_type = 'recruiter'
LEFT JOIN submissions s ON p.id = s.recruiter_id
LEFT JOIN placements pl ON s.id = pl.submission_id AND pl.placement_status = 'active'
LEFT JOIN commissions c ON pl.id = c.placement_id AND c.payment_status = 'paid'
    AND EXTRACT(year FROM c.created_at) = EXTRACT(year FROM CURRENT_DATE)
GROUP BY p.id, p.first_name, p.last_name;

-- Client activity summary
CREATE VIEW client_summary AS
SELECT 
    c.id as client_id,
    c.company_name,
    c.client_status,
    COUNT(DISTINCT jo.id) as total_job_orders,
    COUNT(DISTINCT jo.id) FILTER (WHERE jo.order_status = 'open') as open_orders,
    COUNT(DISTINCT pl.id) as total_placements,
    SUM(pl.placement_fee) as total_fees_ytd,
    MAX(jo.created_at) as last_order_date
FROM clients c
LEFT JOIN job_orders jo ON c.id = jo.client_id
LEFT JOIN placements pl ON jo.id = pl.job_order_id 
    AND EXTRACT(year FROM pl.created_at) = EXTRACT(year FROM CURRENT_DATE)
GROUP BY c.id, c.company_name, c.client_status;

-- =================================================================
-- INDEXES FOR PERFORMANCE
-- =================================================================

-- Core lookups
CREATE INDEX idx_people_email ON people(email);
CREATE INDEX idx_candidates_recruiter ON candidates(recruiter_id);
CREATE INDEX idx_candidates_status ON candidates(candidate_status);
CREATE INDEX idx_job_orders_client ON job_orders(client_id);
CREATE INDEX idx_job_orders_status ON job_orders(order_status);
CREATE INDEX idx_submissions_candidate_job ON submissions(candidate_id, job_order_id);
CREATE INDEX idx_placements_recruiter ON placements(recruiter_id);
CREATE INDEX idx_activities_related_to ON activities(related_to_type, related_to_id);
CREATE INDEX idx_commissions_recruiter ON commissions(recruiter_id);

-- Duplicate detection
CREATE INDEX idx_people_name ON people(first_name, last_name);
CREATE INDEX idx_people_phone ON people(phone);
CREATE INDEX idx_candidate_duplicates_confidence ON candidate_duplicates(confidence_score);

-- Full-text search
CREATE INDEX idx_candidates_search ON candidates USING GIN(to_tsvector('english', 
    (SELECT first_name || ' ' || last_name FROM people WHERE id = person_id)));
CREATE INDEX idx_job_orders_search ON job_orders USING GIN(to_tsvector('english', job_title || ' ' || job_description));