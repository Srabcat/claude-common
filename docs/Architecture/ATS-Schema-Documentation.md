# ATS Consolidated Schema Documentation

## 📋 Schema Overview

**File:** `/Users/april/10x10-Repos/claude-common/docs/Roadmap/F-Cando/consolidated-ats-schema.sql`  
**Version:** 2.0  
**Date:** 2025-08-11  
**Purpose:** Multi-tenant ATS system with Person-based architecture

## 🏗️ Core Architecture Principles

### 1. Person-Based Model (Core Innovation)
- **Single `person` table** for all human entities: candidates, recruiters, employers, platform users
- **Eliminates duplicate data** across different persona tables
- **Unified contact management** through `person_identifier` table
- **Problem Solved:** Fragmented data across multiple candidate/user tables

### 2. Multi-Tenant Architecture
- **Tenant Boundary:** `teams.id` (the paying customer company)
- **Internal Structure:** `organization` table (departments, offices within tenant)
- **Data Isolation:** All queries filtered by `tenant_id` via Row-Level Security
- **Problem Solved:** Secure data separation between different ATS customers

### 3. Duplicate Detection System
- **6-month exclusive representation** per recruiter-candidate-employer combination
- **Identity resolution** via `person_identifier` table (email, phone, LinkedIn)
- **Conflict resolution** workflow for admin review
- **Problem Solved:** Prevents multiple recruiters from submitting same candidate

## 📚 Key Tables & Terminology

### Foundation Tables
| Table | Purpose | Key Fields |
|-------|---------|------------|
| `teams` | Tenant boundary (customer companies) | `tenant_type`: employer, recruiting_agency, platform |
| `users` | Authentication (Supabase Auth integration) | Links to person records |
| `person` | Universal human entity | `person_type`: candidate, agency_recruiter, employer, platform |
| `person_identifier` | Contact info (email, phone, social) | Enables duplicate detection |

### Organizational Structure
| Table | Purpose | Key Fields |
|-------|---------|------------|
| `organization` | Internal company structure | Supports unlimited nesting via `parent_org_id` |
| `role` | Custom roles per tenant | Customer-defined, not hardcoded |
| `user_organization_assignment` | User-org-role assignments | Many-to-many relationships |

### Candidate Management
| Table | Purpose | Key Fields |
|-------|---------|------------|
| `candidate` | Candidate-specific data | Extension of person table |
| `candidate_skill` | Skills with proficiency levels | References standardized `skill` table |
| `candidate_work_location` | Desired work locations | Multiple locations supported |
| `candidate_work_authorization` | Work visa status | Multiple countries supported |

### Duplicate Detection & Representation
| Table | Purpose | Key Fields |
|-------|---------|------------|
| `candidate_submission` | Immutable submission log | Tracks who submitted which candidate when |
| `candidate_representation` | Current representation rights | 6-month exclusive periods |
| `duplicate_conflict` | Admin review queue | Potential duplicates requiring resolution |

### Supporting Tables
| Table | Purpose | Key Fields |
|-------|---------|------------|
| `city` | Location reference | GeoNames database integration |
| `skill` | Standardized skills | Evolving with technology |
| `person_document` | File management | Resumes, portfolios with full-text search |
| `person_communication` | Interaction history | Emails, calls, meetings |
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
- **Authentication:** Handled by Supabase Auth framework

### Data Storage Strategy
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
- **Soft Deletes:** `deleted_at` timestamps, never hard DELETE

## 📋 Current Implementation Status

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

## 🔍 Key Technical Decisions

### 1. Person Types vs Separate Tables
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