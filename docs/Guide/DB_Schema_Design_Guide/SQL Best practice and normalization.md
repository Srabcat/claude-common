# Database Schema Design Best Practices (2025)

## 🚨 CRITICAL RULE #1: NEVER CREATE UNNECESSARY TABLES

### **The Table Creation Test**
Before creating ANY new table, ask these questions **in order**:

1. **"Can the existing table handle this with just additional columns?"**
2. **"What specific functional problem does a separate table solve?"** 
3. **"If my answer is 'organization', 'separation of concerns', or 'cleaner design' - STOP. These are not functional problems."**

### **NEVER Create Tables For:**
- ❌ **History tracking** when status flags work (use `status='active'/'superseded'` pattern)
- ❌ **Audit trails** when JSONB fields work (use `change_history` JSONB column)
- ❌ **"Clean architecture"** or **"separation of concerns"** 
- ❌ **"Future flexibility"** or hypothetical needs
- ❌ **Small lookup lists** that should be CHECK constraints

### **ONLY Create Tables For:**
- ✅ **True 1:many or many:many relationships** (can't be flattened)
- ✅ **Performance isolation** (separate large BLOB data)
- ✅ **Different access patterns** (frequently vs rarely queried)
- ✅ **Security isolation** (different permission requirements)

**Remember: Every additional table is technical debt until proven otherwise.**

---

## Standard SQL Best Practices

1. **Foreign Key Naming**: Use `_id` suffix (e.g., `user_id`).
2. **Naming Conventions**: Use snake_case for table and column names.
3. **Timestamps**: Include `created_at` and `updated_at` columns.
4. **Indexes**: Add indexes on foreign keys and frequently queried fields.
5. **Normalization**: Normalize until it hurts, then denormalize where it's worth it.
6. **Meaningful Names**: Use descriptive table and column names.
7. **Constraints and Defaults**: Define constraints and default values clearly.
8. **Data Types**: Choose appropriate data types.
9. **Documentation**: Document your schema.
10. **Query Optimization**: Regularly review and optimize queries.
11. **Check Existing Schema**: Always check `/Users/april/10x10-Repos/claude-common/docs/Roadmap/F-Cando/consolidated-ats-schema.sql` before designing new tables.

### Normalization (1NF-4NF) Explained with Examples

Normalization is the process of organizing data in a database to reduce redundancy and improve data integrity. Here’s a concise explanation of the first four normal forms (1NF-4NF) with examples:

#### 1. **First Normal Form (1NF)**
- **Definition**: Each column contains atomic (indivisible) values, and each record is unique.
- **Example**:
  ```sql
  CREATE TABLE students (
      student_id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      age INT NOT NULL
  );
  ```
  - **Before 1NF**: A column might contain multiple values (e.g., a list of courses).
  - **After 1NF**: Each column contains a single value.

#### 2. **Second Normal Form (2NF)**
- **Definition**: Achieve 1NF and ensure that all non-key attributes are fully functionally dependent on the primary key.
- **Example**:
  ```sql
  CREATE TABLE enrollments (
      enrollment_id SERIAL PRIMARY KEY,
      student_id INT REFERENCES students(student_id),
      course_id INT REFERENCES courses(course_id),
      grade CHAR(2)
  );
  ```
  - **Before 2NF**: A table might contain redundant data (e.g., course details repeated for each student).
  - **After 2NF**: Separate tables for students and courses, with a join table for enrollments.

#### 3. **Third Normal Form (3NF)**
- **Definition**: Achieve 2NF and ensure that all attributes are only dependent on the primary key.
- **Example**:
  ```sql
  CREATE TABLE courses (
      course_id SERIAL PRIMARY KEY,
      course_name VARCHAR(100) NOT NULL,
      instructor_id INT REFERENCES instructors(instructor_id)
  );
  ```
  - **Before 3NF**: A table might contain redundant data (e.g., instructor details repeated for each course).
  - **After 3NF**: Separate tables for courses and instructors, with foreign keys linking them.

#### 4. **Fourth Normal Form (4NF)**
- **Definition**: Achieve 3NF and ensure that there are no multi-valued dependencies.
- **Example**:
  ```sql
  CREATE TABLE student_interests (
      student_id INT REFERENCES students(student_id),
      interest VARCHAR(100) NOT NULL,
      PRIMARY KEY (student_id, interest)
  );
  ```
  - **Before 4NF**: A table might contain multiple interests for a student in a single row.
  - **After 4NF**: Separate rows for each interest, ensuring no multi-valued dependencies.

### Summary
- **1NF**: Atomic values, unique records.
- **2NF**: Achieve 1NF, no partial dependencies.
- **3NF**: Achieve 2NF, no transitive dependencies.
- **4NF**: Achieve 3NF, no multi-valued dependencies.

Normalization helps reduce redundancy and improve data integrity, but it should be balanced with performance considerations.

---

## 🚨 REAL EXAMPLES: Table Creation Mistakes to Avoid

### ❌ MISTAKE: Creating History Tables When Status Flags Work

**What I Did Wrong:**
```sql
-- DON'T DO THIS - Unnecessary PersonAliasHistory table
CREATE TABLE PersonAliasHistory (
    id UUID PRIMARY KEY,
    person_alias_id UUID,
    change_type VARCHAR(20),
    old_value VARCHAR(500),
    new_value VARCHAR(500),
    changed_at TIMESTAMP,
    changed_by_submission_id UUID
);
```

**Why It's Wrong:**
- ❌ Zero functional benefit over existing table + status flags
- ❌ Additional joins for every history query
- ❌ More complex code to maintain
- ❌ More potential bugs

**✅ CORRECT Solution - Use Existing Table:**
```sql
-- Use existing person_identifier table with status pattern
ALTER TABLE person_identifier ADD COLUMN status VARCHAR(20) DEFAULT 'active' 
CHECK (status IN ('active', 'superseded', 'deleted'));

ALTER TABLE person_identifier ADD COLUMN superseded_by_identifier_id UUID 
REFERENCES person_identifier(identifier_id);

-- When email changes:
-- 1. Old record: UPDATE status = 'superseded', superseded_by_identifier_id = new_id
-- 2. New record: INSERT with status = 'active'
-- Query current: WHERE status = 'active'
-- Query history: WHERE person_id = ? ORDER BY created_at
```

### ❌ MISTAKE: Creating Separate Tables for "Organization"

**What I Did Wrong:**
```sql
-- DON'T DO THIS - Separating data just for "clean design"
CREATE TABLE Person (...);           -- Canonical person
CREATE TABLE PersonAlias (...);      -- Identifiers  
CREATE TABLE Submission (...);       -- Recruiter submissions
CREATE TABLE Representation (...);   -- Time-bound representation
CREATE TABLE ConflictDetection (...); -- Conflict tracking
CREATE TABLE DuplicateDetectionLog (...); -- Audit log
```

**Why It's Wrong:**
- ❌ 7 tables when existing schema already had the functionality
- ❌ "Separation of concerns" is not a functional requirement
- ❌ Ignored existing `person_identifier`, `candidate_submission`, `candidate_representation` tables

**✅ CORRECT Solution - Enhance Existing:**
```sql
-- Use existing tables, add missing functionality:
-- ✅ person_identifier (already exists) - handles PersonAlias
-- ✅ candidate_submission (already exists) - handles Submission  
-- ✅ candidate_representation (already exists) - handles Representation
-- ✅ duplicate_conflict (already exists) - handles ConflictDetection

-- Just add missing fields to existing tables:
ALTER TABLE person_identifier ADD COLUMN status VARCHAR(20) DEFAULT 'active';
ALTER TABLE candidate_submission ADD COLUMN duplicate_reason TEXT;
ALTER TABLE candidate_representation ADD COLUMN conflict_resolution_notes TEXT;
```

### ❌ MISTAKE: Creating Config Tables for Small Lists

**What I Did Wrong:**
```sql
-- DON'T DO THIS for small, stable lists
CREATE TABLE conflict_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50)
);
INSERT INTO conflict_types VALUES 
(1, 'duplicate_candidate'), 
(2, 'representation_conflict'),
(3, 'attribute_mismatch');
```

**✅ CORRECT Solution - CHECK Constraints:**
```sql
-- Use CHECK constraints for small, stable lists
ALTER TABLE duplicate_conflict ADD COLUMN conflict_type VARCHAR(30) 
CHECK (conflict_type IN ('duplicate_candidate', 'representation_conflict', 'attribute_mismatch'));
```

### The Pattern: Always Ask "Why Not Enhance Existing?"

**Before creating any table, prove these statements:**
1. **"Existing table X cannot handle this because [specific technical limitation]"**
2. **"The functional requirement is [specific behavior] that requires separate storage"**
3. **"Adding columns to existing table would cause [specific performance/security problem]"**

**If you can't prove all three - don't create the table.**

---

# Common SQL Newcomer Mistakes - Prevention Guide

## 🚨 **Critical Schema Design Mistakes**

### **1. Data Type Mistakes**
```sql
-- ❌ WRONG: Using wrong data types
CREATE TABLE users (
  phone VARCHAR(10),           -- US only, no international
  salary DECIMAL(5,2),         -- Max $999.99 - way too small
  created_at VARCHAR(20)       -- String dates = query nightmare
);

-- ✅ CORRECT: Proper data types
CREATE TABLE users (
  phone VARCHAR(20),           -- International phone support
  salary INTEGER,              -- Cents or whole dollars
  created_at TIMESTAMP         -- Proper date/time type
);
```

### **2. Primary Key Disasters**
```sql
-- ❌ WRONG: Natural keys that change
CREATE TABLE users (
  email VARCHAR(255) PRIMARY KEY,  -- What if they change email?
  name VARCHAR(100)
);

-- ❌ WRONG: Composite primary keys for main entities
CREATE TABLE candidates (
  first_name VARCHAR(50),
  last_name VARCHAR(50),
  email VARCHAR(255),
  PRIMARY KEY (first_name, last_name, email)  -- Nightmare for foreign keys
);

-- ✅ CORRECT: Surrogate keys
CREATE TABLE users (
  id SERIAL PRIMARY KEY,       -- Immutable, efficient
  email VARCHAR(255) UNIQUE,   -- Business constraint separate
  name VARCHAR(100)
);
```

### **3. Normalization Extremes**
```sql
-- ❌ WRONG: Over-normalization
CREATE TABLE addresses (
  id SERIAL PRIMARY KEY,
  street_number INTEGER,
  street_name VARCHAR(100),
  street_type_id INTEGER       -- References: Ave, St, Blvd, etc.
);
CREATE TABLE street_types (id, name);  -- 5-row lookup table

-- ❌ WRONG: Under-normalization  
CREATE TABLE candidates (
  id SERIAL PRIMARY KEY,
  skills TEXT                  -- "JavaScript,Python,React" - can't query efficiently
);

-- ✅ CORRECT: Balanced normalization
CREATE TABLE candidates (
  id SERIAL PRIMARY KEY,
  street_address VARCHAR(255)  -- Keep simple addresses together
);
CREATE TABLE candidate_skills (
  candidate_id INTEGER,        -- Proper many-to-many for searchable data
  skill_id INTEGER
);
```

### **4. Missing Constraints & Validation**
```sql
-- ❌ WRONG: No data validation
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  status VARCHAR(50),          -- Any string allowed
  quantity INTEGER,            -- Negative quantities possible
  price DECIMAL(10,2)          -- Negative prices possible
);

-- ✅ CORRECT: Proper constraints
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  status VARCHAR(20) CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered')),
  quantity INTEGER CHECK (quantity > 0),
  price INTEGER CHECK (price >= 0)  -- Store cents, positive only
);
```

### **5. Index Negligence**
```sql
-- ❌ WRONG: No indexes on foreign keys
CREATE TABLE candidate_communications (
  id SERIAL PRIMARY KEY,
  candidate_id INTEGER,        -- No index = slow joins
  timestamp TIMESTAMP          -- No index = slow date queries
);

-- ✅ CORRECT: Strategic indexing
CREATE TABLE candidate_communications (
  id SERIAL PRIMARY KEY,
  candidate_id INTEGER,
  timestamp TIMESTAMP
);
CREATE INDEX idx_comms_candidate ON candidate_communications(candidate_id);
CREATE INDEX idx_comms_timestamp ON candidate_communications(timestamp);
```

## 🔍 **Query Anti-Patterns**

### **6. N+1 Query Problems**
```sql
-- ❌ WRONG: Loop queries in application
// Get candidates
SELECT * FROM candidates LIMIT 10;
// Then for each candidate:
SELECT * FROM skills WHERE candidate_id = ?;  -- 10 separate queries!

-- ✅ CORRECT: JOIN or batch queries
SELECT c.*, s.skill_name 
FROM candidates c
LEFT JOIN candidate_skills cs ON c.id = cs.candidate_id  
LEFT JOIN skills s ON cs.skill_id = s.id
LIMIT 10;
```

### **7. SELECT * Abuse**
```sql
-- ❌ WRONG: Selecting everything
SELECT * FROM candidates 
WHERE city = 'Boston';          -- Returns 50 columns including BLOB resumes

-- ✅ CORRECT: Select only needed columns  
SELECT id, first_name, last_name, email
FROM candidates 
WHERE city = 'Boston';
```

### **8. Missing WHERE Clauses in Multi-Tenant**
```sql
-- ❌ WRONG: Missing tenant isolation
SELECT * FROM candidates 
WHERE skills LIKE '%JavaScript%';  -- Returns all tenants' data!

-- ✅ CORRECT: Always include tenant filter
SELECT * FROM candidates 
WHERE tenant_id = ? AND skills LIKE '%JavaScript%';
```

## 📊 **Performance & Scaling Mistakes**

### **9. TEXT/BLOB in Main Tables**
```sql
-- ❌ WRONG: Large data in main tables
CREATE TABLE candidates (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(50),
  resume_text TEXT,            -- 10KB+ per row slows all queries
  resume_pdf BYTEA            -- 1MB+ per row = disaster
);

-- ✅ CORRECT: Separate large data
CREATE TABLE candidates (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(50)
);
CREATE TABLE candidate_documents (
  candidate_id INTEGER,
  document_type VARCHAR(20),
  file_content TEXT            -- Separate table, query only when needed
);
```

### **10. Enum vs Check Constraints vs Lookup Tables**
```sql
-- ❌ WRONG: No constraints (anything goes)
status VARCHAR(50)             -- Could be 'pending', 'PENDING', 'Pending', 'active'

-- ❌ WRONG: Over-engineering small lists
CREATE TABLE statuses (id, name);  -- 3-row table with overhead

-- ✅ CORRECT: Check constraints for small, stable lists
status VARCHAR(20) CHECK (status IN ('active', 'inactive', 'pending'))

-- ✅ CORRECT: Lookup tables for large, changing lists  
CREATE TABLE skills (id, name);    -- 1000+ skills, frequently added
```

## 🛡️ **Security & Data Integrity**

### **11. Missing Soft Deletes**
```sql
-- ❌ WRONG: Hard deletes lose history
DELETE FROM candidates WHERE id = 123;  -- Gone forever, breaks audit trails

-- ✅ CORRECT: Soft deletes preserve history
UPDATE candidates 
SET deleted_at = NOW(), deleted_by = ? 
WHERE id = 123;
```

### **12. No Audit Trails**
```sql
-- ❌ WRONG: No change tracking
CREATE TABLE candidates (
  id SERIAL PRIMARY KEY,
  salary INTEGER               -- Changed from $50K to $80K - who? when? why?
);

-- ✅ CORRECT: Audit critical changes
CREATE TABLE candidate_field_history (
  candidate_id INTEGER,
  field_name VARCHAR(50),      -- 'salary'
  old_value JSONB,            -- {"amount": 50000}
  new_value JSONB,            -- {"amount": 80000} 
  changed_by INTEGER,
  changed_at TIMESTAMP
);
```

## 🔄 **Multi-Tenancy Specific Mistakes**

### **13. Forgetting Tenant Context**
```sql
-- ❌ WRONG: Global foreign keys across tenants
CREATE TABLE job_applications (
  candidate_id INTEGER,        -- Could reference wrong tenant's candidate
  job_id INTEGER              -- Could reference wrong tenant's job
);

-- ✅ CORRECT: Validate tenant consistency
CREATE TABLE job_applications (
  candidate_id INTEGER,
  job_id INTEGER,
  tenant_id INTEGER,          -- Explicit tenant tracking
  CHECK (
    -- Ensure candidate and job belong to same tenant
    (SELECT tenant_id FROM candidates WHERE id = candidate_id) = tenant_id AND
    (SELECT tenant_id FROM jobs WHERE id = job_id) = tenant_id
  )
);
```

### **14. Missing Row-Level Security**
```sql
-- ❌ WRONG: Application-only tenant filtering
-- If application has bug, wrong tenant sees data

-- ✅ CORRECT: Database-level tenant isolation  
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON candidates
FOR ALL TO application_role
USING (tenant_id = current_setting('app.current_tenant_id')::INTEGER);
```

## 📋 **Newcomer Checklist**

Before deploying any schema:

- [ ] **Primary Keys**: Every table has immutable surrogate key?
- [ ] **Data Types**: Phone, money, dates using proper types?
- [ ] **Constraints**: Required fields NOT NULL, enums have CHECK constraints?
- [ ] **Indexes**: All foreign keys and query columns indexed?
- [ ] **Tenant Isolation**: Multi-tenant tables have tenant_id + RLS policies?
- [ ] **Soft Deletes**: Critical data uses deleted_at instead of DELETE?
- [ ] **Audit Trail**: Important changes tracked in history table?
- [ ] **Large Data**: TEXT/BLOB fields in separate tables?
- [ ] **Normalization**: Many-to-many via junction tables, not CSV strings?
- [ ] **Security**: No sensitive data in plain text, proper access controls?

**Remember: Database schema mistakes are expensive to fix later. Spend time getting it right upfront.**