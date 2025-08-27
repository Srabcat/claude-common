-- FINDING PEOPLE BY NAME (when no email/phone available)
-- For reference contacts like "John Smith"

-- =============================================
-- Find person by name across all organizations
-- =============================================

-- Example: Find all "John Smith" entries
SELECT 
    cp.id as canonical_person_id,
    cp.display_name,
    
    -- Contact methods (may be empty)
    (SELECT json_agg(json_build_object(
        'type', cm.type,
        'value', cm.value
    )) FROM contact_methods cm WHERE cm.canonical_person_id = cp.id) as contact_methods,
    
    -- Organizations where this person is referenced
    (SELECT json_agg(json_build_object(
        'org_id', o.id,
        'org_name', o.name,
        'org_type', o.type,
        'role', rc.role,
        'notes', rc.notes,
        'tenant_id', rc.tenant_id
    )) FROM reference_contacts rc
     JOIN organizations o ON rc.organization_id = o.id
     WHERE rc.canonical_person_id = cp.id) as reference_organizations,
     
    -- Full profiles (if any)
    (SELECT json_agg(json_build_object(
        'org_id', o.id,
        'org_name', o.name,
        'org_type', o.type,
        'role', up.role,
        'title', up.title,
        'has_login', up.has_login,
        'tenant_id', up.tenant_id
    )) FROM user_profiles up
     JOIN organizations o ON up.organization_id = o.id
     WHERE up.canonical_person_id = cp.id AND up.deleted_at IS NULL) as full_profiles

FROM canonical_persons cp
WHERE cp.display_name ILIKE '%John Smith%'  -- Case-insensitive partial match
  AND cp.deleted_at IS NULL;

-- =============================================
-- Usage Examples
-- =============================================

-- Create a reference contact without any contact info
/*
SELECT create_reference_contact(
    organization_id := 'org-uuid-here',
    tenant_id := 'tenant-uuid-here', 
    name := 'John Smith',
    role := 'Project Manager',
    email := NULL,  -- No email
    phone := NULL,  -- No phone
    notes := 'Mentioned in project kickoff meeting'
);
*/

-- Later, if we get John Smith's email, we can add it
/*
-- First find the canonical person
SELECT cp.id FROM canonical_persons cp 
WHERE cp.display_name = 'John Smith'
AND cp.id IN (
    SELECT rc.canonical_person_id FROM reference_contacts rc
    JOIN organizations o ON rc.organization_id = o.id
    WHERE o.name = 'TargetOrganization'
);

-- Then add the contact method
INSERT INTO contact_methods (canonical_person_id, type, value, is_primary)
VALUES ('found-canonical-person-id', 'email', 'john.smith@company.com', true);

-- Update the canonical person primary email
UPDATE canonical_persons 
SET primary_email = 'john.smith@company.com'
WHERE id = 'found-canonical-person-id';
*/

-- =============================================
-- Function to search by name with fuzzy matching
-- =============================================

CREATE OR REPLACE FUNCTION find_people_by_name(
    search_name VARCHAR(255),
    organization_id UUID DEFAULT NULL,
    tenant_id UUID DEFAULT NULL
) RETURNS TABLE (
    canonical_person_id UUID,
    display_name VARCHAR(255),
    has_contact_info BOOLEAN,
    organization_count INTEGER,
    organization_names TEXT
) AS $$
BEGIN
    RETURN QUERY
    WITH person_summary AS (
        SELECT 
            cp.id,
            cp.display_name,
            CASE WHEN EXISTS(
                SELECT 1 FROM contact_methods cm 
                WHERE cm.canonical_person_id = cp.id
            ) THEN TRUE ELSE FALSE END as has_contact_info,
            
            -- Count organizations (both references and profiles)
            (SELECT COUNT(DISTINCT COALESCE(rc.organization_id, up.organization_id))
             FROM reference_contacts rc
             FULL OUTER JOIN user_profiles up ON rc.canonical_person_id = up.canonical_person_id
             WHERE COALESCE(rc.canonical_person_id, up.canonical_person_id) = cp.id
               AND (organization_id IS NULL OR 
                    COALESCE(rc.organization_id, up.organization_id) = organization_id)
               AND (tenant_id IS NULL OR 
                    COALESCE(rc.tenant_id, up.tenant_id) = tenant_id)
            ) as org_count,
            
            -- List organization names
            (SELECT STRING_AGG(DISTINCT o.name, ', ')
             FROM (
                 SELECT rc.organization_id as oid FROM reference_contacts rc 
                 WHERE rc.canonical_person_id = cp.id
                   AND (organization_id IS NULL OR rc.organization_id = organization_id)
                   AND (tenant_id IS NULL OR rc.tenant_id = tenant_id)
                 UNION
                 SELECT up.organization_id FROM user_profiles up
                 WHERE up.canonical_person_id = cp.id 
                   AND up.deleted_at IS NULL
                   AND (organization_id IS NULL OR up.organization_id = organization_id)
                   AND (tenant_id IS NULL OR up.tenant_id = tenant_id)
             ) org_ids
             JOIN organizations o ON o.id = org_ids.oid
            ) as org_names
            
        FROM canonical_persons cp
        WHERE cp.display_name ILIKE '%' || search_name || '%'
          AND cp.deleted_at IS NULL
    )
    SELECT 
        ps.id,
        ps.display_name,
        ps.has_contact_info,
        ps.org_count::INTEGER,
        ps.org_names
    FROM person_summary ps
    WHERE ps.org_count > 0  -- Only return people with organizational connections
    ORDER BY ps.has_contact_info DESC, ps.org_count DESC;
END;
$$ LANGUAGE plpgsql;