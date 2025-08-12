# Candidate Submissions Database Schema Design
**Date:** 2025-08-08  
**Status:** Initial Design  
**Purpose:** Database schema for tracking candidate submissions across three personas with flexible source attribution

---

## DESIGN REQUIREMENTS

### **Three Personas Support**
1. **Recruiting Agency** - Using platform as their ATS
2. **Employer** - Using platform as their ATS  
3. **Platform Operations** - Managing marketplace submissions from agencies

### **Key Challenges**
- Same database table handles end-to-end lifecycle from agency submittal to employer application
- Different terminology per persona ("submittal" vs "application")
- Complex source attribution (which recruiter, which agency, which department)
- Extensible design for adding new types without schema changes

---

## DATABASE SCHEMA DESIGN

### **Core Tables**

```sql
-- Main submissions tracking table
candidate_submissions (
  id                    BIGINT PRIMARY KEY,
  candidate_id          BIGINT NOT NULL,
  job_id               BIGINT NOT NULL,
  submission_type_id    INTEGER NOT NULL,     -- FK to submission_types
  source_type_id        INTEGER NOT NULL,     -- FK to source_types
  source_entity_id      BIGINT,              -- FK to source_entities
  source_entity_type    VARCHAR(50),         -- 'user', 'recruiting_agency', 'department'
  status_id            INTEGER NOT NULL,     -- FK to statuses (from terminology research)
  stage_id             INTEGER NOT NULL,     -- FK to stages (from terminology research)
  submitted_by_user_id  BIGINT NOT NULL,     -- Who created this submission
  created_at           TIMESTAMP NOT NULL,
  updated_at           TIMESTAMP NOT NULL,
  
  -- Indexes
  INDEX idx_candidate_job (candidate_id, job_id),
  INDEX idx_job_status (job_id, status_id),
  INDEX idx_source_entity (source_entity_type, source_entity_id),
  INDEX idx_submitted_by (submitted_by_user_id),
  
  -- Constraints
  FOREIGN KEY (candidate_id) REFERENCES candidates(id),
  FOREIGN KEY (job_id) REFERENCES jobs(id),
  FOREIGN KEY (submission_type_id) REFERENCES submission_types(id),
  FOREIGN KEY (source_type_id) REFERENCES source_types(id),
  FOREIGN KEY (submitted_by_user_id) REFERENCES users(id)
);

-- Extensible submission types lookup
submission_types (
  id              INTEGER PRIMARY KEY,
  code            VARCHAR(50) UNIQUE NOT NULL,    -- 'agency_sourced_submittal'
  display_name    VARCHAR(100) NOT NULL,          -- 'Candidate Submittal (Sourced)'
  description     TEXT,
  applicable_personas JSON,                       -- ['recruiting_agency', 'employer']
  active          BOOLEAN DEFAULT true,
  created_at      TIMESTAMP NOT NULL,
  
  INDEX idx_code (code),
  INDEX idx_active (active)
);

-- Extensible source types lookup  
source_types (
  id                  INTEGER PRIMARY KEY,
  code                VARCHAR(50) UNIQUE NOT NULL,    -- 'linkedin', 'referral_employee'
  display_name        VARCHAR(100) NOT NULL,          -- 'LinkedIn', 'Employee Referral'
  description         TEXT,
  applicable_personas JSON,                           -- ['recruiting_agency', 'employer', 'platform']
  active              BOOLEAN DEFAULT true,
  created_at          TIMESTAMP NOT NULL,
  
  INDEX idx_code (code),
  INDEX idx_active (active)
);

-- Source entity attribution (who specifically)
source_entities (
  id                INTEGER PRIMARY KEY,
  entity_type       VARCHAR(50) NOT NULL,      -- 'user', 'recruiting_agency', 'department'
  entity_id         BIGINT NOT NULL,           -- References users.id, agencies.id, etc.
  entity_name       VARCHAR(200) NOT NULL,     -- Display name for UI
  parent_entity_id  INTEGER,                   -- For hierarchical structures
  active            BOOLEAN DEFAULT true,
  created_at        TIMESTAMP NOT NULL,
  
  INDEX idx_entity (entity_type, entity_id),
  INDEX idx_parent (parent_entity_id),
  UNIQUE KEY unique_entity (entity_type, entity_id)
);
```

---

## SUBMISSION TYPES CONFIGURATION

### **Recruiting Agency Persona**
```sql
INSERT INTO submission_types (code, display_name, applicable_personas) VALUES
('agency_sourced_submittal', 'Candidate Submittal (Sourced)', '["recruiting_agency"]'),
('agency_referral_submittal', 'Candidate Submittal (Referral)', '["recruiting_agency"]'),
('agency_inbound_submittal', 'Candidate Submittal (Inbound)', '["recruiting_agency"]');
```

### **Employer Persona**
```sql
INSERT INTO submission_types (code, display_name, applicable_personas) VALUES
('direct_application', 'Direct Application', '["employer"]'),
('agency_submittal', 'Agency Submittal', '["employer"]'),
('internal_referral', 'Internal Referral', '["employer"]'),
('employee_referral', 'Employee Referral', '["employer"]'),
('recruiter_sourced', 'Recruiter Sourced', '["employer"]');
```

### **Platform Operations Persona**
```sql
INSERT INTO submission_types (code, display_name, applicable_personas) VALUES
('agency_partner_submittal', 'Agency Partner Submittal', '["platform"]'),
('employer_referral', 'Employer Referral', '["platform"]'),
('platform_sourced', 'Platform Sourced', '["platform"]'),
('direct_application', 'Direct Application', '["platform"]');
```

---

## SOURCE TYPES CONFIGURATION

### **Universal Source Types**
```sql
INSERT INTO source_types (code, display_name, applicable_personas) VALUES
-- Sourcing Methods
('sourced', 'Actively Sourced', '["recruiting_agency", "employer", "platform"]'),
('cold_outreach', 'Cold Outreach', '["recruiting_agency"]'),
('linkedin', 'LinkedIn', '["recruiting_agency", "employer"]'),
('social_media', 'Social Media', '["recruiting_agency", "employer", "platform"]'),
('networking_event', 'Networking Event', '["recruiting_agency", "employer"]'),

-- Referral Types  
('referral_candidate', 'Candidate Referral', '["recruiting_agency", "employer", "platform"]'),
('referral_employee', 'Employee Referral', '["employer"]'),
('referral_employer', 'Employer Referral', '["platform"]'),

-- Inbound Sources
('inbound_advertising', 'Inbound from Advertising', '["recruiting_agency", "platform"]'),
('inbound_website', 'Company Website', '["employer"]'),
('job_board', 'Job Board Application', '["employer", "platform"]'),

-- Partnership Sources
('agency_partner', 'Recruiting Agency Partner', '["platform"]');
```

---

## PRACTICAL EXAMPLES

### **Example 1: Agency Recruiter Sources Candidate**
```sql
-- Submission record
candidate_submissions: {
  candidate_id: 123,
  job_id: 456,
  submission_type_id: 1,        -- 'agency_sourced_submittal'
  source_type_id: 5,            -- 'linkedin'  
  source_entity_id: 78,         -- references source_entities.id
  source_entity_type: 'user',   -- specific recruiter
  submitted_by_user_id: 78
}

-- Source entity record
source_entities: {
  id: 78,
  entity_type: 'user',
  entity_id: 78,                -- users.id
  entity_name: 'John Smith, Senior Recruiter',
  parent_entity_id: 99          -- recruiting agency
}
```

### **Example 2: Employee Referral to Employer**
```sql
candidate_submissions: {
  candidate_id: 234,
  job_id: 567,
  submission_type_id: 8,        -- 'employee_referral'
  source_type_id: 7,            -- 'referral_employee'
  source_entity_id: 89,         -- referring employee
  source_entity_type: 'user',
  submitted_by_user_id: 89
}
```

### **Example 3: Platform Operations View**
```sql
candidate_submissions: {
  candidate_id: 345,
  job_id: 678,
  submission_type_id: 11,       -- 'agency_partner_submittal'
  source_type_id: 12,           -- 'agency_partner'
  source_entity_id: 101,        -- recruiting agency
  source_entity_type: 'recruiting_agency',
  submitted_by_user_id: 202     -- platform admin
}
```

---

## API RESPONSE EXAMPLES

### **GET /submissions/{id} - Agency View**
```json
{
  "id": 123,
  "candidate_id": 456,
  "job_id": 789,
  "submission_type": {
    "code": "agency_sourced_submittal",
    "display_name": "Candidate Submittal (Sourced)"
  },
  "source_type": {
    "code": "linkedin",
    "display_name": "LinkedIn"  
  },
  "source_entity": {
    "type": "user",
    "id": 78,
    "name": "John Smith, Senior Recruiter",
    "agency": "TechRecruit Inc."
  }
}
```

### **GET /submissions/{id} - Employer View**
```json
{
  "id": 123,
  "candidate_id": 456,  
  "job_id": 789,
  "submission_type": {
    "code": "agency_submittal",
    "display_name": "Agency Submittal"
  },
  "source_type": {
    "code": "agency_partner",
    "display_name": "Recruiting Agency Partner"
  },
  "source_entity": {
    "type": "recruiting_agency",
    "id": 99,
    "name": "TechRecruit Inc.",
    "recruiter": "John Smith"
  }
}
```

---

## DESIGN BENEFITS

### **Extensibility**
- Add new submission/source types via configuration, not schema changes
- JSON persona filtering allows flexible type availability
- Hierarchical source entities support complex org structures

### **Granular Attribution**  
- Track specific recruiter, department, or agency
- Support partnership and referral attribution chains
- Complete audit trail for compliance

### **Multi-Persona Support**
- Same data serves different UI presentations
- Terminology appropriate per persona
- Consistent data model across all interfaces  

### **Performance Optimized**
- Integer foreign keys for fast joins
- Strategic indexes on common query patterns
- Normalized design prevents data duplication

---

## NEXT STEPS

1. **Integration with Stage/Status System** - Link to recruiting lifecycle from terminology research
2. **Migration Strategy** - Plan for transitioning existing data
3. **API Specification** - Define REST endpoints using this schema
4. **UI Mockups** - Design interfaces showing persona-specific terminology
5. **Performance Testing** - Validate schema under expected load