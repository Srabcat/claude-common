# 6 Requirements & Current Schema for Duplicate Detection

## 6 Requirements from F-Duplicate.md

Duplicate Candidate
1. **Detect and maintain one canonical record per candidate** (deduplication) - always
2. **Track every candidate to canonical candidate**, linked to recruiter and agency, across all agencies - often (10% of candidates)
3. Admin can see all dup candidates for the same canonical candidates (within the same tenant, they can see their own dups, per recruiter or per tenant)
4. Detect duplicates when new candidate is added or identifer changed (can trigger new dups)
5. **Keep history of identifier changes** (email, phone)

Submission conflicts

2. **Track every submission to canonical candidate**, linked to recruiter and agency, across all agencies - often (10% of candidates)
3. **Flag real-time submission conflicts** at creation, submission, or attribute edits
5. **Give visibility into duplicates and conflicts** for recruiters, agencies, and platform
6. **Time-bound exclusive representation logic ** per employer (6-12 months from submission date)

## Current Schema - Candidate & Duplicate Related Tables

### 1. person (Universal base table)
```sql
CREATE TABLE person (
    person_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    middle_name VARCHAR(100),
    preferred_name VARCHAR(100),
    person_type VARCHAR(20) NOT NULL CHECK (person_type IN ('candidate', 'agency_recruiter', 'employer', 'platform')),
    tenant_id INTEGER NOT NULL REFERENCES teams(id),
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP,
    created_by UUID
);
```

### 2. person_identifier (Identity resolution for duplicate detection)
```sql
CREATE TABLE person_identifier (
    identifier_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    person_id UUID NOT NULL REFERENCES person(person_id),
    identifier_type VARCHAR(20) NOT NULL CHECK (identifier_type IN ('email', 'phone', 'linkedin', 'github', 'twitter')),
    identifier_value VARCHAR(255) NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    is_verified BOOLEAN DEFAULT FALSE,
    tenant_id INTEGER NOT NULL REFERENCES teams(id),
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP,
    
    UNIQUE(identifier_type, identifier_value, tenant_id)
);
```

### 3. candidate (Candidate-specific attributes)
```sql
CREATE TABLE candidate (
    person_id UUID PRIMARY KEY REFERENCES person(person_id),
    
    -- Professional details
    years_experience DECIMAL(4,1),
    years_experience_last_verified DATE,
    
    -- Location
    current_city_id INTEGER REFERENCES city(city_id),
    current_location_notes TEXT,
    
    -- Compensation
    comp_range_min INTEGER,
    comp_range_max INTEGER,
    comp_currency CHAR(3) DEFAULT 'USD',
    
    -- Availability & preferences
    availability_status VARCHAR(20) CHECK (availability_status IN ('active', 'passive', 'not_looking')),
    availability_last_verified DATE,
    work_pref_remote BOOLEAN DEFAULT FALSE,
    work_pref_hybrid BOOLEAN DEFAULT FALSE,
    work_pref_onsite BOOLEAN DEFAULT FALSE,
    
    -- Source and notes
    source_type VARCHAR(20) CHECK (source_type IN ('agency_partner', 'sourced', 'applied', 'referral', 'database', 'other')),
    location_notes TEXT,
    compensation_notes TEXT,
    work_visa_notes TEXT,
    general_notes TEXT,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### 4. candidate_submission (Recruiter's view of candidate)
```sql
CREATE TABLE candidate_submission (
    submission_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    person_id UUID NOT NULL REFERENCES person(person_id), -- Canonical candidate
    recruiter_person_id UUID NOT NULL REFERENCES person(person_id), -- Recruiter who submitted
    employer_tenant_id INTEGER NOT NULL REFERENCES teams(id), -- Which employer
    job_reference VARCHAR(255),
    
    -- Snapshot of recruiter's data at submission time (immutable)
    submitted_email VARCHAR(255),
    submitted_phone VARCHAR(50),
    submission_notes TEXT,
    
    submitted_at TIMESTAMP DEFAULT NOW(),
    modified_at TIMESTAMP
);
```

### 5. candidate_representation (Time-bound exclusive representation)
```sql
CREATE TABLE candidate_representation (
    representation_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    person_id UUID NOT NULL REFERENCES person(person_id), -- The candidate
    recruiter_person_id UUID NOT NULL REFERENCES person(person_id), -- Current representative
    employer_tenant_id INTEGER NOT NULL REFERENCES teams(id), -- For which employer
    
    -- Time bounds for exclusive representation
    starts_at TIMESTAMP NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    
    source_submission_id UUID REFERENCES candidate_submission(submission_id),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'expired', 'revoked', 'transferred')),
    
    -- Admin override capability
    admin_override BOOLEAN DEFAULT FALSE,
    override_reason TEXT,
    created_by UUID,
    created_at TIMESTAMP DEFAULT NOW(),
    modified_by UUID,
    modified_at TIMESTAMP,
    
    UNIQUE(person_id, employer_tenant_id) -- One active representation per candidate per employer
);
```

### 6. duplicate_conflict (Admin conflict resolution)
```sql
CREATE TABLE duplicate_conflict (
    conflict_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    person_id_1 UUID NOT NULL REFERENCES person(person_id), -- First candidate record
    person_id_2 UUID NOT NULL REFERENCES person(person_id), -- Potentially duplicate record
    employer_tenant_id INTEGER NOT NULL REFERENCES teams(id), -- Employer where conflict detected
    
    -- What triggered the conflict
    trigger_submission_id UUID REFERENCES candidate_submission(submission_id),
    conflict_type VARCHAR(20) NOT NULL CHECK (conflict_type IN ('email_match', 'phone_match', 'name_similarity')),
    confidence_score DECIMAL(3,2),
    
    -- Resolution tracking
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'same_person', 'different_people', 'needs_more_info')),
    resolution_notes TEXT,
    resolved_by UUID,
    resolved_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT NOW()
);
```

## Requirements Mapping to Current Schema

| Requirement | Current Table(s) | Status |
|-------------|------------------|---------|
| #1: One canonical record per candidate | `person` + `person_identifier` UNIQUE constraint | ✅ Complete |
| #2: Track every submission | `candidate_submission` (immutable log) | ✅ Complete |
| #3: Flag real-time duplicates | Need trigger on `person_identifier` + `candidate_submission` | ❓ Missing |
| #4: Keep history of identifier changes | `person_identifier` (need status columns) | ❓ Missing |
| #5: Give visibility into duplicates | `duplicate_conflict` table | ✅ Complete |
| #6: Time-bound exclusive representation | `candidate_representation` | ✅ Complete |

## What's Missing

### For Requirement #3 (Real-time flagging):
```sql
-- Add to candidate_submission:
ALTER TABLE candidate_submission ADD COLUMN is_duplicate BOOLEAN DEFAULT FALSE;
ALTER TABLE candidate_submission ADD COLUMN duplicate_reason TEXT;
ALTER TABLE candidate_submission ADD COLUMN detected_duplicates JSONB;
```

### For Requirement #4 (History tracking):
```sql
-- Add to person_identifier:
ALTER TABLE person_identifier ADD COLUMN status VARCHAR(20) DEFAULT 'active' 
CHECK (status IN ('active', 'superseded', 'deleted'));
ALTER TABLE person_identifier ADD COLUMN superseded_by_identifier_id UUID 
REFERENCES person_identifier(identifier_id);
```

## Summary

**Good News**: 4 out of 6 requirements already handled by existing schema!
**Missing**: Just need to enhance 2 existing tables with additional columns for real-time flagging and history tracking.