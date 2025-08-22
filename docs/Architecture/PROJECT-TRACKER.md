# Project Tracker
*Focus. Build. Ship. Stay on track.*

**File**: `/Users/april/10x10-Repos/PROJECT-TRACKER.md`  
**Last Updated**: 2025-08-14

 **2025-08-20** - **ACTIVE: Values Architecture Framework Decision**
  - **Critical Decision**: ENUM vs Database Tables vs Application Constants
  - **Scope**: All fields with constrained values across entire schema
  - **Affected Fields**: job_category, job_status, submission_stage, submission_status, user_roles, tenant_types, contact_types
  - **Blocking**: Field-level implementation for all tables

 **2025-08-20** - **ACTIVE: Contact (email/phone/social)
  - **Critical Decision**: 1 table for both user and organization?
  - **Blocking**: Field-level implementation for all tables

---

## 🎯 **CORE DB TABLE ARCHITECTURE DESIGN FOCUS**

**PURPOSE**: Lock down fundamental table structure before moving to optimization phase.

### **📊 TABLE DESIGN CATEGORIES**

#### **🔴 TOP-LEVEL TABLES** (Critical Dependencies - Lock First)
*Core business entities that create dependencies for all other tables*
- unique person detection
- (authentication layer). user may or may not have login
- type: **candidate, agency_user, employer_user, platform_user, prospect** (multi-tenant user data) 

- **organization** (tenant isolation) 
   -- tenant, single org
   -- nested parent org
   -- multi org - location, role, department
   -- org contacts vs people contacts
   -- permissions

- **job** (employment opportunities) 

Contact / if same table as profile, any identifier info should be mandatory?
Tenant - at company level- per row, tenants id in table or derived ok.  Nested org permission?  Multiple type permission / location, department? Job titleM. Customization per agency
Conflict at tenant company or ignore org level

Submission -history - changeable by recruiter
- **submission** (core business process) ⚠️ **PENDING: org_id decision**
- **candidate_job_permission** (submission conflicts) ⚠️ **NEEDS DECISION: Add table?**

## **Current Project Status (2025-08-21)**
**Active Project**: ATS Database Schema Design - Core Architecture Complete  
**Phase**: Multi-Tenant Database Architecture Implementation  
**Location**: `/docs/Architecture/` - PostgreSQL schema design with Supabase  
**Status**: 14 core tables designed, constrained values framework implemented, SQL moved to implementation file  

**Completed**: 
- Person/Identity layer (4 tables): canonical_persons, user_profiles, contact_identifiers, contact_history + 4 profile type tables
- Tenant/Role Management (3 tables): tenants, tenant_roles, user_role_assignments  
- Jobs layer (1 table): jobs with JSONB flexibility
- Submissions layer (1 table): submissions with stage/status/interview tracking
- Canonical deduplication architecture with person-first identity model
- Constrained values framework with 3 architectural patterns

**Next**: Continue database design (additional tables/refinements) before moving to implementation

## **Decision Stack** (Priority Order)

### **ACTIVE**
1. **Database Design Continuation** - Next tables/refinements (context will be cleared and restarted)
   - **Status**: In progress - core 14 tables complete
   - **Blocker**: None
   - **Dependencies**: Core architecture locked ✅

### **NEXT** (Future Priorities - Project Tracking Only)
2. **Database Implementation & Testing** - Implement 14 tables in development database
   - **Status**: Pending - awaits DB design completion
   - **Blocker**: Database design completion
   - **Dependencies**: All table schemas finalized

3. **API Endpoint Architecture Planning** - Design REST endpoints for core entities
   - **Status**: Pending - awaits database implementation
   - **Blocker**: Database implementation completion
   - **Dependencies**: Database structure validated

4. **UI Integration Planning** - Map database schema to existing prototype components
   - **Status**: Pending - awaits API architecture
   - **Blocker**: API architecture completion
   - **Dependencies**: Clear migration path from mock-data.ts

### **DETAILS** (Secondary for Current Topic)
- Work-in-progress SQL location strategy: Use brainstorm file during debates
- File organization: ADR (decisions only) vs Implementation (SQL code) vs Brainstorm (WIP)
- Constrained values validation for remaining fields

### **FUTURE PROOFING** (Design Now, Implement Later)
- Phase II hierarchy extensions (departments, locations, corporate relationships)
- Advanced role scoping (department/location-based permissions)
- International expansion support (country-specific value sets)
- Performance optimization (indexing, partitioning, caching)

### **EASY PHASE 2** (Easily Added Later)
- Audit trail enhancements
- Advanced search/filtering capabilities
- External API integrations
- Reporting and analytics features

## **Architecture Decisions Locked**
- ✅ **Person-first canonical identity model** - prevents duplicate revenue loss
- ✅ **Parent-child user profile inheritance** - user_profiles + type-specific tables
- ✅ **Centralized role management** - tenant_roles eliminate permission duplication
- ✅ **Database-level tenant isolation** - RLS for critical security boundaries
- ✅ **Constrained values framework** - 3 patterns based on customization needs
- ✅ **Contact identifier consolidation** - single table with type validation
- ✅ **Multi-profile architecture** - supports rare but critical cross-org users

## **Key Files Status**
- **ADR File**: `/docs/Architecture/DB-Schema-ADR` - Architectural decisions only (SQL removed) ✅
- **Implementation File**: `/docs/Architecture/Complete-Database-Field-Specifications.md` - All SQL code ✅
- **Brainstorm File**: `/claude/commands/db-design-brainstorm.md` - Requirements & process ✅
- **This File**: `PROJECT-TRACKER.md` - Progress tracking ✅

## **Lessons Learned**
- **File Separation**: Keep architectural decisions separate from SQL implementation for AI efficiency
- **Work-in-Progress Strategy**: Use brainstorm file for experimental SQL during debates
- **Framework Application**: Systematic scoring prevents architectural flip-flopping
- **Integration Validation**: Always verify new designs work with all previous decisions
- **Requirements Lock-Down**: Crystal clear business requirements prevent design churn

## **Critical Success Metrics**
- **Revenue Protection**: Canonical deduplication prevents duplicate placements ✅
- **Tenant Isolation**: Database-level security for regulatory compliance ✅
- **Development Speed**: Optimal schema for MVP development velocity ✅
- **Future-Proof**: Extensions possible without core rewrites ✅
- **Multi-Profile Support**: Rare but critical edge cases supported ✅

## **Context Management**
- **Current Session**: Database design continuation after core 14 tables completion
- **Context Strategy**: Clear and restart for next database topic to manage token limits
- **Documentation Strategy**: All decisions captured in locked ADR, implementation in separate file

Current schema CAN support location/department permissions through:

**Database-level (Recommended for security)**:
```sql
-- Add to user profile settings:
settings: {
  "permissions": {
    "locations": ["san_francisco", "new_york"],
    "departments": ["engineering", "sales"], 
    "job_functions": ["senior", "manager"]
  }
}

-- Update RLS policies to check JSON permissions:
CREATE POLICY granular_permissions_candidate_profile ON candidate_profile
  USING (
    organization_id = current_setting('app.current_org_id')::uuid
    AND (
      current_setting('app.user_role') = 'admin'  -- Admins see all
      OR
      -- Check if user has permission for this candidate's location/dept
      EXISTS (
        SELECT 1 FROM get_user_permissions(current_setting('app.current_user_id')::uuid)
        WHERE location = candidate_profile.settings->>'location'
      )
    )
  );
```

**Alternative**: Application-level filtering (simpler but less secure)

**REF-LATER-003** (2025-08-14 12:18 PST) - Application infrastructure tables (deferred from core schema)

**Items moved to Phase II (don't impact core table design):**

**2. Basic application tables**
- user_sessions (for login tracking)
- password_resets (for auth flow)
- api_keys (for integrations)  
- notifications (system messages)

**3. Job application workflow tables**
- interview scheduling
- offer management
- background checks
- Current submission has status/stage, but workflow tables are Phase II

**4. File attachments**
- resumes (PDFs)
- cover letters
- portfolios
- File storage schema not needed for core MVP

**5. Communication logs**
- emails sent to candidates
- SMS notifications
- interview scheduling communications
- Tracking/audit of all communications Phase II

**Rationale**: These are application features, not core data model requirements. Can be added later without affecting existing schema.
----
🔑 Key Business Logic (from Bob, REF-TODAY-004)
	•	Duplicate Detection
	•	No DB flags → handled in app logic
	•	DB supports via lookup tables (person_email, person_phone, person_social)
	•	Submission Conflicts
	•	Need CandoPermittedJob table
	•	Tracks permission when agency submits candidate
	•	Prevents multiple agencies from submitting the same candidate to the same job
	•	Engagement Creation
	•	Manual on match page (not automatic)
	•	Recruiter can change mind before engagement → no need to revoke DB perms
	•	Once engagement created, only admin can remove permissions
	•	Protects against accidental permanent assignments
	•	Schema Impact
	•	Must add CandoPermittedJob table

---
*Generated by /track command • Use `/track list` to view categories*