-- =================================================================
-- SAMPLE DATA FOR UNIFIED ATS SYSTEM
-- Example data to demonstrate the schema functionality
-- =================================================================

-- =================================================================
-- SAMPLE USERS (Different Types)
-- =================================================================

-- Sample users for TechCorp (Employer)
INSERT INTO users (tenant_id, email, first_name, last_name, phone, timezone) VALUES
((SELECT id FROM tenants WHERE slug = 'techcorp'), 'john.manager@techcorp.com', 'John', 'Smith', '+1-555-0101', 'America/Los_Angeles'),
((SELECT id FROM tenants WHERE slug = 'techcorp'), 'sarah.recruiter@techcorp.com', 'Sarah', 'Johnson', '+1-555-0102', 'America/Los_Angeles'),
((SELECT id FROM tenants WHERE slug = 'techcorp'), 'mike.engineer@techcorp.com', 'Mike', 'Chen', '+1-555-0103', 'America/Los_Angeles'),
((SELECT id FROM tenants WHERE slug = 'techcorp'), 'jane.candidate@email.com', 'Jane', 'Doe', '+1-555-0104', 'America/New_York');

-- Sample users for Elite Recruiting (Agency)
INSERT INTO users (tenant_id, email, first_name, last_name, phone, timezone) VALUES
((SELECT id FROM tenants WHERE slug = 'elite-recruiting'), 'alex.owner@eliterecruiting.com', 'Alex', 'Williams', '+1-555-0201', 'America/Chicago'),
((SELECT id FROM tenants WHERE slug = 'elite-recruiting'), 'lisa.recruiter@eliterecruiting.com', 'Lisa', 'Brown', '+1-555-0202', 'America/Chicago'),
((SELECT id FROM tenants WHERE slug = 'elite-recruiting'), 'david.client@fintechstartup.com', 'David', 'Kim', '+1-555-0203', 'America/Los_Angeles'),
((SELECT id FROM tenants WHERE slug = 'elite-recruiting'), 'emma.candidate@email.com', 'Emma', 'Garcia', '+1-555-0204', 'America/New_York');

-- Sample users for TalentMarketplace (Platform)
INSERT INTO users (tenant_id, email, first_name, last_name, phone, timezone) VALUES
((SELECT id FROM tenants WHERE slug = 'talent-marketplace'), 'admin@talentmarketplace.com', 'Platform', 'Admin', '+1-555-0301', 'America/New_York'),
((SELECT id FROM tenants WHERE slug = 'talent-marketplace'), 'recruiter1@freelance.com', 'Tom', 'Anderson', '+1-555-0302', 'America/Denver'),
((SELECT id FROM tenants WHERE slug = 'talent-marketplace'), 'recruiter2@independent.com', 'Maria', 'Rodriguez', '+1-555-0303', 'America/Los_Angeles');

-- =================================================================
-- USER ROLES ASSIGNMENT
-- =================================================================

-- TechCorp roles
INSERT INTO user_roles (user_id, organization_id, role, is_primary) VALUES
((SELECT id FROM users WHERE email = 'john.manager@techcorp.com'), (SELECT id FROM organizations WHERE name = 'TechCorp Inc'), 'hiring_manager', true),
((SELECT id FROM users WHERE email = 'sarah.recruiter@techcorp.com'), (SELECT id FROM organizations WHERE name = 'TechCorp Inc'), 'recruiter', true),
((SELECT id FROM users WHERE email = 'mike.engineer@techcorp.com'), (SELECT id FROM organizations WHERE name = 'TechCorp Inc'), 'interviewer', true),
((SELECT id FROM users WHERE email = 'jane.candidate@email.com'), null, 'candidate', true);

-- Elite Recruiting roles
INSERT INTO user_roles (user_id, organization_id, role, is_primary) VALUES
((SELECT id FROM users WHERE email = 'alex.owner@eliterecruiting.com'), (SELECT id FROM organizations WHERE name = 'Elite Recruiting Agency'), 'admin', true),
((SELECT id FROM users WHERE email = 'lisa.recruiter@eliterecruiting.com'), (SELECT id FROM organizations WHERE name = 'Elite Recruiting Agency'), 'recruiter', true),
((SELECT id FROM users WHERE email = 'david.client@fintechstartup.com'), (SELECT id FROM organizations WHERE name = 'FinTech Startup'), 'client_contact', true),
((SELECT id FROM users WHERE email = 'emma.candidate@email.com'), null, 'candidate', true);

-- Platform roles
INSERT INTO user_roles (user_id, organization_id, role, is_primary) VALUES
((SELECT id FROM users WHERE email = 'admin@talentmarketplace.com'), (SELECT id FROM organizations WHERE name = 'TalentMarketplace Platform'), 'admin', true),
((SELECT id FROM users WHERE email = 'recruiter1@freelance.com'), null, 'recruiter', true),
((SELECT id FROM users WHERE email = 'recruiter2@independent.com'), null, 'recruiter', true);

-- =================================================================
-- SAMPLE CANDIDATES
-- =================================================================

INSERT INTO candidates (user_id, tenant_id, source, headline, summary, experience_years, current_company, current_title, skills, salary_expectations) VALUES
-- Candidate in TechCorp system
((SELECT id FROM users WHERE email = 'jane.candidate@email.com'), 
 (SELECT id FROM tenants WHERE slug = 'techcorp'), 
 'LinkedIn', 
 'Senior Software Engineer specializing in React and Node.js',
 'Experienced full-stack developer with 5+ years building scalable web applications',
 5,
 'Current Tech Company',
 'Senior Software Engineer',
 '["JavaScript", "React", "Node.js", "PostgreSQL", "AWS"]',
 '{"min": 120000, "max": 150000, "currency": "USD", "type": "annual"}'
),

-- Same candidate in Agency system (duplicate handling scenario)
((SELECT id FROM users WHERE email = 'emma.candidate@email.com'),
 (SELECT id FROM tenants WHERE slug = 'elite-recruiting'),
 'Referral',
 'Full Stack Developer with React expertise',
 'Full-stack engineer with strong frontend and backend skills',
 4,
 'StartupXYZ',
 'Full Stack Developer',
 '["JavaScript", "React", "Python", "PostgreSQL"]',
 '{"min": 110000, "max": 140000, "currency": "USD", "type": "annual"}'
);

-- =================================================================
-- SAMPLE JOBS
-- =================================================================

INSERT INTO jobs (tenant_id, organization_id, hiring_manager_id, recruiter_id, title, description, employment_type, experience_level, salary_range, status, skills_required) VALUES
-- TechCorp job
((SELECT id FROM tenants WHERE slug = 'techcorp'),
 (SELECT id FROM organizations WHERE name = 'Engineering Department'),
 (SELECT id FROM users WHERE email = 'john.manager@techcorp.com'),
 (SELECT id FROM users WHERE email = 'sarah.recruiter@techcorp.com'),
 'Senior React Developer',
 'We are looking for a Senior React Developer to join our frontend team and build amazing user experiences.',
 'full_time',
 'senior',
 '{"min": 130000, "max": 160000, "currency": "USD", "type": "annual"}',
 'open',
 '["React", "JavaScript", "TypeScript", "CSS", "Redux"]'
),

-- Agency client job
((SELECT id FROM tenants WHERE slug = 'elite-recruiting'),
 (SELECT id FROM organizations WHERE name = 'FinTech Startup'),
 (SELECT id FROM users WHERE email = 'david.client@fintechstartup.com'),
 (SELECT id FROM users WHERE email = 'lisa.recruiter@eliterecruiting.com'),
 'Full Stack Engineer',
 'Join our growing fintech startup as a Full Stack Engineer working on cutting-edge financial products.',
 'full_time',
 'mid',
 '{"min": 100000, "max": 130000, "currency": "USD", "type": "annual"}',
 'open',
 '["JavaScript", "React", "Node.js", "PostgreSQL", "Financial APIs"]'
);

-- =================================================================
-- SAMPLE APPLICATIONS
-- =================================================================

INSERT INTO applications (candidate_id, job_id, source, status, applied_at) VALUES
-- Application in TechCorp system
((SELECT c.id FROM candidates c JOIN users u ON c.user_id = u.id WHERE u.email = 'jane.candidate@email.com'),
 (SELECT id FROM jobs WHERE title = 'Senior React Developer'),
 'Company Website',
 'in_review',
 CURRENT_TIMESTAMP - INTERVAL '2 days'
),

-- Application in Agency system
((SELECT c.id FROM candidates c JOIN users u ON c.user_id = u.id WHERE u.email = 'emma.candidate@email.com'),
 (SELECT id FROM jobs WHERE title = 'Full Stack Engineer'),
 'Agency Submission',
 'interviewing',
 CURRENT_TIMESTAMP - INTERVAL '5 days'
);

-- =================================================================
-- CLIENT RELATIONSHIPS (Agency specific)
-- =================================================================

INSERT INTO client_relationships (agency_id, client_id, primary_contact_id, relationship_status, commission_structure) VALUES
((SELECT id FROM organizations WHERE name = 'Elite Recruiting Agency'),
 (SELECT id FROM organizations WHERE name = 'FinTech Startup'),
 (SELECT id FROM users WHERE email = 'david.client@fintechstartup.com'),
 'active',
 '{"type": "percentage", "rate": 20, "terms": "net_30"}'
),

((SELECT id FROM organizations WHERE name = 'Elite Recruiting Agency'),
 (SELECT id FROM organizations WHERE name = 'Healthcare Systems Corp'),
 null,
 'active',
 '{"type": "percentage", "rate": 25, "terms": "net_15"}'
);

-- =================================================================
-- RECRUITER NETWORKS (Platform specific)
-- =================================================================

INSERT INTO recruiter_networks (platform_id, recruiter_id, specializations, success_rate, average_time_to_fill, rating, is_verified) VALUES
((SELECT id FROM tenants WHERE slug = 'talent-marketplace'),
 (SELECT id FROM users WHERE email = 'recruiter1@freelance.com'),
 '["Technology", "Startups", "Remote Work"]',
 85.5,
 32,
 4.8,
 true
),

((SELECT id FROM tenants WHERE slug = 'talent-marketplace'),
 (SELECT id FROM users WHERE email = 'recruiter2@independent.com'),
 '["Finance", "Healthcare", "Executive Search"]',
 92.3,
 28,
 4.9,
 true
);

-- =================================================================
-- SAMPLE ACTIVITIES (Notes, Communications)
-- =================================================================

INSERT INTO activities (tenant_id, user_id, related_to_type, related_to_id, activity_type, subject, content) VALUES
-- Note on candidate
((SELECT id FROM tenants WHERE slug = 'techcorp'),
 (SELECT id FROM users WHERE email = 'sarah.recruiter@techcorp.com'),
 'candidate',
 (SELECT c.id FROM candidates c JOIN users u ON c.user_id = u.id WHERE u.email = 'jane.candidate@email.com'),
 'note',
 'Initial phone screen completed',
 'Had a great initial conversation with Jane. Strong technical background, articulate communicator. Recommending for technical interview round.'
),

-- Email activity
((SELECT id FROM tenants WHERE slug = 'elite-recruiting'),
 (SELECT id FROM users WHERE email = 'lisa.recruiter@eliterecruiting.com'),
 'application',
 (SELECT a.id FROM applications a JOIN candidates c ON a.candidate_id = c.id JOIN users u ON c.user_id = u.id WHERE u.email = 'emma.candidate@email.com'),
 'email',
 'Interview scheduled',
 'Sent interview confirmation email to candidate with details for tomorrow''s technical interview.'
);