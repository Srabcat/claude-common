# Candidate-Organization Relationship Examples

## 🎯 The Core Problem

**Current Schema Issue**: `user_roles` requires `organization_id` but candidates don't naturally belong to organizations.

```sql
-- This is problematic:
CREATE TABLE user_roles (
    user_id UUID REFERENCES users(id),
    organization_id UUID REFERENCES organizations(id), -- Required but candidates don't have orgs
    role VARCHAR(50) CHECK (role IN (..., 'candidate'))
);
```

## 📝 Real-World Scenarios

### **Scenario 1: Self-Application (Direct Apply)**
```
Sarah visits TechCorp's career page and applies for Software Engineer role
```

**Data Flow:**
1. Sarah creates account → `users` table
2. Sarah becomes candidate → `candidates` table  
3. Sarah applies to job → `applications` table

**Question**: What should `user_roles.organization_id` be?
- ❓ NULL (candidate doesn't belong to organization)
- ❓ TechCorp's org ID (she's applying there)
- ❓ No user_roles entry for candidates

---

### **Scenario 2: Agency Sourcing**
```
Elite Recruiting finds John on LinkedIn, adds him to their system, submits him to client
```

**Data Flow:**
1. Recruiter creates John's profile → `users` + `candidates`
2. John becomes candidate in Elite's system
3. Elite submits John to client job → `applications`

**Question**: What organization does John belong to?
- ❓ Elite Recruiting (they sourced him)
- ❓ Client company (where he's applying)
- ❓ Both (different roles in different systems)

---

### **Scenario 3: Platform Marketplace**
```
Maria registers on TalentMarketplace, gets matched to multiple jobs by different recruiters
```

**Data Flow:**
1. Maria creates profile → `users` + `candidates`
2. Multiple recruiters see her profile
3. Each recruiter can submit her to their clients

**Question**: Which organization does Maria belong to?
- ❓ TalentMarketplace platform
- ❓ Multiple organizations (each recruiter's)
- ❓ No organization (she's independent)

---

### **Scenario 4: Cross-Tenant Candidate**
```
Same person exists in multiple ATS systems
```

**Alex's Journey:**
1. Applies directly to TechCorp → TechCorp tenant
2. Also sourced by Elite Recruiting → Elite tenant  
3. Also on TalentMarketplace → Platform tenant

**Questions:**
- Same `users.id` across all tenants?
- Different `candidates.id` in each tenant?
- How to link these identities?

---

## 🔧 Proposed Solutions

### **Solution A: Nullable Organization ID**
```sql
CREATE TABLE user_roles (
    user_id UUID REFERENCES users(id),
    organization_id UUID REFERENCES organizations(id), -- NOW NULLABLE
    tenant_id UUID REFERENCES tenants(id), -- Required for isolation
    role VARCHAR(50),
    CONSTRAINT check_candidate_org CHECK (
        (role = 'candidate' AND organization_id IS NULL) OR 
        (role != 'candidate' AND organization_id IS NOT NULL)
    )
);
```

**Examples:**
```sql
-- Sarah (self-applicant) - no organization
INSERT INTO user_roles VALUES (sarah_id, NULL, techcorp_tenant, 'candidate');

-- John (agency-sourced) - belongs to agency
INSERT INTO user_roles VALUES (john_id, elite_org_id, elite_tenant, 'candidate');

-- Recruiter - belongs to organization  
INSERT INTO user_roles VALUES (recruiter_id, elite_org_id, elite_tenant, 'recruiter');
```

---

### **Solution B: Separate Candidate Roles**
```sql
-- Remove candidates from user_roles entirely
CREATE TABLE candidate_roles (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    tenant_id UUID REFERENCES tenants(id),
    sourced_by_org_id UUID REFERENCES organizations(id), -- Who added them
    sourced_by_user_id UUID REFERENCES users(id), -- Which recruiter
    candidate_status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- user_roles only for employees/staff
CREATE TABLE user_roles (
    user_id UUID REFERENCES users(id),
    organization_id UUID NOT NULL REFERENCES organizations(id), -- Always required
    role VARCHAR(50) CHECK (role NOT IN ('candidate')), -- No candidates here
);
```

**Examples:**
```sql
-- Sarah (self-applicant)
INSERT INTO candidate_roles VALUES (gen_random_uuid(), sarah_id, techcorp_tenant, NULL, NULL, 'active');

-- John (agency-sourced)  
INSERT INTO candidate_roles VALUES (gen_random_uuid(), john_id, elite_tenant, elite_org_id, recruiter_id, 'active');

-- Maria (platform, multiple sources)
INSERT INTO candidate_roles VALUES (gen_random_uuid(), maria_id, platform_tenant, recruiter1_org, recruiter1_id, 'active');
INSERT INTO candidate_roles VALUES (gen_random_uuid(), maria_id, platform_tenant, recruiter2_org, recruiter2_id, 'active');
```

---

### **Solution C: Context-Based Organization Assignment**
```sql
-- Candidates belong to organization based on context
CREATE TABLE user_roles (
    user_id UUID REFERENCES users(id),
    organization_id UUID REFERENCES organizations(id),
    context VARCHAR(50), -- 'employee', 'candidate_source', 'candidate_target'
    role VARCHAR(50)
);
```

**Examples:**
```sql
-- Sarah applies to TechCorp
INSERT INTO user_roles VALUES (sarah_id, techcorp_org_id, 'candidate_target', 'candidate');

-- John sourced by Elite for FinTech client
INSERT INTO user_roles VALUES (john_id, elite_org_id, 'candidate_source', 'candidate');
INSERT INTO user_roles VALUES (john_id, fintech_org_id, 'candidate_target', 'candidate');

-- Recruiter works for Elite
INSERT INTO user_roles VALUES (recruiter_id, elite_org_id, 'employee', 'recruiter');
```

---

## 🤔 Decision Factors

### **Solution A: Nullable Org ID**
**Pros:**
- ✅ Minimal schema change
- ✅ Simple to understand
- ✅ Consistent table structure

**Cons:**
- ❌ NULL handling in queries
- ❌ Doesn't capture sourcing relationship
- ❌ Hard to track who added candidate

### **Solution B: Separate Candidate Roles**
**Pros:**
- ✅ Clear separation of concerns
- ✅ Captures sourcing information
- ✅ Supports multiple candidate relationships
- ✅ No NULLs in user_roles

**Cons:**
- ❌ Additional table complexity
- ❌ Different patterns for different user types
- ❌ More joins for some queries

### **Solution C: Context-Based**
**Pros:**
- ✅ Captures full relationship context
- ✅ Flexible for complex scenarios
- ✅ Single pattern for all relationships

**Cons:**
- ❌ Complex to query
- ❌ Easy to create inconsistent data
- ❌ Requires application logic to interpret context

---

## 🎯 Recommendation Framework

**Choose based on your complexity needs:**

### **Simple Use Case** → Solution A
- Mostly direct applications
- Limited cross-system candidates
- Simple permission model

### **Agency-Heavy Use Case** → Solution B  
- Complex sourcing relationships
- Need to track who added candidates
- Multiple recruiters per candidate

### **Platform/Complex Use Case** → Solution C
- Complex multi-party relationships
- Candidates exist in multiple contexts
- Need full relationship tracking

---

## 📊 Example Queries

### **Solution A: Finding candidates in tenant**
```sql
SELECT u.email, c.skills 
FROM users u
JOIN candidates c ON u.id = c.user_id
JOIN user_roles ur ON u.id = ur.user_id
WHERE ur.tenant_id = 'techcorp-tenant' 
  AND ur.role = 'candidate';
```

### **Solution B: Finding candidates sourced by organization**
```sql
SELECT u.email, c.skills, cr.sourced_by_org_id
FROM users u
JOIN candidates c ON u.id = c.user_id  
JOIN candidate_roles cr ON u.id = cr.user_id
WHERE cr.tenant_id = 'elite-tenant'
  AND cr.sourced_by_org_id = 'elite-org-id';
```

### **Solution C: Finding all candidate relationships**
```sql
SELECT u.email, ur.organization_id, ur.context, ur.role
FROM users u
JOIN user_roles ur ON u.id = ur.user_id
WHERE ur.role = 'candidate'
  AND ur.user_id = 'maria-id';
```

Which approach makes the most sense for your use cases?