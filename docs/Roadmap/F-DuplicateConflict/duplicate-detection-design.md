# Duplicate Detection Schema Design Document

## Section 1: Domain Analysis

### Core Concepts
- **Person**: Canonical candidate record (one per unique human)
- **PersonAlias**: Unique identifiers (email, phone, LinkedIn, GitHub) linked to Person
- **Submission**: Immutable recruiter submissions with recruiter-specific candidate data
- **Representation**: Time-bound exclusive representation rights per employer
- **ConflictDetection**: Automated conflict identification and resolution tracking
- **PersonAliasHistory**: Audit trail for identifier changes

### Relationships
- Person (1) → PersonAlias (many): One person can have multiple identifiers
- Person (1) → Submission (many): Multiple recruiters can submit same person
- Submission (1) → Representation (0..1): Submission may result in representation
- Person + Employer → Representation (0..1): Max one active representation per employer
- ConflictDetection → Submissions (many): Conflicts involve multiple submissions

### Business Rules
1. **Uniqueness**: Each email/phone can only belong to one Person
2. **Exclusivity**: Only one active representation per Person per Employer
3. **Time-bound**: Representations expire after 6-12 months
4. **Immutability**: Submissions cannot be changed (only admin corrections)
5. **Sequential**: New representation allowed after current one expires
6. **Cross-employer**: Same person can have concurrent representations with different employers

## Section 2: Comparative Research

### Greenhouse ATS Approach
- **Candidate Matching**: Uses email as primary identifier with fuzzy name matching
- **Duplicate Handling**: Suggests duplicates during creation, allows manual merge
- **Representation**: No built-in representation conflict detection
- **Limitation**: Single-tenant, no cross-agency scenarios

### Bullhorn CRM/ATS Approach  
- **Entity Deduplication**: Separate Person vs Candidate entities
- **Matching Rules**: Configurable matching criteria (email, phone, name combinations)
- **Workflow**: Automated duplicate flagging with manual resolution workflows
- **Strength**: Mature deduplication engine with confidence scoring

### RecruiterFlow Approach
- **Real-time Detection**: Duplicate detection during candidate entry
- **Multi-recruiter**: Tracks which recruiter submitted what data
- **Conflict Resolution**: Basic "first wins" or admin override
- **Limitation**: Limited cross-agency visibility

### Industry Standards
- **Primary Keys**: Email universally used as primary identifier
- **Secondary Keys**: Phone number as backup identifier  
- **Fuzzy Matching**: Name + location matching for edge cases
- **Audit Trails**: Most systems lack comprehensive change tracking

## Section 3: Proposed Design

### Key Design Decisions

#### 1. Person-Alias Separation
**Decision**: Separate Person (canonical) from PersonAlias (identifiers)
**Rationale**: 
- Efficient duplicate detection via single alias lookup table
- Avoids data duplication across recruiter submissions
- Enables clean identifier change tracking
- Supports future fuzzy matching enhancements

#### 2. Immutable Submissions
**Decision**: Submissions are immutable with admin correction overlay
**Rationale**:
- Complete audit trail of what each recruiter submitted
- Prevents data loss during corrections
- Enables recruiter-specific views of same candidate
- Supports compliance and dispute resolution

#### 3. Explicit Representation Tracking
**Decision**: Dedicated Representation table with time bounds
**Rationale**:
- Clear representation ownership and expiration
- Supports complex conflict resolution scenarios
- Enables cross-employer representation tracking
- Separates submission from representation logic

#### 4. Comprehensive Conflict Detection
**Decision**: Automated detection with structured resolution workflow
**Rationale**:
- Real-time detection prevents representation conflicts
- Structured resolution process scales with volume
- Audit trail supports dispute resolution
- Confidence scoring enables automated vs manual routing

### Schema Highlights

```sql
-- Core identity management
Person (id, status, merged_into_person_id, created_by_submission_id)
PersonAlias (person_id, alias_type, alias_value, is_primary, status)

-- Submission tracking  
Submission (person_id, recruiter_id, agency_id, employer_id, submitted_at, 
           candidate_data..., is_duplicate, has_representation_conflict)

-- Representation management
Representation (person_id, recruiter_id, employer_id, starts_at, expires_at, 
               status, superseded_by_representation_id)

-- Conflict detection and resolution
ConflictDetection (trigger_type, conflict_type, person_id, employer_id,
                  conflicting_submission_ids, status, resolution_type)
```

## Section 4: Tradeoffs & Future-Proofing

### What We Achieve
✅ **Real-time duplicate detection** with 6-month window matching  
✅ **Complete audit trail** for all identifier changes and submissions  
✅ **Scalable conflict resolution** with automated + manual workflows  
✅ **Cross-agency transparency** while maintaining recruiter data privacy  
✅ **Time-bound representation** with automatic expiration  
✅ **Admin override capabilities** with full change tracking  

### What We Miss vs Competitors
❌ **Fuzzy name matching** (only exact email/phone matching initially)
❌ **AI-powered duplicate detection** (rule-based system only)
❌ **Cross-tenant duplicate detection** (employer-scoped only)
❌ **Bulk candidate import** duplicate handling
❌ **Advanced merger workflows** for complex scenarios

### Easy to Add Later
🟢 **Additional identifier types** (new alias_type values)  
🟢 **Fuzzy matching algorithms** (confidence scoring framework ready)  
🟢 **Custom conflict resolution rules** per employer  
🟢 **Integration webhooks** for external systems  
🟢 **Advanced reporting views** (schema supports complex queries)  
🟢 **Bulk operations** (foundation tables support batch processing)  

### Hard to Change (Architectural Decisions)
🔴 **Person-Alias separation** (fundamental to performance)  
🔴 **Immutable submissions** (changing would break audit trail)  
🔴 **UUID primary keys** (migration would be complex)  
🔴 **PostgreSQL-specific features** (triggers, JSONB, arrays)  
🔴 **Time-bound representation model** (changing logic would affect existing data)  

## Section 5: Implementation Roadmap

### MVP Phase: Basic Duplicate Detection
**Goals**: Meet 6 core requirements with manual conflict resolution
**Timeline**: 4-6 weeks

**Deliverables**:
- ✅ Core schema implementation (Person, PersonAlias, Submission, Representation)
- ✅ Real-time duplicate detection trigger (email/phone exact match)
- ✅ Basic conflict detection and flagging
- ✅ Admin interface for conflict resolution
- ✅ Recruiter/employer views with data privacy
- ✅ 6-month representation window enforcement

**Success Criteria**:
- 100% duplicate detection for exact email/phone matches
- <2 second response time for submission processing
- Zero data loss during conflict resolution
- Complete audit trail for all operations

### Enhancement Phase 1: Advanced Detection (6-8 weeks)
**Goals**: Reduce false negatives, improve automation

**Features**:
- Fuzzy name matching with confidence scoring
- Phone number normalization (international formats)
- Email alias detection (gmail+tags, dots)
- Bulk duplicate detection and resolution
- Automated resolution for high-confidence matches

### Enhancement Phase 2: Cross-Tenant Marketplace (8-12 weeks)  
**Goals**: Enable candidate marketplace across employers

**Features**:
- Cross-employer duplicate detection (opt-in)
- Privacy-preserving candidate fingerprinting
- Marketplace consent and data sharing controls
- Advanced representation conflict scenarios
- API for external ATS integration

### Enhancement Phase 3: AI-Powered Matching (12-16 weeks)
**Goals**: Machine learning enhanced duplicate detection

**Features**:
- ML model training on historical duplicates
- Advanced feature extraction (education, skills, experience)
- Candidate similarity scoring
- Predictive conflict detection
- Continuous model improvement pipeline

### Parking Lot: Research Areas
- **GDPR Compliance**: Right to be forgotten, data portability
- **International Support**: Multi-country phone/address formats  
- **Enterprise SSO**: Identity provider integration for candidate matching
- **Blockchain**: Candidate consent and data provenance tracking
- **Real-time Notifications**: WebSocket updates for conflict alerts

## Critical Success Factors

### Performance Requirements
- **Submission Processing**: <2s end-to-end including duplicate detection
- **Conflict Detection**: Real-time flagging, <5s resolution query
- **Bulk Operations**: Handle 10K+ candidate imports efficiently
- **Query Performance**: Sub-second response for recruiter/employer views

### Data Quality Requirements  
- **Duplicate Detection Accuracy**: >99% for exact matches, >95% for fuzzy
- **False Positive Rate**: <5% requiring manual review
- **Audit Completeness**: 100% change tracking with attribution
- **Data Consistency**: Zero orphaned records or constraint violations

### Scalability Targets
- **Volume**: Support 1M+ candidates, 100K+ recruiters, 10K+ employers
- **Concurrency**: Handle 1K+ simultaneous submissions
- **Growth**: 2x data growth annually with linear performance scaling
- **Availability**: 99.9% uptime for duplicate detection services

## Implementation Notes

### Database Considerations
- **PostgreSQL 14+** required for advanced JSONB and trigger features
- **Partitioning strategy** for Submission and audit tables by date
- **Index optimization** for alias lookups and time-based queries  
- **Connection pooling** essential for high-concurrency workloads

### Security Requirements
- **Row-level security** for multi-tenant data isolation
- **Encryption at rest** for PII in PersonAlias and Submission tables
- **API rate limiting** to prevent duplicate detection abuse
- **Admin action logging** for compliance and audit requirements

This schema design provides a robust foundation for duplicate detection that meets all 6 requirements while enabling future enhancements. The separation of concerns between identity (PersonAlias), submissions (Submission), and representation (Representation) creates a scalable architecture that can evolve with business needs.