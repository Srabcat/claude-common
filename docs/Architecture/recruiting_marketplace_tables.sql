-- RECRUITING MARKETPLACE - HIGH LEVEL TABLE STRUCTURE

-- CANONICAL IDENTITY
canonical_persons
├── id (UUID, PK)
├── created_at, updated_at
└── (no personal info here - just identity hub)

-- CONTACT METHODS (for identity matching)
contact_methods
├── id (UUID, PK)
├── canonical_person_id (FK)
├── type ('email' | 'phone')
├── value (UNIQUE constraint)
├── created_at
└── (handles 1E constraint: any overlap = same person)

-- ORGANIZATIONS
organizations  
├── id (UUID, PK)
├── name
├── type ('agency' | 'employer')
├── tenant_id (for isolation)
├── location (for California filtering)
├── specialties (for technical recruiting filtering)
└── other business fields...

-- USER PROFILES (one per person per organization)
user_profiles
├── id (UUID, PK)
├── canonical_person_id (FK)
├── organization_id (FK)
├── tenant_id (inherited from org)
├── profile_type ('agency' | 'employer')
├── name (can be "John Smith" vs "Johnny Smith")
├── job_title (different per organization)
├── has_login (boolean)
├── agency_specific_fields (JSONB) - many unique attributes
├── employer_specific_fields (JSONB) - many unique attributes
├── created_at, updated_at, deleted_at
└── UNIQUE(canonical_person_id, organization_id) -- 1E constraint

-- REFERENCE CONTACTS (mentioned people without full profiles)
reference_contacts
├── id (UUID, PK)
├── canonical_person_id (FK) - links to same identity system
├── organization_id (FK)
├── tenant_id
├── name ("John Smith")
├── role
├── email, phone (optional - used for identity matching)
├── notes
└── created_at

-- AUTHENTICATION (optional login capability)
user_auth
├── id (UUID, PK)
├── user_profile_id (FK)
├── email (login email)
├── password_hash
├── is_active
└── created_at

-- TENANT ISOLATION
tenants
├── id (UUID, PK)
├── name
├── subdomain
└── is_active