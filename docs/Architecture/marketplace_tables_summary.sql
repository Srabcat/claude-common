-- HIGH-LEVEL TABLE STRUCTURE FOR MULTI-TALENT MARKETPLACE

-- IDENTITY CORE
canonical_persons
├── id (UUID, PK)
├── primary_email 
├── primary_phone
└── display_name

contact_methods  
├── id (UUID, PK)
├── canonical_person_id (FK)
├── type ('email' | 'phone')
├── value (UNIQUE with type)
└── is_verified, is_primary

-- ORGANIZATION STRUCTURE  
organizations
├── id (UUID, PK)
├── name
├── type ('supply' | 'demand')
└── tenant_id (for isolation)

-- USER PROFILES
user_profiles
├── id (UUID, PK) 
├── canonical_person_id (FK)
├── organization_id (FK)
├── tenant_id (inherited)
├── profile_type ('supply' | 'demand')
├── role, title
├── supply_attributes (JSONB)
├── demand_attributes (JSONB)
├── has_login (boolean)
└── login_email

-- REFERENCE SYSTEM
reference_contacts
├── id (UUID, PK)
├── canonical_person_id (FK) 
├── organization_id (FK)
├── tenant_id
├── name ("John Smith")
├── role
└── optional email/phone

-- AUTHENTICATION
user_auth
├── id (UUID, PK)
├── user_profile_id (FK)
├── email (UNIQUE)
└── password_hash

-- TENANT ISOLATION
tenants
├── id (UUID, PK)
├── name
└── subdomain