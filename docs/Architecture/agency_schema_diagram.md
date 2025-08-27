# Agency ATS Schema - Table Relationships

## Entity Relationship Diagram - Agency Focus

```
                    AGENCY CORE ENTITIES
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│  AGENCY_SETTINGS│       │     PEOPLE      │       │   PERSON_ROLES  │
│ ┌─────────────┐ │       │ ┌─────────────┐ │       │ ┌─────────────┐ │
│ │ id (PK)     │ │       │ │ id (PK)     │ │◄──────┤ │ id (PK)     │ │
│ │ agency_name │ │       │ │ email (UQ)  │ │       │ │ person_id   │ │
│ │ agency_type │ │       │ │ first_name  │ │       │ │ role_type   │ │
│ │ specializ.  │ │       │ │ last_name   │ │       │ │ is_active   │ │
│ │ commission  │ │       │ │ phone       │ │       │ └─────────────┘ │
│ └─────────────┘ │       │ │ linkedin    │ │       └─────────────────┘
└─────────────────┘       │ └─────────────┘ │                │
                          └─────────────────┘                │
                                   │                         │
                                   │                         │
           ┌───────────────────────┼─────────────────────────┘
           │                       │
           │                       ▼
           │               ┌─────────────────┐
           │               │   CANDIDATES    │
           │               │ ┌─────────────┐ │
           │               │ │ id (PK)     │ │
           │               │ │ person_id   │ │◄─┐
           │               │ │ recruiter_id│ │  │
           │               │ │ status      │ │  │
           │               │ │ current_co  │ │  │
           │               │ │ salary      │ │  │
           │               │ │ skills      │ │  │
           │               │ │ master_rec_id│ │ │ (duplicate handling)
           │               │ └─────────────┘ │  │
           │               └─────────────────┘  │
           │                        │          │
           │                        │          │
           ▼                        │          │
   ┌─────────────────┐              │          │
   │     CLIENTS     │              │          │
   │ ┌─────────────┐ │              │          │
   │ │ id (PK)     │ │              │          │
   │ │ company_name│ │              │          │
   │ │ industry    │ │              │          │
   │ │ status      │ │              │          │
   │ │ tier        │ │              │          │
   │ │ recruiter_id│ │──────────────┘          │
   │ └─────────────┘ │                         │
   └─────────────────┘                         │
           │                                   │
           │                                   │
           ▼                                   │
   ┌─────────────────┐                        │
   │CLIENT_CONTACTS  │                        │
   │ ┌─────────────┐ │                        │
   │ │ id (PK)     │ │                        │
   │ │ person_id   │ │◄───────────────────────┘
   │ │ client_id   │ │
   │ │ job_title   │ │
   │ │ decision_mkr│ │
   │ │ primary     │ │
   │ └─────────────┘ │
   └─────────────────┘
           │
           │
           ▼
   ┌─────────────────┐       ┌─────────────────┐
   │   JOB_ORDERS    │       │   SUBMISSIONS   │
   │ ┌─────────────┐ │       │ ┌─────────────┐ │
   │ │ id (PK)     │ │◄──────┤ │ id (PK)     │ │
   │ │ client_id   │ │       │ │ candidate_id│ │◄─┐
   │ │ hm_id       │ │       │ │ job_order_id│ │  │
   │ │ recruiter_id│ │       │ │ recruiter_id│ │  │
   │ │ job_title   │ │       │ │ client_status│ │  │
   │ │ description │ │       │ │ offer_amount│ │  │
   │ │ salary_range│ │       │ │ commission  │ │  │
   │ │ order_status│ │       │ └─────────────┘ │  │
   │ │ fee_percent │ │       └─────────────────┘  │
   │ └─────────────┘ │                           │
   └─────────────────┘                           │
           │                                     │
           │                                     │
           ▼                                     │
   ┌─────────────────┐                          │
   │   PLACEMENTS    │                          │
   │ ┌─────────────┐ │                          │
   │ │ id (PK)     │ │                          │
   │ │ submission_id│ │◄─────────────────────────┘
   │ │ candidate_id│ │
   │ │ job_order_id│ │
   │ │ recruiter_id│ │
   │ │ client_id   │ │
   │ │ start_date  │ │
   │ │ salary      │ │
   │ │ fee_amount  │ │
   │ │ status      │ │
   │ └─────────────┘ │
   └─────────────────┘
           │
           │
           ▼
   ┌─────────────────┐       ┌─────────────────┐
   │   COMMISSIONS   │       │    INVOICES     │
   │ ┌─────────────┐ │       │ ┌─────────────┐ │
   │ │ id (PK)     │ │       │ │ id (PK)     │ │
   │ │ placement_id│ │       │ │ client_id   │ │
   │ │ recruiter_id│ │       │ │ placement_id│ │
   │ │ amount      │ │       │ │ invoice_num │ │
   │ │ due_date    │ │       │ │ amount      │ │
   │ │ status      │ │       │ │ status      │ │
   │ └─────────────┘ │       │ │ payment_date│ │
   └─────────────────┘       │ └─────────────┘ │
                             └─────────────────┘
```

## Duplicate Detection System

```
              DUPLICATE DETECTION WORKFLOW
   ┌─────────────────┐       ┌─────────────────┐
   │   CANDIDATES    │       │CANDIDATE_DUPS   │
   │ ┌─────────────┐ │       │ ┌─────────────┐ │
   │ │ id (PK)     │ │◄──────┤ │ id (PK)     │ │
   │ │ person_id   │ │       │ │ primary_id  │ │
   │ │ email       │ │────┐  │ │ duplicate_id│ │
   │ │ phone       │ │    │  │ │ match_type  │ │
   │ │ resume_url  │ │    │  │ │ confidence  │ │
   │ │ master_rec_id│ │◄───┼──┤ │ status      │ │
   │ └─────────────┘ │    │  │ └─────────────┘ │
   └─────────────────┘    │  └─────────────────┘
                          │
                          │  MATCHING ALGORITHMS:
                          │  • Email exact match
                          │  • Name + phone similarity
                          │  • Resume content analysis
                          │  • LinkedIn profile matching
                          │  • Address similarity
                          └─ • Previous company overlap
```

## Activity Tracking & Communication

```
   ┌─────────────────┐       Related Entity Types:
   │   ACTIVITIES    │       ┌─────────────────┐
   │ ┌─────────────┐ │       │ • candidate     │
   │ │ id (PK)     │ │       │ • client        │
   │ │ user_id     │ │       │ • job_order     │
   │ │ related_type│ │◄──────┤ • placement     │
   │ │ related_id  │ │       │ • submission    │
   │ │ activity_type│ │       └─────────────────┘
   │ │ subject     │ │       
   │ │ content     │ │       Activity Types:
   │ │ scheduled_at│ │       ┌─────────────────┐
   │ │ completed_at│ │       │ • call          │
   │ └─────────────┘ │       │ • email         │
   └─────────────────┘       │ • meeting       │
                             │ • note          │
                             │ • task          │
                             │ • interview     │
                             └─────────────────┘
```

## Business Flow Patterns

### 1. Client Onboarding Flow
```
New Client → Client Record → Client Contacts → Job Order → Candidate Search
     ↓             ↓              ↓              ↓              ↓
  clients    client_contacts    people     job_orders     candidates
```

### 2. Placement Process Flow
```
Candidate → Job Match → Submission → Client Review → Interview → Offer → Placement → Commission
    ↓           ↓           ↓             ↓           ↓         ↓         ↓            ↓
candidates   job_orders  submissions   activities  interviews  offers  placements  commissions
```

### 3. Duplicate Resolution Flow
```
New Candidate → Duplicate Detection → Confidence Scoring → Manual Review → Merge/Keep Separate
      ↓                 ↓                    ↓                  ↓              ↓
  candidates    candidate_duplicates   confidence_score   manual_review   master_record_id
```

## Key Tables and Their Purpose

### Core People Management
| Table | Purpose | Key Features |
|-------|---------|--------------|
| `people` | Universal person storage | Email uniqueness, contact info |
| `person_roles` | Role assignments | Multiple roles per person |
| `candidates` | Candidate-specific data | Skills, salary, availability |

### Client Management
| Table | Purpose | Key Features |
|-------|---------|--------------|
| `clients` | Client companies | Industry, size, tier classification |
| `client_contacts` | People at client companies | Decision-making authority |
| `client_relationships` | Agency-client relationship | Contract terms, commission rates |

### Job & Placement Management  
| Table | Purpose | Key Features |
|-------|---------|--------------|
| `job_orders` | Client job requirements | Salary, skills, timeline |
| `submissions` | Candidate submissions | Client feedback, interview status |
| `placements` | Successful hires | Salary, fees, guarantee period |

### Financial Management
| Table | Purpose | Key Features |
|-------|---------|--------------|
| `commissions` | Individual payouts | Split commissions, payment tracking |
| `invoices` | Client billing | Payment terms, status tracking |

## Advanced Features

### Duplicate Candidate Detection
```sql
-- Automatic duplicate detection triggers
CREATE OR REPLACE FUNCTION detect_candidate_duplicates()
RETURNS TRIGGER AS $$
BEGIN
    -- Email exact match
    INSERT INTO candidate_duplicates (primary_candidate_id, duplicate_candidate_id, match_type, confidence_score)
    SELECT NEW.id, c.id, 'email', 95.0
    FROM candidates c
    JOIN people p1 ON c.person_id = p1.id
    JOIN people p2 ON NEW.person_id = p2.id
    WHERE p1.email = p2.email AND c.id != NEW.id;
    
    -- Name + phone similarity
    INSERT INTO candidate_duplicates (primary_candidate_id, duplicate_candidate_id, match_type, confidence_score)
    SELECT NEW.id, c.id, 'name_phone', 85.0
    FROM candidates c
    JOIN people p1 ON c.person_id = p1.id
    JOIN people p2 ON NEW.person_id = p2.id
    WHERE similarity(p1.first_name || ' ' || p1.last_name, p2.first_name || ' ' || p2.last_name) > 0.8
    AND p1.phone = p2.phone AND c.id != NEW.id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### Commission Calculation
```sql
-- Automatic commission calculation
CREATE VIEW commission_summary AS
SELECT 
    p.recruiter_id,
    pp.first_name || ' ' || pp.last_name as recruiter_name,
    COUNT(p.id) as placements_ytd,
    SUM(p.placement_fee) as total_fees,
    SUM(c.net_commission) as total_commissions,
    AVG(c.commission_percentage) as avg_commission_rate
FROM placements p
JOIN commissions c ON p.id = c.placement_id
JOIN people pp ON p.recruiter_id = pp.id
WHERE EXTRACT(year FROM p.created_at) = EXTRACT(year FROM CURRENT_DATE)
  AND p.placement_status = 'active'
GROUP BY p.recruiter_id, pp.first_name, pp.last_name;
```

### Performance Indexes
```sql
-- Core performance indexes for agency workflow
CREATE INDEX idx_people_email ON people(email);
CREATE INDEX idx_candidates_recruiter ON candidates(recruiter_id);
CREATE INDEX idx_candidates_status ON candidates(candidate_status);
CREATE INDEX idx_job_orders_client ON job_orders(client_id);
CREATE INDEX idx_submissions_candidate_job ON submissions(candidate_id, job_order_id);
CREATE INDEX idx_placements_recruiter ON placements(recruiter_id);
CREATE INDEX idx_commissions_recruiter ON commissions(recruiter_id);

-- Duplicate detection indexes
CREATE INDEX idx_people_name ON people(first_name, last_name);
CREATE INDEX idx_people_phone ON people(phone);
CREATE INDEX idx_candidate_duplicates_confidence ON candidate_duplicates(confidence_score);

-- Full-text search
CREATE INDEX idx_candidates_search ON candidates USING GIN(to_tsvector('english', 
    (SELECT first_name || ' ' || last_name FROM people WHERE id = person_id)));
```

This agency-focused schema emphasizes the unique needs of recruiting agencies: client relationship management, commission tracking, duplicate candidate detection, and placement-focused workflows.