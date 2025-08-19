-- =============================================================================
-- CONSOLIDATED ATS DATABASE SCHEMA
-- =============================================================================
-- Version: 2.0
-- Date: 2025-08-11
-- Purpose: Multi-tenant ATS system with Person-based architecture
--
-- CRITICAL ASSUMPTIONS FOR ENGINEERS:
-- 1. MULTI-TENANCY: Single database, tenant isolation via tenant_id + Row-Level Security
-- 2. PERSON MODEL: Generic person entity supports candidates, Agency recruiters, employers, platform users
-- 3. DUPLICATE DETECTION: 2
-- 4. REPRESENTATION: 6-month exclusive rights per recruiter-candidate-employer combination
-- 5. POSTGRESQL + SUPABASE: Uses Drizzle ORM, UUID primary keys, RLS policies
-- 6. TENANT ISOLATION: Teams table = tenant boundary, organizations = internal structure
--
-- DESIGN DECISIONS:
-- 1. Table Naming: SINGULAR names (person, organization, role) for consistency

-- 2. Constants vs DB Tables:

--    - CONSTANTS: Currency codes (ISO 4217), Country/State codes (ISO 3166), Work auth types,  Representation window

--    - DB TABLES: Cities (changing), Skills (evolving), Organizations (customer-defined)
--    - RATIONALE: Stable standards as constants, dynamic/large data in tables
-- 3. Person Types: 'candidate', 'agency_recruiter', 'employer', 'platform'
-- 4. Tenant Types: 'employer', 'recruiting_agency', 'platform' (determines UI/features)
-- 5. Global IDs: All primary keys globally unique across tenants for referential integrity
-- 6. Soft Deletes: Use deleted_at timestamps, never hard DELETE critical data
-- 7. Authentication: Handled by Supabase Auth framework - no login fields in person table
-- 8. Contacts vs Users: person table tracks business contacts, auth framework handles login users
-- 9. Prospect Separation: High-volume sourcing in separate prospect table to prevent person table pollution
-- 10. Data Ownership: person_identifier = current truth; candidate_submission = immutable submission record
--
-- MULTI-TENANT ARCHITECTURE:
-- - TENANT BOUNDARY: teams.id (the paying customer company)
-- - INTERNAL STRUCTURE: organizations (departments, offices, divisions within tenant)
-- - USER ASSIGNMENTS: Users can belong to multiple orgs with different roles
-- - DATA ISOLATION: All queries filtered by tenant_id automatically via RLS
-- - DUPLICATE DETECTION: Within tenant only, prevents agency A seeing agency B candidates
--
-- DUPLICATE DETECTION TRIGGER:
-- - WHEN: Recruiter submits candidate to specific job at employer
-- - SCOPE: Check email/phone match within same employer, 6-month window
-- - RESULT: First submitter gets exclusive 6-month representation
-- - ADMIN OVERRIDE: Can resolve conflicts, correct typos, reassign representation
--
-- IMPLEMENTATION PHASES:
-- - MVP: Single-level orgs, basic roles, open access within tenant
-- - Phase 1: Multi-level hierarchy, access policies, detailed permissions
-- - Phase 2: Cross-tenant marketplace features (if needed)
--
-- =============================================================================
-- TENANT & AUTHENTICATION FOUNDATION
-- =============================================================================
-- NOTE: These tables exist in starter kit, adding tenant_type enhancement

-- Users (enhanced from starter kit)
-- Keep existing users table structure, add soft deletes
ALTER TABLE users ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;

-- Teams = Tenant boundary (enhanced from starter kit) 
-- Each team represents one paying customer company
ALTER TABLE teams ADD COLUMN IF NOT EXISTS tenant_type VARCHAR(20) NOT NULL DEFAULT 'recruiting_agency';
-- Valid tenant_types: 'employer', 'recruiting_agency', 'platform'
-- Determines UI navigation, available features, and business logic

-- Team members (keep existing from starter kit)
-- Links users to their tenant with basic role

-- =============================================================================
-- REFERENCE TABLES (Dynamic Data Only)
-- =============================================================================
-- NOTE: Currency codes, Country codes, State codes stored as constants in application
-- Only frequently changing data stored in database tables

-- Cities database (GeoNames or similar) - frequently changing, requires DB storage
CREATE TABLE city (
    city_id INTEGER PRIMARY KEY,
    city_name VARCHAR(100) NOT NULL,
    state_code VARCHAR(10) NOT NULL,     -- US: CA, NY; CA: ON, BC (constant reference)
    country_code CHAR(2) NOT NULL,       -- ISO 3166-1 alpha-2: US, CA, GB (constant reference)
    population INTEGER,
    UNIQUE(city_name, state_code, country_code)
);

-- Standardized Skills Database - evolving with technology
CREATE TABLE skill (
    skill_id INTEGER PRIMARY KEY,
    skill_name VARCHAR(100) NOT NULL UNIQUE,
    category VARCHAR(50),  -- 'programming', 'framework', 'database', etc.
    created_at TIMESTAMP DEFAULT NOW()
);

-- =============================================================================
-- PERSON-BASED ARCHITECTURE (Core Innovation)
-- =============================================================================
-- Generic person entity supports all personas: candidates, recruiters, employers, platform users

-- Universal person table for all human entities in the system
CREATE TABLE person (
    person_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    middle_name VARCHAR(100),
    preferred_name VARCHAR(100),        -- How they want to be addressed
    person_type VARCHAR(20) NOT NULL CHECK (person_type IN ('candidate', 'agency_recruiter', 'employer', 'platform')),
    tenant_id INTEGER NOT NULL REFERENCES teams(id), -- Which tenant owns this person record
    
    -- Note: Login/authentication handled by Supabase Auth - no login fields needed here
    
    -- Audit & soft delete fields
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP,
    created_by UUID,                    -- User who created this record
    
    -- Ensure person_type makes sense for tenant_type
    -- (e.g., recruiting agencies don't create employer_contact records)
    INDEX idx_person_tenant_type (tenant_id, person_type)
);

-- Identity resolution table for duplicate detection
-- AUTHORITATIVE SOURCE: Current email/phone/social identifiers for all persons
-- UPDATED: Added history tracking for duplicate detection
CREATE TABLE person_identifier (
    identifier_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    person_id UUID NOT NULL REFERENCES person(person_id),
    identifier_type VARCHAR(20) NOT NULL CHECK (identifier_type IN ('email', 'phone', 'linkedin', 'github', 'twitter')),
    identifier_value VARCHAR(255) NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,   -- Primary email/phone for this person
    is_verified BOOLEAN DEFAULT FALSE,  -- Has this been verified?
    tenant_id INTEGER NOT NULL REFERENCES teams(id), -- Tenant isolation
    
    -- History tracking for duplicate detection (Requirement #4)
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'superseded', 'deleted')),
    superseded_by_identifier_id UUID REFERENCES person_identifier(identifier_id),
    change_reason TEXT,                 -- Why this identifier changed
    changed_by_person_id UUID REFERENCES person(person_id), -- Who made the change
    changed_by_table_type VARCHAR(20) CHECK (changed_by_table_type IN ('candidate', 'agency_recruiter', 'person')),
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP,
    
    UNIQUE(identifier_type, identifier_value, tenant_id), -- No duplicate emails within tenant
    INDEX idx_identifier_lookup (identifier_type, identifier_value), -- Fast duplicate detection
    INDEX idx_identifier_person (person_id),
    INDEX idx_identifier_tenant (tenant_id),
    INDEX idx_identifier_status (status) WHERE status = 'active' -- Performance for active identifiers
);

-- =============================================================================
-- MULTI-TENANT ORGANIZATIONAL HIERARCHY
-- =============================================================================

-- Organizations within each tenant (departments, offices, divisions, teams)
-- Supports unlimited nesting via parent_org_id
CREATE TABLE organization (
    organization_id SERIAL PRIMARY KEY,  -- Globally unique across all tenants
    name VARCHAR(100) NOT NULL,
    parent_org_id INTEGER REFERENCES organization(organization_id), -- Self-referencing for hierarchy
    tenant_id INTEGER NOT NULL REFERENCES teams(id), -- Which tenant owns this org
    org_type VARCHAR(50),               -- 'department', 'office', 'division', 'team', 'subsidiary'
    
    -- Future access policy controls (NULL for MVP)
    access_policy VARCHAR(20) DEFAULT 'inherit', -- 'open', 'restricted', 'inherit', 'custom'
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP,
    created_by UUID,
    
    INDEX idx_org_tenant (tenant_id),
    INDEX idx_org_parent (parent_org_id),
    INDEX idx_org_type (org_type)
);

-- Custom roles per tenant (not hardcoded, customer-defined)
CREATE TABLE role (
    role_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,         -- "VP of Sales", "Senior Recruiter", "Coordinator"
    tenant_id INTEGER NOT NULL REFERENCES teams(id), -- Tenant-scoped role definitions
    
    -- Future permission controls (NULL for MVP)
    permissions JSONB,                  -- Module-based permissions: {"candidates": "read", "jobs": "write"}
    is_admin BOOLEAN DEFAULT FALSE,     -- Can manage other users within tenant
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP,
    created_by UUID,
    
    UNIQUE(name, tenant_id),            -- Role names unique within tenant
    INDEX idx_role_tenant (tenant_id)
);

-- User assignments to organizations with roles (many-to-many)
-- Users can belong to multiple orgs within their tenant with different roles
CREATE TABLE user_organization_assignment (
    assignment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id INTEGER NOT NULL REFERENCES users(id),
    organization_id INTEGER NOT NULL REFERENCES organization(organization_id),
    role_id INTEGER NOT NULL REFERENCES role(role_id),
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP,
    assigned_by UUID,                   -- User who made this assignment
    
    UNIQUE(user_id, organization_id),   -- One role per user per organization
    INDEX idx_assignment_user (user_id),
    INDEX idx_assignment_org (organization_id),
    INDEX idx_assignment_role (role_id)
);

-- =============================================================================
-- CANDIDATE-SPECIFIC TABLES
-- =============================================================================

-- Candidate extension of person table (person_type = 'candidate' only)
-- UPDATED: Simple UUID primary key (startup-friendly, avoids composite foreign keys)
CREATE TABLE candidate (
    candidate_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    person_id UUID NOT NULL REFERENCES person(person_id),
    recruiter_person_id UUID NOT NULL REFERENCES person(person_id),
    
    -- Professional details
    years_experience DECIMAL(4,1),      -- 5.5 years precision
    years_experience_last_verified DATE,
    
    -- Current location
    current_city_id INTEGER REFERENCES city(city_id),
    current_location_notes TEXT,
    
    -- Compensation expectations
    comp_range_min INTEGER,             -- Salary in whole dollars
    comp_range_max INTEGER,
    comp_currency CHAR(3) DEFAULT 'USD', -- ISO 4217 (stored as constants)
    
    -- Availability & preferences
    availability_status VARCHAR(20) CHECK (availability_status IN ('active', 'passive', 'not_looking')),
    availability_last_verified DATE,
    work_pref_remote BOOLEAN DEFAULT FALSE,
    work_pref_hybrid BOOLEAN DEFAULT FALSE,
    work_pref_onsite BOOLEAN DEFAULT FALSE,
    work_from_home_state VARCHAR(2),    -- State code for remote work
    
    -- Source tracking
    source_type VARCHAR(20) CHECK (source_type IN ('agency_partner', 'sourced', 'applied', 'referral', 'database', 'other')),
    
    -- Context-specific notes
    location_notes TEXT,                -- "Moving to NYC in 2 months"
    compensation_notes TEXT,            -- "Negotiable if remote", "Equity important"
    work_visa_notes TEXT,              -- "H1B expires 2026"
    general_notes TEXT,                -- General recruiter notes
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    -- Business rule: one candidate record per (person, recruiter) combination
    UNIQUE(person_id, recruiter_person_id),
    
    -- Constraints
    CHECK (
        -- Ensure recruiter is actually a recruiter type
        EXISTS (SELECT 1 FROM person WHERE person_id = recruiter_person_id AND person_type IN ('agency_recruiter', 'platform'))
    ),
    CHECK (
        -- Ensure candidate person is actually a candidate type  
        EXISTS (SELECT 1 FROM person WHERE person_id = candidate.person_id AND person_type = 'candidate')
    )
);

-- Candidate skills (many-to-many)
CREATE TABLE candidate_skill (
    candidate_id UUID NOT NULL REFERENCES candidate(candidate_id) ON DELETE CASCADE,
    skill_id INTEGER NOT NULL REFERENCES skill(skill_id),
    proficiency_level VARCHAR(20) CHECK (proficiency_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
    created_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (candidate_id, skill_id)
);

-- Desired work locations for candidates
CREATE TABLE candidate_work_location (
    location_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID NOT NULL REFERENCES candidate(candidate_id) ON DELETE CASCADE,
    city_id INTEGER NOT NULL REFERENCES city(city_id),
    location_notes TEXT,               -- "Moving here in 2 months"
    created_at TIMESTAMP DEFAULT NOW()
);

-- Work authorization status (supports multiple countries)
CREATE TABLE candidate_work_authorization (
    auth_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID NOT NULL REFERENCES candidate(candidate_id) ON DELETE CASCADE,
    country_code CHAR(2) NOT NULL,     -- ISO 3166-1 (stored as constants)
    status VARCHAR(100) NOT NULL,      -- 'Citizen', 'Green Card', 'H1B', 'Requires Sponsorship'
    expires_at DATE,                   -- NULL for permanent status
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- =============================================================================
-- DOCUMENT MANAGEMENT
-- =============================================================================

-- Documents (resumes, cover letters, portfolios)
CREATE TABLE person_document (
    document_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    person_id UUID NOT NULL REFERENCES person(person_id),
    document_type VARCHAR(20) NOT NULL CHECK (document_type IN ('resume', 'cover_letter', 'portfolio', 'reference', 'other')),
    filename VARCHAR(255) NOT NULL,
    file_storage_id VARCHAR(255) NOT NULL, -- Cloud storage reference (S3 key)
    file_size_bytes INTEGER,
    content_type VARCHAR(100),         -- MIME type
    extracted_text TEXT,              -- For full-text search
    is_current BOOLEAN DEFAULT FALSE, -- Current/primary document
    uploaded_by UUID,                 -- User ID who uploaded
    uploaded_at TIMESTAMP DEFAULT NOW(),
    
    INDEX idx_document_person (person_id),
    INDEX idx_document_type (document_type),
    INDEX idx_document_current (is_current)
);

-- =============================================================================
-- COMMUNICATIONS & NOTES
-- =============================================================================

-- Communication history (emails, calls, messages) - person-agnostic
CREATE TABLE person_communication (
    comm_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    person_id UUID NOT NULL REFERENCES person(person_id),
    comm_type VARCHAR(20) NOT NULL CHECK (comm_type IN ('email', 'call', 'message', 'meeting', 'linkedin')),
    direction VARCHAR(10) NOT NULL CHECK (direction IN ('inbound', 'outbound')),
    subject VARCHAR(255),
    message_body TEXT,
    timestamp TIMESTAMP NOT NULL,
    created_by UUID NOT NULL,          -- User ID who logged this
    external_id VARCHAR(255),          -- Email message ID, call log ID, etc.
    created_at TIMESTAMP DEFAULT NOW(),
    
    INDEX idx_comm_person (person_id),
    INDEX idx_comm_timestamp (timestamp),
    INDEX idx_comm_type (comm_type)
);

-- Additional notes beyond structured fields
CREATE TABLE person_note (
    note_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    person_id UUID NOT NULL REFERENCES person(person_id),
    note_text TEXT NOT NULL,
    note_type VARCHAR(50),             -- 'general', 'interview_feedback', 'admin', etc.
    created_by UUID NOT NULL,          -- User ID
    created_at TIMESTAMP DEFAULT NOW(),
    
    INDEX idx_note_person (person_id),
    INDEX idx_note_type (note_type)
);

-- =============================================================================
-- DUPLICATE DETECTION & REPRESENTATION TRACKING
-- =============================================================================
-- NOTE: These tables implement the 6-month exclusive representation model

-- Tracks when candidates are submitted to specific employers  
-- SUBMISSION RECORD: What was sent to employer (correctable for data entry errors)
-- BUSINESS REQUIREMENT: Employer says "I want candidate with email X" - this table shows what we submitted
-- NOTE: person_identifier and candidate_submission serve different purposes and don't need to be consistent
CREATE TABLE candidate_submission (
    submission_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    person_id UUID NOT NULL REFERENCES person(person_id), -- The candidate 
    recruiter_person_id UUID NOT NULL REFERENCES person(person_id), -- Recruiter who submitted
    employer_tenant_id INTEGER NOT NULL REFERENCES teams(id), -- Which employer received submission
    job_reference VARCHAR(255),        -- Job ID, job title, or other reference
    
    -- SUBMISSION DATA: Contact info sent to employer (updatable for data entry error correction)
    submitted_email VARCHAR(255),      -- Email submitted to employer (correctable if recruiter made typo)
    submitted_phone VARCHAR(50),       -- Phone submitted to employer (correctable if recruiter made typo)  
    submission_notes TEXT,             -- Any notes from recruiter
    
    submitted_at TIMESTAMP DEFAULT NOW(),
    -- created_by UUID,                   -- User who made submission
    
    -- Submission status and representation tracking
    status_TBD VARCHAR(30) DEFAULT 'submitted',  -- Status enumeration to be determined during submission conflict implementation
    representation_expires_at TIMESTAMP,         -- Explicit expiry date (avoids date math in queries)
    
    -- Submission conflict tracking
    conflict_details_TBD JSONB,          -- Details about submission conflicts
    conflicting_submission_ids_TBD JSONB, -- Array of conflicting submission UUIDs
    
    -- Admin override capability
    admin_notes TEXT,                     -- Admin override notes
    modified_by UUID,                     -- Admin who modified
    modified_at TIMESTAMP,
    
    INDEX idx_submission_candidate (person_id),
    INDEX idx_submission_recruiter (recruiter_person_id),
    INDEX idx_submission_employer (employer_tenant_id),
    INDEX idx_submission_date (submitted_at),
    INDEX idx_submission_email (submitted_email),
    INDEX idx_submission_phone (submitted_phone),
    INDEX idx_submission_representation (person_id, employer_tenant_id, status_TBD, representation_expires_at), -- For fast representation queries
    
    -- Business rule constraint: Only one active representation per (person, employer)
    CONSTRAINT unique_active_representation EXCLUDE (person_id WITH =, employer_tenant_id WITH =) 
    WHERE (status_TBD = 'active_representation' AND representation_expires_at > NOW())
);



-- =============================================================================
-- PROSPECT/SOURCING TABLES
-- =============================================================================

-- Prospecting targets for high-volume sourcing (separate from core people)
-- Prevents pollution of main person table with cold outreach contacts
CREATE TABLE prospect (
    prospect_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id INTEGER NOT NULL REFERENCES teams(id), -- Which tenant owns this prospect
    
    -- Basic info
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    prospect_type VARCHAR(30) NOT NULL CHECK (prospect_type IN ('candidate_prospect', 'employer_prospect')),
    
    -- Contact information
    email VARCHAR(255),
    phone VARCHAR(50),
    linkedin_url VARCHAR(500),
    
    -- Context
    company_name VARCHAR(200),
    job_title VARCHAR(200),
    source VARCHAR(50),                -- 'linkedin', 'github', 'referral', 'conference'
    
    -- Outreach tracking
    outreach_status VARCHAR(20) DEFAULT 'not_contacted' CHECK (outreach_status IN ('not_contacted', 'contacted', 'responded', 'converted', 'not_interested')),
    last_contacted_at TIMESTAMP,
    notes TEXT,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by UUID,
    
    INDEX idx_prospect_tenant_type (tenant_id, prospect_type),
    INDEX idx_prospect_email (email),
    INDEX idx_prospect_phone (phone),
    INDEX idx_prospect_status (outreach_status),
    INDEX idx_prospect_company (company_name)
);

-- =============================================================================
-- FULL-TEXT SEARCH INDEXES
-- =============================================================================

-- Resume content search
CREATE INDEX idx_document_text_search ON person_document 
USING gin(to_tsvector('english', extracted_text));

-- Person name search
CREATE INDEX idx_person_name_search ON person 
USING gin(to_tsvector('english', first_name || ' ' || last_name || ' ' || COALESCE(preferred_name, '')));

-- =============================================================================
-- TENANT-AWARE PERFORMANCE INDEXES
-- =============================================================================
-- All indexes include tenant_id as first column for partition pruning

-- Person lookups
CREATE INDEX idx_person_tenant_type ON person(tenant_id, person_type);
CREATE INDEX idx_person_tenant_name ON person(tenant_id, last_name, first_name);

-- Identifier lookups for duplicate detection
CREATE INDEX idx_identifier_tenant_type_value ON person_identifier(tenant_id, identifier_type, identifier_value);

-- Organization hierarchy
CREATE INDEX idx_org_tenant_parent ON organization(tenant_id, parent_org_id);

-- Candidate searches
CREATE INDEX idx_candidate_tenant_availability ON candidate(candidate_id, person_id);

-- Communication history
CREATE INDEX idx_comm_tenant_timestamp ON person_communication(person_id, timestamp);

-- Submission tracking
CREATE INDEX idx_submission_employer_date ON candidate_submission(employer_tenant_id, submitted_at);

-- =============================================================================
-- ROW-LEVEL SECURITY POLICIES (For Production)
-- =============================================================================
-- NOTE: Enable these in production for automatic tenant isolation
-- All queries will be automatically filtered by tenant_id

-- Enable RLS on all tenant-aware tables
-- ALTER TABLE person ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE person_identifier ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE organization ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE role ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE candidate_submission ENABLE ROW LEVEL SECURITY;

-- Create tenant isolation policies
-- CREATE POLICY tenant_isolation_person ON person
-- FOR ALL TO application_role
-- USING (tenant_id = current_setting('app.current_tenant_id')::INTEGER);

-- CREATE POLICY tenant_isolation_identifier ON person_identifier
-- FOR ALL TO application_role  
-- USING (tenant_id = current_setting('app.current_tenant_id')::INTEGER);

-- Continue for all tenant-aware tables...

-- =============================================================================
-- DUPLICATE DETECTION TRIGGERS (Candidate Duplicate Detection - PHASE 2)
-- =============================================================================

-- =============================================================================
-- DUPLICATE DETECTION: APPLICATION LAYER APPROACH
-- =============================================================================
-- Business logic moved to application layer for:
-- - Better testability and debugging
-- - Easier rule changes (startup needs flexibility)
-- - Graceful error handling and user experience
-- - Performance control (batching, caching)
--
-- Database constraints below serve as backup safety net only

-- Backup database constraints (safety net only)
-- These catch application bugs but don't implement business logic

-- Prevent duplicate active identifiers within tenant
ALTER TABLE person_identifier ADD CONSTRAINT backup_unique_active_identifier 
UNIQUE(identifier_type, identifier_value, tenant_id) WHERE status = 'active';

-- Prevent invalid person types
ALTER TABLE candidate ADD CONSTRAINT backup_valid_candidate_person
CHECK (EXISTS (SELECT 1 FROM person WHERE person_id = candidate.person_id AND person_type = 'candidate'));

-- Note: Identifier history tracking moved to application layer
-- When email changes, application code will:
-- 1. Update old record: status = 'superseded', superseded_by_identifier_id = new_id  
-- 2. Insert new record: status = 'active'

-- =============================================================================
-- SAMPLE DATA SETUP (Development Only)
-- =============================================================================
-- NOTE: Remove in production, useful for testing

-- Insert sample tenant types
-- UPDATE teams SET tenant_type = 'recruiting_agency' WHERE id = 1;
-- UPDATE teams SET tenant_type = 'employer' WHERE id = 2;

-- Insert sample organization
-- INSERT INTO organization (name, tenant_id, org_type) VALUES
-- ('Sales Department', 1, 'department'),
-- ('Boston Office', 1, 'office');

-- Insert sample roles
-- INSERT INTO role (name, tenant_id, is_admin) VALUES
-- ('VP of Sales', 1, true),
-- ('Senior Recruiter', 1, false),
-- ('Coordinator', 1, false);

-- =============================================================================
-- MIGRATION NOTES FOR DEVELOPERS
-- =============================================================================
-- 1. Existing teams/users tables remain unchanged for backward compatibility
-- 2. Add tenant_type to teams table to enable persona-based features  
-- 3. Person table replaces candidate table - migrate existing candidate data
-- 4. person_identifier replaces person_emails/person_phones - consolidate contact data
-- 5. Enable RLS policies in production for automatic tenant isolation
-- 6. Update all application queries to work with person-based model
-- 7. Implement duplicate detection triggers on candidate submission
-- 8. Add UI for admin conflict resolution workflows
--
-- PHASE 1 MVP: Basic multi-tenant with person model ✅ COMPLETE
-- PHASE 2A: Candidate duplicate detection ✅ COMPLETE (2025-08-13)
--   - Simple UUID primary key for candidate table (startup-friendly foreign keys)
--   - UNIQUE constraint on (person_id, recruiter_person_id) maintains business rule  
--   - person_identifier history tracking with status fields
--   - Application-layer duplicate detection with database constraints backup
--   - Database triggers removed (moved to application layer)
--   - Performance optimized with database constraints instead of materialized views
-- PHASE 2B: Submission conflict detection (TODO - next phase)
-- PHASE 3: Advanced permissions, cross-tenant features if needed