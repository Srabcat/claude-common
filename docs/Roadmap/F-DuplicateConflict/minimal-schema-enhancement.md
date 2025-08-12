# Minimal Schema Enhancement for Duplicate Detection

## Overview
Enhance existing tables to meet 6 requirements from F-Duplicate.md without creating new tables.

## Changes to person_identifier Table

### New Attributes Added:
```sql
ALTER TABLE person_identifier ADD COLUMN status VARCHAR(20) DEFAULT 'active' 
CHECK (status IN ('active', 'superseded', 'deleted'));

ALTER TABLE person_identifier ADD COLUMN superseded_by_identifier_id UUID 
REFERENCES person_identifier(identifier_id);

ALTER TABLE person_identifier ADD COLUMN change_reason TEXT;
ALTER TABLE person_identifier ADD COLUMN changed_by_person_id UUID REFERENCES person(person_id);
ALTER TABLE person_identifier ADD COLUMN changed_by_table_type VARCHAR(20) 
CHECK (changed_by_table_type IN ('person', 'candidate', 'agency_recruiter'));
```

### Purpose of Each Attribute:

| Attribute | Purpose | Example Usage |
|-----------|---------|---------------|
| `status` | Track identifier lifecycle | 'active' = current email, 'superseded' = old email replaced |
| `superseded_by_identifier_id` | Link to replacement record | Points to new email record when email changes |
| `change_reason` | Why identifier changed | 'typo_correction', 'candidate_update', 'admin_merge' |
| `changed_by_person_id` | Who made the change | References person.person_id who submitted the change |
| `changed_by_table_type` | Which persona made change | 'candidate', 'agency_recruiter', 'person' - clarifies context |

### How It Meets Requirements:
- **Req #4**: "Keep history of identifier changes" - superseded records preserved with timestamps
- **Req #1**: "One canonical record per candidate" - active status shows current identifiers
- **Req #5**: "Give visibility" - change_reason and changed_by provide audit trail

## Changes to candidate_submission Table

### New Attributes Added:
```sql
ALTER TABLE candidate_submission ADD COLUMN is_duplicate BOOLEAN DEFAULT FALSE;
ALTER TABLE candidate_submission ADD COLUMN duplicate_reason TEXT;
ALTER TABLE candidate_submission ADD COLUMN detected_duplicates JSONB;
ALTER TABLE candidate_submission ADD COLUMN has_representation_conflict BOOLEAN DEFAULT FALSE;
ALTER TABLE candidate_submission ADD COLUMN conflict_details JSONB;
```

### Purpose of Each Attribute:

| Attribute | Purpose | Example Usage |
|-----------|---------|---------------|
| `is_duplicate` | Flag duplicate submissions | TRUE when email/phone matches existing submission |
| `duplicate_reason` | Why flagged as duplicate | 'Email overlap', 'Phone overlap', 'Both email and phone' |
| `detected_duplicates` | List of conflicting submissions | `["uuid1", "uuid2"]` - other submission IDs that conflict |
| `has_representation_conflict` | Flag representation conflicts | TRUE when recruiter conflicts with existing representation |
| `conflict_details` | Conflict explanation | `{"existing_recruiter": "uuid", "conflict_type": "active_representation"}` |

### How It Meets Requirements:
- **Req #2**: "Track every submission" - all submissions logged with duplicate flags
- **Req #3**: "Flag real-time duplicates" - is_duplicate and duplicate_reason set on submission
- **Req #6**: "Time-bound exclusive representation" - has_representation_conflict tracks violations
- **Req #5**: "Give visibility" - conflict_details explains what happened

## Existing Tables Used (No Changes Needed):
- `candidate_representation` - already handles time-bound representation (Req #6)
- `duplicate_conflict` - already handles admin conflict resolution (Req #5)

## Critical Design Issues to Resolve

### 1. UI Issue: Multiple Emails - Which to Supersede?
**Problem**: User has 3 emails, changes primary email in UI. Which existing email gets superseded?

**Solutions**:
- **Option A**: Supersede current `is_primary=true` email only
- **Option B**: Mark ALL existing emails as superseded, new email becomes primary
- **Option C**: UI shows existing emails, user selects which to replace

**Recommendation**: Option A - supersede only current primary email

### 2. Database Issue: `changed_by_person_id` Reference
**Problem**: `changed_by_user_id` unclear - could reference wrong table

**Solution**: Added `changed_by_table_type` to clarify persona context:
```sql
changed_by_person_id UUID REFERENCES person(person_id)
changed_by_table_type VARCHAR(20) CHECK (changed_by_table_type IN ('candidate', 'agency_recruiter', 'person'))
```

### 3. Design Clarity: Duplicate vs Representation Conflict

**Two Separate Concepts**:

#### A. Duplicate Detection (Person-Level)
- **Table**: `person_identifier` 
- **Trigger**: Same email/phone across different person records
- **Flag**: Person X and Person Y are actually the same human
- **Resolution**: Merge persons, keep one canonical record

#### B. Representation Conflict (Submission-Level)  
- **Table**: `candidate_submission`
- **Trigger**: Multiple recruiters submit same person to same employer
- **Flag**: Recruiter A vs Recruiter B representation rights
- **Resolution**: First submitter wins, or admin decides

### 4. Submission Flags Logic

**Scenario**: 3 submissions for same person to same employer
- Submission 1 (Day 1): `is_duplicate=false` (first submission)
- Submission 2 (Day 2): `is_duplicate=true` (detected duplicate) 
- Submission 3 (Day 3): `is_duplicate=true` (detected duplicate)

**`detected_duplicates` Array**:
- Submission 1: `[]` (no conflicts when submitted)
- Submission 2: `["submission_1_uuid"]` (conflicts with submission 1)
- Submission 3: `["submission_1_uuid", "submission_2_uuid"]` (conflicts with both)

**`duplicate_reason` Array Format**:
```json
["email_overlap", "phone_overlap"]  // Both email AND phone match
// OR
["email_overlap"]  // Only email matches
```

### 5. Representation Conflict Logic

**`has_representation_conflict`**: TRUE when submission conflicts with existing active representation

**`conflict_details` Format**:
```json
{
  "existing_representation_id": "uuid123",
  "existing_recruiter_person_id": "uuid456", 
  "conflict_type": "active_representation",
  "expires_at": "2025-08-01"
}
```

## Benefits of This Approach:
- ✅ Uses existing schema structure
- ✅ Minimal complexity - just additional columns
- ✅ Meets all 6 requirements
- ✅ No new tables to maintain
- ✅ Simpler queries - no additional joins needed
- ✅ Clear separation: Duplicates = Person-level, Conflicts = Submission-level