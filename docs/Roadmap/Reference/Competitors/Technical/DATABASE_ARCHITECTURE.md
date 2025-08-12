# Database Architecture & Schema Design

## Core Entity Relationships

### Entity Relationship Overview
```
User/Organization Structure:
Organization → Users → Permissions → Roles

Recruiting Workflow:
Organization → Jobs → Submissions → Interviews → Candidates
                ↓
Agency → Recruiter → Submissions

Configuration:
Organization → Settings → Workflows → Templates
```

## 1. User & Organization Management

### Organizations Table
```sql
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  type ENUM('platform_admin', 'employer', 'agency') NOT NULL,
  domain VARCHAR(255), -- for email domain verification
  subscription_tier ENUM('free', 'basic', 'premium', 'enterprise') DEFAULT 'free',
  settings JSONB DEFAULT '{}', -- org-specific configurations
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);
```

### Users Table  
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  role ENUM('platform_admin', 'agency_recruiter', 'employer_recruiter', 'hiring_manager', 'interviewer') NOT NULL,
  permissions JSONB DEFAULT '{}', -- role-based permissions
  profile JSONB DEFAULT '{}', -- additional profile data
  is_active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Permissions System (RBAC)
```sql
CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  permissions JSONB NOT NULL -- array of permission strings
);

CREATE TABLE user_roles (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
  granted_by UUID REFERENCES users(id),
  granted_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, role_id)
);

-- Permission examples in JSONB:
-- ["candidates.read", "candidates.write", "jobs.read", "interviews.manage"]
```

## 2. Jobs & Positions

### Jobs Table (Enhanced from Research)
```sql
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id), -- hiring company
  title VARCHAR(255) NOT NULL,
  department VARCHAR(100),
  description TEXT NOT NULL,
  requirements TEXT[],
  nice_to_have TEXT[],
  responsibilities TEXT[],
  
  -- Location & Work Style
  location JSONB, -- {city, state, country, remote, timezone}
  work_type ENUM('full_time', 'part_time', 'contract', 'internship') DEFAULT 'full_time',
  remote_policy ENUM('office', 'remote', 'hybrid') DEFAULT 'office',
  
  -- Compensation
  salary_min INTEGER,
  salary_max INTEGER,
  currency CHAR(3) DEFAULT 'USD',
  equity_offered BOOLEAN DEFAULT false,
  equity_range JSONB, -- {min, max, percentage}
  
  -- Hiring Process
  hiring_manager_id UUID REFERENCES users(id),
  recruiters UUID[], -- array of user IDs
  hiring_stages JSONB DEFAULT '["applied", "screening", "interview", "offer", "hired"]',
  custom_fields JSONB DEFAULT '{}',
  
  -- Status & Metadata
  status ENUM('draft', 'active', 'paused', 'filled', 'cancelled') DEFAULT 'draft',
  priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
  target_start_date DATE,
  posted_at TIMESTAMPTZ,
  filled_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Job Collaborators (Multiple Agencies/Recruiters per Job)
```sql
CREATE TABLE job_collaborators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  collaborator_id UUID REFERENCES organizations(id), -- agency
  collaborator_type ENUM('agency', 'recruiter', 'hiring_manager') NOT NULL,
  permissions JSONB DEFAULT '{}', -- what they can do with this job
  fee_structure JSONB, -- commission, rates, terms
  status ENUM('invited', 'active', 'paused', 'removed') DEFAULT 'invited',
  invited_by UUID REFERENCES users(id),
  added_at TIMESTAMPTZ DEFAULT NOW()
);
```

## 3. Candidates & Profiles

### Candidates Table (Comprehensive Schema)
```sql
CREATE TABLE candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Personal Information
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(50),
  location JSONB, -- {city, state, country, timezone}
  
  -- Professional Profile
  current_title VARCHAR(255),
  years_experience INTEGER,
  skills TEXT[],
  summary TEXT,
  linkedin_url VARCHAR(500),
  portfolio_urls TEXT[],
  
  -- Documents & Files
  resume_url VARCHAR(500),
  resume_parsed_data JSONB, -- extracted resume data
  documents JSONB DEFAULT '[]', -- array of document objects
  
  -- Source & Attribution
  source VARCHAR(100), -- how they entered system
  source_details JSONB, -- additional source context
  referrer_id UUID REFERENCES users(id), -- who referred them
  
  -- Availability & Preferences
  availability_status ENUM('active', 'passive', 'not_looking') DEFAULT 'active',
  desired_salary_min INTEGER,
  desired_salary_max INTEGER,
  remote_preference ENUM('office', 'remote', 'hybrid', 'no_preference'),
  
  -- Privacy & Compliance
  consent_marketing BOOLEAN DEFAULT false,
  consent_data_processing BOOLEAN DEFAULT true,
  gdpr_compliant BOOLEAN DEFAULT true,
  
  -- System Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_contacted_at TIMESTAMPTZ
);
```

### Work Experience & Education
```sql
CREATE TABLE candidate_experience (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE,
  company VARCHAR(255) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE, -- NULL for current position
  is_current BOOLEAN DEFAULT false,
  location VARCHAR(255),
  achievements TEXT[],
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
  achievements TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## 4. Submissions (Agency → Job Applications)

### Submissions Table (Core of ATS Workflow)
```sql
CREATE TABLE submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Core Relationships
  candidate_id UUID REFERENCES candidates(id) NOT NULL,
  job_id UUID REFERENCES jobs(id) NOT NULL,
  submitted_by_org UUID REFERENCES organizations(id), -- agency or direct
  submitted_by_user UUID REFERENCES users(id), -- specific recruiter
  
  -- Submission Details
  submission_type ENUM('agency_submission', 'direct_application', 'internal_referral', 'platform_match') NOT NULL,
  source_details JSONB, -- how submission originated
  cover_letter TEXT,
  custom_responses JSONB, -- answers to job-specific questions
  
  -- Current Status & Stage
  current_stage VARCHAR(100) DEFAULT 'applied', -- matches job.hiring_stages
  status ENUM('active', 'withdrawn', 'rejected', 'hired') DEFAULT 'active',
  rejection_reason VARCHAR(255),
  rejection_feedback TEXT,
  
  -- Timeline & Priority
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  last_stage_change_at TIMESTAMPTZ DEFAULT NOW(),
  priority_score INTEGER DEFAULT 0, -- for ranking/sorting
  
  -- Agency/Fee Information
  fee_structure JSONB, -- commission details if agency submission
  contract_terms JSONB, -- specific terms for this submission
  
  -- Analytics & Tracking
  views_by_employer INTEGER DEFAULT 0,
  last_viewed_at TIMESTAMPTZ,
  time_in_current_stage INTERVAL, -- calculated field
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(candidate_id, job_id) -- prevent duplicate applications
);
```

### Submission Stage History (Audit Trail)
```sql
CREATE TABLE submission_stage_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID REFERENCES submissions(id) ON DELETE CASCADE,
  from_stage VARCHAR(100),
  to_stage VARCHAR(100) NOT NULL,
  changed_by_user UUID REFERENCES users(id),
  reason VARCHAR(255),
  notes TEXT,
  duration_in_previous_stage INTERVAL,
  changed_at TIMESTAMPTZ DEFAULT NOW()
);
```

## 5. Interview Management

### Interviews Table (Comprehensive)
```sql
CREATE TABLE interviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Core Relationships
  submission_id UUID REFERENCES submissions(id) NOT NULL,
  candidate_id UUID REFERENCES candidates(id) NOT NULL,
  job_id UUID REFERENCES jobs(id) NOT NULL,
  
  -- Interview Details
  title VARCHAR(255) NOT NULL,
  type ENUM('phone', 'video', 'in_person', 'technical', 'panel', 'culture_fit') NOT NULL,
  stage VARCHAR(100) NOT NULL, -- e.g., 'phone_screen', 'technical_round', 'final'
  round_number INTEGER DEFAULT 1,
  
  -- Scheduling
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  timezone VARCHAR(50),
  location VARCHAR(255), -- for in-person
  video_link VARCHAR(500), -- for remote
  calendar_event_id VARCHAR(255), -- external calendar integration
  
  -- Participants
  interviewers UUID[] NOT NULL, -- array of user IDs
  coordinator_id UUID REFERENCES users(id),
  
  -- Preparation
  interview_guide TEXT,
  questions_to_ask TEXT[],
  evaluation_criteria JSONB, -- scoring rubric
  preparation_notes TEXT,
  
  -- Execution & Status
  status ENUM('scheduled', 'in_progress', 'completed', 'cancelled', 'no_show') DEFAULT 'scheduled',
  actual_start_time TIMESTAMPTZ,
  actual_end_time TIMESTAMPTZ,
  
  -- Follow-up
  thank_you_sent BOOLEAN DEFAULT false,
  feedback_due_date DATE,
  next_steps TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Interview Feedback & Evaluation
```sql
CREATE TABLE interview_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  interview_id UUID REFERENCES interviews(id) ON DELETE CASCADE,
  interviewer_id UUID REFERENCES users(id) NOT NULL,
  
  -- Evaluation Scores
  overall_rating INTEGER CHECK (overall_rating >= 1 AND overall_rating <= 5),
  criteria_scores JSONB, -- {technical: 4, communication: 5, culture_fit: 3}
  recommendation ENUM('strong_hire', 'hire', 'no_hire', 'strong_no_hire') NOT NULL,
  
  -- Detailed Feedback
  strengths TEXT,
  concerns TEXT,
  detailed_notes TEXT,
  follow_up_questions TEXT[],
  
  -- Next Steps
  recommended_next_steps TEXT,
  additional_rounds_needed BOOLEAN DEFAULT false,
  
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## 6. Configuration & Settings

### Organization Settings
```sql
CREATE TABLE organization_settings (
  organization_id UUID REFERENCES organizations(id) PRIMARY KEY,
  
  -- Branding
  logo_url VARCHAR(500),
  brand_colors JSONB, -- {primary, secondary, accent}
  company_description TEXT,
  
  -- Workflow Settings
  default_hiring_stages TEXT[] DEFAULT ARRAY['applied', 'screening', 'interview', 'offer', 'hired'],
  approval_workflows JSONB, -- stage advancement rules
  notification_preferences JSONB,
  
  -- Integration Settings
  calendar_integration JSONB, -- Google/Outlook settings
  email_settings JSONB, -- SMTP, templates
  ats_integrations JSONB, -- external ATS connections
  
  -- Privacy & Compliance
  data_retention_days INTEGER DEFAULT 1825, -- 5 years
  gdpr_enabled BOOLEAN DEFAULT true,
  audit_logging BOOLEAN DEFAULT true,
  
  -- Feature Flags
  features_enabled TEXT[], -- array of feature names
  custom_fields_schema JSONB, -- user-defined fields
  
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### User Preferences
```sql
CREATE TABLE user_preferences (
  user_id UUID REFERENCES users(id) PRIMARY KEY,
  
  -- Interface Preferences
  theme ENUM('light', 'dark', 'system') DEFAULT 'system',
  language CHAR(2) DEFAULT 'en',
  timezone VARCHAR(50),
  date_format VARCHAR(20) DEFAULT 'MM/DD/YYYY',
  
  -- Notification Settings
  email_notifications JSONB DEFAULT '{"daily_digest": true, "interview_reminders": true}',
  push_notifications JSONB DEFAULT '{}',
  notification_schedule JSONB, -- quiet hours, etc.
  
  -- Dashboard & Views
  default_dashboard_layout JSONB,
  saved_searches JSONB,
  column_preferences JSONB, -- table view customizations
  
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## 7. Analytics & Tracking Tables

### Activity Log (Audit Trail)
```sql
CREATE TABLE activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  organization_id UUID REFERENCES organizations(id),
  
  action VARCHAR(100) NOT NULL, -- 'candidate.view', 'submission.status_change'
  resource_type VARCHAR(50) NOT NULL, -- 'candidate', 'job', 'interview'
  resource_id UUID NOT NULL,
  
  details JSONB, -- action-specific details
  ip_address INET,
  user_agent TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Performance Metrics (Calculated)
```sql
CREATE TABLE performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  metric_type VARCHAR(100) NOT NULL, -- 'time_to_hire', 'source_performance'
  metric_period ENUM('daily', 'weekly', 'monthly', 'quarterly') NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  
  metrics JSONB NOT NULL, -- calculated metric values
  
  calculated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(organization_id, metric_type, metric_period, period_start)
);
```

## Implementation Recommendations

### Phase 1: Core Tables (Immediate MVP)
1. **User Management**: organizations, users, user_roles
2. **Core Entities**: jobs, candidates, submissions, interviews  
3. **Basic Settings**: organization_settings, user_preferences

### Phase 2: Enhanced Features (3-6 months)
1. **History Tracking**: submission_stage_history, activity_log
2. **Detailed Profiles**: candidate_experience, candidate_education
3. **Interview System**: interview_feedback, evaluation workflows

### Phase 3: Advanced Analytics (6-12 months)  
1. **Performance Tracking**: performance_metrics, advanced reporting
2. **Collaboration**: job_collaborators, multi-agency workflows
3. **Integration Support**: API-ready schema extensions

### Indexes & Performance
```sql
-- Critical indexes for performance
CREATE INDEX idx_submissions_job_status ON submissions(job_id, status);
CREATE INDEX idx_candidates_email ON candidates(email);
CREATE INDEX idx_interviews_scheduled_at ON interviews(scheduled_at);
CREATE INDEX idx_activity_log_created_at ON activity_log(created_at);
CREATE INDEX idx_users_organization_role ON users(organization_id, role);
```

This schema supports the multi-stakeholder collaboration that differentiates our platform while providing the foundation for advanced features later.