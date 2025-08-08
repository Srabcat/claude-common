Secure Supabase Setup + Mongo Migration
v1.2

**Current State**: Database configured for iterative migration testing (2 tables first, then more)

---

## EXPERT ADVISORY ROLE

**Claude's Role in This Migration:**
- 🔒 **Security Expert**: All recommendations prioritize data protection, access control, and compliance
- 🗄️ **PostgreSQL Database Expert**: Schema design, performance optimization, and best practices
- ⚡ **Migration Specialist**: Risk mitigation, rollback planning, and operational excellence

**Security-First Mindset:**
- Every configuration decision evaluated through security lens
- Zero tolerance for insecure defaults or shortcuts
- Assume hostile network environment and insider threats
- Compliance-ready practices (GDPR, SOC2, etc.)

**PostgreSQL Optimization Focus:**
- Schema design for performance and maintainability
- Proper indexing strategies for query patterns
- Data type optimization for storage and speed
- Relationship modeling for referential integrity

**Migration Excellence Standards:**
- Comprehensive rollback plans for every step
- Monitoring and validation at each phase
- Documentation for operational handoff
- Risk assessment and mitigation strategies

**Trust but Verify Principle:**
- Question all tool defaults (like Airbyte's SSL disable)
- Test security controls before proceeding
- Validate data integrity at every step
- Document security decisions and rationale

⸻

## 1. Key Security Concepts

🔑 **Supabase API Keys Summary:**
- Anon = limited guest key → needs RLS to be safe
- Service = full access key → backend only, keep secret
- ✅ Never expose keys in frontend code
- ✅ Route all calls through backend API
- ✅ RLS must be enabled per table (after migration)
- ✅ Use policies like: `auth.uid() IS NOT NULL`

1. **Anon Key (anon public)**
   • Role: anon (unauthenticated user)
   • ✅ Can read/write if RLS is off
   • ❌ Cannot bypass RLS
   • ⚠️ Never expose in frontend — route through backend API
   • Use for: Guest access (if RLS is enforced)

2. **Service Role Key (service_role)**
   • Role: service_role (full admin access)
   • ✅ Bypasses all RLS policies
   • ❌ Never expose in frontend
   • Use for: Secure backend-only operations (e.g. cron, admin API)

⸻

## 2. Security Configuration (Pre-Data Migration)

Since the database is empty, focus on these configurations **before** any data migration:

### 1. SSL/TLS Security ✅ **COMPLETED**

**Dashboard Steps:**
- Project Settings → Database → SSL Configuration ✅ **COMPLETED**
- ✅ Enable "Enforce SSL on incoming connections" ✅ **COMPLETED**
- ✅ Download Supabase CA certificate (optional - can do later)
- ✅ Use `verify-full` SSL mode for applications

**What we verified:**
- SSL enforcement enabled in dashboard ✅
- Postgres version 17.4 (supports SSL enforcement) ✅
- SSL query `SHOW ssl;` returns "on" ✅

### 2. Authentication Setup ✅ **Configure Now**

**Dashboard Steps:**
- Authentication → Settings → Enable MFA ✅ **COMPLETED**
- Create custom database roles with limited permissions (see Airbyte section below)
- Configure JWT token expiration times

**Verification:**
- MFA required for admin login ✅ **COMPLETED**
- Custom roles created with minimal permissions

### 3. Network & Access Control ✅ **Configure Now**

**Dashboard Steps:**
- Settings → Network Restrictions → Add IP allowlist (if needed)
- Settings → Rate Limits → Configure per-endpoint limits  
- Settings → API → CORS → Restrict to your domains only ✅ **CHECKED**

**Verification:**
- Rate limits trigger at configured thresholds  
- CORS: No wildcard origins visible - secure configuration ✅

### 4. Environment Security ✅ **Configure Now**

**Key Management:**
- Store service_role key in backend environment only
- Store anon key in backend environment only  
- ✅ Never expose keys in frontend code
- Configure spend caps in billing settings

**Verification:**
- No API keys in client-side code
- Spend caps configured and alerts working

### 5. Database Security ✅ **Configure Now**

**User Management:**
- Change all default passwords
- Create application-specific database users
- Grant only necessary permissions

**Logging:**
- Dashboard → Settings → Logging → Enable audit logging
- Configure log retention period

**Verification:**
- No default passwords remain
- Application users have limited privileges
- Database actions logged

---

### ⚠️ Post-Migration Security (Save for Later)

These require data to be present - **skip for now**:

- ❌ Row Level Security (RLS) policies - enable after migration
- ❌ Table-specific access controls - configure per imported table  
- ❌ Data encryption verification - test after data import
- ❌ Backup testing - verify after migration complete

⸻

## 3. Airbyte Connection Setup

### ❌ AVOID: Custom User Approach (Lesson Learned)

**What we initially tried (DON'T DO THIS):**
- Created `airbyte_importer` custom user
- Configured complex permission grant/revoke cycles
- Spent hours troubleshooting permissions

**Why this approach failed:**
- Supavisor pooler doesn't work with custom users
- IPv4/IPv6 compatibility issue was the real blocker
- Added unnecessary complexity

### ✅ CORRECT: Supavisor Pooler Approach

**Use Supavisor connection pooler:**
- Solves IPv4/IPv6 compatibility (main issue)
- Uses main postgres user (sufficient permissions)
- No custom permission management needed
- Simpler, more reliable setup

#### Status for Current Migration (2 tables test)
- ✅ **Permissions granted** - verified both can_create=true, can_create_in_public=true
- ✅ **MongoDB source tested** - verified read access to target collections
- ✅ **IPv4/IPv6 issue resolved** - using Supavisor pooler connection
- ⏳ **Airbyte connection test** - READY TO TEST with IPv4-compatible settings
- ❌ **Post-migration revoke** - PENDING (run after Airbyte completes)

**CURRENT AIRBYTE DESTINATION SETTINGS (IPv4-compatible):**
- **Host**: `aws-0-us-east-1.pooler.supabase.com`
- **Port**: `6543`
- **Database**: `postgres`
- **Username**: `postgres.ocbkjyyyjyxacupcdbns` (Supavisor format, NOT airbyte_importer)
- **Password**: [Main database password]
- **SSL Mode**: `require`

**⚠️ CRITICAL LESSON LEARNED - DO NOT REPEAT:**
We initially created an `airbyte_importer` custom user and spent significant time configuring permissions. This was **UNNECESSARY** and led to wasted troubleshooting time.

**WHY CUSTOM USER APPROACH FAILED:**
1. **Supavisor pooler requires `postgres.PROJECT_REF` username format** - custom users don't work
2. **IPv4/IPv6 issue** - would have occurred regardless of user choice
3. **Pooler bypasses custom user permissions** - uses main postgres user privileges
4. **Added complexity** - permission grant/revoke cycles not needed with pooler

**CORRECT APPROACH FOR AIRBYTE + SUPABASE:**
- **Always use Supavisor pooler** for Airbyte Cloud (IPv4 compatibility)
- **Use main postgres user** through pooler (format: `postgres.PROJECT_REF`)
- **Skip custom user creation** - adds complexity without security benefit in pooled environment

**Test Results:**
- Database: `10by10-web-app` (TEST DATABASE)
- ✅ `db.Organization.findOne()` - read access confirmed
- ✅ `db.ImportLog.find().limit(10)` - read access confirmed  
- ✅ `db.Employer.findOne()` - should fail (access denied as expected)
- ✅ `db.Organization.updateOne({}, { $set: { testWrite: true } })` - should fail (write denied as expected)

**MIGRATION STRATEGY DECISION:**
- **Current Phase**: TestDB → PostgreSQL migration for development/testing
- **Production Plan**: Live MongoDB → PostgreSQL migration documented below
- **Goal**: Retire MongoDB ASAP after critical functionality validated

### AIRBYTE STEP-BY-STEP INSTRUCTIONS

#### Step 1: Access Airbyte Dashboard
1. Open your web browser
2. Navigate to your Airbyte instance URL
3. Log in with your credentials

#### Step 2: Create/Update MongoDB Source Connection
1. Click **"Sources"** in left sidebar
2. If MongoDB source doesn't exist:
   - Click **"+ New Source"**
   - Search for and select **"MongoDB"**
   - Fill in connection details:
     - **Source name**: `MongoDB-10by10-TestDB`
     - **Host**: [Your MongoDB host]
     - **Port**: `27017` (default)
     - **Database Name**: `10by10-web-app`
     - **Username**: [Your MongoDB username]
     - **Password**: [Your MongoDB password]
     - **Authentication Source**: `admin` (usually)
   - Click **"Set up source"**
3. If source exists, verify it points to the TEST database

#### Step 3: Get Supavisor IPv4 Connection String (REQUIRED for Airbyte Cloud)

**WHY NEEDED**: Supabase switched to IPv6-only in Jan 2024, Airbyte Cloud only supports IPv4

**Step 3A: Get Supavisor Connection Details from Supabase**

1. **Click "Connect" button** (top of Supabase dashboard - always available)
2. **Look for Transaction pooler or Session pooler** sections
3. **Verify it shows "IPv4 compatible"** ✅ (Direct connection will show "Not IPv4 compatible" ❌)
4. **Click "View parameters"** on the Transaction pooler section
5. **Copy the following details**:
   - **Host**: `aws-0-us-east-1.pooler.supabase.com` ✅
   - **Port**: `6543` ✅ (transaction mode)
   - **Database**: `postgres` ✅
   - **User**: `postgres.ocbkjyyyjyxacupcdbns` ✅ (format: postgres.PROJECT_REF)

**Step 3B: Create/Update Supabase Destination in Airbyte**

⚠️ **SECURITY WARNING: SSL IS MANDATORY**
- **ALWAYS enable SSL** for database migrations
- **NEVER use "disable" SSL mode** - this sends passwords and data in plain text

1. Click **"Destinations"** in left sidebar
2. If Supabase destination doesn't exist:
   - Click **"+ New Destination"**
   - Search for and select **"Postgres"**
   - Fill in **SUPAVISOR** connection details:
     - **Destination name**: `Supabase-Supavisor-IPv4`
     - **Host**: [Supavisor host from Step 3A]
     - **Port**: [Supavisor port from Step 3A] 
     - **Database**: `postgres`
     - **Username**: [Supavisor username from Step 3A]
     - **Password**: [Your database password]
     - **SSL Mode**: `require` ⚠️ **CRITICAL - NEVER use disable for migrations**
   - Click **"Set up destination"**

**CRITICAL DIFFERENCE**: Use Supavisor credentials, NOT direct database credentials

**REUSABLE FOR FUTURE MIGRATIONS**: These Supavisor connection details will work for all future migration batches - only table selection will change.

#### Step 4: Create Connection
1. Click **"Connections"** in left sidebar
2. Click **"+ New Connection"**
3. **Select Source**: Choose your MongoDB source
4. **Select Destination**: Choose your Supabase destination
5. Click **"Set up connection"**

#### Step 5: Configure Sync Settings
1. **Connection Name**: `TestDB-to-Supabase-Phase1`
2. **Replication Frequency**: `Manual` (for controlled migration)
3. **Destination Namespace**: `public` (default schema)

#### Step 6: Select Tables to Sync (APPLY NAMING BEST PRACTICES)

**PostgreSQL Expert Recommendations - Naming Conventions:**
- Use `snake_case` (lowercase with underscores) - industry standard
- Plural nouns for tables: `users`, `import_logs` - follows Rails/Django conventions
- Clear, descriptive names for readability and maintainability
- Consistent naming reduces cognitive load and prevents errors
- Future-proofs for multiple developers and database tools

1. Find **"Organization"** in the list
   - ✅ Check the toggle to enable sync
   - **Sync Mode**: `Full Refresh | Overwrite`
   - **Destination Stream Name**: `organizations` (plural + clear)

2. Find **"ImportLog"** in the list  
   - ✅ Check the toggle to enable sync
   - **Sync Mode**: `Full Refresh | Overwrite`
   - **Destination Stream Name**: `import_logs` (snake_case + plural)

3. **Disable all other collections** for this test migration

**NextJS Code Benefits:**
```javascript
// Clear, readable table names:
await supabase.from('organizations').select('*')
await supabase.from('import_logs').select('*')
```

#### Step 7: Test Connection
1. Click **"Test connection"** button
2. Verify both source and destination tests pass
3. If tests fail, check connection details and permissions

#### Step 8: Start Migration
1. Click **"Set up connection"** to save configuration
2. On the connection page, click **"Sync now"** button
3. **Monitor the sync progress** in real-time
4. Watch for any errors or warnings

#### Step 9: Verify Completion
1. Wait for sync to show **"Succeeded"** status
2. Note the completion timestamp
3. Check **"Records synced"** count for each table

#### Step 10: IMMEDIATE Post-Migration Security (CRITICAL)
**Run these SQL commands in Supabase SQL Editor within 5 minutes:**

```sql
-- Revoke permissions immediately
REVOKE CREATE ON DATABASE postgres FROM airbyte_importer;
REVOKE CREATE ON SCHEMA public FROM airbyte_importer;

-- Verify revocation worked
SELECT 
    has_database_privilege('airbyte_importer', current_database(), 'CREATE') as can_create,
    has_schema_privilege('airbyte_importer', 'public', 'CREATE') as can_create_in_public;
-- Expected: both should be FALSE

-- Security Expert: Enable RLS immediately - zero trust model
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE import_logs ENABLE ROW LEVEL SECURITY;

-- PostgreSQL Expert: Create restrictive policies first, open later as needed
CREATE POLICY "authenticated_access_organizations" ON organizations FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "authenticated_access_import_logs" ON import_logs FOR ALL USING (auth.uid() IS NOT NULL);

-- Security verification: Ensure anon access is blocked
-- This should return empty results for unauthorized users
```

#### Step 11: Verify Migration Success
```sql
-- Check data migrated
SELECT COUNT(*) FROM organizations;
SELECT COUNT(*) FROM import_logs;

-- Check a few sample records
SELECT * FROM organizations LIMIT 5;
SELECT * FROM import_logs LIMIT 5;
```

---

## QUICK REFERENCE FOR FUTURE MIGRATIONS

**Once Supavisor connection is working, for subsequent migration batches:**

1. **BEFORE each batch**: Grant permissions to `airbyte_importer`
```sql
GRANT CREATE ON DATABASE postgres TO airbyte_importer;
GRANT CREATE ON SCHEMA public TO airbyte_importer;
```

2. **Configure connection**: Use same Supavisor destination, just change table selection

3. **IMMEDIATELY AFTER each batch**: Revoke permissions
```sql
REVOKE CREATE ON DATABASE postgres FROM airbyte_importer;
REVOKE CREATE ON SCHEMA public FROM airbyte_importer;
```

4. **Enable RLS**: On all newly migrated tables
```sql
ALTER TABLE [table_name] ENABLE ROW LEVEL SECURITY;
CREATE POLICY "authenticated_access" ON [table_name] FOR ALL USING (auth.uid() IS NOT NULL);
```

---

## TROUBLESHOOTING REFERENCE

### Common Airbyte Cloud + Supabase Issues

**Error 08001 - "The connection attempt failed"**

**ROOT CAUSE**: IPv4/IPv6 compatibility issue (2024 widespread issue)
- **Problem**: Supabase switched to IPv6-only (Jan 15, 2024), Airbyte Cloud only supports IPv4
- **Solution**: Use Supavisor connection pooler (IPv4-compatible)

**Resolution Steps:**
1. **In Supabase**: Click "Connect" → Find "Transaction pooler" or "Session pooler" 
2. **Verify**: Shows "IPv4 compatible" ✅ (Direct connection shows "Not IPv4 compatible" ❌)
3. **Use pooler connection details**: Host: `aws-0-us-east-1.pooler.supabase.com`, Port: `6543`
4. **Username format**: `postgres.PROJECT_REF` (not `airbyte_importer`)

**Other Common Issues:**
- **"airbyte_safe_cast function already exists"** - Clear previous sync artifacts
- **SSL connection required** - Always use SSL mode "require" or higher
- **Connection timeouts** - Check IP allowlisting in Supabase Network settings

⸻

## 4. Migration Plan: Phases

**Phase 1 – Migrate DB (no frontend yet)**
- Use Airbyte to import flat Mongo data into Supabase
- ✅ Immediately enable RLS on all imported tables
- ✅ Add login-only access policy
- ✅ For sensitive tables: consider pre-creating schema and securing before import

**Phase 2 – Backend**
- Implement API layer that talks to Supabase
- ✅ Store anon key + service key securely in .env, never expose to client
- ✅ Enforce access control in both RLS and backend

**Phase 3 – Frontend**
- FE calls your backend API (not Supabase directly)
- ✅ Confirm FE has no direct access to anon/service keys
- ✅ Test data visibility: FE cannot access any table unless explicitly allowed via backend

⸻

## 5. PRODUCTION MIGRATION PLAYBOOK

**When ready to migrate live production data, repeat these exact steps:**

### Pre-Production Migration Checklist
1. **Schedule maintenance window** - coordinate with users
2. **Backup production MongoDB** - full backup before starting
3. **Test application** - ensure new code works with test data
4. **Prepare rollback plan** - document MongoDB restoration steps

### Production Migration Steps

#### Step 1: MongoDB Production Setup
```bash
# Connect to PRODUCTION MongoDB (10by10-web-app-prod or equivalent)
# Verify collections exist and have expected data
db.Organization.countDocuments()
db.ImportLog.countDocuments()
# [Add other critical collection counts]
```

#### Step 2: Airbyte Production Configuration
- Update Airbyte source to point to **production** MongoDB
- ⚠️ **VERIFY SSL is enabled** on both source and destination
- Verify connection test passes
- **DO NOT run migration yet**

#### Step 3: Security Preparation (Same as Test)
```sql
-- Grant permissions to airbyte_importer
GRANT CREATE ON DATABASE postgres TO airbyte_importer;
GRANT CREATE ON SCHEMA public TO airbyte_importer;

-- Verify permissions
SELECT 
    has_database_privilege('airbyte_importer', current_database(), 'CREATE') as can_create,
    has_schema_privilege('airbyte_importer', 'public', 'CREATE') as can_create_in_public;
-- Expected: both true
```

#### Step 4: Production Migration Execution
1. **Start production migration** (same tables/sequence as test)
2. **Monitor progress** - watch for errors/failures
3. **IMMEDIATELY after completion** - revoke permissions:
```sql
REVOKE CREATE ON DATABASE postgres FROM airbyte_importer;
REVOKE CREATE ON SCHEMA public FROM airbyte_importer;
```

#### Step 5: Production Security Lockdown
```sql
-- Enable RLS on all production tables
ALTER TABLE organization ENABLE ROW LEVEL SECURITY;
ALTER TABLE importlog ENABLE ROW LEVEL SECURITY;
-- [Repeat for all migrated tables]

-- Add basic login-only policies
CREATE POLICY "require_login_organization" ON organization FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "require_login_importlog" ON importlog FOR ALL USING (auth.uid() IS NOT NULL);
-- [Repeat for all migrated tables]
```

#### Step 6: Application Cutover
1. **Update environment variables** - point to production Supabase
2. **Deploy new application code** - with PostgreSQL integration
3. **Test critical user journeys** - verify functionality works
4. **Monitor error logs** - watch for PostgreSQL-related issues

#### Step 7: MongoDB Retirement
1. **Run parallel for 24-48 hours** - keep MongoDB as backup
2. **Verify no MongoDB calls** - check application logs
3. **Archive MongoDB data** - export for historical backup
4. **Shutdown MongoDB** - only after confidence in PostgreSQL

### Production Migration Validation
```sql
-- Verify data migrated correctly
SELECT COUNT(*) FROM organization;
SELECT COUNT(*) FROM importlog;

-- Verify RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE rowsecurity = true;

-- Verify policies exist
SELECT tablename, policyname 
FROM pg_policies;
```

### Emergency Rollback Plan
If production migration fails:
1. **Restore MongoDB** from pre-migration backup
2. **Revert environment variables** to MongoDB
3. **Deploy previous application version**
4. **Investigate PostgreSQL issues** before retry

⸻

## 6. TODOs

**Before Each Migration Batch**
- Grant CREATE permissions to airbyte_importer (see SQL above)
- Identify flat vs nested collections in current batch
- Pre-create and secure high-sensitivity tables (if any in batch)
- Document expected schema for current batch

**After Each Migration Batch** ⚠️ **CRITICAL SECURITY STEPS**

**1. IMMEDIATELY revoke permissions (within 5 minutes of completion):**
```sql
REVOKE CREATE ON DATABASE postgres FROM airbyte_importer;
REVOKE CREATE ON SCHEMA public FROM airbyte_importer;
```

**2. Verify revoke worked:**
```sql
SELECT 
    has_database_privilege('airbyte_importer', current_database(), 'CREATE') as can_create,
    has_schema_privilege('airbyte_importer', 'public', 'CREATE') as can_create_in_public;
```
**Must show:** Both `false`

**3. Secure newly imported tables:**
- Enable RLS on all newly imported tables
- Add login-only policies to all newly imported tables  
- Test data access with limited users
- Verify anon access is blocked for new tables

**4. Document completion:** "Migration batch [X] completed, permissions revoked on [date/time]"

**After Final Migration (All Tables Complete)**
- Enable RLS on ALL tables
- Verify anon access is blocked across all endpoints
- Rotate anon key after setup
- Save key securely in backend only
- Delete or disable airbyte_importer user entirely

**Before Backend Launch**
- Ensure backend is only interface to Supabase
- Audit backend routes for access control

**Before Frontend Launch**
- Confirm no keys in client code or source maps
- Confirm backend correctly enforces permissions
- Test access patterns as anon + logged-in user

**Ongoing**
- Automate RLS enforcement in migrations
- Add CI check to block tables without RLS
- Create key rotation policy (quarterly or as needed)

⸻

## 6. Key Lessons Learned

**Configuration gaps found during setup:**
1. **SSL Enforcement**: Enabled easily in dashboard - Postgres 17.4 supports it fully
2. **MFA**: Configured in Authentication → Settings (but skipped JWT token config for now)
3. **Airbyte User**: Already existed but lacked CREATE permissions on database and schema
4. **Security Approach**: Grant minimal permissions only during migration, revoke immediately after

**Important knowledge for developers:**
- `CREATEDB` ≠ `CREATE` permissions (CREATEDB = new databases, CREATE = tables/schemas in existing DB)
- `public` schema is default workspace, not "public internet" - still needs security
- Iterative migrations require permission grant/revoke cycles for security
- Always verify permissions with SQL queries, don't assume dashboard settings are complete
- Postgres version check: `SELECT version();` or `SHOW server_version;`

**Workflow for iterative migration:**
1. Grant permissions → 2. Run Airbyte → 3. Immediately revoke permissions → 4. Test access → 5. Repeat

⸻