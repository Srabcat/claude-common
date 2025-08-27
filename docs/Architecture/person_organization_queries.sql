-- PERSON-ORGANIZATION IDENTIFICATION QUERIES
-- Find exact organizations and sides for any person

-- =============================================
-- CORE QUERY: Get all organizations for a person by email/phone
-- =============================================

-- Example: person@example.com works for:
-- - SupplierA (supply-side, as freelancer)  
-- - SupplierB (supply-side, as contractor)
-- - ClientCorp (demand-side, as hiring manager)

SELECT 
    cp.id as canonical_person_id,
    cp.display_name,
    o.id as organization_id,
    o.name as organization_name,
    o.type as organization_type,  -- 'supply' or 'demand'
    up.profile_type,              -- Should match organization_type
    up.role,
    up.title,
    up.has_login,
    up.tenant_id
FROM canonical_persons cp
JOIN contact_methods cm ON cp.id = cm.canonical_person_id  
JOIN user_profiles up ON cp.id = up.canonical_person_id
JOIN organizations o ON up.organization_id = o.id
WHERE cm.value = 'person@example.com'  -- Or any email/phone
  AND cm.type = 'email'               -- Or 'phone'
  AND up.deleted_at IS NULL
ORDER BY o.type, o.name;

-- =============================================
-- SUMMARY QUERY: Person's side involvement
-- =============================================

-- Quick check: Is this person supply-side, demand-side, or both?
SELECT 
    cm.value as contact_value,
    COUNT(CASE WHEN o.type = 'supply' THEN 1 END) as supply_orgs_count,
    COUNT(CASE WHEN o.type = 'demand' THEN 1 END) as demand_orgs_count,
    
    -- List of supply organizations
    STRING_AGG(
        CASE WHEN o.type = 'supply' THEN o.name END, 
        ', '
    ) as supply_organizations,
    
    -- List of demand organizations  
    STRING_AGG(
        CASE WHEN o.type = 'demand' THEN o.name END,
        ', '  
    ) as demand_organizations,
    
    -- Overall classification
    CASE 
        WHEN COUNT(CASE WHEN o.type = 'supply' THEN 1 END) > 0 
         AND COUNT(CASE WHEN o.type = 'demand' THEN 1 END) > 0 
        THEN 'both'
        WHEN COUNT(CASE WHEN o.type = 'supply' THEN 1 END) > 0 
        THEN 'supply-only'
        WHEN COUNT(CASE WHEN o.type = 'demand' THEN 1 END) > 0 
        THEN 'demand-only'
        ELSE 'none'
    END as person_classification

FROM canonical_persons cp
JOIN contact_methods cm ON cp.id = cm.canonical_person_id
JOIN user_profiles up ON cp.id = up.canonical_person_id  
JOIN organizations o ON up.organization_id = o.id
WHERE cm.value = 'person@example.com'
  AND cm.type = 'email'
  AND up.deleted_at IS NULL
GROUP BY cm.value;

-- =============================================
-- DETAILED BREAKDOWN: All relationships
-- =============================================

-- Complete picture including reference contacts
WITH person_orgs AS (
    SELECT 
        cp.id as canonical_person_id,
        cp.display_name,
        o.id as org_id,
        o.name as org_name,
        o.type as org_type,
        up.role,
        up.title,
        'active_profile' as relationship_type,
        up.tenant_id
    FROM canonical_persons cp
    JOIN contact_methods cm ON cp.id = cm.canonical_person_id
    JOIN user_profiles up ON cp.id = up.canonical_person_id
    JOIN organizations o ON up.organization_id = o.id  
    WHERE cm.value = 'person@example.com'
      AND cm.type = 'email'
      AND up.deleted_at IS NULL
      
    UNION ALL
    
    SELECT 
        cp.id,
        cp.display_name, 
        o.id,
        o.name,
        o.type,
        rc.role,
        NULL as title,
        'reference_contact' as relationship_type,
        rc.tenant_id
    FROM canonical_persons cp
    JOIN contact_methods cm ON cp.id = cm.canonical_person_id
    JOIN reference_contacts rc ON cp.id = rc.canonical_person_id
    JOIN organizations o ON rc.organization_id = o.id
    WHERE cm.value = 'person@example.com'
      AND cm.type = 'email'
)
SELECT 
    canonical_person_id,
    display_name,
    -- Supply side details
    (SELECT json_agg(json_build_object(
        'org_id', org_id,
        'org_name', org_name, 
        'role', role,
        'title', title,
        'relationship_type', relationship_type,
        'tenant_id', tenant_id
    )) FROM person_orgs WHERE org_type = 'supply') as supply_relationships,
    
    -- Demand side details  
    (SELECT json_agg(json_build_object(
        'org_id', org_id,
        'org_name', org_name,
        'role', role, 
        'title', title,
        'relationship_type', relationship_type,
        'tenant_id', tenant_id
    )) FROM person_orgs WHERE org_type = 'demand') as demand_relationships,
    
    -- Summary counts
    (SELECT COUNT(*) FROM person_orgs WHERE org_type = 'supply') as total_supply_orgs,
    (SELECT COUNT(*) FROM person_orgs WHERE org_type = 'demand') as total_demand_orgs
    
FROM person_orgs
GROUP BY canonical_person_id, display_name
LIMIT 1;

-- =============================================
-- FUNCTION: Get person organization summary
-- =============================================

CREATE OR REPLACE FUNCTION get_person_organization_summary(
    contact_value VARCHAR(255),
    contact_type VARCHAR(20) DEFAULT 'email'
) RETURNS TABLE (
    person_id UUID,
    display_name VARCHAR(255),
    organization_id UUID, 
    organization_name VARCHAR(255),
    organization_type VARCHAR(20),
    person_role VARCHAR(100),
    person_title VARCHAR(100),
    relationship_type VARCHAR(50),
    tenant_id UUID
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        cp.id,
        cp.display_name,
        o.id,
        o.name,
        o.type,
        up.role,
        up.title,
        'active_profile'::VARCHAR(50),
        up.tenant_id
    FROM canonical_persons cp
    JOIN contact_methods cm ON cp.id = cm.canonical_person_id
    JOIN user_profiles up ON cp.id = up.canonical_person_id
    JOIN organizations o ON up.organization_id = o.id
    WHERE cm.value = contact_value
      AND cm.type = contact_type
      AND up.deleted_at IS NULL
      
    UNION ALL
    
    SELECT 
        cp.id,
        cp.display_name,
        o.id, 
        o.name,
        o.type,
        rc.role,
        NULL::VARCHAR(100),
        'reference_contact'::VARCHAR(50),
        rc.tenant_id
    FROM canonical_persons cp
    JOIN contact_methods cm ON cp.id = cm.canonical_person_id  
    JOIN reference_contacts rc ON cp.id = rc.canonical_person_id
    JOIN organizations o ON rc.organization_id = o.id
    WHERE cm.value = contact_value
      AND cm.type = contact_type;
END;
$$ LANGUAGE plpgsql;