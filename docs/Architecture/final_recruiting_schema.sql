-- RECRUITING MARKETPLACE - FINAL SCHEMA DESIGN
-- Solo developer friendly, PostgreSQL, tenant_id approach

-- =============================================
-- TENANT ISOLATION
-- =============================================
CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    subdomain VARCHAR(100) UNIQUE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- CANONICAL IDENTITY SYSTEM
-- =============================================

-- Identity hub - no personal info, just links profiles
CREATE TABLE canonical_persons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Contact methods for identity matching (keep old ones for history)
CREATE TABLE contact_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    canonical_person_id UUID NOT NULL REFERENCES canonical_persons(id),
    type VARCHAR(20) NOT NULL CHECK (type IN ('email', 'phone')),
    value VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE, -- for deactivation without deletion
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(type, value), -- enforces identity matching rule
    INDEX idx_contact_methods_value (value),
    INDEX idx_contact_methods_person (canonical_person_id)
);

-- =============================================
-- ORGANIZATIONS
-- =============================================
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('agency', 'employer')),
    
    -- For search/filter use cases
    location VARCHAR(255), -- "California"
    specialties TEXT[], -- ["technical recruiting", "executive search"]
    
    -- Status tracking
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    INDEX idx_organizations_tenant (tenant_id),
    INDEX idx_organizations_type (type),
    INDEX idx_organizations_location (location)
);

-- =============================================
-- USER PROFILES (one per person per organization)
-- =============================================
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    canonical_person_id UUID NOT NULL REFERENCES canonical_persons(id),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    
    -- Profile can have different info per organization
    profile_type VARCHAR(20) NOT NULL CHECK (profile_type IN ('agency', 'employer')),
    name VARCHAR(255) NOT NULL, -- "John Smith" vs "Johnny Smith"
    job_title VARCHAR(255),
    
    -- Agency-specific fields
    agency_specializations TEXT[], -- ["technical", "executive"]
    commission_rate DECIMAL(5,2),
    placement_count INTEGER DEFAULT 0,
    years_experience INTEGER,
    
    -- Employer-specific fields  
    department VARCHAR(255),
    hiring_budget INTEGER,
    company_size VARCHAR(50), -- "50-100", "1000+"
    decision_level VARCHAR(50), -- "hiring_manager", "hr", "executive"
    
    -- Login capability
    has_login BOOLEAN DEFAULT FALSE,
    
    -- Status tracking (for deactivation/history)
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'terminated')),
    status_changed_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Core constraints
    UNIQUE(canonical_person_id, organization_id), -- 1E: one profile per person per org
    
    -- Indexes for search/filter
    INDEX idx_user_profiles_tenant (tenant_id),
    INDEX idx_user_profiles_canonical (canonical_person_id),
    INDEX idx_user_profiles_org (organization_id),
    INDEX idx_user_profiles_type (profile_type),
    INDEX idx_user_profiles_name (name),
    INDEX idx_user_profiles_status (status)
);

-- =============================================
-- REFERENCE CONTACTS (mentioned people)
-- =============================================
CREATE TABLE reference_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    canonical_person_id UUID NOT NULL REFERENCES canonical_persons(id),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    
    -- Basic info
    name VARCHAR(255) NOT NULL, -- "John Smith"
    role VARCHAR(255),
    notes TEXT,
    
    -- Optional contact info (for identity matching)
    email VARCHAR(255),
    phone VARCHAR(50),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    INDEX idx_reference_contacts_tenant (tenant_id),
    INDEX idx_reference_contacts_canonical (canonical_person_id),
    INDEX idx_reference_contacts_org (organization_id),
    INDEX idx_reference_contacts_email (email),
    INDEX idx_reference_contacts_phone (phone)
);

-- =============================================
-- AUTHENTICATION (optional login)
-- =============================================
CREATE TABLE user_auth (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_profile_id UUID NOT NULL REFERENCES user_profiles(id),
    tenant_id UUID NOT NULL REFERENCES tenants(id), -- for isolation
    
    login_email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    INDEX idx_user_auth_profile (user_profile_id),
    INDEX idx_user_auth_tenant (tenant_id),
    INDEX idx_user_auth_email (login_email)
);

-- =============================================
-- HELPER FUNCTIONS
-- =============================================

-- Find canonical person by any contact method
CREATE OR REPLACE FUNCTION find_canonical_person_by_contact(
    contact_value VARCHAR(255)
) RETURNS UUID AS $$
DECLARE
    person_id UUID;
BEGIN
    SELECT canonical_person_id INTO person_id
    FROM contact_methods
    WHERE value = contact_value AND is_active = TRUE
    LIMIT 1;
    
    RETURN person_id;
END;
$$ LANGUAGE plpgsql;

-- Get all profiles for a person by email/phone
CREATE OR REPLACE FUNCTION get_person_profiles(
    contact_value VARCHAR(255)
) RETURNS TABLE (
    canonical_person_id UUID,
    profile_id UUID,
    organization_name VARCHAR(255),
    organization_type VARCHAR(20),
    profile_name VARCHAR(255),
    job_title VARCHAR(255),
    tenant_id UUID
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        up.canonical_person_id,
        up.id,
        o.name,
        o.type,
        up.name,
        up.job_title,
        up.tenant_id
    FROM user_profiles up
    JOIN organizations o ON up.organization_id = o.id
    WHERE up.canonical_person_id = find_canonical_person_by_contact(contact_value)
      AND up.status = 'active';
END;
$$ LANGUAGE plpgsql;