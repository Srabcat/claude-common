-- Single Candidate Schema (No Duplicates)
-- ATS Candidate Database Schema
-- Version: 1.0
-- Date: 2025-08-11
--
-- DESIGN DECISIONS:
-- 1. Table Naming: SINGULAR names (candidate, city, skill) for consistency with complex domain relationships
-- 2. Constants vs DB Tables:
--    - CONSTANTS: Currency codes (ISO 4217), Country codes (ISO 3166-1), State/Province codes, Work authorization types
--    - DB TABLES: Cities (frequently changing), Skills (evolving with technology)
--    - RATIONALE: Stable ISO standards stored as constants for performance; dynamic data in tables
--    - WHEN TO USE:
--      * Constants: Stable, small datasets (<200 items), government standards
--      * Database: Dynamic, large datasets (>1000 items), frequently changing
--    - TO REVERT: If constants become limiting, create currency/country/state tables with same singular naming pattern

-- =============================================================================
-- REFERENCE TABLES (Dynamic Data Only)
-- =============================================================================
-- NOTE: Currency codes, Country codes, and State codes are stored as constants in application code
-- due to their stability as ISO standards. Only frequently changing data is stored in DB tables.

-- Cities (GeoNames or similar standard database) - frequently changing, requires DB storage
CREATE TABLE city (
    city_id INTEGER PRIMARY KEY,
    city_name VARCHAR(100) NOT NULL,
    state_code VARCHAR(10) NOT NULL,     -- US: CA, NY; CA: ON, BC (stored as constant reference)
    country_code CHAR(2) NOT NULL,       -- ISO 3166-1 alpha-2: US, CA, GB (stored as constant reference)
    population INTEGER,
    UNIQUE(city_name, state_code, country_code)
);

-- Standardized Skills Database - evolving with technology, requires DB storage
CREATE TABLE skill (
    skill_id INTEGER PRIMARY KEY,
    skill_name VARCHAR(100) NOT NULL UNIQUE,
    category VARCHAR(50),  -- 'programming', 'framework', 'database', etc.
    created_at TIMESTAMP DEFAULT NOW()
);

-- =============================================================================
-- UNIVERSAL CONTACT INFORMATION TABLES
-- =============================================================================

-- Email addresses (universal for candidates, employers, recruiters)
CREATE TABLE person_emails (
    email_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    person_id UUID NOT NULL,  -- References candidates, employers, recruiters
    email_address VARCHAR(255) NOT NULL,
    email_type VARCHAR(20) DEFAULT 'Personal' CHECK (email_type IN ('Personal', 'Work', 'Other')),
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(person_id, email_address)
);

-- Phone numbers (universal for candidates, employers, recruiters)
CREATE TABLE person_phones (
    phone_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    person_id UUID NOT NULL,  -- References candidates, employers, recruiters
    phone_number VARCHAR(50) NOT NULL,
    phone_type VARCHAR(20) DEFAULT 'Personal' CHECK (phone_type IN ('Personal', 'Work', 'Mobile', 'Other')),
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(person_id, phone_number)
);

-- Social links (universal for candidates, employers, recruiters)
-- NOTE FOR DEVELOPERS: Use application constants for platform_type values to ensure consistency
-- Example: SOCIAL_PLATFORM.INSTAGRAM = 'Instagram' (not 'IG', 'instagram', 'Insta', etc.)
-- This prevents query issues with inconsistent string values
CREATE TABLE person_social_links (
    link_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    person_id UUID NOT NULL,  -- References candidates, employers, recruiters
    url VARCHAR(500) NOT NULL,  -- Add Google Scholar and substack
    platform_type VARCHAR(30) CHECK (platform_type IN ('LinkedIn', 'GitHub', 'Website', 'Twitter', 'Facebook', 'Instagram', 'YouTube', 'TikTok', 'Behance', 'Dribble', 'Medium', 'Other')),
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(person_id, url)
);

-- =============================================================================
-- MAIN CANDIDATE TABLES
-- =============================================================================

-- Primary candidate information
CREATE TABLE candidate (
    candidate_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name VARCHAR(100) NOT NULL,      -- Legal first name
    last_name VARCHAR(100) NOT NULL,       -- Legal last name
    middle_name VARCHAR(100),              -- Middle name/initial
    preferred_name VARCHAR(100),           -- How they want to be called (Bob vs Robert)
    -- Contact info moved to separate tables for flexibility
    -- Primary contact references (set after creating contact records)
    primary_email_id UUID REFERENCES person_emails(email_id),
    primary_phone_id UUID REFERENCES person_phones(phone_id),
    
    -- Current location (where they live now)
    current_city_id INTEGER REFERENCES city(city_id),
    current_location_notes TEXT,  -- For edge cases or additional context
    
    -- Experience & Skills
    years_experience DECIMAL(4,1),  -- 5.5 years precision
    years_experience_last_verified DATE,  -- When experience was last updated/verified
    
    -- Compensation
    comp_range_min INTEGER,  -- Salary in whole dollars
    comp_range_max INTEGER,  -- Salary in whole dollars
    comp_currency CHAR(3) DEFAULT 'USD',  -- ISO 4217 currency codes (stored as constants in app)
    
    -- Availability
    availability_status VARCHAR(20) CHECK (availability_status IN ('active', 'passive', 'not_looking')),
    availability_last_verified DATE,
    
    -- Source tracking
    source_type VARCHAR(20) CHECK (source_type IN ('agency_partner', 'sourced', 'applied', 'referral', 'database', 'other')),
    
    -- Work preferences

    work_pref_remote BOOLEAN DEFAULT FALSE,
    work_pref_hybrid BOOLEAN DEFAULT FALSE,
    work_pref_onsite BOOLEAN DEFAULT FALSE,
    work_from_home_state VARCHAR(2),  -- US state code where candidate lives for remote work
    
    -- Notes fields for specific contexts
    location_notes TEXT,        -- "Moving to NYC in 2 months", "Open to relocating"
    compensation_notes TEXT,    -- "Negotiable if remote", "Equity important", "Current: $120K"
    work_visa_notes TEXT,       -- "H1B expires 2026", "Green card in progress"
    general_notes TEXT,         -- General recruiter notes and observations
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Candidate skills (many-to-many relationship)
CREATE TABLE candidate_skill (
    candidate_id UUID NOT NULL REFERENCES candidate(candidate_id) ON DELETE CASCADE,
    skill_id INTEGER NOT NULL REFERENCES skill(skill_id),
    proficiency_level VARCHAR(20) CHECK (proficiency_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
    created_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (candidate_id, skill_id)
);

-- Desired work locations (multiple cities candidate is open to)
CREATE TABLE candidate_work_location (
    location_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID NOT NULL REFERENCES candidate(candidate_id) ON DELETE CASCADE,
    city_id INTEGER NOT NULL REFERENCES city(city_id),
    location_notes TEXT,  -- "Moving here in 2 months", "Need relocation assistance"
    created_at TIMESTAMP DEFAULT NOW()
);

-- Work authorization (supports multiple countries/statuses)
CREATE TABLE candidate_work_auth (
    auth_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID NOT NULL REFERENCES candidate(candidate_id) ON DELETE CASCADE,
    country_code CHAR(2) NOT NULL,  -- ISO 3166-1 country code (stored as constants)
    status VARCHAR(100) NOT NULL,  -- 'Citizen', 'Green Card', 'H1B', 'Requires Sponsorship'
    expires_at DATE,  -- NULL for permanent status
    notes TEXT,  -- Additional context
    created_at TIMESTAMP DEFAULT NOW()
);

-- =============================================================================
-- DOCUMENT MANAGEMENT
-- =============================================================================

-- Documents (resumes, cover letters, portfolios)
CREATE TABLE candidate_document (
    document_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID NOT NULL REFERENCES candidate(candidate_id) ON DELETE CASCADE,
    document_type VARCHAR(20) NOT NULL CHECK (document_type IN ('resume', 'cover_letter', 'portfolio', 'reference', 'other')),
    filename VARCHAR(255) NOT NULL,
    file_storage_id VARCHAR(255) NOT NULL,  -- Cloud storage reference (S3 key, etc.)
    file_size_bytes INTEGER,
    content_type VARCHAR(100),  -- MIME type
    extracted_text TEXT,  -- Full-text search content
    is_current BOOLEAN DEFAULT FALSE,  -- Mark current/primary document
    uploaded_by UUID,  -- User ID who uploaded
    uploaded_at TIMESTAMP DEFAULT NOW()
);

-- =============================================================================
-- COMMUNICATIONS & NOTES
-- =============================================================================

-- Additional recruiter notes (for notes beyond the specific context fields on candidate table)
-- Use this for detailed conversation logs, interview feedback, etc.
CREATE TABLE candidate_additional_note (
    note_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID NOT NULL REFERENCES candidate(candidate_id) ON DELETE CASCADE,
    note_text TEXT NOT NULL,
    created_by UUID NOT NULL,  -- User ID
    created_at TIMESTAMP DEFAULT NOW()
);

-- Communication history (emails, calls, messages)
CREATE TABLE candidate_communication (
    comm_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID NOT NULL REFERENCES candidate(candidate_id) ON DELETE CASCADE,
    comm_type VARCHAR(20) NOT NULL CHECK (comm_type IN ('email', 'call', 'message', 'meeting', 'linkedin')),
    direction VARCHAR(10) NOT NULL CHECK (direction IN ('inbound', 'outbound')),
    subject VARCHAR(255),
    message_body TEXT,
    timestamp TIMESTAMP NOT NULL,
    created_by UUID NOT NULL,  -- User ID
    external_id VARCHAR(255),  -- Email message ID, call log ID, etc.
    created_at TIMESTAMP DEFAULT NOW()
);

-- =============================================================================
-- INDEXES FOR PERFORMANCE
-- =============================================================================

-- Universal contact information indexes
CREATE INDEX idx_person_emails_address ON person_emails(email_address);
CREATE INDEX idx_person_emails_person ON person_emails(person_id);
CREATE INDEX idx_person_phones_number ON person_phones(phone_number);
CREATE INDEX idx_person_phones_person ON person_phones(person_id);
CREATE INDEX idx_person_social_links_person ON person_social_links(person_id);
CREATE INDEX idx_person_social_links_platform ON person_social_links(platform_type);

-- Primary search indexes
CREATE INDEX idx_candidate_location ON candidate(current_city_id);
CREATE INDEX idx_candidate_availability ON candidate(availability_status);
CREATE INDEX idx_candidate_experience ON candidate(years_experience);
CREATE INDEX idx_candidate_comp_range ON candidate(comp_range_min, comp_range_max);
CREATE INDEX idx_candidate_work_prefs ON candidate(work_pref_remote, work_pref_hybrid, work_pref_onsite);
CREATE INDEX idx_candidate_updated ON candidate(updated_at);

-- Skills search
CREATE INDEX idx_candidate_skill_skill ON candidate_skill(skill_id);
CREATE INDEX idx_skill_category ON skill(category);

-- Document search
CREATE INDEX idx_document_type ON candidate_document(document_type);
CREATE INDEX idx_document_current ON candidate_document(is_current);

-- Full-text search on resume content
CREATE INDEX idx_document_text_search ON candidate_document USING gin(to_tsvector('english', extracted_text));

-- Communications
CREATE INDEX idx_communication_type ON candidate_communication(comm_type);
CREATE INDEX idx_communication_timestamp ON candidate_communication(timestamp);

-- Location lookups
CREATE INDEX idx_city_name ON city(city_name);
CREATE INDEX idx_city_location ON city(state_code, country_code);