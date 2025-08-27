# Employer ATS Schema - Table Relationships

## Entity Relationship Diagram - Employer Focus

```
                    COMPANY STRUCTURE
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│COMPANY_SETTINGS │       │   DEPARTMENTS   │       │     USERS       │
│ ┌─────────────┐ │       │ ┌─────────────┐ │       │ ┌─────────────┐ │
│ │ id (PK)     │ │       │ │ id (PK)     │ │◄──────┤ │ id (PK)     │ │
│ │ company_name│ │       │ │ parent_id   │ │─┐     │ │ email (UQ)  │ │
│ │ industry    │ │       │ │ name        │ │ │     │ │ first_name  │ │
│ │ def_process │ │       │ │ dept_head_id│ │ │     │ │ last_name   │ │
│ │ structured  │ │       │ │ budget      │ │ │     │ │ employee_id │ │
│ │ diversity   │ │       │ │ headcount   │ │ │     │ │ account_type│ │
│ └─────────────┘ │       │ └─────────────┘ │ │     │ │ manager_id  │ │
└─────────────────┘       └─────────────────┘ │     │ │ dept_id     │ │
                                    │         │     │ └─────────────┘ │
                                    └─────────┘     └─────────────────┘
                                                             │
┌─────────────────┐       ┌─────────────────┐               │
│   USER_ROLES    │       │   CANDIDATES    │               │
│ ┌─────────────┐ │       │ ┌─────────────┐ │               │
│ │ id (PK)     │ │       │ │ id (PK)     │ │               │
│ │ user_id     │ │◄──────┼─│ user_id     │ │◄──────────────┘
│ │ dept_id     │ │       │ │ source      │ │
│ │ role_name   │ │       │ │ referrer_id │ │
│ │ permissions │ │       │ │ headline    │ │
│ │ scope       │ │       │ │ summary     │ │
│ └─────────────┘ │       │ │ skills      │ │
└─────────────────┘       │ │ is_internal │ │
                          │ │ primary_rec │ │ (duplicate handling)
                          │ └─────────────┘ │
                          └─────────────────┘
                                   │
                                   │
                          ┌─────────────────┐       ┌─────────────────┐
                          │CANDIDATE_WORK   │       │CANDIDATE_EDU    │
                          │ ┌─────────────┐ │       │ ┌─────────────┐ │
                          │ │ id (PK)     │ │       │ │ id (PK)     │ │
                          │ │ candidate_id│ │◄──────┼─│ candidate_id│ │
                          │ │ company     │ │       │ │ institution │ │
                          │ │ title       │ │       │ │ degree      │ │
                          │ │ start_date  │ │       │ │ field       │ │
                          │ │ achievements│ │       │ │ grad_date   │ │
                          │ └─────────────┘ │       │ └─────────────┘ │
                          └─────────────────┘       └─────────────────┘
```

## Job Requisition & Approval Workflow

```
                    JOB CREATION WORKFLOW
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│JOB_REQUISITIONS │       │  JOB_POSTINGS   │       │HIRING_PROCESSES │
│ ┌─────────────┐ │       │ ┌─────────────┐ │       │ ┌─────────────┐ │
│ │ id (PK)     │ │◄──────┤ │ id (PK)     │ │       │ │ id (PK)     │ │
│ │ req_number  │ │       │ │ req_id      │ │       │ │ process_name│ │
│ │ dept_id     │ │       │ │ posting_title│ │      │ │ dept_id     │ │
│ │ hm_id       │ │       │ │ public_desc │ │       │ │ job_level   │ │
│ │ recruiter_id│ │       │ │ career_site │ │       │ │ is_default  │ │
│ │ job_title   │ │       │ │ job_boards  │ │       │ │ target_days │ │
│ │ description │ │       │ │ expires_at  │ │       │ └─────────────┘ │
│ │ salary_range│ │       │ │ page_views  │ │       └─────────────────┘
│ │ approval_st │ │       │ └─────────────┘ │                │
│ │ req_status  │ │       └─────────────────┘                │
│ └─────────────┘ │                                          │
└─────────────────┘                                          │
         │                                                   │
         │                ┌─────────────────┐                │
         │                │ HIRING_STAGES   │                │
         │                │ ┌─────────────┐ │                │
         │                │ │ id (PK)     │ │                │
         └────────────────┼─│ process_id  │ │◄───────────────┘
                          │ │ stage_name  │ │
                          │ │ stage_order │ │
                          │ │ stage_type  │ │
                          │ │ auto_advance│ │
                          │ │ sla_hours   │ │
                          │ └─────────────┘ │
                          └─────────────────┘
```

## Application & Interview Pipeline

```
                    HIRING PIPELINE
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│  APPLICATIONS   │       │APP_STAGE_HIST   │       │ INTERVIEW_KITS  │
│ ┌─────────────┐ │       │ ┌─────────────┐ │       │ ┌─────────────┐ │
│ │ id (PK)     │ │◄──────┤ │ id (PK)     │ │       │ │ id (PK)     │ │
│ │ candidate_id│ │       │ │ app_id      │ │       │ │ kit_name    │ │
│ │ req_id      │ │       │ │ stage_id    │ │       │ │ dept_id     │ │
│ │ cur_stage_id│ │       │ │ entered_at  │ │       │ │ job_level   │ │
│ │ source      │ │       │ │ exited_at   │ │       │ │ interview_type│ │
│ │ cover_letter│ │       │ │ duration    │ │       │ │ questions   │ │
│ │ app_status  │ │       │ │ moved_by    │ │       │ │ scorecard   │ │
│ │ fit_score   │ │       │ │ outcome     │ │       │ └─────────────┘ │
│ │ referrer_id │ │       │ └─────────────┘ │       └─────────────────┘
│ └─────────────┘ │       └─────────────────┘                │
└─────────────────┘                                          │
         │                                                   │
         │                                                   │
         ▼                                                   │
┌─────────────────┐       ┌─────────────────┐               │
│   INTERVIEWS    │       │INTERVIEW_PARTS  │               │
│ ┌─────────────┐ │       │ ┌─────────────┐ │               │
│ │ id (PK)     │ │◄──────┤ │ id (PK)     │ │               │
│ │ app_id      │ │       │ │ interview_id│ │               │
│ │ kit_id      │ │◄──────┼─│ user_id     │ │               │
│ │ title       │ │       │ │ role        │ │               │
│ │ scheduled_at│ │       │ │ inv_status  │ │               │
│ │ duration    │ │       │ │ attendance  │ │               │
│ │ location    │ │       │ │ feedback    │ │               │
│ │ status      │ │       │ │ scorecard   │ │               │
│ │ recommend.  │ │       │ │ submitted_at│ │               │
│ └─────────────┘ │       │ └─────────────┘ │               │
└─────────────────┘       └─────────────────┘               │
                                                            │
                                                            └─┐
                                                              │
┌─────────────────┐       ┌─────────────────┐               │
│     OFFERS      │       │OFFER_APPROVALS  │               │
│ ┌─────────────┐ │       │ ┌─────────────┐ │               │
│ │ id (PK)     │ │◄──────┤ │ id (PK)     │ │               │
│ │ app_id      │ │       │ │ offer_id    │ │               │
│ │ created_by  │ │       │ │ approver_id │ │               │
│ │ approved_by │ │       │ │ approval_lvl│ │               │
│ │ offer_type  │ │       │ │ status      │ │               │
│ │ job_title   │ │       │ │ approved_at │ │               │
│ │ base_salary │ │       │ │ rejection   │ │               │
│ │ equity      │ │       │ └─────────────┘ │               │
│ │ offer_status│ │       └─────────────────┘               │
│ │ expires_at  │ │                                         │
│ └─────────────┘ │                                         │
└─────────────────┘                                         │
                                                            │
                                                            │
           ┌─────────────────┐                              │
           │INTERNAL_MOBILITY│◄─────────────────────────────┘
           │ ┌─────────────┐ │
           │ │ id (PK)     │ │
           │ │ employee_id │ │
           │ │ app_id      │ │
           │ │ current_dept│ │
           │ │ mobility_type│ │
           │ │ mgr_approval│ │
           │ │ hr_approval │ │
           │ │ transition  │ │
           │ └─────────────┘ │
           └─────────────────┘
```

## Communication & Activity System

```
   ┌─────────────────┐       Related Entity Types:
   │   ACTIVITIES    │       ┌─────────────────┐
   │ ┌─────────────┐ │       │ • candidate     │
   │ │ id (PK)     │ │       │ • application   │
   │ │ user_id     │ │       │ • requisition   │
   │ │ related_type│ │◄──────┤ • interview     │
   │ │ related_id  │ │       │ • offer         │
   │ │ activity_type│ │       └─────────────────┘
   │ │ subject     │ │       
   │ │ content     │ │       Activity Types:
   │ │ visibility  │ │       ┌─────────────────┐
   │ │ task_due    │ │       │ • note          │
   │ │ assignee_id │ │       │ • email         │
   │ └─────────────┘ │       │ • call          │
   └─────────────────┘       │ • meeting       │
                             │ • task          │
           │                 │ • system_event  │
           │                 │ • status_change │
           ▼                 └─────────────────┘
   ┌─────────────────┐       
   │EMAIL_TEMPLATES  │       Template Types:
   │ ┌─────────────┐ │       ┌─────────────────┐
   │ │ id (PK)     │ │       │ • app_received  │
   │ │ template_name│ │       │ • rejection     │
   │ │ dept_id     │ │       │ • interview_inv │
   │ │ subject     │ │       │ • interview_rem │
   │ │ body        │ │       │ • offer_letter  │
   │ │ template_type│ │◄──────┤ • welcome       │
   │ │ trigger_event│ │       └─────────────────┘
   │ │ variables   │ │       
   │ └─────────────┘ │       
   └─────────────────┘       
```

## Business Flow Patterns

### 1. Job Requisition Flow
```
Hiring Need → Requisition Draft → Approval → Job Posting → Applications
     ↓              ↓               ↓           ↓             ↓
departments  job_requisitions  approvals  job_postings  applications
```

### 2. Interview Process Flow
```
Application → Stage Assignment → Interview Kit → Schedule → Conduct → Feedback → Decision
     ↓              ↓               ↓             ↓          ↓          ↓         ↓
applications  hiring_stages  interview_kits  interviews  participants feedback  offers
```

### 3. Internal Mobility Flow
```
Employee → Internal Application → Manager Approval → HR Approval → Transfer
    ↓            ↓                     ↓               ↓            ↓
  users    internal_mobility    manager_approval  hr_approval   transition
```

## Key Tables and Their Purpose

### Organizational Structure
| Table | Purpose | Key Features |
|-------|---------|--------------|
| `company_settings` | Company configuration | Default processes, compliance settings |
| `departments` | Org hierarchy | Budget, headcount, hierarchy |
| `users` | All people | Employees and candidates |
| `user_roles` | Permission system | Granular role-based access |

### Job Management
| Table | Purpose | Key Features |
|-------|---------|--------------|
| `job_requisitions` | Internal job requests | Approval workflow, budget tracking |
| `job_postings` | Public job listings | Multi-channel posting, analytics |
| `hiring_processes` | Process templates | Reusable workflows |
| `hiring_stages` | Process steps | SLA tracking, automation |

### Candidate Pipeline
| Table | Purpose | Key Features |
|-------|---------|--------------|
| `candidates` | Candidate profiles | Skills matching, internal mobility |
| `applications` | Job applications | Pipeline tracking, scoring |
| `application_stage_history` | Progress tracking | Duration analysis, bottlenecks |

### Interview System
| Table | Purpose | Key Features |
|-------|---------|--------------|
| `interview_kits` | Reusable templates | Structured interviews, scorecards |
| `interviews` | Scheduled sessions | Calendar integration, logistics |
| `interview_participants` | Attendee management | Feedback collection |

### Offer Management
| Table | Purpose | Key Features |
|-------|---------|--------------|
| `offers` | Job offers | Compensation details, negotiation |
| `offer_approvals` | Approval workflow | Multi-level approvals |
| `internal_mobility` | Employee transfers | Current role tracking |

## Advanced Features

### Structured Interview Process
```sql
-- Interview kit with structured questions
CREATE OR REPLACE FUNCTION create_interview_from_kit(
    p_application_id UUID,
    p_kit_id UUID,
    p_scheduled_at TIMESTAMP WITH TIME ZONE
)
RETURNS UUID AS $$
DECLARE
    v_interview_id UUID;
    v_kit RECORD;
    v_participant RECORD;
BEGIN
    -- Get kit details
    SELECT * INTO v_kit FROM interview_kits WHERE id = p_kit_id;
    
    -- Create interview
    INSERT INTO interviews (application_id, kit_id, interview_title, interview_type, 
                           scheduled_at, duration_minutes)
    VALUES (p_application_id, p_kit_id, v_kit.kit_name, v_kit.interview_type,
            p_scheduled_at, v_kit.duration_minutes)
    RETURNING id INTO v_interview_id;
    
    -- Auto-assign interviewers based on department and role
    FOR v_participant IN 
        SELECT u.id, ur.role_name
        FROM users u
        JOIN user_roles ur ON u.id = ur.user_id
        WHERE ur.role_name IN ('interviewer', 'hiring_manager')
          AND u.department_id = (SELECT r.department_id FROM job_requisitions r
                                JOIN applications a ON r.id = a.requisition_id
                                WHERE a.id = p_application_id)
    LOOP
        INSERT INTO interview_participants (interview_id, user_id, role)
        VALUES (v_interview_id, v_participant.id, 'interviewer');
    END LOOP;
    
    RETURN v_interview_id;
END;
$$ LANGUAGE plpgsql;
```

### Automated Duplicate Detection (Internal Employees)
```sql
-- Detect when employees apply internally
CREATE OR REPLACE FUNCTION check_internal_candidate()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if candidate email matches existing employee
    UPDATE candidates 
    SET is_internal_candidate = true,
        current_employee_id = u.id
    FROM users u
    WHERE candidates.id = NEW.id
      AND u.email = (SELECT email FROM users WHERE id = NEW.user_id)
      AND u.account_type = 'employee';
      
    -- Create internal mobility record if internal candidate
    IF NEW.is_internal_candidate THEN
        INSERT INTO internal_mobility (employee_id, application_id, current_department_id,
                                     current_title, current_manager_id, mobility_type)
        SELECT u.id, app.id, u.department_id, 'Current Role', u.manager_id, 'transfer'
        FROM users u, applications app
        WHERE u.id = NEW.current_employee_id 
          AND app.candidate_id = NEW.id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### Performance Analytics Views
```sql
-- Hiring funnel metrics
CREATE VIEW hiring_funnel_metrics AS
SELECT 
    r.job_title,
    d.name as department,
    COUNT(a.id) as total_applications,
    COUNT(a.id) FILTER (WHERE a.application_status = 'phone_screen') as phone_screens,
    COUNT(a.id) FILTER (WHERE a.application_status = 'interviewing') as interviews,
    COUNT(a.id) FILTER (WHERE a.application_status = 'offer') as offers,
    COUNT(a.id) FILTER (WHERE a.application_status = 'hired') as hires,
    ROUND(COUNT(a.id) FILTER (WHERE a.application_status = 'hired')::decimal / 
          NULLIF(COUNT(a.id), 0) * 100, 2) as conversion_rate,
    AVG(EXTRACT(days FROM (a.last_activity_at - a.applied_at))) as avg_time_to_hire
FROM job_requisitions r
LEFT JOIN applications a ON r.id = a.requisition_id
LEFT JOIN departments d ON r.department_id = d.id
WHERE r.created_at >= CURRENT_DATE - INTERVAL '6 months'
GROUP BY r.id, r.job_title, d.name;

-- Interviewer performance
CREATE VIEW interviewer_performance AS
SELECT 
    u.first_name || ' ' || u.last_name as interviewer_name,
    d.name as department,
    COUNT(ip.id) as interviews_conducted,
    AVG(CASE 
        WHEN ip.individual_recommendation = 'strong_hire' THEN 5
        WHEN ip.individual_recommendation = 'hire' THEN 4
        WHEN ip.individual_recommendation = 'no_hire' THEN 2
        WHEN ip.individual_recommendation = 'strong_no_hire' THEN 1
        ELSE 3 
    END) as avg_recommendation_score,
    COUNT(ip.id) FILTER (WHERE ip.feedback_submitted_at IS NOT NULL) as feedback_completion_rate
FROM users u
JOIN departments d ON u.department_id = d.id
JOIN interview_participants ip ON u.id = ip.user_id AND ip.role = 'interviewer'
WHERE ip.created_at >= CURRENT_DATE - INTERVAL '90 days'
GROUP BY u.id, u.first_name, u.last_name, d.name;
```

### Critical Indexes
```sql
-- Performance indexes for employer ATS
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_department ON users(department_id);
CREATE INDEX idx_candidates_internal ON candidates(is_internal_candidate);
CREATE INDEX idx_requisitions_dept_status ON job_requisitions(department_id, requisition_status);
CREATE INDEX idx_applications_req_status ON applications(requisition_id, application_status);
CREATE INDEX idx_interviews_scheduled ON interviews(scheduled_at);
CREATE INDEX idx_offers_status ON offers(offer_status);

-- Full-text search for candidates and jobs
CREATE INDEX idx_candidates_search ON candidates USING GIN(to_tsvector('english', headline || ' ' || summary));
CREATE INDEX idx_requisitions_search ON job_requisitions USING GIN(to_tsvector('english', job_title || ' ' || job_description));
```

This employer-focused schema emphasizes structured hiring processes, approval workflows, internal mobility, and comprehensive interview management - all key features for internal hiring teams.