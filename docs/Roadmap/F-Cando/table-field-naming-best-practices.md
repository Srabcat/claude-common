# Database Table & Field Naming Best Practices

## Current Problems in Schema

### Naming Confusion
- `user` table unclear - is this login or contact?
- `person` too generic - recruiter vs candidate vs employer?
- `teams` unclear - is this tenant or organization?
- `person_type` ambiguous - what are the valid values?

### Normalization Issues
- Login user needs email AND contact has primary email = duplication
- Mixed concerns in tables (login + contact info together)

## Proposed Naming Conventions

### Core Principle: **Explicit Over Generic**
- Use specific, descriptive names
- Avoid generic terms like `user`, `person`, `teams`
- Table names should immediately convey purpose

### Table Naming Pattern: `{domain}_{entity}`

#### Authentication & Login
```sql
user_login              -- Login accounts only (username, password, auth)
user_session            -- Active login sessions
```

#### Contact Information (Universal)
```sql
contact                 -- Universal contact info (name, basic details)
contact_identifier      -- Emails, phones, LinkedIn (replaces person_identifier)
contact_document        -- Resumes, portfolios
contact_communication   -- Emails, calls, meetings
contact_note           -- Additional notes
```

#### Organizational Structure
```sql
tenant                  -- Paying customer companies (replaces teams)
organization           -- Departments/offices within tenant
role                   -- Custom roles per tenant
user_organization_assignment  -- Who works where with what role
```

#### Person Types (Specific Tables)
```sql
agency_person          -- Recruiters at agencies
employer_person        -- Employees at companies  
platform_person        -- Platform staff/admins
candidate              -- Job seekers
```

#### Business Logic
```sql
candidate_submission    -- When recruiters submit candidates
candidate_representation -- Who represents whom to which employer
duplicate_conflict     -- Admin review queue for conflicts
```

## Field Naming Conventions

### Primary Keys: `{table_name}_id`
```sql
contact_id             -- contact table PK
tenant_id             -- tenant table PK  
candidate_id          -- candidate table PK
```

### Foreign Keys: `{referenced_table}_id`
```sql
contact_id            -- References contact table
tenant_id            -- References tenant table
user_login_id         -- References user_login table
```

### Boolean Fields: `is_{condition}` or `has_{feature}`
```sql
is_primary            -- Primary email/phone
is_verified           -- Verified status
has_login_account     -- Contact has login
is_admin              -- Admin role
```

### Status Fields: `{entity}_status`
```sql
availability_status   -- active, passive, not_looking
representation_status -- active, expired, revoked
conflict_status      -- pending, resolved, duplicate
```

### Date Fields: `{action}_at`
```sql
created_at           -- When record created
updated_at           -- Last modification
deleted_at           -- Soft delete timestamp
expires_at           -- When representation expires
submitted_at         -- When candidate submitted
```

## Persona Mapping with New Names

### Agency Recruiter User (with login account)
```
contact + user_login + agency_person + user_organization_assignment
```

### Agency Recruiter Contact (no login account)
```
contact + agency_person
```

### Employer User (with login account)  
```
contact + user_login + employer_person + user_organization_assignment
```

### Employer Contact (no login account)
```
contact + employer_person  
```

### Platform User (with login account)
```
contact + user_login + platform_person + user_organization_assignment
```

### Platform Contact (no login account)
```
contact + platform_person
```

### Candidate (with login account)
```
contact + user_login + candidate + contact_identifier
```

### Candidate (no login account)
```
contact + candidate + contact_identifier
```

## Key Design Decisions

### 1. Separation of Concerns
- **contact**: Name, basic info (no emails/phones)
- **contact_identifier**: All emails, phones, LinkedIn URLs
- **user_login**: Authentication only (username, password)
- **{type}_person**: Role-specific data

### 2. No Duplication
- Login table references contact_id (no duplicate emails)
- Primary email stored as FK to contact_identifier table
- Single source of truth for each data type

### 3. Clear Entity Types
- `agency_person` not `recruiter` (agencies can have coordinators, VPs)
- `employer_person` not `employer` (employers are companies)
- `candidate` remains (clear, specific)
- `platform_person` for platform staff

### 4. Explicit Status Fields
- `actor_type` instead of `person_type` (clearer intent)
- `availability_status` instead of `status` (specific context)
- `representation_status` for business logic states

## Benefits of This Approach

1. **Self-Documenting**: Table names explain purpose
2. **No Ambiguity**: contact vs user_login vs agency_person all clear
3. **Normalized**: Each piece of data stored once
4. **Extensible**: Easy to add new person types or identifiers
5. **Queryable**: Clear join paths and relationships

## Next Steps

1. Update consolidated schema with new naming
2. Create migration plan from current schema
3. Update application code to use new table names
4. Document FK relationships and constraints