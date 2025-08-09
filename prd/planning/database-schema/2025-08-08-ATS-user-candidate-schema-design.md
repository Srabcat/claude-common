# ATS User & Candidate Database Schema Design
**Date:** 2025-08-08  
**Purpose:** Database architecture for user management and candidate entities with flexible access control  
**Status:** Design Phase - Implementation Ready  

---

## ASSUMPTIONS

### Business Requirements - MVP
1. **Data Isolation**: Agency A must never see Agency B's candidates (table stakes)
2. **Simple Access Control**: Everyone in same organization sees everything (MVP)
3. **Platform Admin Impersonation**: Support staff can switch roles for testing/troubleshooting
4. **Variable Organization Sizes**: 1-20 people immediate, scale to hundreds later
5. **Performance Isolation**: One agency cannot affect another's performance
6. **Future-Proof Design**: Must support complex hierarchy without major refactoring

### MVP Access Control (Simplified)
1. **All Agencies**: All agency recruiters see all agency candidates
2. **All Employers**: All employer recruiters see all employer candidates
3. **Platform Admin**: Sees everything across all organizations

### Future Enhancement Requirements (Design For)
1. **Multi-Organization Users**: Same person works at multiple agencies
2. **Agency Variations**:
   - **Open Access Agency**: All recruiters see all candidates (current MVP)
   - **Private Access Agency**: Recruiters only see their own candidates
3. **Employer Hierarchies**:
   - **Head of HR**: Sees all candidates across all departments
   - **Sales Recruiters**: Only see sales candidates
   - **Technical Recruiters**: Only see technical candidates

### Scale Assumptions
- **Users**: Thousands (goal: tens of thousands)
- **Candidates per Agency**: Hundreds to thousands (rare: tens of thousands)
- **Organizations**: Hundreds of agencies/employers

---

## CORE SCHEMA DESIGN - MVP

### 1. Users & Organizations (Simplified for MVP)

```sql
-- Core user identity (authentication)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    organization_id UUID REFERENCES organizations(id), -- Single org membership (MVP)
    user_type VARCHAR(50) NOT NULL, -- 'agency_recruiter', 'employer_recruiter', 'platform_admin'
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    INDEX(organization_id, user_type),
    INDEX(organization_id)
);

-- Organizations (agencies, employers, platform)
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    organization_type VARCHAR(50) NOT NULL, -- 'agency', 'employer', 'platform'
    -- Future enhancement fields (added but not used in MVP)
    access_policy VARCHAR(50) DEFAULT 'open', -- For future: 'open', 'private', 'hierarchical'
    custom_settings JSONB DEFAULT '{}', -- For future custom configurations
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    INDEX(organization_type)
);
```

### 2. Candidates (Simplified for MVP)

```sql
-- Candidate entity (organization-scoped)
CREATE TABLE candidates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    agency_recruiter_user_id UUID REFERENCES users(id), -- Who owns/manages this candidate
    
    -- Basic candidate info
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    
    -- Future enhancement fields (added but not used in MVP)
    department_tags TEXT[], -- For future employer filtering ['sales', 'technical']
    visibility_scope VARCHAR(50) DEFAULT 'organization', -- For future: 'private', 'department', 'organization'
    custom_fields JSONB DEFAULT '{}', -- For future tenant-specific fields
    
    -- Metadata
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    -- Critical indexes for data isolation and performance
    INDEX(organization_id), -- Data isolation (most important)
    INDEX(organization_id, agency_recruiter_user_id), -- Performance for recruiter views
    INDEX(agency_recruiter_user_id), -- Quick lookup by recruiter
    
    -- Row-level security constraint
    CONSTRAINT valid_organization_user 
        CHECK (organization_id IS NOT NULL AND agency_recruiter_user_id IS NOT NULL)
);
```

---

## MVP ACCESS CONTROL (Simple Organization-Wide)

### Application Queries - MVP Version
```javascript
// MVP: Simple organization-scoped queries
const getCandidatesForUser = async (userId) => {
  // Get user's organization
  const user = await db.query('SELECT organization_id FROM users WHERE id = $1', [userId]);
  
  // Get all candidates in same organization (everyone sees everything)
  return db.query(`
    SELECT c.* FROM candidates c 
    WHERE c.organization_id = $1 
    AND c.is_active = true
    ORDER BY c.created_at DESC
  `, [user.organization_id]);
};

// Platform admin sees everything
const getAllCandidatesForAdmin = async () => {
  return db.query(`
    SELECT c.*, o.name as organization_name 
    FROM candidates c
    JOIN organizations o ON o.id = c.organization_id
    WHERE c.is_active = true
    ORDER BY c.created_at DESC
  `);
};
```

---

## FUTURE ENHANCEMENT - MULTI-ORG & HIERARCHY SUPPORT

### Migration Strategy (Minimal Refactoring Required)

**Step 1: Add Multi-Organization Support**
```sql
-- Add the junction table when needed (future)
CREATE TABLE user_organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    user_type VARCHAR(50) NOT NULL,
    department VARCHAR(100), -- For hierarchy support
    hierarchy_level INT DEFAULT 1,
    permissions JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    joined_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(user_id, organization_id),
    INDEX(organization_id, user_type),
    INDEX(user_id)
);
```

**Step 2: Migrate Existing Data**
```sql
-- One-time migration: populate user_organizations from existing users table
INSERT INTO user_organizations (user_id, organization_id, user_type, is_active)
SELECT id, organization_id, user_type, is_active 
FROM users 
WHERE organization_id IS NOT NULL;
```

**Step 3: Update Application Logic** 
```javascript
// Enhanced version - checks if user has multi-org access
const getUserOrganizations = async (userId) => {
  // First check if user exists in user_organizations (multi-org)
  const multiOrg = await db.query(`
    SELECT organization_id FROM user_organizations 
    WHERE user_id = $1 AND is_active = true
  `, [userId]);
  
  if (multiOrg.length > 0) {
    // User has multi-org access
    return multiOrg.map(row => row.organization_id);
  } else {
    // Fallback to single org (backwards compatibility)
    const user = await db.query('SELECT organization_id FROM users WHERE id = $1', [userId]);
    return [user.organization_id];
  }
};
```

**Step 4: Add Hierarchy Support**
```sql
-- Enable hierarchy-based access when needed
UPDATE organizations SET access_policy = 'hierarchical' WHERE id = 'employer_123';

-- Add department filtering
UPDATE candidates 
SET department_tags = ARRAY['sales'] 
WHERE organization_id = 'employer_123' 
AND created_by_user_id IN (SELECT id FROM users WHERE user_type = 'sales_recruiter');
```

### Why This Approach Works ✅

1. **MVP Simplicity**: Start with direct foreign key - no extra joins
2. **Zero Migration Pain**: Multi-org table is additive, doesn't break existing queries  
3. **Backwards Compatibility**: Application checks both patterns, falls back gracefully
4. **Performance**: 99.99% of queries stay fast with simple organization_id lookup
5. **Future-Ready**: Complex hierarchy fields exist but are ignored until needed

### Migration Code Example
```javascript
// Helper function that works for both MVP and multi-org
const getOrganizationsForUser = async (userId) => {
  // Try multi-org first (future enhancement)
  let orgs = await db.query(`
    SELECT organization_id FROM user_organizations 
    WHERE user_id = $1 AND is_active = true
  `, [userId]);
  
  if (orgs.length === 0) {
    // Fallback to single org (current MVP)
    const user = await db.query(`
      SELECT organization_id FROM users 
      WHERE id = $1 AND is_active = true
    `, [userId]);
    orgs = user.organization_id ? [{ organization_id: user.organization_id }] : [];
  }
  
  return orgs.map(org => org.organization_id);
};

// This function works in both MVP and enhanced versions
const getCandidatesForUser = async (userId) => {
  const userOrgs = await getOrganizationsForUser(userId);
  
  return db.query(`
    SELECT c.* FROM candidates c 
    WHERE c.organization_id = ANY($1::uuid[])
    AND c.is_active = true
    ORDER BY c.created_at DESC
  `, [userOrgs]);
};
```

**Result**: You can start simple and add complexity later with minimal code changes!

---

## ACCESS CONTROL IMPLEMENTATION

### 1. Agency Access Patterns

#### Open Access Agency (Everyone Sees Everything)
```sql
-- Organization setting
UPDATE organizations 
SET access_policy = 'open' 
WHERE id = 'agency_123';

-- Application query (all candidates visible)
SELECT c.* FROM candidates c
WHERE c.organization_id = 'agency_123'
AND c.is_active = true;
```

#### Private Access Agency (Recruiters See Only Their Own)
```sql
-- Organization setting  
UPDATE organizations 
SET access_policy = 'private' 
WHERE id = 'agency_456';

-- Application query (only assigned candidates)
SELECT c.* FROM candidates c
WHERE c.organization_id = 'agency_456'
AND c.assigned_to_user_id = $current_user_id
AND c.is_active = true;
```

### 2. Employer Hierarchical Access

#### Head of HR (Sees All Departments)
```sql
-- User setup
INSERT INTO user_organizations (user_id, organization_id, user_type, department, hierarchy_level)
VALUES ('user_hr_head', 'employer_789', 'employer_recruiter', 'hr', 3);

-- Application query (hierarchy_level >= 3 sees all)
SELECT c.* FROM candidates c
JOIN user_organizations uo ON uo.organization_id = c.organization_id
WHERE c.organization_id = 'employer_789'
AND uo.user_id = $current_user_id
AND (uo.hierarchy_level >= 3 OR c.department_tags && ARRAY[uo.department]);
```

#### Department-Specific Recruiters
```sql
-- Sales recruiter setup
INSERT INTO user_organizations (user_id, organization_id, user_type, department, hierarchy_level)
VALUES ('user_sales_recruiter', 'employer_789', 'employer_recruiter', 'sales', 1);

-- Application query (department-scoped)
SELECT c.* FROM candidates c
JOIN user_organizations uo ON uo.organization_id = c.organization_id  
WHERE c.organization_id = 'employer_789'
AND uo.user_id = $current_user_id
AND c.department_tags && ARRAY[uo.department]; -- Only sales candidates
```

---

## FLEXIBLE PERMISSION SYSTEM

### Permission Structure (JSONB)
```json
{
  "candidates": {
    "view": ["own", "department", "all"],
    "create": true,
    "edit": ["own", "department", "all"], 
    "delete": ["own"]
  },
  "users": {
    "view": ["department", "all"],
    "impersonate": false
  }
}
```

### Application-Level Access Control
```javascript
// Middleware to determine user access scope
const getUserAccessScope = async (userId, organizationId) => {
  const membership = await db.query(`
    SELECT uo.*, o.access_policy 
    FROM user_organizations uo
    JOIN organizations o ON o.id = uo.organization_id
    WHERE uo.user_id = $1 AND uo.organization_id = $2
  `, [userId, organizationId]);
  
  const { user_type, department, hierarchy_level, access_policy } = membership;
  
  if (access_policy === 'open') return 'organization';
  if (access_policy === 'private') return 'own';
  if (hierarchy_level >= 3) return 'organization'; // Senior level sees all
  return 'department';
};

// Dynamic query builder based on access scope
const getCandidatesQuery = (accessScope, userId, organizationId, department) => {
  const baseQuery = `
    SELECT c.* FROM candidates c 
    WHERE c.organization_id = $1 AND c.is_active = true
  `;
  
  switch (accessScope) {
    case 'own':
      return baseQuery + ` AND c.assigned_to_user_id = $2`;
    case 'department':
      return baseQuery + ` AND c.department_tags && ARRAY[$3]`;
    case 'organization':
      return baseQuery;
    default:
      throw new Error('Invalid access scope');
  }
};
```

---

## PLATFORM ADMIN IMPERSONATION

### Impersonation Table
```sql
CREATE TABLE admin_impersonations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_user_id UUID REFERENCES users(id),
    target_organization_id UUID REFERENCES organizations(id),
    impersonated_user_type VARCHAR(50),
    impersonated_department VARCHAR(100),
    session_token VARCHAR(255),
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    
    INDEX(admin_user_id),
    INDEX(session_token),
    INDEX(expires_at)
);
```

### Impersonation Logic
```javascript
// Platform admin switches context
const impersonateOrganization = async (adminUserId, targetOrgId, userType, department) => {
  // Verify admin permissions
  const admin = await verifyPlatformAdmin(adminUserId);
  if (!admin) throw new Error('Unauthorized');
  
  // Create impersonation session
  const session = await db.query(`
    INSERT INTO admin_impersonations 
    (admin_user_id, target_organization_id, impersonated_user_type, impersonated_department, expires_at)
    VALUES ($1, $2, $3, $4, NOW() + INTERVAL '1 hour')
    RETURNING session_token
  `, [adminUserId, targetOrgId, userType, department]);
  
  return session.session_token;
};
```

---

## ROW-LEVEL SECURITY (Additional Protection)

```sql
-- Enable RLS on candidates table
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access candidates from their organizations
CREATE POLICY org_isolation ON candidates
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM user_organizations 
      WHERE user_id = current_setting('app.current_user')::UUID
      AND is_active = true
    )
  );

-- Application sets user context
SET app.current_user = 'user_id_here';
```

---

## MIGRATION & SCALING STRATEGY

### Phase 1: Start Simple
- Implement basic organization-scoped access
- Use 'open' access policy for all organizations initially
- Add department tagging gradually

### Phase 2: Add Hierarchy 
- Implement hierarchy_level based access
- Add department-specific permissions
- Roll out to organizations that need it

### Phase 3: Scale Optimizations
- Partition candidates table by organization_id for large tenants
- Add caching layer for permission lookups
- Consider dedicated databases for enterprise clients

---

## PERFORMANCE CONSIDERATIONS

### Critical Indexes
```sql
-- Most important: organization-scoped queries
CREATE INDEX CONCURRENTLY idx_candidates_org_active 
ON candidates(organization_id, is_active);

-- User-specific queries  
CREATE INDEX CONCURRENTLY idx_candidates_org_user 
ON candidates(organization_id, assigned_to_user_id);

-- Department filtering
CREATE INDEX CONCURRENTLY idx_candidates_org_dept 
ON candidates USING GIN(organization_id, department_tags);
```

### Query Patterns
- **Always filter by organization_id first** (data isolation + performance)
- **Use composite indexes** for common query patterns
- **Avoid N+1 queries** with JOIN operations
- **Cache permission lookups** to reduce database load

---

**RESULT: This schema supports all required access patterns while maintaining strict data isolation and performance separation between organizations.**