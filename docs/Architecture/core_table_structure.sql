-- FINAL SCHEMA: PARENT-CHILD WITH ORGANIZATION HIERARCHY

-- TENANT ISOLATION
tenants
├── id (UUID, PK)
├── name
├── subdomain
└── is_active

-- CANONICAL IDENTITY
canonical_persons
├── id (UUID, PK)
└── created_at, updated_at

contact_methods
├── id (UUID, PK)
├── user_profile_id (FK → user_profiles) -- ONLY REFERENCE NEEDED
├── type ('email' | 'phone')
├── value -- VALIDATED BY CHECK CONSTRAINTS
├── is_active
└── created_at
-- CHECK: (type = 'email' AND value ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
--     OR (type = 'phone' AND value ~* '^\+?[0-9\s\-\(\)\.]+$')

-- ORGANIZATIONS
organizations
├── id (UUID, PK)
├── tenant_id (FK → tenants)
├── name
├── type ('agency' | 'employer')
├── location
├── specialties (TEXT[])
├── is_active
└── created_at, updated_at

-- SHARED PROFILE DATA (parent table)
user_profiles
├── id (UUID, PK)
├── canonical_person_id (FK → canonical_persons)
├── tenant_id (FK → tenants)
├── profile_type ('agency' | 'employer')
├── first_name, last_name
├── home_address
├── status ('active' | 'inactive')
└── UNIQUE(canonical_person_id, tenant_id, profile_type)

-- PROFILE-ORGANIZATION RELATIONSHIPS (many-to-many)
profile_organizations
├── id (UUID, PK)
├── user_profile_id (FK → user_profiles)
├── organization_id (FK → organizations)
├── job_title, role (can differ per org)
├── status ('active' | 'inactive')
├── start_date, end_date
└── UNIQUE(user_profile_id, organization_id)

-- AGENCY-SPECIFIC DATA (child table)
agency_profiles
├── user_profile_id (PK, FK → user_profiles)
├── specializations (TEXT[])
├── commission_rate, placement_count
└── years_experience

-- EMPLOYER-SPECIFIC DATA (child table)
employer_profiles
├── user_profile_id (PK, FK → user_profiles)
├── department, hiring_budget
├── company_size, decision_level
└── approval_authority

-- REFERENCE CONTACTS
reference_contacts
├── id (UUID, PK)
├── canonical_person_id (FK → canonical_persons)
├── organization_id (FK → organizations)
├── tenant_id (FK → tenants)
├── name, role, notes
└── email, phone (optional)

-- AUTHENTICATION
user_auth
├── id (UUID, PK)
├── user_profile_id (FK → user_profiles)
├── tenant_id (FK → tenants)
├── login_email (UNIQUE)
├── password_hash
└── is_active