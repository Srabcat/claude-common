# Multi-Tenant Schema Design - Project Status

**Date**: 2025-08-11  
**Status**: Schema consolidation in progress

##  **DONE**

### **Research & Design**
-  **Multi-tenant architecture research** ’ `/multi-tenant-architecture.md`
-  **Competitive analysis** (Greenhouse, Bullhorn, RecruiterFlow, Ashby) ’ `/F-Cando/candidate-schema-claude-research.md`
-  **Design proposal documentation** ’ `/F-Cando/multi-tenant-schema-proposal.md`
-  **Candidate schema design** ’ `/F-Cando/candidate-schema.sql`
-  **SQL best practices guide** ’ `/docs/Guide/DB_Schema_Design_Guide/SQL Best practice and normalization.md`

### **Core Decisions Made**
-  **Single database + tenant_id approach** (not separate databases per tenant)
-  **Keep `teams` table name** (add tenant_type column instead of renaming)
-  **Global organization IDs** (unique across all tenants)
-  **Single hierarchy model** (one organizations table, not separate offices/departments)
-  **Tenant-scoped custom roles** (not global fixed roles)
-  **Row-Level Security for data isolation**

### **Testing & Validation**
-  **User understanding tests** (multi-org assignments, role differences, permission scenarios)
-  **Tricky concept explanations** (office vs department, job assignment limitations)

## = **IN PROGRESS**

### **Schema Implementation**
- = **Consolidate multi-tenant + candidate schema** into single SQL file
- = **Add enterprise patterns** (soft deletes, audit trails, tenant isolation)

## =Ë **TODO**

### **High Priority - Schema Completion**
- [ ] **Merge schemas**: Combine `/F-Cando/candidate-schema.sql` + multi-tenant tables
- [ ] **Add tenant_type** to existing teams table
- [ ] **Create organizations table** with parent_org_id for hierarchy
- [ ] **Create roles table** with tenant-scoped custom role names
- [ ] **Create user_org_assignments** table for many-to-many relationships
- [ ] **Add indexes** for performance (tenant-aware indexes)

### **Medium Priority - Documentation Cleanup**
- [ ] **Remove duplicate files**: Archive superseded ChatGPT analysis
- [ ] **Research terminology**: Confirm ATS industry standards (team vs tenant vs organization)
- [ ] **Update file references** in documentation

### **Low Priority - Implementation Preparation**
- [ ] **DAL coding guide** ’ `/F-Cando/TODO-dal-coding-guide.md` (parked)
- [ ] **Migration strategy** planning
- [ ] **Testing strategy** for multi-tenant isolation

## =Á **Key File Locations**

### **Primary Schema Files**
- **Current SQL**: `/F-Cando/candidate-schema.sql`
- **Multi-tenant design**: `/F-Cando/multi-tenant-schema-proposal.md`
- **Detailed architecture**: `/multi-tenant-architecture.md`

### **Research & Analysis**
- **Competitive research**: `/F-Cando/candidate-schema-claude-research.md`
- **SQL best practices**: `/docs/Guide/DB_Schema_Design_Guide/SQL Best practice and normalization.md`

### **Implementation Guides**
- **DAL guide** (parked): `/F-Cando/TODO-dal-coding-guide.md`
- **DB review framework**: `/slash-commands/db-design-review.md`

### **Superseded/Archive**
- **ChatGPT analysis**: `/F-Cando/cando-db-schema-gpt-research` (to be archived)

## <¯ **Next Steps**

1. **Consolidate schema files** into single working SQL file
2. **Test schema** with sample data and queries
3. **Implement in starter kit** at `/NextSaaS/lib/db/schema.ts`
4. **Update DAL queries** at `/NextSaaS/lib/db/queries.ts`

## = **Parking Lot - Complex Features**

### **Easy to Add Later**
- Multi-level organizational hierarchy (populate parent_org_id)
- Access policy enforcement (populate access_policy field)
- Permission modules (populate permissions JSONB)
- Audit trails (add created_by, modified_by columns)

### **Hard to Change Later** 
- Tenant isolation model (database vs schema vs table level)
- Primary key strategy (global IDs vs tenant-scoped IDs)
- Single vs dual hierarchy (offices + departments separate tables)

## =Ê **Assumptions to Validate**

- **PostgreSQL + Supabase + Drizzle ORM** technology stack
- **Row-Level Security** for tenant data isolation
- **JSONB permissions** for future flexibility
- **MVP approach**: Start simple, add complexity later