-- Multi-Talent SaaS Marketplace Database Schema
-- Designed for two-sided marketplace with canonical person identity

-- =============================================
-- CORE IDENTITY SYSTEM
-- =============================================

-- Canonical persons - the "true" identity behind all profiles
CREATE TABLE canonical_persons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    -- Metadata for identity resolution
    primary_email VARCHAR(255),
    primary_phone VARCHAR(50),
    display_name VARCHAR(255),
    -- Soft delete support
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Contact methods for identity resolution
CREATE TABLE contact_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    canonical_person_id UUID REFERENCES canonical_persons(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('email', 'phone')),
    value VARCHAR(255) NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(type, value), -- Ensure each email/phone belongs to only one canonical person
    INDEX idx_contact_methods_value (value),
    INDEX idx_contact_methods_person (canonical_person_id)
);

-- =============================================
-- ORGANIZATION SYSTEM
-- =============================================

-- Organizations (both supply-side and demand-side companies)
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('supply', 'demand')),
    tenant_id UUID NOT NULL, -- For tenant isolation
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    
    INDEX idx_organizations_tenant (tenant_id),
    INDEX idx_organizations_type (type)
);

-- =============================================
-- USER PROFILES SYSTEM
-- =============================================

-- User profiles - can be supply-side or demand-side
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    canonical_person_id UUID REFERENCES canonical_persons(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL, -- Inherited from organization for isolation
    
    -- Profile type and role
    profile_type VARCHAR(20) NOT NULL CHECK (profile_type IN ('supply', 'demand')),
    role VARCHAR(100),
    title VARCHAR(100),
    
    -- Profile-specific attributes
    supply_attributes JSONB, -- e.g., skills, rates, availability
    demand_attributes JSONB, -- e.g., hiring needs, budget, requirements
    
    -- Login capability
    has_login BOOLEAN DEFAULT FALSE,
    login_email VARCHAR(255), -- May differ from contact methods
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    
    INDEX idx_user_profiles_canonical (canonical_person_id),
    INDEX idx_user_profiles_org (organization_id),
    INDEX idx_user_profiles_tenant (tenant_id),
    INDEX idx_user_profiles_type (profile_type),
    INDEX idx_user_profiles_login_email (login_email)
);

-- =============================================
-- REFERENCE CONTACTS SYSTEM
-- =============================================

-- For people mentioned but not having full profiles (like "John Smith")
CREATE TABLE reference_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    canonical_person_id UUID REFERENCES canonical_persons(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL,
    
    -- Basic reference info
    name VARCHAR(255) NOT NULL,
    role VARCHAR(100),
    notes TEXT,
    
    -- Contact info (optional)
    email VARCHAR(255),
    phone VARCHAR(50),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    INDEX idx_reference_contacts_canonical (canonical_person_id),
    INDEX idx_reference_contacts_org (organization_id),
    INDEX idx_reference_contacts_tenant (tenant_id)
);

-- =============================================
-- AUTHENTICATION SYSTEM
-- =============================================

-- User authentication for those with login capability
CREATE TABLE user_auth (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_profile_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    INDEX idx_user_auth_profile (user_profile_id),
    INDEX idx_user_auth_email (email)
);

-- =============================================
-- TENANT ISOLATION
-- =============================================

-- Tenant management for isolation
CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    subdomain VARCHAR(100) UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE
);

-- =============================================
-- HELPER VIEWS AND FUNCTIONS
-- =============================================

-- View to get complete person information
CREATE VIEW person_complete_view AS
SELECT 
    cp.id as canonical_person_id,
    cp.display_name,
    cp.primary_email,
    cp.primary_phone,
    
    -- Aggregated contact methods
    (SELECT json_agg(json_build_object(
        'type', cm.type,
        'value', cm.value,
        'is_verified', cm.is_verified,
        'is_primary', cm.is_primary
    )) FROM contact_methods cm WHERE cm.canonical_person_id = cp.id) as contact_methods,
    
    -- Aggregated profiles
    (SELECT json_agg(json_build_object(
        'profile_id', up.id,
        'organization_id', up.organization_id,
        'organization_name', o.name,
        'profile_type', up.profile_type,
        'role', up.role,
        'title', up.title,
        'has_login', up.has_login,
        'tenant_id', up.tenant_id
    )) FROM user_profiles up 
     LEFT JOIN organizations o ON up.organization_id = o.id 
     WHERE up.canonical_person_id = cp.id AND up.deleted_at IS NULL) as profiles,
     
    -- Reference contacts
    (SELECT json_agg(json_build_object(
        'reference_id', rc.id,
        'organization_id', rc.organization_id,
        'organization_name', o.name,
        'name', rc.name,
        'role', rc.role,
        'tenant_id', rc.tenant_id
    )) FROM reference_contacts rc
     LEFT JOIN organizations o ON rc.organization_id = o.id
     WHERE rc.canonical_person_id = cp.id) as references

FROM canonical_persons cp
WHERE cp.deleted_at IS NULL;

-- =============================================
-- IDENTITY RESOLUTION FUNCTIONS
-- =============================================

-- Function to find canonical person by email or phone
CREATE OR REPLACE FUNCTION find_canonical_person(
    contact_value VARCHAR(255),
    contact_type VARCHAR(20) DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    person_id UUID;
BEGIN
    -- If type not specified, try to infer from value format
    IF contact_type IS NULL THEN
        IF contact_value LIKE '%@%' THEN
            contact_type := 'email';
        ELSE
            contact_type := 'phone';
        END IF;
    END IF;
    
    SELECT canonical_person_id INTO person_id
    FROM contact_methods
    WHERE type = contact_type AND value = contact_value
    LIMIT 1;
    
    RETURN person_id;
END;
$$ LANGUAGE plpgsql;

-- Function to create or merge canonical person (handles contacts without email/phone)
CREATE OR REPLACE FUNCTION create_or_merge_canonical_person(
    email VARCHAR(255) DEFAULT NULL,
    phone VARCHAR(50) DEFAULT NULL,
    display_name VARCHAR(255) DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    existing_person_id UUID;
    new_person_id UUID;
BEGIN
    -- Try to find existing person by email or phone (only if provided)
    IF email IS NOT NULL THEN
        existing_person_id := find_canonical_person(email, 'email');
    END IF;
    
    IF existing_person_id IS NULL AND phone IS NOT NULL THEN
        existing_person_id := find_canonical_person(phone, 'phone');
    END IF;
    
    -- If found, return existing
    IF existing_person_id IS NOT NULL THEN
        RETURN existing_person_id;
    END IF;
    
    -- Create new canonical person (even without contact methods)
    INSERT INTO canonical_persons (display_name, primary_email, primary_phone)
    VALUES (display_name, email, phone)
    RETURNING id INTO new_person_id;
    
    -- Add contact methods only if provided
    IF email IS NOT NULL THEN
        INSERT INTO contact_methods (canonical_person_id, type, value, is_primary)
        VALUES (new_person_id, 'email', email, true);
    END IF;
    
    IF phone IS NOT NULL THEN
        INSERT INTO contact_methods (canonical_person_id, type, value, is_primary)
        VALUES (new_person_id, 'phone', phone, true);
    END IF;
    
    RETURN new_person_id;
END;
$$ LANGUAGE plpgsql;

-- Function to create reference contact (for "John Smith" type entries)
CREATE OR REPLACE FUNCTION create_reference_contact(
    organization_id UUID,
    tenant_id UUID,
    name VARCHAR(255),
    role VARCHAR(100) DEFAULT NULL,
    email VARCHAR(255) DEFAULT NULL,
    phone VARCHAR(50) DEFAULT NULL,
    notes TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    person_id UUID;
    reference_id UUID;
BEGIN
    -- Create or find canonical person
    person_id := create_or_merge_canonical_person(email, phone, name);
    
    -- Create reference contact
    INSERT INTO reference_contacts (
        canonical_person_id, 
        organization_id, 
        tenant_id, 
        name, 
        role, 
        email, 
        phone, 
        notes
    ) VALUES (
        person_id, 
        organization_id, 
        tenant_id, 
        name, 
        role, 
        email, 
        phone, 
        notes
    ) RETURNING id INTO reference_id;
    
    RETURN reference_id;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- EXAMPLE QUERIES
-- =============================================

-- Query: Find all information about a person by email
/*
SELECT * FROM person_complete_view 
WHERE canonical_person_id = find_canonical_person('user@example.com', 'email');
*/

-- Query: Get all supply-side profiles for a person
/*
SELECT up.*, o.name as organization_name
FROM user_profiles up
JOIN organizations o ON up.organization_id = o.id
WHERE up.canonical_person_id = find_canonical_person('user@example.com')
  AND up.profile_type = 'supply'
  AND up.deleted_at IS NULL;
*/

-- Query: Check if person works for supply or demand side
/*
SELECT DISTINCT profile_type
FROM user_profiles
WHERE canonical_person_id = find_canonical_person('user@example.com')
  AND deleted_at IS NULL;
*/

-- Query: Get all organizations a person is associated with
/*
SELECT DISTINCT o.id, o.name, o.type, up.profile_type, up.role
FROM user_profiles up
JOIN organizations o ON up.organization_id = o.id
WHERE up.canonical_person_id = find_canonical_person('user@example.com')
  AND up.deleted_at IS NULL
UNION
SELECT DISTINCT o.id, o.name, o.type, 'reference' as profile_type, rc.role
FROM reference_contacts rc
JOIN organizations o ON rc.organization_id = o.id
WHERE rc.canonical_person_id = find_canonical_person('user@example.com');
*/