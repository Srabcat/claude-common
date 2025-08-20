Of course. This is the perfect moment to consolidate everything into a final, shareable architectural document. This will serve as the definitive blueprint for you and your co-founder, detailing not just the final schema but, more importantly, the strategic reasoning, trade-offs, and principles behind it.

Here is the complete package.

---

### Architectural Design Document: Core Identity & Data Model (v1.6)

**To:** Co-founder
**From:** [Your Name] & Manus (AI Architect)
**Date:** 8/14/2025
**Subject:** Final architecture for the core data model of our new ATS platform.

#### 1. Executive Summary: Our Guiding Principles

After a rigorous design and stress-testing process, we have finalized the foundational data architecture for our platform. The design is built on three core principles derived from best practices at large-scale systems like Salesforce and modern ATS platforms:

1.  **The "Airlock" Model:** We will maintain a strict separation between high-volume, low-quality "prospect" data and our core, high-quality operational data. This prevents performance degradation and keeps our primary dataset clean and reliable.
2.  **Person-First Canonical Identity:** The system's central entity is a `person`, representing a unique human being. All other roles (user, candidate, contact) are linked to this canonical record. This is the key to powerful, accurate deduplication.
3.  **Defense in Depth:** We will enforce data integrity at multiple layers (UI, Application/DAL, and Database). The database itself will be the final, non-negotiable guardian, using strict constraints to protect our most valuable asset: our data.

---

#### 2. The Final Architectural Decisions & Trade-offs

This section details the key architectural choices we made and the reasoning behind them, including why we rejected alternative paths.

##### **Decision 1: Separate Tables for Prospects (The "Airlock")**

*   **What We Chose:** Two distinct tables, `candidate_prospects` and `client_prospects`, that are completely separate from our core `persons` table.
*   **The Devil's Advocate (Alternative):** A unified `prospects` table with an inheritance model.
*   **Why We Made This Choice:** Our business logic and user workflows for handling candidate prospects vs. client prospects are fundamentally different ("Specialized Cockpits"). More importantly, the sheer volume of prospect data (potentially millions of low-engagement records) would pollute and slow down our core operational database if they were mixed. This "Airlock" approach mirrors the proven Salesforce `Lead` vs. `Contact` model, ensuring scalability and performance.

##### **Decision 2: Three Separate Tables for Person Identifiers**

*   **What We Chose:** Three distinct, strongly-typed tables: `person_emails`, `person_phones`, and `person_socials`.
*   **The Devil's Advocate (Alternative):** A single `person_contacts` table with a `contact_type` column.
*   **Why We Made This Choice:** This is our "Defense in Depth" principle in action.
    1.  **Integrity:** It allows the database to enforce specific constraints (e.g., a valid email format), acting as a final guard against corrupt data from bulk imports or buggy API integrations.
    2.  **Performance:** It enables small, hyper-optimized indexes on each identifier type. This guarantees our most critical query—duplicate checking—remains fast at scale.
    3.  **Clarity:** The explicit schema is easier for developers and AI assistants to query correctly, reducing bugs.

##### **Decision 3: A Unified `persons` Table for All Identified People**

*   **What We Chose:** Any person for whom we have a unique identifier (work email, personal email, etc.), whether they are a login user or just a passive contact (like an interviewer), gets a record in the `persons` table.
*   **The Devil's Advocate (Alternative):** Storing contact info for non-users in a separate `JSONB` blob to avoid "polluting" the `persons` table.
*   **Why We Made This Choice:** This was a critical insight. The purpose of the `persons` table is **identification**, not just user management. A work email is a valid identifier. This model dramatically simplifies the architecture:
    *   It provides a single source of truth for every known individual.
    *   It makes the "Universal Reverse Lookup" clean and efficient.
    *   It correctly models a person's journey across different companies by attaching new roles (`organization_contacts`) to the same timeless `persons` record.

##### **Decision 4: Pluggable Authentication via an "Auth Bridge"**

*   **What We Chose:** Our `users` table acts as a simple bridge, linking our internal `person_id` to an external `auth_provider_user_id` from a service like Supabase.
*   **Why We Made This Choice:** This decouples our core business logic from our authentication provider. If we ever need to migrate away from Supabase, we only need to update the "bridge" table and the login service, leaving the rest of our application untouched. It provides maximum future flexibility with minimal upfront cost.

---

### 3. The Final MVP SQL Schema (v1.6)

Here is the complete SQL code for the database schema. This can be saved as `schema_mvp_v1.6.sql`.

```sql
-- =================================================================
-- Final MVP Schema - Version 1.6 (Unified Identity & Airlock Model)
-- =================================================================

-- SECTION 1: CORE OPERATIONAL DATA (High-Quality, High-Integrity)
-- =================================================================
You are absolutely right. My apologies. In my effort to provide the complete text document, I failed to provide the most important part in a clean, final format: the SQL code itself.

You need the final SQL schema in a clean, copy-and-paste-ready format. I will provide that for you now as a distinct code block. There will be no other text in my response, just the code, so you can easily select and copy the entire thing.

Here is the complete and final SQL schema (v1.6). Please copy the entire contents of this code block.

```sql
-- =================================================================
-- Final MVP Schema - Version 1.6 (Unified Identity & Airlock Model)
-- =================================================================

-- SECTION 1: CORE OPERATIONAL DATA (High-Quality, High-Integrity)
-- =================================================================

-- The canonical record for a unique human being.
CREATE TABLE persons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name VARCHAR(255),
    last_name VARCHAR(255)
);

-- Strongly-typed tables for unique identifiers, enabling fast, accurate deduplication.
CREATE TABLE person_emails (
    email VARCHAR(255) PRIMARY KEY,
    person_id UUID NOT NULL REFERENCES persons(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'do_not_contact'))
);

CREATE TABLE person_phones (
    phone_number VARCHAR(50) PRIMARY KEY,
    person_id UUID NOT NULL REFERENCES persons(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'do_not_contact'))
);

CREATE TABLE person_socials (
    url VARCHAR(2048) PRIMARY KEY,
    person_id UUID NOT NULL REFERENCES persons(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive'))
);

-- The "Auth Bridge" table, linking a person to a login provider like Supabase.
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    person_id UUID NOT NULL UNIQUE REFERENCES persons(id),
    auth_provider VARCHAR(50) NOT NULL DEFAULT 'supabase',
    auth_provider_user_id TEXT NOT NULL,
    UNIQUE (auth_provider, auth_provider_user_id)
);

-- The "Tenant" table. All data belongs to an organization.
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('employer', 'agency', 'platform'))
);

-- Extension tables for organization-specific data (Hybrid Model).
CREATE TABLE agency_details ( org_id UUID PRIMARY KEY REFERENCES organizations(id), settings JSONB DEFAULT '{}' );
CREATE TABLE employer_details ( org_id UUID PRIMARY KEY REFERENCES organizations(id), settings JSONB DEFAULT '{}' );
CREATE TABLE platform_details ( org_id UUID PRIMARY KEY REFERENCES organizations(id), settings JSONB DEFAULT '{}' );

-- Tables defining a person's or user's role in the system.
CREATE TABLE candidate_profiles ( person_id UUID PRIMARY KEY REFERENCES persons(id), settings JSONB DEFAULT '{}' );
CREATE TABLE recruiter_profile ( user_id UUID PRIMARY KEY REFERENCES users(id), settings JSONB DEFAULT '{}' );
CREATE TABLE employer_user_profile ( user_id UUID PRIMARY KEY REFERENCES users(id), settings JSONB DEFAULT '{}' );

-- Defines the relationship between a person and an organization (e.g., as an Interviewer).
CREATE TABLE organization_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    person_id UUID NOT NULL REFERENCES persons(id),
    job_title VARCHAR(255),
    details JSONB DEFAULT '{}', -- For role-specific data like calendar links.
    UNIQUE (organization_id, person_id)
);

-- Defines which users are members of which organizations.
CREATE TABLE organization_members (
    user_id UUID NOT NULL REFERENCES users(id),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    PRIMARY KEY (user_id, organization_id)
);

-- =================================================================
-- SECTION 2: THE AIRLOCK / STAGING AREA (High-Volume, Low-Quality)
-- Intentionally separate from the core operational data.
-- =================================================================

CREATE TABLE candidate_prospects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    status VARCHAR(50) NOT NULL DEFAULT 'new',
    source VARCHAR(255),
    full_name VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    linkedin_url VARCHAR(2048),
    details JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now(),
    INDEX idx_candidate_prospects_email (email)
);

CREATE TABLE client_prospects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    status VARCHAR(50) NOT NULL DEFAULT 'new',
    source VARCHAR(255),
    company_name VARCHAR(255),
    contact_person_email VARCHAR(255),
    details JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now(),
    INDEX idx_client_prospects_email (contact_person_email)
);
```