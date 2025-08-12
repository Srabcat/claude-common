# ATS Consolidated Schema Documentation

## 📋 Schema Overview

**File:** `/Users/april/10x10-Repos/claude-common/docs/Roadmap/F-Cando/consolidated-ats-schema.sql`  
**Version:** 2.0  
**Date:** 2025-08-11  
**Purpose:** Multi-tenant ATS system with Person-based architecture

## 🚨 TODAY'S TODOs & QUESTIONS (Prioritize First)

### 🔴 Critical Design Decisions Needed Today

2. **Duplicate detection tables design review** - not confirmed yet
3. **Person_type list finalization** - candidate, lead, contact, login user concepts

### 🟡 Schema Updates Needed - Low risk/complexity
4. **Candidate tenant type** - should we add 4th tenant type for job seekers?
1. **GDPR consideration** for PII in person_identifier table
5. **Change team → tenant** in DB naming convention
6. **Add primary flag** to person_identifier table
7. **Add SQL comments** for greenhouse org structure, global IDs, multiple contacts
--- phone, email, URL, syntax verification.  
--- Enum type fields finalized

### 🟢 Documentation & Planning
8. **Supabase replacement plan** - how to replace if we decide not to use Supabase?
9. **Soft delete strategy** discussion (can be phase 2)
10. **Move Data Storage Strategy** to TODO section

### ❓ Questions to Answer
- **Q1:** Explain fragmented data problem when we do have multiple tables
- **Q2:** Explain tenant isolation - do you mean secure data separation?

## 🏗️ Core Architecture Principles

### 1. Person-Based Model (Core Innovation)
- **Single `person` table** for all human entities: candidates, agency recruiters, employers, platform users
- **Eliminates duplicate data** across different persona tables
- **Unified contact management** through `person_identifier` table. This table contains PII that can be used for duplicate detection. Also allow the same users to work at multiple companies at the same time. [ ADD TODO today: GDPR consideration.]
- **Problem Solved:** Fragmented data across multiple candidate/user tables [ Q - Explain please because we do have multiple tables]

### 2. Multi-Tenant Architecture
- **Tenant Boundary:** `teams.id` (the paying customer company) [ TODO: change team -> tenant in DB]
- **Internal Structure:** `organization` table (departments, offices within tenant)
- **Data Isolation:** All queries filtered by `tenant_id` via Row-Level Security
- **Problem Solved:** Secure data separation between different ATS customers [ Q - explain. Do you mean tenant isolation?]

### 3. Duplicate Detection System
- **6-month exclusive representation** per recruiter-candidate-employer combination [ per canonical unique candidate and employer submission, I dont think you need to say recruiter]
- **Identity resolution** via `person_identifier` table (email, phone, LinkedIn)
- **Conflict resolution** workflow for admin review and decide representation
- **Problem Solved:** Prevents multiple recruiters from submitting same actual candidate

## 📚 Key Tables & Terminology

### Foundation Tables [ add concept apply to all tenant type. Q and TODO - add candidate tenant type?]
| Table | Purpose | Key Fields |
|-------|---------|------------|
| `teams` | Tenant boundary (customer companies) | `tenant_type`: employer, agency_recruiter, platform |
| `users` | Authentication (Supabase Auth integration) | Links to person records |
| `person` | Universal human entity | `person_type`: candidate, agency_recruiter, employer, platform | [ TODO: does the list need to be decided now? we have the concept of lead, contact, login user for each of the tenant type]
| `person_identifier` | Contact info (email, phone, social) | Enables duplicate detection | [ add comments in SQL: can have multiple email, phone, social.  TODO: primary flag?]

### Organizational Structure [ add comment that this structure applies to all 3 tenant type]
| Table | Purpose | Key Fields |
|-------|---------|------------|
| `organization` | Internal company structure | Supports unlimited nesting via `parent_org_id` | [ add SQL comment: same as greenhouse]
| `role` | Custom roles per tenant | Customer-defined, not hardcoded |
| `user_organization_assignment` | User-org-role assignments | Many-to-many relationships | [ add comment that role id and org id are global across tenants]

### Candidate Management
| Table | Purpose | Key Fields |
|-------|---------|------------|
| `candidate` | Candidate-specific data | Extension of person table | 
[ name attributes ]
| `candidate_skill` | Skills with proficiency levels | References standardized `skill` table |
| `candidate_work_location` | Desired work locations | Multiple locations supported |
| `candidate_work_authorization` | Work visa status | Multiple countries supported |
[ add comments: more attributes such as year of experience]

### Duplicate Detection & Representation [ TODO TODAY - no design review yet.  We designed person_identifier, but did not confirm this table's design]
| Table | Purpose | Key Fields |
|-------|---------|------------|
| `candidate_submission` | Immutable submission log | Tracks who submitted which candidate when |
| `candidate_representation` | Current representation rights | 6-month exclusive periods |
| `duplicate_conflict` | Admin review queue | Potential duplicates requiring resolution |

### Supporting Tables [ fields supporting other table]
| Table | Purpose | Key Fields |
|-------|---------|------------|
| `city` | Location reference | GeoNames database integration |
| `skill` | Standardized skills | Evolving with technology |
| `person_document` | File management | Resumes, portfolios with full-text search |
| `person_communication` | Interaction history | Emails, calls, meetings |

[ Top level table but not core features ]
| `prospect` | High-volume sourcing | Separate from core person table |

## 🎯 Problems Solved

### 1. Data Fragmentation
**Before:** Separate candidate, recruiter, employer tables with duplicate fields  
**After:** Unified person model with type-specific extensions  
**Benefit:** Single source of truth for human entities

### 2. Duplicate Management
**Before:** No systematic duplicate detection  
**After:** Identity resolution with 6-month representation tracking  
**Benefit:** Clear ownership and conflict resolution

### 3. Tenant Security
**Before:** Application-level tenant filtering  
**After:** Database-level Row-Level Security  
**Benefit:** Automatic, foolproof data isolation

### 4. Scalable Organization
**Before:** Flat user-role assignments  
**After:** Hierarchical organizations with flexible roles  
**Benefit:** Supports complex company structures

## 🚧 Implementation Assumptions & Design Decisions

### Database Technology
- **PostgreSQL + Supabase:** Leverages UUID primary keys, RLS policies
- **Drizzle ORM:** Type-safe database access layer
- **Authentication:** Handled by Supabase Auth framework [ TODO - HOW TO REPLACE IF DECIDE NOT TO USE SUPERGASE?]

### Data Storage Strategy [ SHOULD MOVE TO TODO section]
**Constants (Application Level):**
- Currency codes (ISO 4217: USD, EUR, GBP)
- Country/State codes (ISO 3166: US, CA, GB)
- Work authorization types

**Database Tables (Dynamic Data):**
- Cities (frequently changing, large dataset)
- Skills (evolving with technology)
- Organizations (customer-defined)

**Rationale:** Stable standards as constants, dynamic/large data in tables

### Naming Conventions
- **Table Names:** Singular (person, organization, role)
- **Primary Keys:** `table_name_id` format
- **Foreign Keys:** Match referenced table's primary key name
- **Soft Deletes:** `deleted_at` timestamps, never hard DELETE [ Add TODO since we have not discussed what to do, can be phase 2]

## 📋 Current Implementation Status [ MOVE TO THE TOP]

### ✅ Phase 1 MVP (Current)
- Multi-tenant foundation with person model
- Basic organizational hierarchy
- Candidate management with skills/locations
- Document storage with full-text search

### 🚧 Phase 2 (To-Do - Bucket C: Design Now or Pain Later)
- Duplicate detection triggers on submission
- Admin conflict resolution UI
- Advanced permission system
- Cross-tenant marketplace features

### 📝 Phase 3 (To-Do - Bucket D: Easily Add Later)
- Advanced reporting and analytics
- Integration APIs for external systems
- Mobile app support
- Performance optimizations

## 🔍 Key Technical Decisions -

### 1. Contact Information Storage (CRITICAL DECISION - 2025-08-12)  **FINAL**
**Decision:** Separate `person_identifier` table (Lever approach)  
**Alternative:** JSON fields in person table (Greenhouse approach)  
**Core Constraint:** Duplicate detection is core business function (daily, 10+ searches)  
**Usage Pattern:** Daily duplicate detection vs occasional contact reads during interviews  
**Trade-off:** Slower reads (JOIN required) vs faster duplicate detection and also search by email and phone

### 2. Person Types vs Separate Tables
**Decision:** Single person table with `person_type` enum  
**Alternative:** Separate candidates, recruiters, employers tables  
**Rationale:** Reduces duplication, enables unified contact management

### 2. Tenant Architecture
**Decision:** Single database with Row-Level Security  
**Alternative:** Separate databases per tenant  
**Rationale:** Simpler operations, cost-effective, proven pattern

### 3. Duplicate Detection Scope
**Decision:** Within tenant only, 6-month representation  
**Alternative:** Global duplicate detection  
**Rationale:** Business requirement, maintains tenant isolation

### 4. Skills Management
**Decision:** Separate skills table with proficiency levels  
**Alternative:** JSON field with free-form skills  
**Rationale:** Enables standardization and search capabilities

## 🏷️ Assumptions & To-Dos (Collaboration Guide Labels)

### 🟢 Bucket A - Needed Now, No Design Impact
- Additional candidate fields (salary history, certifications)
- More document types (references, portfolios)
- Extended communication types (video calls, texts)

### 🟡 Bucket B - Needed Now, Solve One Problem at a Time
- Advanced search and filtering UI
- Bulk data import/export functionality
- Email integration for automatic communication logging

### 🔴 Bucket C - Phase 2, Design Now or Pain Later
- **Critical:** Duplicate detection trigger implementation
- **Critical:** Admin conflict resolution workflows
- **Critical:** Advanced permission system architecture
- Cross-tenant data sharing capabilities

### 🔵 Bucket D - Phase 2, Easily Add Later
- Analytics and reporting dashboards
- Mobile application support
- Third-party integrations (job boards, background checks)
- Advanced UI polish and user experience enhancements

---

**Generated:** 2025-08-12  
**Maintained by:** Architecture team  
**Next Review:** Implementation of Phase 2 duplicate detection system