-- =================================================================
-- ATS CONFIGURATION DATA
-- Default configurations for different ATS use cases
-- =================================================================

-- =================================================================
-- TENANT TYPES CONFIGURATION
-- =================================================================

-- Sample tenant configurations for different use cases
INSERT INTO tenants (name, type, slug, settings, subscription_tier) VALUES
-- Employer ATS (like Greenhouse/Ashby)
('TechCorp', 'employer', 'techcorp', '{
    "features": ["structured_interviews", "offer_management", "onboarding", "analytics"],
    "integrations": ["slack", "greenhouse", "workday"],
    "hiring_stages": ["application", "phone_screen", "technical", "onsite", "offer", "hired"]
}', 'enterprise'),

-- Recruiting Agency (like Bullhorn/RecruiterFlow)
('Elite Recruiting', 'agency', 'elite-recruiting', '{
    "features": ["client_management", "commission_tracking", "candidate_sourcing", "placement_tracking"],
    "integrations": ["salesforce", "quickbooks", "linkedin_recruiter"],
    "specializations": ["technology", "finance", "healthcare"]
}', 'professional'),

-- Hiring Platform (like Paraform/Wellfound)
('TalentMarketplace', 'platform', 'talent-marketplace', '{
    "features": ["recruiter_network", "job_marketplace", "automated_matching", "commission_management"],
    "integrations": ["stripe", "docusign", "calendly"],
    "marketplace_type": "b2b_recruiter_network"
}', 'enterprise');

-- =================================================================
-- DEFAULT WORKFLOW TEMPLATES
-- =================================================================

-- Employer ATS workflow (structured hiring process)
INSERT INTO workflow_templates (tenant_id, name, description, type, is_default) VALUES
((SELECT id FROM tenants WHERE slug = 'techcorp'), 'Standard Tech Hiring', 'Standard hiring process for technical roles', 'hiring', true);

SET @employer_template_id = (SELECT id FROM workflow_templates WHERE name = 'Standard Tech Hiring');

INSERT INTO workflow_stages (template_id, name, description, stage_order, stage_type, sla_hours) VALUES
(@employer_template_id, 'Application Review', 'Initial resume and application review', 1, 'application', 24),
(@employer_template_id, 'Phone Screen', 'Brief phone/video screening call', 2, 'screening', 48),
(@employer_template_id, 'Technical Interview', 'Technical skills assessment', 3, 'interview', 72),
(@employer_template_id, 'Onsite/Final Interview', 'Final interview with team and manager', 4, 'interview', 96),
(@employer_template_id, 'Reference Check', 'Reference verification', 5, 'reference', 48),
(@employer_template_id, 'Offer', 'Job offer extended', 6, 'offer', 72),
(@employer_template_id, 'Hired', 'Candidate accepted and hired', 7, 'hired', 0);

-- Agency ATS workflow (client-focused placement process)
INSERT INTO workflow_templates (tenant_id, name, description, type, is_default) VALUES
((SELECT id FROM tenants WHERE slug = 'elite-recruiting'), 'Agency Placement Process', 'Standard placement process for agency recruiting', 'agency_placement', true);

SET @agency_template_id = (SELECT id FROM workflow_templates WHERE name = 'Agency Placement Process');

INSERT INTO workflow_stages (template_id, name, description, stage_order, stage_type, sla_hours) VALUES
(@agency_template_id, 'Candidate Sourcing', 'Find and qualify candidates', 1, 'screening', 72),
(@agency_template_id, 'Client Submission', 'Submit candidate to client', 2, 'application', 24),
(@agency_template_id, 'Client Interview', 'Client conducts interviews', 3, 'interview', 120),
(@agency_template_id, 'Offer Negotiation', 'Negotiate offer terms', 4, 'offer', 48),
(@agency_template_id, 'Placement', 'Successful placement made', 5, 'hired', 24);

-- Platform workflow (marketplace matching process)
INSERT INTO workflow_templates (tenant_id, name, description, type, is_default) VALUES
((SELECT id FROM tenants WHERE slug = 'talent-marketplace'), 'Platform Matching Process', 'Automated matching and placement process', 'hiring', true);

SET @platform_template_id = (SELECT id FROM workflow_templates WHERE name = 'Platform Matching Process');

INSERT INTO workflow_stages (template_id, name, description, stage_order, stage_type, auto_advance) VALUES
(@platform_template_id, 'Job Posted', 'Job posted to marketplace', 1, 'application', true),
(@platform_template_id, 'Recruiter Assigned', 'Recruiter takes on the job', 2, 'screening', false),
(@platform_template_id, 'Candidates Sourced', 'Candidates identified and screened', 3, 'screening', false),
(@platform_template_id, 'Client Review', 'Client reviews submitted candidates', 4, 'interview', false),
(@platform_template_id, 'Interview Process', 'Client conducts interviews', 5, 'interview', false),
(@platform_template_id, 'Placement Made', 'Successful hire completed', 6, 'hired', false);

-- =================================================================
-- SAMPLE INTERVIEW TEMPLATES
-- =================================================================

-- Technical interview template
INSERT INTO interview_templates (tenant_id, name, description, duration_minutes, interview_type, questions) VALUES
((SELECT id FROM tenants WHERE slug = 'techcorp'), 'Software Engineer Technical', 'Technical assessment for software engineers', 90, 'technical', '[
    {"category": "Coding", "question": "Implement a function to reverse a linked list", "weight": 40},
    {"category": "System Design", "question": "Design a URL shortening service", "weight": 30},
    {"category": "Problem Solving", "question": "How would you debug a performance issue in production?", "weight": 30}
]');

-- Cultural fit interview
INSERT INTO interview_templates (tenant_id, name, description, duration_minutes, interview_type, questions) VALUES
((SELECT id FROM tenants WHERE slug = 'techcorp'), 'Cultural Fit Interview', 'Assess cultural alignment and soft skills', 60, 'cultural', '[
    {"category": "Values", "question": "Tell me about a time you had to make a difficult decision", "weight": 25},
    {"category": "Teamwork", "question": "How do you handle conflict in a team setting?", "weight": 25},
    {"category": "Growth", "question": "What motivates you to do your best work?", "weight": 25},
    {"category": "Communication", "question": "Explain a complex technical concept to a non-technical person", "weight": 25}
]');

-- =================================================================
-- EMAIL TEMPLATES
-- =================================================================

INSERT INTO email_templates (tenant_id, name, subject, body, template_type, variables) VALUES
-- Application received template
((SELECT id FROM tenants WHERE slug = 'techcorp'), 'Application Received', 'Your application for {{job_title}}', 
'Dear {{candidate_name}},

Thank you for your application for the {{job_title}} position at {{company_name}}. We have received your application and our team is reviewing it.

We will be in touch within the next few business days with an update on your application status.

Best regards,
{{hiring_manager_name}}
Hiring Team', 'application_received', '["candidate_name", "job_title", "company_name", "hiring_manager_name"]'),

-- Interview invitation
((SELECT id FROM tenants WHERE slug = 'techcorp'), 'Interview Invitation', 'Interview Invitation - {{job_title}}', 
'Dear {{candidate_name}},

We would like to invite you for an interview for the {{job_title}} position at {{company_name}}.

Interview Details:
- Date: {{interview_date}}
- Time: {{interview_time}}
- Duration: {{interview_duration}}
- Location: {{interview_location}}
- Interviewer(s): {{interviewer_names}}

Please confirm your attendance by replying to this email.

Best regards,
{{hiring_manager_name}}', 'interview_invite', '["candidate_name", "job_title", "company_name", "interview_date", "interview_time", "interview_duration", "interview_location", "interviewer_names", "hiring_manager_name"]');

-- =================================================================
-- SAMPLE ORGANIZATIONS WITHIN AN EMPLOYER TENANT
-- =================================================================

-- Employer organizations
INSERT INTO organizations (tenant_id, name, type, industry, size_range, website) VALUES
((SELECT id FROM tenants WHERE slug = 'techcorp'), 'TechCorp Inc', 'company', 'Technology', '500-1000', 'https://techcorp.com'),
((SELECT id FROM tenants WHERE slug = 'techcorp'), 'Engineering Department', 'department', 'Technology', '100-200', null);

-- Agency client organizations
INSERT INTO organizations (tenant_id, name, type, industry, size_range, website) VALUES
((SELECT id FROM tenants WHERE slug = 'elite-recruiting'), 'Elite Recruiting Agency', 'agency', 'Staffing', '50-100', 'https://eliterecruiting.com'),
((SELECT id FROM tenants WHERE slug = 'elite-recruiting'), 'FinTech Startup', 'company', 'Financial Technology', '10-50', 'https://fintechstartup.com'),
((SELECT id FROM tenants WHERE slug = 'elite-recruiting'), 'Healthcare Systems Corp', 'company', 'Healthcare', '1000+', 'https://healthcaresystems.com');

-- Platform organizations
INSERT INTO organizations (tenant_id, name, type, industry, size_range, website) VALUES
((SELECT id FROM tenants WHERE slug = 'talent-marketplace'), 'TalentMarketplace Platform', 'company', 'Marketplace', '50-100', 'https://talentmarketplace.com');

-- =================================================================
-- SYSTEM SETTINGS AND CONFIGURATIONS
-- =================================================================

-- Sample system configurations stored as JSON
-- This would typically be managed through an admin interface

-- Skills taxonomy (for consistent skill tagging)
CREATE TABLE skills_taxonomy (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    category VARCHAR(100) NOT NULL,
    parent_skill_id UUID REFERENCES skills_taxonomy(id),
    synonyms JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO skills_taxonomy (name, category) VALUES
-- Technical Skills
('JavaScript', 'Programming Languages'),
('Python', 'Programming Languages'),
('Java', 'Programming Languages'),
('React', 'Frontend Frameworks'),
('Node.js', 'Backend Frameworks'),
('PostgreSQL', 'Databases'),
('AWS', 'Cloud Platforms'),
('Docker', 'DevOps Tools'),

-- Soft Skills
('Leadership', 'Management'),
('Communication', 'Interpersonal'),
('Problem Solving', 'Analytical'),
('Project Management', 'Management'),

-- Industry Skills
('Financial Modeling', 'Finance'),
('Clinical Research', 'Healthcare'),
('Digital Marketing', 'Marketing');

-- Location taxonomy (for consistent location handling)
CREATE TABLE locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('country', 'state', 'city', 'metro')),
    parent_id UUID REFERENCES locations(id),
    country_code VARCHAR(2),
    state_code VARCHAR(10),
    timezone VARCHAR(100),
    coordinates POINT,
    is_remote_friendly BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO locations (name, type, country_code, timezone) VALUES
('United States', 'country', 'US', 'America/New_York'),
('California', 'state', 'US', 'America/Los_Angeles'),
('New York', 'state', 'US', 'America/New_York'),
('Texas', 'state', 'US', 'America/Chicago');

INSERT INTO locations (name, type, country_code, parent_id, timezone) VALUES
('San Francisco', 'city', 'US', (SELECT id FROM locations WHERE name = 'California'), 'America/Los_Angeles'),
('New York City', 'city', 'US', (SELECT id FROM locations WHERE name = 'New York'), 'America/New_York'),
('Austin', 'city', 'US', (SELECT id FROM locations WHERE name = 'Texas'), 'America/Chicago');