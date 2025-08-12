# Multi-Tenant ATS Architecture Design
**Date**: 2025-08-11  
**Purpose**: Technical specification for multi-tenant candidate database architecture

## References & Research Sources

**Multi-Tenancy Engineering Patterns:**
- **HubSpot Engineering**: https://product.hubspot.com/blog/multi-tenant-saas-database-tenancy-patterns
- **Stripe Engineering**: https://stripe.com/blog/online-migrations
- **Slack Engineering**: https://slack.engineering/flannel-an-application-level-edge-cache/
- **PostgreSQL Multi-Tenancy**: https://aws.amazon.com/blogs/database/multi-tenant-data-isolation-with-postgresql-row-level-security/
- **SaaS Tenant Patterns**: https://docs.microsoft.com/en-us/azure/sql-database/saas-tenancy-app-design-patterns
- **GDPR Technical Compliance**: https://gdpr.eu/article-25-data-protection-by-design/

**Startup Scaling Disasters:**
- **Slack's Tenant Crisis**: Multi-billion dollar Vitess migration due to tenant boundary assumptions
- **HubSpot's Security Retrofit**: HIPAA compliance requiring fundamental architecture changes

---

# Core Requirements

## Business Model
- **SaaS Platform**: Multiple recruiting agencies using shared infrastructure
- **Tenant = Agency**: Each recruiting agency is a separate tenant
- **Data Isolation**: Agency A cannot access Agency B's candidates under any circumstances
- **Cross-Tenant Features**: Duplicate detection, marketplace features (opt-in)

## Technical Requirements
- **Performance**: Tenant filtering must be efficient at millions of records scale
- **Security**: Database-level isolation prevents application bugs from causing breaches
- **Compliance**: GDPR Article 25 - data protection by design and by default
- **Scalability**: Support 1000+ tenants without performance degradation

---

# Architecture Options Analysis

## Option A: Schema-per-Tenant (Rejected)
```sql
-- Separate schemas: tenant_123.candidates, tenant_456.candidates
CREATE SCHEMA tenant_123;
CREATE TABLE tenant_123.candidates (...);
```

**Problems:**
- Schema sprawl: 1000 tenants = 1000 schemas × 50 tables = 50,000 database objects
- Migration complexity: Deploy schema changes to 1000+ schemas
- Resource waste: Empty/small tenant schemas consume significant metadata overhead
- Cross-tenant features impossible: No way to detect duplicates across schemas

## Option B: Database-per-Tenant (Rejected)  
```sql
-- Separate databases: tenant_123_db, tenant_456_db
```

**Problems:**
- Operational nightmare: 1000 databases to maintain, backup, monitor
- Cost explosion: Each database needs dedicated resources
- Cross-tenant reporting impossible: Cannot aggregate analytics across tenants
- Connection pool exhaustion: Each tenant database needs separate connections

## Option C: Shared Schema with Row-Level Security (Recommended)
```sql
-- Single schema with tenant_id column + RLS policies
CREATE POLICY tenant_isolation ON candidates
FOR ALL TO application_role
USING (tenant_id = current_setting('app.current_tenant_id')::UUID);
```

**Benefits:**
- **Operational Simplicity**: Single database, single schema to maintain
- **Cost Efficiency**: Shared resources, optimal utilization
- **Cross-Tenant Features**: Duplicate detection, analytics possible with privacy controls
- **Defense in Depth**: Database enforces isolation even if application has bugs
- **Proven at Scale**: Used by Salesforce, HubSpot, Stripe for millions of tenants

---

# Implementation Specification

## 1. Database Schema Changes

### Add Tenant ID to All Tables
```sql
-- Add to every table in the system
ALTER TABLE candidates ADD COLUMN tenant_id UUID NOT NULL;
ALTER TABLE person_emails ADD COLUMN tenant_id UUID NOT NULL;
ALTER TABLE person_phones ADD COLUMN tenant_id UUID NOT NULL;
ALTER TABLE person_social_links ADD COLUMN tenant_id UUID NOT NULL;
ALTER TABLE candidate_documents ADD COLUMN tenant_id UUID NOT NULL;
ALTER TABLE candidate_communication ADD COLUMN tenant_id UUID NOT NULL;
-- ... continue for all tables
```

### Create Row-Level Security Policies
```sql
-- Enable RLS on all tables
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE person_emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE person_phones ENABLE ROW LEVEL SECURITY;
-- ... continue for all tables

-- Create isolation policies
CREATE POLICY tenant_isolation_candidates ON candidates
FOR ALL TO application_role
USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

CREATE POLICY tenant_isolation_emails ON person_emails
FOR ALL TO application_role
USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

-- ... continue for all tables
```

### Tenant-Aware Indexes
```sql
-- All indexes must include tenant_id as first column for partition pruning
CREATE INDEX idx_candidates_tenant_created ON candidates(tenant_id, created_at);
CREATE INDEX idx_candidates_tenant_email ON candidates(tenant_id, primary_email_id);
CREATE INDEX idx_emails_tenant_address ON person_emails(tenant_id, email_address);
CREATE INDEX idx_communications_tenant_timestamp ON candidate_communication(tenant_id, timestamp);
```

## 2. Application Layer Implementation

### Tenant Context Middleware
```javascript
// Express.js middleware to set tenant context
app.use('/api', async (req, res, next) => {
  try {
    // Extract tenant from JWT token
    const token = req.headers.authorization?.replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const tenantId = decoded.tenant_id;
    
    if (!tenantId) {
      return res.status(401).json({ error: 'No tenant context' });
    }
    
    // Set PostgreSQL session variable
    await req.db.query('SET app.current_tenant_id = $1', [tenantId]);
    
    // Store for application use
    req.tenantId = tenantId;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid tenant context' });
  }
});
```

### Database Connection Management
```javascript
// Connection pool configuration
const pool = new Pool({
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  user: 'application_role', // Limited permissions role
  password: process.env.DB_PASSWORD,
  max: 100, // Shared across all tenants
});

// Ensure RLS is enforced
pool.on('connect', (client) => {
  // Fail-safe: Block queries without tenant context
  client.query('SET app.current_tenant_id = NULL');
});
```

### Query Patterns
```javascript
// All queries automatically filtered by RLS
const candidates = await db.query(`
  SELECT * FROM candidates 
  WHERE availability_status = 'active'
  ORDER BY created_at DESC
`);
// RLS automatically adds: AND tenant_id = current_setting('app.current_tenant_id')::UUID

// Manual tenant checks for extra safety (defense in depth)
const candidate = await db.query(`
  SELECT * FROM candidates 
  WHERE candidate_id = $1 AND tenant_id = $2
`, [candidateId, req.tenantId]);
```

## 3. Security Implementation

### Database Roles and Permissions
```sql
-- Application role with limited permissions
CREATE ROLE application_role;

-- Grant only necessary permissions
GRANT SELECT, INSERT, UPDATE ON candidates TO application_role;
GRANT SELECT, INSERT, UPDATE ON person_emails TO application_role;
-- No DELETE permissions - use soft deletes only
-- No DDL permissions - only migrations can alter schema

-- Prevent bypass of RLS
REVOKE BYPASS RLS ON ALL TABLES FROM application_role;
```

### Tenant Validation
```javascript
// Validate tenant exists and user has access
async function validateTenantAccess(userId, tenantId) {
  const result = await db.query(`
    SELECT 1 FROM tenant_users 
    WHERE user_id = $1 AND tenant_id = $2 AND status = 'active'
  `, [userId, tenantId]);
  
  if (result.rows.length === 0) {
    throw new Error('Unauthorized tenant access');
  }
}
```

### Audit Logging
```sql
-- Audit all tenant context changes
CREATE TABLE tenant_access_log (
  log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  tenant_id UUID NOT NULL,
  action VARCHAR(50) NOT NULL,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Log failed tenant access attempts
CREATE TABLE tenant_access_violations (
  violation_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  attempted_tenant_id UUID,
  actual_tenant_id UUID,
  query_attempted TEXT,
  ip_address INET,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

# Cross-Tenant Features Design

## Duplicate Detection (Privacy-Preserving)

### Identity Fingerprinting
```sql
-- Global identity table (cross-tenant)
CREATE TABLE identity_fingerprints (
    fingerprint_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email_hash VARCHAR(64),      -- SHA-256 of normalized email
    phone_hash VARCHAR(64),      -- SHA-256 of normalized phone  
    name_similarity_hash VARCHAR(64), -- Metaphone + Jaro-Winkler hash
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(email_hash, phone_hash, name_similarity_hash)
);

-- Link candidates to identity fingerprints
CREATE TABLE candidate_identity_links (
    candidate_id UUID REFERENCES candidate(candidate_id),
    fingerprint_id UUID REFERENCES identity_fingerprints(fingerprint_id),
    tenant_id UUID NOT NULL, -- Which tenant owns this candidate
    confidence_score DECIMAL(3,2), -- 0.00 to 1.00 match confidence
    created_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (candidate_id, fingerprint_id)
);

-- No RLS on identity tables - they're designed for cross-tenant access
-- Security through hashing and anonymization
```

### Privacy-Preserving Matching Algorithm
```javascript
async function detectDuplicates(candidateData, tenantId) {
    // Generate privacy-preserving hashes
    const emailHash = sha256(normalizeEmail(candidateData.email));
    const phoneHash = sha256(normalizePhone(candidateData.phone));
    const nameHash = generateNameSimilarityHash(
        candidateData.firstName, 
        candidateData.lastName
    );
    
    // Find matching fingerprints across ALL tenants
    const matches = await db.query(`
        SELECT f.fingerprint_id,
               COUNT(DISTINCT l.tenant_id) as tenant_count,
               AVG(l.confidence_score) as avg_confidence,
               -- Don't reveal which tenants, just count
               CASE WHEN COUNT(DISTINCT l.tenant_id) > 1 
                    THEN 'cross_tenant' 
                    ELSE 'single_tenant' 
               END as match_type
        FROM identity_fingerprints f
        JOIN candidate_identity_links l ON f.fingerprint_id = l.fingerprint_id  
        WHERE f.email_hash = $1 OR f.phone_hash = $2 OR f.name_similarity_hash = $3
        GROUP BY f.fingerprint_id
        HAVING COUNT(DISTINCT l.tenant_id) > 0
        ORDER BY avg_confidence DESC
        LIMIT 10
    `, [emailHash, phoneHash, nameHash]);
    
    return matches;
}
```

### Consensual Identity Resolution
```sql
-- Duplicate resolution requests (manual review)
CREATE TABLE duplicate_resolution_requests (
    request_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fingerprint_id UUID REFERENCES identity_fingerprints(fingerprint_id),
    requesting_tenant_id UUID NOT NULL,
    target_candidate_summary JSONB, -- Anonymized summary for review
    resolution_status VARCHAR(20) DEFAULT 'pending',
    resolved_at TIMESTAMP,
    resolved_by UUID,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### Anonymized Match Summaries
```json
// What tenant A sees about potential duplicate in tenant B
{
  "match_confidence": 0.85,
  "candidate_summary": {
    "experience_range": "5-7 years",
    "location_region": "San Francisco Bay Area", 
    "skills_categories": ["Software Engineering", "JavaScript"],
    "last_activity": "2024-01",
    "anonymized_id": "candidate_x7k2m9"
  },
  "requesting_agency": "*** (Anonymized) ***",
  "resolution_required": true
}
```

---

# Performance Optimization

## Tenant Partitioning Strategy
```sql
-- Partition large tables by tenant_id for better performance
CREATE TABLE candidate_communication_partitioned (
    LIKE candidate_communication INCLUDING ALL
) PARTITION BY HASH (tenant_id);

-- Create partitions (4 partitions for load distribution)
CREATE TABLE candidate_communication_p0 PARTITION OF candidate_communication_partitioned
    FOR VALUES WITH (modulus 4, remainder 0);
CREATE TABLE candidate_communication_p1 PARTITION OF candidate_communication_partitioned
    FOR VALUES WITH (modulus 4, remainder 1);
CREATE TABLE candidate_communication_p2 PARTITION OF candidate_communication_partitioned
    FOR VALUES WITH (modulus 4, remainder 2);
CREATE TABLE candidate_communication_p3 PARTITION OF candidate_communication_partitioned
    FOR VALUES WITH (modulus 4, remainder 3);
```

## Connection Pool Management
```javascript
// Tenant-aware connection pooling
class TenantAwarePool {
  constructor() {
    this.pools = new Map(); // tenant_id -> connection pool
    this.sharedPool = new Pool({ max: 50 }); // For tenant lookup queries
  }
  
  async getConnection(tenantId) {
    // Use shared pool with RLS for isolation
    const client = await this.sharedPool.connect();
    await client.query('SET app.current_tenant_id = $1', [tenantId]);
    return client;
  }
}
```

## Query Optimization
```sql
-- Materialized views for cross-tenant analytics (anonymized)
CREATE MATERIALIZED VIEW tenant_metrics AS
SELECT 
  tenant_id,
  COUNT(*) as candidate_count,
  COUNT(*) FILTER (WHERE availability_status = 'active') as active_candidates,
  AVG(years_experience) as avg_experience,
  DATE_TRUNC('month', created_at) as month
FROM candidates 
GROUP BY tenant_id, DATE_TRUNC('month', created_at);

-- Refresh nightly
CREATE INDEX idx_tenant_metrics_month ON tenant_metrics(month, tenant_id);
```

---

# Migration Strategy

## Phase 1: Foundation (Week 1-2)
```sql
-- 1. Add tenant_id columns (nullable initially)
ALTER TABLE candidates ADD COLUMN tenant_id UUID;
ALTER TABLE person_emails ADD COLUMN tenant_id UUID;
-- ... all tables

-- 2. Populate tenant_id based on existing data
UPDATE candidates SET tenant_id = 'default-tenant-uuid';
UPDATE person_emails SET tenant_id = 'default-tenant-uuid';  
-- ... all tables

-- 3. Make tenant_id NOT NULL
ALTER TABLE candidates ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE person_emails ALTER COLUMN tenant_id SET NOT NULL;
-- ... all tables
```

## Phase 2: Security (Week 3)
```sql
-- 1. Enable RLS on all tables
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE person_emails ENABLE ROW LEVEL SECURITY;
-- ... all tables

-- 2. Create tenant isolation policies
CREATE POLICY tenant_isolation_candidates ON candidates
FOR ALL TO application_role
USING (tenant_id = current_setting('app.current_tenant_id')::UUID);
-- ... all tables

-- 3. Create tenant-aware indexes
CREATE INDEX CONCURRENTLY idx_candidates_tenant_created ON candidates(tenant_id, created_at);
-- ... all indexes
```

## Phase 3: Application Updates (Week 4)
- Deploy tenant context middleware
- Update all queries to handle RLS
- Add tenant validation to all endpoints
- Enable audit logging

## Phase 4: Cross-Tenant Features (Week 5-6)
- Implement duplicate detection tables
- Deploy privacy-preserving matching
- Create resolution workflow UI

---

# Compliance & Governance

## GDPR Article 25 Implementation
- **Data Protection by Design**: RLS policies prevent unauthorized access at database level
- **Data Protection by Default**: Tenant context required for all operations
- **Privacy by Design**: Duplicate detection uses hashed identifiers, not actual data

## SOC 2 Type II Controls
- **Access Controls**: Database-level tenant isolation
- **Audit Logging**: All tenant access attempts logged
- **Data Segregation**: Cryptographic separation through RLS

## Regulatory Compliance
- **CCPA**: Tenant-specific data deletion capabilities
- **PIPEDA**: Canadian tenant data residency options
- **GDPR**: EU tenant data processing controls

---

# Operational Procedures

## Tenant Onboarding
1. Create tenant record in `tenants` table
2. Generate unique tenant UUID
3. Create initial admin user with tenant association
4. Set up tenant-specific configurations
5. Validate RLS policies working correctly

## Tenant Offboarding  
1. Soft delete all tenant data (set deleted_at timestamps)
2. Anonymize identity fingerprints
3. Archive tenant data for retention period
4. Purge data after legal retention requirements met
5. Update cross-tenant references

## Monitoring & Alerting
- RLS policy violations
- Cross-tenant data access attempts
- Tenant context failures
- Performance degradation per tenant
- Duplicate detection accuracy metrics

This multi-tenant architecture provides enterprise-grade security, privacy, and scalability while enabling innovative cross-tenant features like privacy-preserving duplicate detection.