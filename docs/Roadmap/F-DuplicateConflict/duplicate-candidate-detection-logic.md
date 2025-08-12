# Duplicate Candidate Detection Logic

## Schema Foundation

### Updated Candidate Table (Composite Key)
```sql
CREATE TABLE candidate (
    person_id UUID NOT NULL REFERENCES person(person_id),
    recruiter_person_id UUID NOT NULL REFERENCES person(person_id),
    
    -- All candidate fields
    years_experience DECIMAL(4,1),
    comp_range_min INTEGER,
    comp_range_max INTEGER,
    availability_status VARCHAR(20),
    -- ... etc (all existing fields)
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    PRIMARY KEY (person_id, recruiter_person_id)
);
```

### Enhanced person_identifier Table
```sql
ALTER TABLE person_identifier ADD COLUMN status VARCHAR(20) DEFAULT 'active' 
CHECK (status IN ('active', 'superseded', 'deleted'));

ALTER TABLE person_identifier ADD COLUMN superseded_by_identifier_id UUID 
REFERENCES person_identifier(identifier_id);

ALTER TABLE person_identifier ADD COLUMN change_reason TEXT;
ALTER TABLE person_identifier ADD COLUMN changed_by_person_id UUID REFERENCES person(person_id);
ALTER TABLE person_identifier ADD COLUMN changed_by_table_type VARCHAR(20) 
CHECK (changed_by_table_type IN ('candidate', 'agency_recruiter', 'person'));
```

## Duplicate Detection Requirements

### Requirement 1: Detect and maintain one canonical record per candidate
**Implementation**: 
- `person` table stores one canonical record per unique human
- `person_identifier` UNIQUE constraint prevents duplicate emails/phones within tenant
- Multiple `candidate` records allowed per person (different recruiters)

### Requirement 2: Track every candidate linked to canonical candidate
**Implementation**:
- `candidate` table with composite key (person_id, recruiter_person_id)
- Each recruiter can have their own candidate record for same person
- All candidate records link to same canonical person_id

### Requirement 3: Admin can see all duplicate candidates for same canonical candidate
**Implementation**: 
```sql
-- Query to see all candidate records for same person within tenant
SELECT 
    c.person_id,
    c.recruiter_person_id,
    p_recruiter.first_name as recruiter_name,
    c.years_experience,
    c.comp_range_min,
    c.created_at
FROM candidate c
JOIN person p_recruiter ON c.recruiter_person_id = p_recruiter.person_id
WHERE c.person_id = ?
AND EXISTS (
    SELECT 1 FROM person p 
    WHERE p.person_id = c.person_id 
    AND p.tenant_id = current_tenant_id()
);
```

### Requirement 4: Detect duplicates when new candidate added or identifier changed
**Implementation**: PostgreSQL triggers

### Requirement 5: Keep history of identifier changes
**Implementation**: Status-based history in person_identifier table

## Detection Logic Flows

### Flow 1: New Candidate Creation by Recruiter

```
1. Recruiter adds new candidate with email/phone
2. System checks person_identifier for existing email/phone match within tenant
3. IF MATCH FOUND:
   a. Get existing person_id from person_identifier
   b. Create candidate record with (existing_person_id, recruiter_person_id)
   c. Log in duplicate_conflict table if needed for admin review
4. IF NO MATCH:
   a. Create new person record
   b. Create person_identifier records for email/phone
   c. Create candidate record with (new_person_id, recruiter_person_id)
```

### Flow 2: Identifier Change Detection

```
1. Recruiter updates candidate's email/phone
2. Trigger on person_identifier UPDATE/INSERT
3. System checks for matches with new identifier value
4. IF MATCH FOUND with different person_id:
   a. Flag potential duplicate in duplicate_conflict table
   b. Set old identifier status = 'superseded'
   c. Create new identifier with status = 'active'
   d. Alert admin for manual review
5. Update person_identifier history fields
```

### Flow 3: Admin Duplicate Resolution

```
1. Admin reviews duplicate_conflict records with status = 'pending'
2. Admin decides: 'same_person' or 'different_people'
3. IF same_person:
   a. Merge person records (keep one, update references)
   b. Update all candidate records to point to canonical person_id
   c. Mark duplicate identifiers as 'superseded'
4. IF different_people:
   a. Mark conflict as resolved
   b. Keep separate person records
   c. Add notes explaining difference
```

## Engineering Requirements

### Database Triggers Required

#### 1. Duplicate Detection Trigger
```sql
CREATE OR REPLACE FUNCTION detect_duplicate_candidate()
RETURNS TRIGGER AS $$
DECLARE
    existing_person_id UUID;
    conflict_exists BOOLEAN;
BEGIN
    -- Check for existing person with same email/phone within tenant
    SELECT DISTINCT pi.person_id INTO existing_person_id
    FROM person_identifier pi
    JOIN person p ON pi.person_id = p.person_id
    WHERE pi.identifier_value = NEW.identifier_value
    AND pi.identifier_type = NEW.identifier_type
    AND pi.status = 'active'
    AND p.tenant_id = (SELECT tenant_id FROM person WHERE person_id = NEW.person_id)
    AND pi.person_id != NEW.person_id;
    
    IF existing_person_id IS NOT NULL THEN
        -- Check if conflict already exists
        SELECT EXISTS(
            SELECT 1 FROM duplicate_conflict 
            WHERE (person_id_1 = NEW.person_id AND person_id_2 = existing_person_id)
            OR (person_id_1 = existing_person_id AND person_id_2 = NEW.person_id)
            AND status = 'pending'
        ) INTO conflict_exists;
        
        IF NOT conflict_exists THEN
            -- Create conflict record for admin review
            INSERT INTO duplicate_conflict (
                person_id_1, person_id_2, 
                conflict_type, confidence_score,
                employer_tenant_id
            ) VALUES (
                NEW.person_id, existing_person_id,
                CASE NEW.identifier_type 
                    WHEN 'email' THEN 'email_match'
                    WHEN 'phone' THEN 'phone_match'
                END,
                0.95,
                (SELECT tenant_id FROM person WHERE person_id = NEW.person_id)
            );
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_detect_duplicate_candidate
    AFTER INSERT OR UPDATE ON person_identifier
    FOR EACH ROW
    EXECUTE FUNCTION detect_duplicate_candidate();
```

#### 2. Identifier History Trigger
```sql
CREATE OR REPLACE FUNCTION track_identifier_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'UPDATE' AND OLD.identifier_value != NEW.identifier_value THEN
        -- Mark old identifier as superseded
        UPDATE person_identifier 
        SET status = 'superseded',
            superseded_by_identifier_id = NEW.identifier_id,
            updated_at = NOW()
        WHERE identifier_id = OLD.identifier_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_track_identifier_changes
    BEFORE UPDATE ON person_identifier
    FOR EACH ROW
    EXECUTE FUNCTION track_identifier_changes();
```

### Application Layer Requirements

#### 1. Candidate Creation Service
```typescript
async createCandidate(recruiterPersonId: UUID, candidateData: CandidateInput): Promise<CandidateResult> {
    // 1. Check for existing person by email/phone
    const existingPerson = await findPersonByIdentifiers(candidateData.email, candidateData.phone);
    
    let personId: UUID;
    if (existingPerson) {
        personId = existingPerson.person_id;
        // Log that we're using existing person
    } else {
        // Create new person + identifiers
        personId = await createNewPersonWithIdentifiers(candidateData);
    }
    
    // 2. Create candidate record
    const candidate = await createCandidateRecord(personId, recruiterPersonId, candidateData);
    
    // 3. Check for pending conflicts
    const conflicts = await getPendingConflictsForPerson(personId);
    
    return { candidate, conflicts };
}
```

#### 2. Duplicate Resolution Service
```typescript
async resolveDuplicate(conflictId: UUID, resolution: 'same_person' | 'different_people', adminUserId: UUID): Promise<void> {
    const conflict = await getDuplicateConflict(conflictId);
    
    if (resolution === 'same_person') {
        await mergePersons(conflict.person_id_1, conflict.person_id_2);
        await updateAllCandidateReferences(conflict.person_id_2, conflict.person_id_1);
    }
    
    await updateConflictStatus(conflictId, resolution, adminUserId);
}
```

### Performance Considerations

#### Indexes Required
```sql
-- For duplicate detection performance
CREATE INDEX idx_person_identifier_value_type_tenant ON person_identifier(identifier_value, identifier_type, tenant_id) WHERE status = 'active';
CREATE INDEX idx_person_identifier_person_status ON person_identifier(person_id, status);

-- For candidate queries
CREATE INDEX idx_candidate_person_recruiter ON candidate(person_id, recruiter_person_id);
CREATE INDEX idx_candidate_recruiter ON candidate(recruiter_person_id);

-- For conflict resolution
CREATE INDEX idx_duplicate_conflict_status ON duplicate_conflict(status) WHERE status = 'pending';
CREATE INDEX idx_duplicate_conflict_persons ON duplicate_conflict(person_id_1, person_id_2);
```

#### Query Optimization
- Use partial indexes for active identifiers only
- Batch conflict detection for bulk imports
- Cache frequently accessed person-identifier mappings

### Data Integrity Constraints

```sql
-- Ensure recruiter is actually a recruiter
ALTER TABLE candidate ADD CONSTRAINT check_recruiter_type 
CHECK (EXISTS (
    SELECT 1 FROM person 
    WHERE person_id = recruiter_person_id 
    AND person_type IN ('agency_recruiter', 'platform')
));

-- Ensure candidate person is actually a candidate
ALTER TABLE candidate ADD CONSTRAINT check_candidate_type
CHECK (EXISTS (
    SELECT 1 FROM person 
    WHERE person_id = person_id 
    AND person_type = 'candidate'
));
```

## Testing Requirements

### Unit Tests
- Duplicate detection trigger with various email/phone combinations
- Identifier history tracking on updates
- Conflict creation and resolution workflows

### Integration Tests  
- End-to-end candidate creation with duplicate detection
- Multiple recruiters adding same candidate scenario
- Admin conflict resolution workflows

### Performance Tests
- Bulk candidate import with duplicate detection
- Concurrent candidate creation stress testing
- Large-scale identifier change processing

## Monitoring & Alerting

### Metrics to Track
- Duplicate detection rate (% of new candidates flagged)
- Conflict resolution time (time from detection to admin resolution)
- False positive rate (conflicts resolved as 'different_people')
- Performance: duplicate detection trigger execution time

### Alerts
- High number of pending conflicts (>50)
- Duplicate detection trigger failures
- Unusual spike in duplicate detection rate
- Slow conflict resolution times (>24 hours)