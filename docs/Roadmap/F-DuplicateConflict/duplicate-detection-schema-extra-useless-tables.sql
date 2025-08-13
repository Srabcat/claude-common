-- Duplicate Detection Tables Schema
-- Designed to meet 6 core requirements from F-Duplicate.md
-- 1. One canonical record per candidate (Person table)
-- 2. Track every submission across recruiters/agencies (Submission table)
-- 3. Real-time duplicate/conflict detection (PersonAlias + triggers)
-- 4. History of identifier changes (PersonAliasHistory table)
-- 5. Visibility for all stakeholders (views and permissions)
-- 6. Time-bound exclusive representation (Representation table)

-- Core entity: One canonical record per unique candidate
CREATE TABLE Person (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Metadata
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'merged', 'archived')),
    merged_into_person_id UUID REFERENCES Person(id), -- If this person was merged into another
    
    -- System tracking
    created_by_submission_id UUID, -- First submission that created this person
    last_updated_by_submission_id UUID -- Most recent submission that updated this person
);

-- Unique identifiers linked to canonical Person - enables efficient deduplication
CREATE TABLE PersonAlias (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    person_id UUID NOT NULL REFERENCES Person(id) ON DELETE CASCADE,
    
    -- Identity attributes
    alias_type VARCHAR(20) NOT NULL CHECK (alias_type IN ('email', 'phone', 'linkedin', 'github')),
    alias_value VARCHAR(500) NOT NULL,
    
    -- Tracking
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by_submission_id UUID NOT NULL, -- Which submission added this alias
    is_primary BOOLEAN DEFAULT FALSE, -- Primary email/phone for this person
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'superseded')),
    
    -- Constraints
    UNIQUE(alias_type, alias_value), -- Each unique identifier can only belong to one person
    UNIQUE(person_id, alias_type, is_primary) WHERE is_primary = TRUE -- Only one primary per type per person
);

-- History of all identifier changes for requirement #4
CREATE TABLE PersonAliasHistory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    person_alias_id UUID NOT NULL REFERENCES PersonAlias(id),
    
    -- What changed
    change_type VARCHAR(20) NOT NULL CHECK (change_type IN ('created', 'updated', 'deactivated', 'superseded')),
    old_value VARCHAR(500),
    new_value VARCHAR(500),
    
    -- When and who
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    changed_by_submission_id UUID NOT NULL,
    reason TEXT,
    
    -- Admin override tracking
    is_admin_override BOOLEAN DEFAULT FALSE,
    admin_user_id UUID -- References admin who made the change
);

-- Immutable log of all recruiter submissions - requirement #2
CREATE TABLE Submission (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Core relationships
    person_id UUID NOT NULL REFERENCES Person(id),
    recruiter_id UUID NOT NULL, -- References User/Recruiter table
    agency_id UUID NOT NULL,    -- References Agency table
    employer_id UUID NOT NULL,  -- References Employer table
    
    -- Timing
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    submission_window_start DATE, -- For 6-month representation window calculation
    submission_window_end DATE,
    
    -- Submission data (recruiter's view of candidate)
    candidate_name VARCHAR(200) NOT NULL,
    email VARCHAR(320),
    phone VARCHAR(50),
    linkedin_url VARCHAR(500),
    github_url VARCHAR(500),
    
    -- Additional recruiter-specific data
    notes TEXT,
    expected_salary_min INTEGER,
    expected_salary_max INTEGER,
    currency_code VARCHAR(3) DEFAULT 'USD',
    resume_url VARCHAR(500),
    portfolio_url VARCHAR(500),
    
    -- Status and flags
    status VARCHAR(30) DEFAULT 'submitted' CHECK (status IN (
        'submitted',           -- Initial submission
        'duplicate_detected',  -- Flagged as duplicate
        'conflict_detected',   -- Representation conflict
        'approved',           -- Approved for representation
        'rejected',           -- Rejected by employer
        'admin_review',       -- Pending admin review
        'superseded'          -- Replaced by newer submission
    )),
    
    -- Duplicate detection results
    is_duplicate BOOLEAN DEFAULT FALSE,
    duplicate_reason TEXT, -- "Email overlap", "Phone overlap", etc.
    detected_duplicates JSONB, -- Array of submission IDs that are duplicates
    
    -- Representation conflict flags
    has_representation_conflict BOOLEAN DEFAULT FALSE,
    conflict_details JSONB, -- Details about the conflict
    
    -- System metadata
    is_admin_corrected BOOLEAN DEFAULT FALSE,
    admin_corrections JSONB, -- Log of admin corrections
    original_submission_data JSONB -- Backup of original data before any corrections
);

-- Time-bound exclusive representation per employer - requirement #6
CREATE TABLE Representation (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Core relationships
    person_id UUID NOT NULL REFERENCES Person(id),
    recruiter_id UUID NOT NULL,
    agency_id UUID NOT NULL,
    employer_id UUID NOT NULL,
    submission_id UUID NOT NULL REFERENCES Submission(id),
    
    -- Time bounds (6-12 months typically)
    starts_at TIMESTAMP WITH TIME ZONE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    
    -- Status
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN (
        'active',      -- Currently representing
        'expired',     -- Time period ended
        'revoked',     -- Admin revoked
        'superseded'   -- Replaced by new representation
    )),
    
    -- Conflict resolution
    superseded_by_representation_id UUID REFERENCES Representation(id),
    conflict_resolution_notes TEXT,
    resolved_by_admin_id UUID,
    resolved_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints: Only one active representation per person per employer
    UNIQUE(person_id, employer_id, status) WHERE status = 'active'
);

-- Conflict detection and resolution tracking
CREATE TABLE ConflictDetection (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- What triggered the conflict
    trigger_type VARCHAR(30) NOT NULL CHECK (trigger_type IN (
        'new_submission',      -- New submission detected duplicate
        'attribute_change',    -- Email/phone change triggered recheck
        'representation_overlap', -- Multiple active representations
        'manual_review'        -- Admin initiated review
    )),
    trigger_submission_id UUID REFERENCES Submission(id),
    
    -- Conflict details
    conflict_type VARCHAR(30) NOT NULL CHECK (conflict_type IN (
        'duplicate_candidate', -- Same person submitted by different recruiters
        'representation_conflict', -- Multiple recruiters claiming representation
        'attribute_mismatch',  -- Same person with different key attributes
        'timeline_overlap'     -- Representation periods overlap
    )),
    
    -- Involved parties
    person_id UUID NOT NULL REFERENCES Person(id),
    employer_id UUID NOT NULL,
    conflicting_submission_ids JSONB NOT NULL, -- Array of submission IDs in conflict
    conflicting_recruiter_ids JSONB NOT NULL,  -- Array of recruiter IDs in conflict
    
    -- Detection details
    detected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    detection_reason TEXT NOT NULL,
    confidence_score DECIMAL(3,2) CHECK (confidence_score BETWEEN 0 AND 1),
    
    -- Resolution
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN (
        'pending',     -- Awaiting resolution
        'resolved',    -- Conflict resolved
        'false_positive', -- Not actually a conflict
        'escalated'    -- Requires human review
    )),
    resolution_type VARCHAR(30) CHECK (resolution_type IN (
        'first_submitter_wins',    -- First recruiter keeps representation
        'most_recent_wins',        -- Most recent recruiter gets representation
        'admin_decision',          -- Admin manually decided
        'employer_choice',         -- Employer picked recruiter
        'merge_candidates',        -- Candidates were actually different people
        'split_representation'     -- Different representation for different roles
    )),
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolved_by_admin_id UUID,
    resolution_notes TEXT
);

-- Audit trail for all duplicate detection operations
CREATE TABLE DuplicateDetectionLog (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- What was checked
    operation_type VARCHAR(30) NOT NULL CHECK (operation_type IN (
        'submission_check',    -- Checking new submission for duplicates
        'attribute_recheck',   -- Re-checking after attribute change
        'bulk_recheck',       -- Bulk duplicate detection run
        'manual_check'        -- Admin initiated check
    )),
    
    -- Input data
    input_submission_id UUID REFERENCES Submission(id),
    input_person_id UUID REFERENCES Person(id),
    search_criteria JSONB, -- What attributes were used for matching
    search_window_start DATE,
    search_window_end DATE,
    
    -- Results
    matches_found INTEGER DEFAULT 0,
    matching_person_ids JSONB, -- Array of person IDs that matched
    matching_submission_ids JSONB, -- Array of submission IDs that matched
    
    -- Execution details
    executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    execution_time_ms INTEGER,
    algorithm_version VARCHAR(20) DEFAULT '1.0',
    
    -- Results processing
    conflicts_created INTEGER DEFAULT 0,
    representations_updated INTEGER DEFAULT 0,
    admin_alerts_sent INTEGER DEFAULT 0
);

-- Indexes for performance
CREATE INDEX idx_person_status ON Person(status) WHERE status = 'active';
CREATE INDEX idx_person_created_at ON Person(created_at);

CREATE INDEX idx_person_alias_lookup ON PersonAlias(alias_type, alias_value);
CREATE INDEX idx_person_alias_person ON PersonAlias(person_id);
CREATE INDEX idx_person_alias_active ON PersonAlias(status) WHERE status = 'active';

CREATE INDEX idx_submission_person ON Submission(person_id);
CREATE INDEX idx_submission_recruiter_employer ON Submission(recruiter_id, employer_id);
CREATE INDEX idx_submission_employer_date ON Submission(employer_id, submitted_at);
CREATE INDEX idx_submission_duplicate ON Submission(is_duplicate) WHERE is_duplicate = TRUE;
CREATE INDEX idx_submission_conflict ON Submission(has_representation_conflict) WHERE has_representation_conflict = TRUE;
CREATE INDEX idx_submission_window ON Submission(employer_id, submission_window_start, submission_window_end);

CREATE INDEX idx_representation_active ON Representation(person_id, employer_id, status) WHERE status = 'active';
CREATE INDEX idx_representation_expiry ON Representation(expires_at) WHERE status = 'active';
CREATE INDEX idx_representation_recruiter ON Representation(recruiter_id, status);

CREATE INDEX idx_conflict_pending ON ConflictDetection(status, detected_at) WHERE status = 'pending';
CREATE INDEX idx_conflict_person_employer ON ConflictDetection(person_id, employer_id);

CREATE INDEX idx_duplicate_log_submission ON DuplicateDetectionLog(input_submission_id);
CREATE INDEX idx_duplicate_log_execution ON DuplicateDetectionLog(executed_at);

-- Views for stakeholder visibility (requirement #5)

-- Recruiter view: Only their own submission data
CREATE VIEW recruiter_submissions AS
SELECT 
    s.id,
    s.person_id,
    s.submitted_at,
    s.candidate_name,
    s.email,
    s.phone,
    s.status,
    s.is_duplicate,
    s.duplicate_reason,
    s.has_representation_conflict,
    r.status as representation_status,
    r.expires_at as representation_expires
FROM Submission s
LEFT JOIN Representation r ON s.id = r.submission_id AND r.status = 'active'
WHERE s.recruiter_id = current_user_id(); -- Assumes current_user_id() function exists

-- Employer view: Only current representative's data
CREATE VIEW employer_candidates AS
SELECT DISTINCT
    p.id as person_id,
    s.candidate_name,
    s.email,
    s.phone,
    s.linkedin_url,
    s.github_url,
    s.notes,
    s.expected_salary_min,
    s.expected_salary_max,
    s.currency_code,
    s.resume_url,
    s.portfolio_url,
    r.recruiter_id,
    r.agency_id,
    r.starts_at as representation_start,
    r.expires_at as representation_end
FROM Person p
JOIN Representation r ON p.id = r.person_id
JOIN Submission s ON r.submission_id = s.id
WHERE r.status = 'active' 
  AND r.employer_id = current_employer_id(); -- Assumes current_employer_id() function exists

-- Admin view: Full conflict and duplicate visibility
CREATE VIEW admin_conflicts AS
SELECT 
    cd.id as conflict_id,
    cd.conflict_type,
    cd.detected_at,
    cd.status as conflict_status,
    p.id as person_id,
    cd.employer_id,
    cd.conflicting_submission_ids,
    cd.conflicting_recruiter_ids,
    cd.detection_reason,
    cd.confidence_score,
    cd.resolution_type,
    cd.resolved_at
FROM ConflictDetection cd
JOIN Person p ON cd.person_id = p.id
WHERE cd.status IN ('pending', 'escalated')
ORDER BY cd.detected_at DESC;

-- Platform overview: Duplicate detection metrics
CREATE VIEW duplicate_detection_metrics AS
SELECT 
    DATE_TRUNC('day', detected_at) as detection_date,
    conflict_type,
    COUNT(*) as conflicts_detected,
    COUNT(*) FILTER (WHERE status = 'resolved') as conflicts_resolved,
    COUNT(*) FILTER (WHERE status = 'pending') as conflicts_pending,
    AVG(confidence_score) as avg_confidence
FROM ConflictDetection
WHERE detected_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE_TRUNC('day', detected_at), conflict_type
ORDER BY detection_date DESC;

-- Triggers for automatic duplicate detection (requirement #3)

-- Function to detect duplicates on new submission
CREATE OR REPLACE FUNCTION detect_duplicates_on_submission()
RETURNS TRIGGER AS $$
DECLARE
    matching_person_id UUID;
    existing_submission_ids UUID[];
    conflict_id UUID;
BEGIN
    -- Look for existing person with same email or phone within 6-month window
    SELECT DISTINCT pa.person_id 
    INTO matching_person_id
    FROM PersonAlias pa
    WHERE pa.status = 'active'
      AND (
        (pa.alias_type = 'email' AND pa.alias_value = NEW.email AND NEW.email IS NOT NULL)
        OR 
        (pa.alias_type = 'phone' AND pa.alias_value = NEW.phone AND NEW.phone IS NOT NULL)
      )
      AND EXISTS (
        SELECT 1 FROM Submission s2 
        WHERE s2.person_id = pa.person_id 
          AND s2.employer_id = NEW.employer_id
          AND s2.submitted_at >= NEW.submitted_at - INTERVAL '6 months'
      )
    LIMIT 1;

    IF matching_person_id IS NOT NULL THEN
        -- Update submission as duplicate
        UPDATE Submission 
        SET is_duplicate = TRUE,
            duplicate_reason = CASE 
                WHEN EXISTS (
                    SELECT 1 FROM PersonAlias 
                    WHERE person_id = matching_person_id 
                      AND alias_type = 'email' 
                      AND alias_value = NEW.email
                ) THEN 'Email overlap'
                ELSE 'Phone overlap'
            END
        WHERE id = NEW.id;

        -- Get conflicting submission IDs
        SELECT ARRAY_AGG(s.id)
        INTO existing_submission_ids
        FROM Submission s
        WHERE s.person_id = matching_person_id
          AND s.employer_id = NEW.employer_id
          AND s.submitted_at >= NEW.submitted_at - INTERVAL '6 months'
          AND s.id != NEW.id;

        -- Create conflict detection record
        INSERT INTO ConflictDetection (
            trigger_type,
            trigger_submission_id,
            conflict_type,
            person_id,
            employer_id,
            conflicting_submission_ids,
            conflicting_recruiter_ids,
            detection_reason,
            confidence_score
        ) VALUES (
            'new_submission',
            NEW.id,
            'duplicate_candidate',
            matching_person_id,
            NEW.employer_id,
            json_build_array(NEW.id) || to_jsonb(existing_submission_ids),
            json_build_array(NEW.recruiter_id),
            'Duplicate detected: same email/phone within 6-month window',
            0.95
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for duplicate detection on submission
CREATE TRIGGER trigger_detect_duplicates
    AFTER INSERT ON Submission
    FOR EACH ROW
    EXECUTE FUNCTION detect_duplicates_on_submission();

-- Function to recheck duplicates when aliases change
CREATE OR REPLACE FUNCTION recheck_duplicates_on_alias_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Log the duplicate detection recheck
    INSERT INTO DuplicateDetectionLog (
        operation_type,
        input_person_id,
        search_criteria,
        executed_at,
        algorithm_version
    ) VALUES (
        'attribute_recheck',
        COALESCE(NEW.person_id, OLD.person_id),
        json_build_object(
            'trigger', 'alias_change',
            'old_value', OLD.alias_value,
            'new_value', NEW.alias_value
        ),
        NOW(),
        '1.0'
    );

    -- TODO: Implement full duplicate recheck logic
    -- This would involve re-running duplicate detection for all submissions
    -- involving this person across all employers within the time window

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger for alias changes
CREATE TRIGGER trigger_recheck_on_alias_change
    AFTER UPDATE OR DELETE ON PersonAlias
    FOR EACH ROW
    EXECUTE FUNCTION recheck_duplicates_on_alias_change();