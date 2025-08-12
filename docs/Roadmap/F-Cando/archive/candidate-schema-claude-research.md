# Candidate Schema Research
**Date**: 2025-08-11  
**Purpose**: Research findings for ATS candidate database schema design


TODO: 
- Should you create github issues to keep track what needs to be implemented as tickets?
- derive location hieracy, metro concept


P5:
- Text Extraction for Search
- Store extracted plain text in separate column
- **Multiple Compensation Types**: Base, bonus, equity often separate fields
- `comp_base`, `comp_total`, `comp_equity` (detailed breakdown)
### Address Normalization
- **LibPostal** - C library using ML for global address parsing
- Handles abbreviations, variations, typos
- Used by major tech companies

---- Engineering tickets
P1 - - automatically add createdAt and updatedAt as columns using PostgreSQL triggers to be done automatically every time a new entry is created or updated in a table. Research best practices and the best way to do this automatically. Not sure if Drizzle handles this automatically?

P2 - How to populate the country, state, cities table?  create P2 todo.  Can fill the table it's a few hard-coded simple country, state, and city to get started. For city, research if population is common or even needed or more metro area concept (eg: greater SF bay area, which may be more common?)

 Avoid JOINs in common candidate list queries
- Use arrays for simple lists (remote_work_states)

---
More research needed - 

Skills - need to research if hierachy needed or if there is an existing taxonomy can be used from resume vendors or maybe standards exist?

----

QUESTIONS 
  
- Best practice on how many tables since we are just like candidates, we haven't even started employer jobs and submissions, so that could be 10x the number of tables or more to build the product. 
- 

# ChatGPT vs Claude Schema Comparison

## Key Differences

**ChatGPT Design**: Over-engineered
- Person + RecruiterCandidate split tables
- Normalized reference tables (countries, states, currencies)
- Generic candidate_notes with note_type categorization
- candidate_field_history audit table
- Complex deduplication with alias tables

**Claude Design**: Performance-focused
- Single candidate table
- Constants for stable data (countries, states, work auth)
- Context-specific note fields (location_notes, compensation_notes)
- Universal contact tables (person_emails, person_phones)
- Singular table naming

## Performance Impact

**Query: Get candidate with location info**
- **ChatGPT**: 4-table JOIN (candidates → cities → states → countries)
- **Claude**: 1-table JOIN (candidate → city with embedded state/country codes)

**Winner: Claude** - 75% fewer JOINs, faster queries

## When to Choose Each

**Claude Design**: Single-agency, performance-critical, rapid development
**ChatGPT Design**: Multi-agency, heavy compliance, complex deduplication

## Work Authorization: Constants vs Database

**Constants Approach (Used in Claude)**:
```javascript
WORK_AUTH = { US: { H1B: 'H1B', CITIZEN: 'US_Citizen' } }
```
- No JOINs needed for filtering
- ~50 types globally (small, stable dataset)
- Government-regulated (rarely changes)

**Database Table Approach (ChatGPT)**:
- Requires JOIN for every work auth query
- Over-engineered for small, stable dataset
- Schema changes needed to add types

**Best Practice: Use constants for stable, small reference data (<200 items)**



candidate_work_auth
CREATE TABLE candidate_work_location 

# ChatGPT vs Claude Schema Comparison

## Key Differences

**ChatGPT Design**: Over-engineered
- Person + RecruiterCandidate split tables
- Normalized reference tables (countries, states, currencies)
- Generic candidate_notes with note_type categorization
- candidate_field_history audit table
- Complex deduplication with alias tables

**Claude Design**: Performance-focused
- Single candidate table
- Constants for stable data (countries, states, work auth)
- Context-specific note fields (location_notes, compensation_notes)
- Universal contact tables (person_emails, person_phones)
- Singular table naming

## Performance Impact

**Query: Get candidate with location info**
- **ChatGPT**: 4-table JOIN (candidates → cities → states → countries)
- **Claude**: 1-table JOIN (candidate → city with embedded state/country codes)

**Winner: Claude** - 75% fewer JOINs, faster queries

## When to Choose Each

**Claude Design**: Single-agency, performance-critical, rapid development
**ChatGPT Design**: Multi-agency, heavy compliance, complex deduplication

## Work Authorization: Constants vs Database

**Constants Approach (Used in Claude)**:
```javascript
WORK_AUTH = { US: { H1B: 'H1B', CITIZEN: 'US_Citizen' } }
```
- No JOINs needed for filtering
- ~50 types globally (small, stable dataset)
- Government-regulated (rarely changes)

**Database Table Approach (ChatGPT)**:
- Requires JOIN for every work auth query
- Over-engineered for small, stable dataset
- Schema changes needed to add types

**Best Practice: Use constants for stable, small reference data (<200 items)**

-- Universal contact tables for candidates, employers, recruiters    - multiple roles

 comp_max_cents INTEGER                                                                                                              │ │
│ │   151 +  candidate_field_history  -- Track all changes   

====================================================================


## Key Research URLs - ATS API Documentation

**Major ATS Systems:**
- **Ashby**: 
  - Main API: https://developers.ashbyhq.com/reference
  - Application Source:https://developers.ashbyhq.com/reference/applicationchangesource
- **Greenhouse**: 
  - Main API: https://developers.greenhouse.io/harvest.html
  - Candidates API: https://github.com/grnhse/greenhouse-api-docs/blob/master/source/includes/harvest/_candidates.md
- **Bullhorn**: 
  - REST API Docs: https://bullhorn.github.io/rest-api-docs/
  - Entity Reference: https://bullhorn.github.io/rest-api-docs/entityref.html
- **RecruiterFlow**: 
  - API Docs: https://developers.recruiterflow.com/
  - Candidate API: https://developers.recruiterflow.com/reference/candidate
- **SmartRecruiters**: https://developers.smartrecruiters.com/
- **Wellfound (AngelList)**: https://wellfound.com/help/api
- **Paraform**: https://www.paraform.com/ (API documentation research needed)

**Additional ATS Platforms:**
- **Lever**: https://hire.lever.co/developer/documentation
- **Workable**: https://workable.readme.io/docs/
- **BambooHR**: https://documentation.bamboohr.com/docs
- **iCIMS**: https://developer.icims.com/
- **JazzHR**: https://www.jazzhr.com/api/

**Database Design Authorities:**
- **PostgreSQL Schema Recommendations**: https://wiki.postgresql.org/wiki/Database_Schema_Recommendations_for_an_Application
- **SQL Style Guide**: https://www.sqlstyle.guide/
- **Database Star**: https://www.databasestar.com/database-table-naming-conventions/

**Location Data Standards:**
- **GeoNames**: http://www.geonames.org/
- **Natural Earth**: https://www.naturalearthdata.com/
- **ISO Standards**: https://www.iso.org/iso-3166-country-codes.html

**Startup Scaling & Database Architecture Sources:**
- **Instagram Engineering**: https://instagram-engineering.com/sharding-ids-at-instagram-1cf5a71e5a5c
- **Slack Engineering**: https://slack.engineering/flannel-an-application-level-edge-cache/
- **Uber Engineering**: https://www.uber.com/blog/unified-data-quality-platform/
- **Stripe Engineering**: https://stripe.com/blog/online-migrations
- **Twitter Engineering**: https://blog.twitter.com/engineering/en_us/topics/infrastructure/2017/the-infrastructure-behind-twitter-scale
- **HubSpot Engineering**: https://product.hubspot.com/blog/multi-tenant-saas-database-tenancy-patterns
- **Lyft Engineering**: https://eng.lyft.com/verity-lyfts-data-quality-platform-5b6c66e9a4e
- **Pinterest Engineering**: https://medium.com/pinterest-engineering/sharding-pinterest-how-we-scaled-our-mysql-fleet-3f341e96ca6f

**Database Design Best Practices:**
- **PostgreSQL Multi-Tenancy**: https://aws.amazon.com/blogs/database/multi-tenant-data-isolation-with-postgresql-row-level-security/
- **SaaS Tenant Patterns**: https://docs.microsoft.com/en-us/azure/sql-database/saas-tenancy-app-design-patterns
- **GDPR Technical Compliance**: https://gdpr.eu/article-25-data-protection-by-design/
- **Database Sharding Patterns**: https://www.digitalocean.com/community/tutorials/understanding-database-sharding


## Location Data Standards Research

### Industry Standard Databases
1. **GeoNames Database** - Most comprehensive open source geographical database
   - 11+ million placenames covering all countries
   - Creative Commons Attribution license (free commercial use)
   - Provides ISO country codes, administrative divisions, coordinates
   - Multiple formats: cities with population >500, >1000, >5000
   - REST APIs available for real-time lookups

2. **Natural Earth** - Cartographic quality dataset
   - Public domain dataset at multiple scales
   - Curated city selection based on regional significance
   - Includes population estimates from LandScan dataset

3. **GitHub Resources**
   - `dr5hn/countries-states-cities-database` - Most comprehensive, multiple formats
   - `datasets/world-cities` - Clean dataset from Natural Earth data
   - 50+ repositories under "country-state-city" topic

### Location Code Standards
- **ISO 3166-1**: Country codes (US, CA, GB)
- **ISO 3166-2**: State/province subdivision codes
- **ISO 4217**: Currency codes (USD, CAD, EUR)

## ATS Location Handling Patterns (From Previous Research)

### Bullhorn ATS
```json
{
  "address": {
    "city": "Sacramento",
    "state": "CA", 
    "zip": "",
    "countryID": 1
  },
  "secondaryAddress": { /* same structure */ }
}
```
- Primary + secondary addresses
- Distance matching with configurable radius (default 20 miles)
- Structured address components

### SmartRecruiters ATS
```json
{
  "country": "US",
  "region": "CA",
  "city": "San Francisco", 
  "remote": true
}
```
- ISO country codes
- Boolean remote flag
- Structured city/region/country

### Ashby ATS
- Structured location field as primary data object
- Automatic timezone inference from location data
- Location-based bulk operations and filtering
- Location-based auto-reject configurations

### Greenhouse ATS
```json
{
  "location": {
    "address": "New York, New York, USA"
  }
}
```
- Unstructured address strings
- Google Places API integration for validation
- Hidden lat/lng fields for distance calculation

## Skills Normalization Research

### Common Approaches Found
1. **Free Text Tags** - Simple but inconsistent (React vs ReactJS vs React.js)
2. **Standardized Skills Database** - Normalized skill names with categories
3. **Hierarchical Skills** - Skills with subcategories and proficiency levels
4. **AI-Powered Extraction** - Parse skills from resumes and normalize automatically

### Industry Best Practices
- Most mature ATSs use standardized skill databases
- Categories help with filtering and reporting
- Proficiency levels common: Beginner, Intermediate, Advanced, Expert
- Some systems allow both standardized + custom skills

## Salary/Compensation Data Standards

### Storage Format Research
- **Dollars vs Cents**: Mixed practices, but dollars more common for salary ranges
- **Currency Support**: ISO 4217 currency codes standard
- **Precision**: Integer dollars sufficient for salary ranges
- **Multiple Compensation Types**: Base, bonus, equity often separate fields

### Common Fields Found
- `comp_min`, `comp_max` (salary range)
- `comp_currency` (ISO currency code)
- `comp_base`, `comp_total`, `comp_equity` (detailed breakdown)

## Years of Experience Format

### Precision Standards
- **DECIMAL(4,1)** format allows: 0.5, 5.5, 15.0, etc.
- Supports half-year increments commonly used in recruiting
- 4 digits total, 1 after decimal: range 0.0 to 999.9 years

## Document Storage Patterns

### File Storage Approaches
1. **Database BLOBs** - Not recommended for large files
2. **File System Paths** - Simple but limits scalability  
3. **Cloud Storage References** - Most scalable (S3 keys, Google Cloud Storage IDs)

### Text Extraction for Search
- Store extracted plain text in separate column
- Use PostgreSQL full-text search with GIN indexes
- `to_tsvector('english', extracted_text)` for search optimization

## Multi-Recruiter Architecture Patterns

### Option A: Single Candidate Table
- One canonical candidate record
- Track recruiter ownership/access separately
- Simpler queries, potential data conflicts

### Option B: Person + RecruiterCandidate Split  
- Person table for canonical identity
- RecruiterCandidate for recruiter-specific data
- More complex but handles conflicts better
- Used by some enterprise ATSs

## Normalization Libraries for Data Quality

### Address Normalization
- **LibPostal** - C library using ML for global address parsing
- Handles abbreviations, variations, typos
- Used by major tech companies

### Location Validation
- Validate city exists in state/country
- Handle common abbreviations and variations
- Fuzzy matching for typos and similar names

## Performance Considerations for Scale

### Index Strategy (for millions of candidates)
- Primary indexes on searchable fields (location, skills, availability)
- Composite indexes for common filter combinations
- GIN indexes for full-text search on resume content
- Partial indexes for active candidates only

### Query Optimization
- Separate tables for high-volume data (documents, communications)
- Avoid JOINs in common candidate list queries
- Use arrays for simple lists (remote_work_states)

# Critical Database Design Gaps Analysis

## What I Missed (Junior vs Senior Architect Gap)

### **1. Production Operations - MISSING**
- **Data Migration Strategy**: No schema versioning or migration tracking
- **Soft Deletes**: Hard deletes with CASCADE will lose critical recruiting data
- **Backup/Recovery**: No consideration for data retention policies
- **Monitoring**: No query performance tracking or data quality metrics

### **2. Enterprise Scalability - MISSING**  
- **Multi-Tenancy**: No tenant isolation for SaaS deployment
- **Concurrent Updates**: No optimistic locking for race conditions
- **Partitioning Strategy**: Large tables (communications, audit logs) need partitioning
- **Read Replicas**: No separation of read-heavy vs write operations

### **3. Security Patterns - MISSING**
- **Row-Level Security**: No tenant data isolation at database level  
- **Audit Logging**: No comprehensive change tracking for compliance
- **Data Classification**: No PII marking or data sensitivity levels
- **Access Controls**: No role-based data access patterns

### **4. Business Logic Gaps - MISSING**
- **Compensation Complexity**: Missing equity, bonus, total comp calculations
- **Experience Modeling**: Primitive years count vs skill-specific experience
- **Location Intelligence**: No metro areas, timezone, cost-of-living data
- **Career Progression**: No promotion/title change tracking

### **5. Data Quality & Integrity - MISSING**
- **Data Validation**: Relying on application layer only
- **Completeness Scoring**: No profile completion tracking
- **Duplicate Detection**: No fuzzy matching or similarity scoring
- **Data Lineage**: No tracking of data source and modifications

### **6. Integration Patterns - MISSING**
- **Event Sourcing**: No domain events for workflow triggers
- **Background Jobs**: No async job queue integration  
- **External System Integration**: No webhook/API versioning support
- **Data Sync**: No conflict resolution for external data sources

## Root Cause: Academic vs Production Mindset

**I focused on**: Clean normalization, query optimization, relationships
**I missed**: Operations, scaling, real-world business complexity, enterprise workflows

This reveals a **classic startup-to-enterprise scaling gap** - solving the immediate data model without considering the system evolution.

# Startup Scaling Lessons: Database Migration Disasters

## Real-World Examples

### **Instagram: PostgreSQL Sharding Crisis**
- **Startup**: Single PostgreSQL instance
- **Growth Problem**: Hit 60GB limit, couldn't scale vertically
- **Enterprise Fix**: Custom sharding across 12 replicas
- **ATS Lesson**: Plan for horizontal scaling from day one

### **Slack: Multi-Tenant Schema Crisis**  
- **Startup**: Team-based sharding
- **Growth Problem**: Shared channels broke tenant boundaries
- **Enterprise Fix**: Complete Vitess migration, custom routing
- **ATS Lesson**: Tenant model must handle complex relationships

### **HubSpot: Security Retrofit Challenges**
- **Startup**: Basic multi-tenant architecture
- **Growth Problem**: HIPAA compliance, field-level permissions
- **Enterprise Fix**: Application encryption, audit trails
- **ATS Lesson**: Compliance retrofitting is extremely expensive

### **Uber: Data Quality Platform Crisis**
- **Growth Problem**: 90% of incidents from data quality issues
- **Solution**: 12 months, 5 engineers for custom UDQ platform
- **ATS Lesson**: Data quality needs dedicated infrastructure

## Critical Patterns That Emerge

### **Pattern 1: Tenant Isolation Crisis**
- Companies underestimate compliance complexity
- Multi-tenant makes GDPR/CCPA exponentially harder
- Candidate data = special category personal data (Article 9)

### **Pattern 2: Audit Trail Retrofitting**
- Hiring decisions require comprehensive audit trails
- Compliance investigations need complete data lineage
- Adding audit logging later breaks existing performance

### **Pattern 3: Data Quality Cascading Failures**
- Bad candidate data affects entire recruiting pipeline
- Duplicate detection becomes critical at scale
- Profile completeness impacts matching algorithms

## Enterprise-Ready ATS Requirements

Based on scaling lessons, our schema must support:

1. **Multi-Tenant Security**: Row-level security, field-level encryption
2. **Comprehensive Auditing**: All changes tracked for compliance
3. **Data Quality Controls**: Validation, completeness scoring, deduplication
4. **Horizontal Scaling**: Proper sharding keys, read replicas
5. **Migration Capabilities**: Schema evolution without downtime
6. **Integration Resilience**: Conflict resolution, sync monitoring

# Implementation Priority Matrix

## Phase 0: Foundation (Must Build Now)
**Risk**: Impossible to retrofit later

### **P0A: Multi-Tenancy & Security**
```sql
-- Add to every table
tenant_id UUID NOT NULL,
created_by UUID NOT NULL,
updated_by UUID,
-- Row-level security policies
```
**Why Critical**: Slack's tenant boundary crisis, HubSpot's compliance retrofit

### **P0B: Soft Deletes & Audit Foundation** 
```sql
-- Add to every table
deleted_at TIMESTAMP,
deleted_by UUID,
version_number INTEGER DEFAULT 1,
-- Basic audit logging infrastructure
```
**Why Critical**: Recruiting data is legally protected, hard deletes = compliance violations

### **P0C: Migration Framework**
```sql
CREATE TABLE schema_migrations (
    version VARCHAR(50) PRIMARY KEY,
    applied_at TIMESTAMP DEFAULT NOW()
);
```
**Why Critical**: Schema changes without migrations = Instagram's 60GB crisis

---

## Phase 1: MVP Enhancements (Build Within 6 Months)
**Risk**: Significant refactoring required later

### **P1A: Data Quality Infrastructure**
```sql
-- Add to candidate table
profile_completeness_score DECIMAL(3,2),
data_quality_issues JSONB,
last_validation_check TIMESTAMP,
```
**Why Important**: Uber's data quality disaster (90% incidents), 12 months to fix

### **P1B: Enhanced Location Intelligence**
```sql
-- Metro area concepts, timezone tracking
metro_area_id INTEGER,
timezone VARCHAR(50),
cost_of_living_index INTEGER,
```
**Why Important**: Remote work complexity, geographic pay adjustments

### **P1C: Comprehensive Compensation Model**
```sql
-- Total compensation tracking
comp_base INTEGER,
comp_variable INTEGER,  -- Bonus
comp_equity_value INTEGER,
comp_total_calculated INTEGER,
```
**Why Important**: Tech recruiting requires equity tracking, total comp calculations

---

## Phase 2: Growth Features (6-18 Months)
**Risk**: Performance degradation as scale increases

### **P2A: Advanced Search & Matching**
```sql
-- Full-text search optimization
CREATE INDEX idx_candidate_search ON candidate 
USING gin(to_tsvector('english', 
    first_name || ' ' || last_name || ' ' || 
    location_notes || ' ' || general_notes));
```

### **P2B: Integration Resilience**
```sql
-- External system sync tracking
CREATE TABLE integration_sync_log (
    sync_id UUID PRIMARY KEY,
    external_system VARCHAR(50),
    entity_type VARCHAR(50),
    entity_id UUID,
    sync_status VARCHAR(20),
    last_sync_at TIMESTAMP
);
```

### **P2C: Background Job Infrastructure**
```sql
-- Async processing foundation
CREATE TABLE background_jobs (
    job_id UUID PRIMARY KEY,
    job_type VARCHAR(50),
    payload JSONB,
    status VARCHAR(20),
    scheduled_at TIMESTAMP
);
```

---

## Phase 3: Enterprise Features (18+ Months)
**Risk**: Competitive disadvantage in large deals

### **P3A: Advanced Compliance**
- Field-level encryption
- Data residency controls
- Advanced audit querying

### **P3B: Advanced Analytics**
- Materialized views for reporting
- Data warehouse integration
- Predictive matching algorithms

### **P3C: Multi-Region Architecture**
- Geographic data distribution
- Cross-region replication
- Regulatory compliance by region

---

## Implementation Decision Framework

### **Build Now (Phase 0)**
- **Criteria**: Impossible/extremely expensive to retrofit
- **Examples**: Multi-tenancy, soft deletes, migration framework
- **Cost of Delay**: Slack's $M migration, HubSpot's compliance crisis

### **Build Early (Phase 1)** 
- **Criteria**: Significant refactoring required if delayed
- **Examples**: Data quality, location intelligence, compensation model
- **Cost of Delay**: 6-12 months of rework, performance impacts

### **Build When Needed (Phase 2-3)**
- **Criteria**: Additive features, minimal schema changes
- **Examples**: Advanced search, integrations, analytics
- **Cost of Delay**: Feature gaps, but manageable technical debt

# Multi-Tenancy & Duplicate Detection Design

**Note**: Detailed multi-tenancy architecture and duplicate detection design has been moved to:
`/docs/Roadmap/F-multi-tenant/multi-tenant-architecture.md`

## Summary for Candidate Schema Context

### **Multi-Tenancy Requirements**
- Add `tenant_id UUID NOT NULL` to all tables
- Implement PostgreSQL Row-Level Security (RLS) policies  
- Create tenant-aware indexes: `(tenant_id, other_columns)`
- Application middleware to set tenant context

### **Duplicate Detection Requirements**
- Global `identity_fingerprints` table with SHA-256 hashed identifiers
- `candidate_identity_links` table linking candidates to fingerprints
- Privacy-preserving cross-tenant duplicate detection
- Consensual identity resolution workflow

### **Critical Implementation Notes**
- **Security**: Database-level tenant isolation prevents application bugs from causing data breaches
- **Privacy**: Zero-knowledge duplicate matching using hashed identifiers
- **Performance**: Tenant-aware indexes essential for scale
- **Compliance**: GDPR Article 25 data protection by design

**See detailed technical specification in F-multi-tenant folder.**

## Parking Lot - Deferred Items

### Items to Address Later (Multi-Recruiter Phase)
1. Duplicate detection and merging strategies
2. Recruiter ownership and data visibility rules
3. Conflict resolution when multiple recruiters have different data
4. Submission exclusivity and representation periods
5. Audit trails for compliance and change tracking

### Future Enhancements
1. AI-powered skill extraction from resumes
2. Automatic location geocoding and validation
3. Integration with external job boards and HRIS systems
4. Advanced search with Elasticsearch integration
5. Real-time candidate matching algorithms