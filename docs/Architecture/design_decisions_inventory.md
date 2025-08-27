# ATS Schema Design Decisions - Inventory & Framework

## 🎯 Topics That Need Resolution

### 1. **Organization Segment-Specific Fields**

#### What We Know:
- Current design: Organizations table with `settings JSONB`
- Different segments need different fields:
  - **Employer**: Approval workflows, HRIS integration, compliance settings
  - **Agency**: Commission rates, specializations, agency type (contingency/retained)
  - **Platform**: Marketplace fees, verification settings, revenue sharing

#### What We Don't Know:
- Which approach is best for storing segment-specific data
- How many fields will be segment-specific vs universal
- Performance implications of each approach

#### Current Implementation:
```sql
CREATE TABLE organizations (
    id UUID PRIMARY KEY,
    tenant_id UUID,
    type VARCHAR(50) CHECK (type IN ('company', 'agency', 'department', 'team')),
    settings JSONB DEFAULT '{}',  -- All segment-specific data here
    -- Universal fields only
);
```

---

### 2. **User Type-Specific Fields**

#### What We Know:
- Current design: Single `users` table + `candidates` extension table
- Different user types need different fields:
  - **Recruiters**: Specializations, success metrics, commission splits
  - **Hiring Managers**: Approval levels, department budget access
  - **Candidates**: Skills, salary expectations, work authorization (HAS extension table)
  - **Platform Staff**: Admin levels, system access permissions

#### What We Don't Know:
- Why candidates get special treatment (extension table) but others don't
- Whether other user types should also get extension tables
- Consistency philosophy across user types

#### Current Implementation:
```sql
-- Universal person data
CREATE TABLE users (
    id UUID PRIMARY KEY,
    email VARCHAR(255),
    first_name VARCHAR(100),
    -- Only universal fields
);

-- Only candidates get extension
CREATE TABLE candidates (
    user_id UUID REFERENCES users(id),
    skills JSONB,
    salary_expectations JSONB,
    work_authorization VARCHAR(100),
    -- Candidate-specific fields
);

-- No extension tables for other user types
```

---

### 3. **Candidate-Organization Relationship Problem**

#### What We Know:
- Candidates don't "belong" to an organization like employees do
- `user_roles` requires `organization_id` but candidates may not have one
- Multiple application scenarios exist

#### What We Don't Know:
- How to handle candidates who self-apply (no organization)
- How to represent candidates sourced by multiple recruiters
- Whether candidates should ever have `user_roles` entries

#### Current Problem:
```sql
CREATE TABLE user_roles (
    user_id UUID REFERENCES users(id),
    organization_id UUID REFERENCES organizations(id), -- PROBLEM: Candidates don't have orgs
    role VARCHAR(50) CHECK (role IN (..., 'candidate')),
);
```

#### Application Scenarios:
1. **Self-application**: Candidate applies directly from job posting
2. **Agency sourcing**: Recruiter finds candidate, adds to their system
3. **Internal referral**: Employee refers external candidate
4. **Platform discovery**: Platform matches candidate to multiple jobs

---

## 🏗️ Three Architectural Approaches

### **Approach A: JSONB Settings (Current)**
```sql
-- Segment-specific data in JSON
organizations (
    type VARCHAR(50),
    settings JSONB  -- {"commission_rate": 20, "agency_type": "executive_search"}
);

users (
    email VARCHAR(255),
    -- No type-specific fields except candidates table
);
```

**Pros:**
- ✅ Schema flexibility without migrations
- ✅ Minimal table count
- ✅ Easy to add new fields

**Cons:**
- ❌ No type safety
- ❌ Complex queries for type-specific data
- ❌ Inconsistent (candidates get special treatment)

---

### **Approach B: Extension Tables**
```sql
-- Base tables with extensions
organizations (...);
agencies (org_id, commission_rates, specializations, agency_type);
employers (org_id, approval_workflows, hris_integration);
platforms (org_id, marketplace_fees, verification_settings);

users (...);
candidates (user_id, skills, salary_expectations);
recruiters (user_id, specializations, success_rate);
hiring_managers (user_id, approval_level, budget_access);
```

**Pros:**
- ✅ Type safety
- ✅ Clear data modeling
- ✅ Optimized queries
- ✅ Consistent approach

**Cons:**
- ❌ More tables to maintain
- ❌ Schema migrations for new fields
- ❌ Complex joins

---

### **Approach C: Single Table with All Fields**
```sql
-- Everything in base tables
organizations (
    type VARCHAR(50),
    -- Employer fields
    approval_workflows BOOLEAN,
    hris_integration VARCHAR(100),
    -- Agency fields  
    commission_rate DECIMAL(5,2),
    agency_type VARCHAR(50),
    -- Platform fields
    marketplace_fees JSONB,
    -- Many will be NULL based on type
);

users (
    email VARCHAR(255),
    -- Candidate fields
    skills JSONB,
    salary_expectations JSONB,
    -- Recruiter fields
    specializations JSONB,
    success_rate DECIMAL(5,2),
    -- Many will be NULL based on role
);
```

**Pros:**
- ✅ Simple queries
- ✅ No joins needed
- ✅ Easy to understand

**Cons:**
- ❌ Many NULL fields
- ❌ Wide tables
- ❌ Type confusion

---

## 🎯 Decision Framework

### **Evaluation Criteria**

| Criteria | Weight | Description |
|----------|---------|-------------|
| **Type Safety** | High | Prevent invalid data, clear field definitions |
| **Query Performance** | High | Fast queries for common operations |
| **Schema Evolution** | Medium | Easy to add new fields/types |
| **Development Complexity** | Medium | How complex is application code |
| **Data Consistency** | High | Uniform approach across similar entities |
| **Storage Efficiency** | Low | Disk space and memory usage |

### **Scoring Matrix**

| Approach | Type Safety | Performance | Evolution | Dev Complexity | Consistency | Total |
|----------|-------------|-------------|-----------|----------------|-------------|-------|
| **A: JSONB** | 2/5 | 3/5 | 5/5 | 2/5 | 2/5 | **14/25** |
| **B: Extensions** | 5/5 | 4/5 | 2/5 | 4/5 | 5/5 | **20/25** |
| **C: All Fields** | 3/5 | 5/5 | 3/5 | 5/5 | 3/5 | **19/25** |

### **Use Case Analysis**

#### **High Type Diversity + Frequent Queries** → Extension Tables
- Many segment-specific fields
- Complex business logic per type
- Performance-critical queries

#### **Rapid Prototyping + Unknown Requirements** → JSONB
- Requirements still evolving
- Need schema flexibility
- Less critical performance

#### **Simple Types + Few Segments** → Single Table
- Limited type diversity
- Well-known requirements
- Simple application logic

---

## 🔍 Specific Issues to Resolve

### **1. Candidate-Organization Relationship**

#### **Option 1: Candidates Never Have Organization**
```sql
user_roles (
    user_id UUID,
    organization_id UUID NULL, -- Allow NULL for candidates
    role VARCHAR(50)
);
```

#### **Option 2: Candidates Belong to "Sourcing" Organization**
```sql
-- Candidate belongs to whoever added them
candidates (
    user_id UUID,
    sourced_by_org_id UUID REFERENCES organizations(id), -- Agency/employer who added them
);
```

#### **Option 3: Separate Candidate Roles Table**
```sql
candidate_roles (
    user_id UUID,
    tenant_id UUID,  -- Which system they're a candidate in
    role VARCHAR(50) DEFAULT 'candidate'
);
```

### **2. Cross-Tenant Candidate Access**

**Scenario**: Same person is candidate in multiple systems
- Candidate in employer's ATS (applied directly)
- Also candidate in agency's ATS (sourced by recruiter)
- Also candidate in platform marketplace

**Questions**:
- One user record across all tenants?
- Separate candidate records per tenant?
- How to handle duplicate detection?

---

---

## 📋 Secondary Topics (Future Discussion)

### **4. Prospect Management System**

#### What We Know:
- Both candidates and employers start as "prospects" before becoming active entities
- Recruiting agencies prospect both potential candidates AND potential client companies
- Response rates are very low (~1%), creating high volume of prospect data
- Prospects should not pollute main candidate/organization tables

#### What We Don't Know:
- How to structure prospect-to-active transition workflow
- Field alignment between prospect and active entity tables
- Prospect lifecycle management and cleanup policies

#### Proposed Approach:
```sql
-- Separate prospect tables to avoid polluting main tables
CREATE TABLE candidate_prospects (
    id UUID PRIMARY KEY,
    sourced_by_user_id UUID REFERENCES users(id),
    sourced_by_org_id UUID REFERENCES organizations(id),
    prospect_status VARCHAR(50), -- 'new', 'contacted', 'responded', 'converted', 'dead'
    -- Subset of candidate fields for initial outreach
    email VARCHAR(255),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    current_company VARCHAR(255),
    linkedin_url VARCHAR(500),
    prospect_score DECIMAL(5,2), -- AI/manual scoring
    last_contact_attempt TIMESTAMP,
    conversion_date TIMESTAMP, -- When they became actual candidate
    converted_to_candidate_id UUID REFERENCES candidates(id)
);

CREATE TABLE employer_prospects (
    id UUID PRIMARY KEY,
    sourced_by_user_id UUID REFERENCES users(id),
    prospect_status VARCHAR(50),
    company_name VARCHAR(255),
    website VARCHAR(255),
    industry VARCHAR(100),
    estimated_size VARCHAR(50),
    potential_contact_email VARCHAR(255),
    prospect_score DECIMAL(5,2),
    conversion_date TIMESTAMP,
    converted_to_org_id UUID REFERENCES organizations(id)
);
```

---

### **5. Advanced Duplicate Detection System**

#### What We Know:
- Duplicate detection is critical across all three organization types (Agency, Employer, Platform)
- Candidates are the most important entity to deduplicate
- People have multiple contact methods (emails, phones, social handles)
- Detection should be based on multiple identifiable attributes

#### What We Don't Know:
- Confidence scoring algorithms for different match types
- How to handle partial matches vs exact matches
- Merge workflow and manual review process

#### Proposed Approach:
```sql
-- Multiple contact methods per person
CREATE TABLE person_contact_methods (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    contact_type VARCHAR(50), -- 'email', 'phone', 'linkedin', 'github', etc.
    contact_value VARCHAR(500),
    is_primary BOOLEAN DEFAULT false,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enhanced duplicate detection with multiple matching criteria
CREATE TABLE duplicate_candidates (
    id UUID PRIMARY KEY,
    primary_candidate_id UUID REFERENCES candidates(id),
    duplicate_candidate_id UUID REFERENCES candidates(id),
    match_criteria JSONB, -- {"email_match": true, "phone_match": false, "name_similarity": 0.85}
    confidence_score DECIMAL(5,2), -- 0-100 overall confidence
    detection_method VARCHAR(100), -- 'automatic', 'manual', 'ai_suggested'
    review_status VARCHAR(50), -- 'pending', 'confirmed_duplicate', 'confirmed_different', 'merged'
    reviewed_by UUID REFERENCES users(id),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Audit trail for merges
CREATE TABLE candidate_merge_history (
    id UUID PRIMARY KEY,
    merged_from_candidate_id UUID, -- Original candidate (now inactive)
    merged_to_candidate_id UUID REFERENCES candidates(id), -- Target candidate
    merged_by UUID REFERENCES users(id),
    merge_strategy JSONB, -- Which fields were kept from which record
    merged_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

**Detection Algorithms:**
- **Email exact match**: 95% confidence
- **Phone exact match**: 90% confidence  
- **Name + company similarity**: 80% confidence
- **LinkedIn profile match**: 99% confidence
- **Resume content similarity**: 70-85% confidence (AI-powered)
- **Multiple weak signals**: Combination scoring

---

## 📋 Primary Topics (Immediate Resolution Required)

1. **Choose architectural approach** for segment-specific fields
2. **Resolve candidate-organization relationship** model
3. **Define cross-tenant candidate strategy**
4. **Create consistent pattern** for all user types
5. **Update schema** with chosen approach
6. **Update documentation** with rationale

## 📋 Secondary Topics (After Primary Resolution)

7. **Design prospect management system** for low-conversion outreach
8. **Implement advanced duplicate detection** with multiple contact methods
9. **Create prospect-to-active transition workflows**
10. **Define duplicate merge and review processes**

## 🤔 Questions for Decision

1. **How many segment-specific fields** do you anticipate? (5? 20? 50?)
2. **How often will you add new fields** for segments/types?
3. **What's your tolerance for complex queries** vs simple schema?
4. **Should candidates ever "belong" to an organization**?
5. **Do you need cross-tenant candidate sharing**?

*Let's use this framework to make systematic decisions rather than gut feelings.*