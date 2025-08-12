# Multi-Tenant ATS Database Design - Comprehensive Proposal

**Date**: 2025-08-11  
**Status**: Under Review  
**Purpose**: Complete multi-tenant database schema design for ATS system

## Section 1: Terminology & Taxonomy

### **Core Terminology Decision:**
- **Use `tenant_id` consistently** (not `team_id`) - less confusion
- **Tenant** = The paying customer company (Acme Recruiting Agency, XYZ Corp)
- **Organization** = Internal structure within a tenant (Sales Division, West Coast Office)
- **Role** = Job function with permissions (VP of Sales, Recruiter, Coordinator)

### **Tenant Types:** 
```sql
tenant_type VARCHAR(20) -- 'employer', 'recruiting_agency', 'platform'
```
**Why needed**: Determines UI navigation and available features

### **Greenhouse Model Explained:**
- **Office** = Geographic/location-based (Boston, New York, EMEA)
- **Department** = Functional areas (Sales, Engineering, Legal)  
- **Users can belong to BOTH** office AND department simultaneously
- **Separate hierarchies** that intersect (jobs belong to office + department)

### **My Design vs Greenhouse:**
- **Greenhouse**: Two separate trees (offices + departments)
- **My Design**: One flexible tree (organizations) that can represent both
- **Advantage**: Simpler model, more flexible for different customer needs

## Section 2: My Database Design

### **1. Enhanced Tenant Table**
```sql
-- Add to existing teams table
ALTER TABLE teams ADD COLUMN tenant_type VARCHAR(20) NOT NULL DEFAULT 'recruiting_agency';
-- Values: 'employer', 'recruiting_agency', 'platform'
```

### **2. Organizations Table (NEW)**
```sql
organizations (
  id SERIAL PRIMARY KEY,                -- Globally unique across all tenants
  name VARCHAR(100) NOT NULL,           -- "Sales Division", "Boston Office" 
  parent_org_id INT → organizations.id, -- NULL = top level, supports unlimited nesting
  tenant_id INT → teams.id,             -- Which customer owns this org
  org_type VARCHAR(50),                 -- "department", "office", "division", "team"
  access_policy VARCHAR(20),            -- 'open', 'restricted', 'inherit' (NULL for MVP)
  created_at, updated_at
)
```

### **3. Roles Table (NEW)**
```sql
roles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,           -- "VP of Sales", "Senior Recruiter"
  tenant_id INT → teams.id,             -- Tenant-specific role definitions
  permissions JSONB,                    -- Future: module-based permissions
  is_admin BOOLEAN DEFAULT FALSE,       -- Can manage users within tenant
  created_at, updated_at,
  UNIQUE(name, tenant_id)
)
```

### **4. User Organization Assignments (NEW)**
```sql
user_org_assignments (
  id SERIAL PRIMARY KEY,
  user_id INT → users.id,
  organization_id INT → organizations.id, -- Globally unique, implies tenant
  role_id INT → roles.id,
  created_at, updated_at,
  UNIQUE(user_id, organization_id)      -- One role per user per org
)
```

### **Key Design Decisions:**

**Org ID Global Uniqueness**: ✅ Yes
- `org_id = 12345` tells you which tenant it belongs to
- No need to pass both `tenant_id` + `org_id` in queries

**Organization vs Role**:
- **Organization** = WHERE you work (Sales Division, Boston Office)
- **Role** = WHAT you do (VP of Sales, Recruiter)
- Users can be in multiple orgs with different roles

## Section 3: Comparison with Existing ATS

| Feature | Greenhouse | My Design | Advantage |
|---------|------------|-----------|-----------|
| **Hierarchy** | Two trees (Office + Dept) | One flexible tree | Simpler, more flexible |
| **User Assignment** | Multiple offices + depts | Multiple orgs + roles | Same flexibility |
| **Role Customization** | Limited (3 tiers) | Full customization | Better for diverse customers |
| **Nesting Depth** | Unlimited | Unlimited | Same capability |
| **Access Control** | Permission-based | Policy-based (future) | More systematic |

**What I'm Missing vs Greenhouse:**
- **Intersection model**: Jobs belonging to office AND department
- **Complex permission matrix**: Granular office-department permissions

**What I Add vs Greenhouse:**
- **Tenant type awareness**: Different UX for employers vs agencies
- **Flexible org types**: Not limited to office/department concepts
- **Simpler mental model**: One hierarchy instead of two

## Section 4: MVP Implementation & Future Roadmap

### **MVP (Phase 1) - Start Simple:**
```sql
-- MVP Implementation:
-- 1. Add tenant_type to teams table
-- 2. Create organizations table (single level only)
-- 3. Create roles table (basic names only) 
-- 4. Create user_org_assignments table
-- 5. All access_policy = 'open' (see everything in tenant)
```

### **Easy to Add Later (Phase 2):**
- **Multi-level hierarchy**: Populate `parent_org_id` 
- **Access policies**: Populate `access_policy` field
- **Permissions**: Populate `permissions` JSONB
- **Audit trails**: Add `created_by`, `modified_by` columns

### **Hard to Change Later (⚠️ Think Carefully Now):**

#### **1. Tenant Isolation Model**
**Current Choice**: Single database with `tenant_id` columns
**Alternative**: Separate databases per tenant
**Why Hard to Change**: Would require complete data migration and application rewrite

#### **2. Global vs Tenant-Scoped IDs**  
**Current Choice**: `organizations.id` globally unique
**Alternative**: `organizations.id` unique only within tenant
**Why Hard to Change**: All foreign key relationships would need updating

#### **3. Single vs Dual Hierarchy Model**
**Current Choice**: One `organizations` table for everything
**Alternative**: Separate `offices` and `departments` tables like Greenhouse  
**Why Hard to Change**: Would need to split existing data and rewrite all queries

#### **4. Role Definition Level**
**Current Choice**: Roles defined at tenant level
**Alternative**: Roles defined globally or at org level
**Why Hard to Change**: Permission system architecture would need complete redesign

### **Critical Decisions to Make Now:**

1. **Confirm global org IDs** - simplifies queries but uses more ID space
2. **Confirm single hierarchy** - simpler than Greenhouse's dual model
3. **Confirm tenant-scoped roles** - allows customization but prevents sharing
4. **Confirm tenant types** - needed for different UI experiences

---

**This design supports unlimited hierarchy like Greenhouse, custom roles like RecruiterFlow, and tenant types for different personas - all while starting simple and allowing complexity later.**