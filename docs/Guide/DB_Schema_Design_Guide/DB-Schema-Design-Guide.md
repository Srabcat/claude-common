# Database Schema Design Guide

## 🚨 CRITICAL RULE: NEVER CREATE UNNECESSARY TABLES

### **The Table Creation Test**
Before creating ANY new table, ask these questions **in order**:

1. **"Can the existing table handle this with just additional columns?"**
2. **"What specific functional problem does a separate table solve?"** 
3. **"If my answer is 'organization', 'separation of concerns', or 'cleaner design' - STOP. These are not functional problems."**

### **Real Examples of Unnecessary Table Creation**

#### ❌ WRONG: Creating History Tables When Status Flags Work
```sql
-- DON'T DO THIS
CREATE TABLE person_identifier_history (
    id UUID PRIMARY KEY,
    person_identifier_id UUID,
    old_value VARCHAR(255),
    new_value VARCHAR(255),
    changed_at TIMESTAMP
);

-- THIS SOLVES THE SAME PROBLEM WITH ZERO DOWNSIDE
ALTER TABLE person_identifier ADD COLUMN status VARCHAR(20) DEFAULT 'active';
ALTER TABLE person_identifier ADD COLUMN superseded_by_identifier_id UUID;
-- When email changes: old record gets status='superseded', new record gets status='active'
```

**Why the history table is PURE DOWNSIDE:**
- ❌ Additional complexity with zero functional benefit
- ❌ More joins required for queries
- ❌ More code to maintain
- ❌ More potential bugs
- ❌ Harder to query

#### ❌ WRONG: Creating Separate Audit Tables When JSONB Fields Work
```sql
-- DON'T DO THIS
CREATE TABLE field_changes (
    id UUID PRIMARY KEY,
    table_name VARCHAR(50),
    record_id UUID,
    field_name VARCHAR(50),
    old_value TEXT,
    new_value TEXT
);

-- ADD TO EXISTING TABLE INSTEAD
ALTER TABLE person ADD COLUMN change_history JSONB;
-- Store: [{"field": "email", "old": "old@email.com", "new": "new@email.com", "at": "2025-01-01"}]
```

#### ❌ WRONG: Creating Configuration Tables When Constants Work
```sql
-- DON'T DO THIS (unless values change frequently)
CREATE TABLE status_types (
    id SERIAL PRIMARY KEY,
    status_name VARCHAR(20)
);
INSERT INTO status_types VALUES (1, 'active'), (2, 'inactive'), (3, 'pending');

-- USE CHECK CONSTRAINTS FOR STABLE LISTS
ALTER TABLE person ADD COLUMN status VARCHAR(20) 
CHECK (status IN ('active', 'inactive', 'pending'));
```

### **When IS It OK to Create New Tables?**

**✅ ONLY create new tables when:**
1. **Different cardinality relationships** (1:many, many:many)
2. **Performance isolation** (separate large BLOB data)
3. **Different access patterns** (frequently vs rarely queried data)
4. **Security isolation** (different permission requirements)

**✅ GOOD examples:**
```sql
-- Many-to-many relationships require junction tables
CREATE TABLE person_skills (
    person_id UUID,
    skill_id INTEGER
);

-- Large data should be separated for performance
CREATE TABLE person_documents (
    person_id UUID,
    document_content TEXT  -- Large resume text separate from main person table
);
```

## Schema Design Process

### Step 1: Start with Existing Tables
1. **Read the existing schema FIRST**: `/Users/april/10x10-Repos/claude-common/docs/Roadmap/F-Cando/consolidated-ats-schema.sql`
2. **List what already exists**: person, person_identifier, candidate_submission, etc.
3. **Identify what's missing**: Only the actual functional gaps

### Step 2: Enhance Before Creating
1. **Add columns** to existing tables
2. **Add constraints** and indexes
3. **Add JSONB fields** for flexible data
4. **Add status/flag columns** for state tracking

### Step 3: Create New Tables ONLY When Necessary
1. **Document the functional requirement** that existing tables cannot meet
2. **Prove the requirement** with specific examples
3. **Consider the maintenance cost** vs functional benefit

## Anti-Patterns to Avoid

### ❌ The "Clean Architecture" Trap
```sql
-- DON'T separate data just for "clean design"
CREATE TABLE person_contact_info (...);
CREATE TABLE person_personal_info (...);
CREATE TABLE person_professional_info (...);

-- Keep related data together unless there's a functional reason to separate
CREATE TABLE person (
    id UUID PRIMARY KEY,
    -- All person data in one place for simpler queries
    first_name VARCHAR(100),
    email VARCHAR(255),
    phone VARCHAR(50),
    job_title VARCHAR(200)
);
```

### ❌ The "Future Flexibility" Trap  
```sql
-- DON'T create tables for hypothetical future needs
CREATE TABLE person_attributes (
    person_id UUID,
    attribute_name VARCHAR(100),
    attribute_value TEXT
);

-- Add specific columns when you actually need them
ALTER TABLE person ADD COLUMN salary INTEGER;
ALTER TABLE person ADD COLUMN start_date DATE;
```

### ❌ The "Separation of Concerns" Trap
```sql
-- DON'T separate just because "it's a different type of data"
CREATE TABLE person_audit_log (...);
CREATE TABLE person_change_history (...);
CREATE TABLE person_field_updates (...);

-- One pattern handles all change tracking needs
ALTER TABLE person ADD COLUMN updated_at TIMESTAMP;
ALTER TABLE person ADD COLUMN updated_by UUID;
ALTER TABLE person ADD COLUMN change_log JSONB;
```

## Table Design Checklist

Before creating ANY new table:

- [ ] **Existing Table Check**: Can existing tables handle this with additional columns?
- [ ] **Functional Requirement**: What specific functional problem requires a new table?
- [ ] **Relationship Justification**: Is this a true 1:many or many:many relationship?
- [ ] **Performance Justification**: Does this separate large/slow data from fast queries?
- [ ] **Security Justification**: Does this require different access permissions?
- [ ] **Maintenance Cost**: Is the maintenance overhead worth the functional benefit?

## Status Field Patterns (Instead of History Tables)

### Pattern: Version History with Status Flags
```sql
-- ONE table handles current + historical data
CREATE TABLE person_identifier (
    id UUID PRIMARY KEY,
    person_id UUID,
    identifier_type VARCHAR(20),
    identifier_value VARCHAR(255),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'superseded', 'deleted')),
    superseded_by_id UUID REFERENCES person_identifier(id),
    created_at TIMESTAMP,
    created_by UUID
);

-- Query current: WHERE status = 'active'
-- Query history: WHERE person_id = ? ORDER BY created_at
-- Query change chain: Follow superseded_by_id links
```

### Pattern: Change Tracking with JSONB
```sql
CREATE TABLE person (
    id UUID PRIMARY KEY,
    email VARCHAR(255),
    phone VARCHAR(50),
    -- Track all changes in one field
    change_history JSONB DEFAULT '[]'::jsonb,
    updated_at TIMESTAMP,
    updated_by UUID
);

-- Store changes as: [{"field": "email", "old": "old@email.com", "new": "new@email.com", "at": "2025-01-01", "by": "user123"}]
```

## Remember: Functionality First, Not Architecture First

**The Goal**: Build what works with minimum complexity
**Not The Goal**: Build the "cleanest" or most "organized" schema

**Every additional table is technical debt until proven otherwise.**

## References

- [SQL Best Practices and Normalization](./SQL%20Best%20practice%20and%20normalization.md)
- [Supabase Reference](./Reference/Supabase.md)