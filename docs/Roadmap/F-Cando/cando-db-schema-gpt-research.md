chatgpt - 2025-08-10 12pm

Alright — let’s go deep on the trade-offs here like an ATS/database architect would, and I’ll keep it practical for your recruiter-agency scale and your PostgreSQL/Supabase plan.

⸻

1. Notes: In Candidate Table vs Separate Notes Table

Option A: Notes in candidate table
	•	Pros
	•	No joins needed — one query gets candidate + note
	•	Simple for cases where there’s only one note per candidate
	•	Cons
	•	You can only store one note — can’t track multiple recruiter updates over time
	•	You lose history — overwriting notes loses context
	•	Not great for collaborative recruiting, where multiple recruiters may add different info
	•	If notes get long, you risk bloating the row size (affects performance for large datasets)

⸻

Option B: Separate candidate_notes table
	•	Pros
	•	Supports multiple notes per candidate (time-stamped, authored, categorized)
	•	Scales well — millions of notes don’t bloat your main candidate table
	•	Works for structured queries like “find all candidates with availability notes in last 30 days”
	•	Lets you store long text without slowing down candidate list queries
	•	Cons
	•	You’ll need a JOIN (or a second query) when retrieving notes
	•	More storage overhead: candidate_id, created_at, updated_at repeated per row

⸻

Why “repeated candidate_id” isn’t actually a big problem
	•	Disk space: Even if candidate_id is UUID (16 bytes) and you have 10 million notes, that’s ~160 MB just for IDs — tiny compared to resume PDFs or images.
	•	PostgreSQL is designed for normalized schemas with repeated keys — index lookups on UUIDs or ints are extremely fast.
	•	The main overhead is query joins, but in practice:
	•	You rarely need all notes for all candidates in bulk
	•	You usually fetch notes only when viewing one candidate’s profile or exporting

Verdict for ATS: 99% of large ATS systems (Ashby, Greenhouse, Bullhorn) use a separate notes table — because recruiter communication history matters more than shaving a join.

⸻

2. Communications: Notes vs Separate Communication Table
	•	Notes table = freeform recruiter context
	•	Communication table = structured log of messages, calls, Slack, etc.
	•	Keep separate because:
	•	Notes are internal recruiter thoughts
	•	Communications are events with the candidate, often with timestamps, medium, and even full message bodies
	•	You may want to filter “show me candidates we last called more than 30 days ago” — that’s hard if you mix notes + comms

Typical setup:

candidate_notes
---------------
note_id
candidate_id
note_type
note_text
created_by
created_at

candidate_communications
------------------------
comm_id
candidate_id
comm_type (email, call, slack)
direction (inbound, outbound)
subject
message_body
timestamp


⸻

3. Resumes — Use Cases & Frequency

Use cases:
	•	Always display latest resume
	•	Rarely, see history of multiple resumes (1% cases)
	•	Search for keywords in resumes (high-value use case in recruiting)
	•	Store possibly large files (PDFs, DOCX)

Implication for DB design:
	•	Store resume metadata + parsed text in a candidate_resumes table
	•	Keep only latest_resume_id in candidate table for quick access
	•	Parsed text column should be full-text indexed for keyword search (PostgreSQL tsvector with GIN index)

⸻

4. Portfolio URLs — Use Cases & Frequency

Reality:
	•	98% of candidates have no portfolio links
	•	Searching portfolios is rare except for specific role sourcing (e.g., “must have GitHub”)
	•	Often you just want to display them in profile

Implication:
	•	Two options:
	1.	Separate table (normalized): avoids storing nulls for 98% of rows, makes search fast if indexed on link_type
	2.	JSONB column in candidate: good if you mostly just display links and only rarely filter

⸻

PostgreSQL JSONB + GIN Indexing
	•	JSONB = binary-optimized JSON storage in PostgreSQL
	•	Allows indexing inside JSON objects/arrays
	•	GIN index = Generalized Inverted Index, great for searching keys/values inside JSONB efficiently
	•	Example:

CREATE INDEX idx_portfolio_links ON candidates USING gin (portfolio_links jsonb_path_ops);

Now you can query:

SELECT * FROM candidates
WHERE portfolio_links @> '[{"type": "github"}]';


	•	This means you can keep portfolios as JSON but still query them fast — no full table scans.

⸻

My Recommendation for You (Supabase/Postgres)
	•	candidate table: core searchable fields + portfolio_links JSONB (GIN indexed)
	•	candidate_resumes table: store multiple, keep text for search
	•	candidate_notes table: for recruiter context
	•	candidate_communications table: for actual calls/emails/messages
	•	documents table optional for homework/cover letters (low volume)

This way:
	•	You avoid joins for portfolios since 98% don’t have them — just one nullable JSONB field
	•	You normalize resumes and notes because they’re higher-volume and often queried
	•	You get full-text search for resumes and fast JSON search for portfolios

⸻

Nice — good, specific points. I dug into Bullhorn + Recruiterflow docs and Postgres best practices and distilled practical, ATS-grade guidance you can act on. Short version up front, then concrete options and a small schema tweak.

Key takeaways (TL;DR)
	•	Compensation = candidate-level source-of-truth (store canonical comp on candidate). Duplicate the value on a submission/candidate_job when you send it to a client so you know what was told to employer. (RecruiterFlow supports job-candidate custom fields; Bullhorn stores salary on candidate records.)  ￼ ￼
	•	Audit important changes (comp, availability, work_auth, remote_preference) in a small candidate_field_history table — don’t audit every tiny field change.  ￼
	•	Communications = separate table (structured events: email, call, slack). Notes = separate table (freeform recruiter context). Both are standard in mature ATSs.  ￼ ￼
	•	Work auth (global): model as a normalized lookup (country + auth type) or JSONB with a small enumerated canonical set per country. Bullhorn has onboarding/I-9 & compliance tooling — treat auth as an auditable, configurable picklist.  ￼
	•	Portfolios: JSONB with a GIN index is an OK tradeoff for mostly-empty optional data; if you search links often, use a small portfolio_links table. Postgres GIN/JSONB supports indexed queries.  ￼

Below is the reasoning, examples, and options — concise bullets per your style.
	1.	Compensation: where to store, and how to duplicate safely

	•	Problem: recruiter A and B may talk to candidate; comp rarely changes, but you must show what was told on each submission.
	•	Recommended pattern:
	•	candidate.comp_min, candidate.comp_max — canonical (NULL if unknown).
	•	submission.comp_min, submission.comp_max — copied snapshot at time of submit (what employer was told).
	•	Add candidate_field_history entry only when canonical comp changes (old/new, who, when).
	•	Data types:
	•	store salary as integer in cents (or whole dollars) — safer than floats. Use NULL for unknown; do not use 0.
	•	If you need halves (e.g., 3.5 years elsewhere) use decimal for experience, but comp is best as integer cents.
	•	Why this matches enterprise practice:
	•	Bullhorn and other ATSs keep salary on candidate records and populate offer documents from those fields. Copying on submission is standard for audit/offer generation.  ￼ ￼

	2.	Minimal audit trail (who changed what & when)

	•	Keep a targeted candidate_field_history table (only for fields that matter: comp, availability, work_auth, remote_pref). Schema:
	•	history_id, candidate_id, field_name, old_value (JSONB), new_value (JSONB), changed_by, changed_at
	•	Why targeted: full row-auditing is large and noisy; most ATSes audit changes to critical fields only. You can always add triggers later if you want full audit.  ￼

	3.	Multiple recruiters / per-job differences

	•	Reality: some values are universal (education, work history), some are per-opportunity (availability for a specific start date, interview readiness).
	•	Design:
	•	candidate = canonical fields (comp, contact, home location, work_auth, years_exp)
	•	candidate_job or submission (for per-job data): candidate_id, job_id, recruiter_id, submission_comp_min, submission_comp_max, remote_pref_for_job, notes_snapshot
	•	When a recruiter updates candidate canonical comp, optionally prompt to push to active submissions (or not).
	•	RecruiterFlow explicitly supports job-candidate custom fields when something is job-specific. Use that pattern.  ￼

	4.	Notes vs Communications

	•	Keep two tables:
	•	candidate_notes (internal, freeform; note_type; created_by; created_at)
	•	candidate_communications (structured: comm_type=email|call|slack|sms, direction, subject, body, timestamp, user_id)
	•	Reason: recruiter commentary (notes) is not the same as recorded candidate communications (needed for SLA, compliance, follow-ups). RecruiterFlow and other tools log communications separately.  ￼

	5.	Remote / location modeling (short list of options)

	•	Minimal set of fields (use unknown default):
	•	work_arrangement enum: [unknown, remote_only, hybrid, onsite]
	•	remote_states varchar[] or JSONB (US state codes) — null if not applicable
	•	onsite_location struct: {city, state, country} nullable
	•	commute_radius_miles integer nullable
	•	UI rule: default unknown; prompt recruiter to ask when unknown. This prevents bad data and matches your request.

	6.	Work Authorization — global, configurable approach

	•	Two ways (pick based on admin complexity):
	•	Normalized lookup (recommended): work_authorization_types table with rows {id, country_code, code, display_label}. Candidate links to many types in candidate_work_authorizations (candidate_id, type_id, details, expires_at).
	•	JSONB: candidate.work_authorization = [{country: 'US', type:'H1B', expires:'2026-11-01'}, ...] with admin picklists.
	•	For US-specific flows:
	•	Keep an extra i9_status, i9_docs_uploaded, i9_verified_at fields or link to Bullhorn-style onboarding flow. Bullhorn provides I-9/onboarding modules and configurable picklists for compliance.  ￼
	•	UX: make the admin list editable so each customer can add their country-specific auth types (Bullhorn-style picklists and consent config exist for this).  ￼

	7.	Portfolios & Resumes — frequency-informed trade-offs

	•	Facts:
	•	Most candidates: 0 portfolio links; few have many.
	•	Most candidates: 1 resume; tiny percent have versions.
	•	Options:
	•	Portfolios:
	•	Option A (recommended if you rarely filter by links): candidate.portfolio_links JSONB + GIN index (allows @> queries for e.g. GitHub). Good for Supabase/Postgres and avoids joins for the 98% empty case.  ￼
	•	Option B (if you search links often): normalized portfolio_links table (candidate_id, type, url) with an index on type and url.
	•	Resumes:
	•	candidate_resumes table with file_id, candidate_id, uploaded_at, is_current, parsed_text_tsvector (store parsed text for FTS).
	•	Create a tsvector column and GIN index for resume full-text search (Postgres FTS). Avoid storing large text on main candidate row.  ￼
	•	Why: Postgres JSONB + GIN works and is supported by docs, but expression indexes or small normalized table work better if you query a single attribute frequently.  ￼ ￼

	8.	How Bullhorn & RecruiterFlow actually behave (what I found)

	•	Bullhorn
	•	Candidate records include salary/job preferences and have robust APIs and onboarding/I-9 modules for compliance. You can configure picklists and automate documents (salary/start date used in offer docs). Bullhorn is built for staffing scale.  ￼ ￼
	•	RecruiterFlow
	•	CRM/ATS with job-candidate custom fields, automation recipes to update fields, and communication logging; geared to modern boutique agencies and supports per-job custom fields when needed. Use job-candidate fields for job-specific values, but canonical candidate fields exist too.  ￼

	9.	Concrete schema tweak (compact)

	•	Candidate (canonical)
	•	candidate_id, name, email, phone, home_city, home_state, years_exp decimal, comp_min_cents int, comp_max_cents int, work_auth JSONB, portfolio_links JSONB, created_at, updated_at
	•	Candidate_resumes
	•	resume_id, candidate_id, file_id, uploaded_at, is_current bool, parsed_text_tsvector (GIN)
	•	Candidate_notes
	•	note_id, candidate_id, note_type, note_text, created_by, created_at
	•	Candidate_communications
	•	comm_id, candidate_id, comm_type, direction, subject, body, timestamp, user_id
	•	Submission / candidate_job (snapshot at submission)
	•	submission_id, candidate_id, job_id, recruiter_id, submitted_comp_min_cents, submitted_comp_max_cents, submitted_remote_pref, submission_created_at
	•	Candidate_field_history (targeted audit)
	•	history_id, candidate_id, field_name, old_value JSONB, new_value JSONB, changed_by, changed_at

	10.	Practical UX rules for data quality

	•	Default unknown for preference fields (remote, availability, comp) → force recruiter to ask if business-critical.
	•	Use NULL (not 0) for unknown compensation.
	•	When a candidate updates comp/remote, create a candidate_field_history row automatically (trigger or app logic).
	•	When submitting, snapshot candidate canonical comp into submission so you never lose what you told that employer.

⸻
1
Key Design Decisions

1. Context notes
	•	Don’t attach a notes column to every field — you’ll blow up the schema and make queries messy.
	•	Instead:
	•	Have one candidate_notes table keyed by candidate_id.
	•	Store: note_id, candidate_id, note_type (freeform, compensation, availability, etc.), note_text, created_at, created_by.
	•	This way you can keep multiple recruiter comments, time-stamped, without polluting the main table.

⸻

2. JSON vs searchable fields
	•	If you’ll want to filter or search, store as structured fields or in a separate relational table.
	•	JSON is fine for:
	•	Documents metadata (resumes, cover letters, homework)
	•	Portfolios if you’re not filtering by type or URL
	•	If you want to filter (e.g., find everyone with a GitHub link):
	•	Either split portfolio_urls into a separate table with columns (candidate_id, type, url) — searchable with indexes
	•	Or, if you use PostgreSQL, you can store JSONB and create GIN indexes to make JSON fields searchable — but that’s more advanced DB work

⸻

Candidate Table — Core Fields

candidate
---------
candidate_id (PK)
first_name
last_name
email
phone
location_city
location_state
location_country
remote_preference (enum array: remote_only, hybrid, onsite, unknown)
availability_status (enum: active, passive, not_looking, unknown)
availability_last_verified (date)
start_date_exact (date, nullable)
start_date_estimate (string, nullable)
comp_base_min (integer, nullable)
comp_base_max (integer, nullable)
comp_equity (string, nullable)
comp_benefits (JSON array)
source_type (enum: direct_application, sourced, referral, agency_submission, event, database)
refer_id (string, nullable)
years_experience (decimal(4,1), nullable)
years_exp_last_calculated (date, nullable)
created_at
updated_at


⸻

Portfolio Table (Searchable)

portfolio_links
---------------
link_id (PK)
candidate_id (FK)
link_type (enum: personal_site, github, dribbble, linkedin, other)
url (string, indexed for search)
created_at


⸻

Documents Table (JSON allowed, not for direct filtering)

documents
---------
document_id (PK)
candidate_id (FK)
doc_type (enum: resume, cover_letter, homework)
metadata (JSONB — version_notes, assignment_name, uploaded_at)
file_storage_id (string)
created_at


⸻

Notes Table

candidate_notes
---------------
note_id (PK)
candidate_id (FK)
note_type (enum: general, availability, compensation, remote_pref, portfolio, sourcing, client_feedback)
note_text (text)
created_by (user_id)
created_at


⸻

Searching Examples
	•	Find all candidates with GitHub links
→ Query portfolio_links where link_type='github'
	•	Find candidates available in <30 days
→ Filter start_date_exact if present; if null, parse start_date_estimate where text matches patterns (“week”, “month”)
	•	Find candidates with Python in resume
→ Only possible if you store resume text in a searchable column or use a full-text search engine (Elasticsearch, Postgres full-text)
	•	Find candidates sourced via referral and still active
→ Filter source_type='referral' and availability_status='active'

⸻

Why this works for you
	•	Keeps core fields searchable and clean.
	•	Keeps notes separate so recruiters can dump context without blowing up schema.
	•	Uses separate table for portfolios so you can filter by URL type.
	•	Allows JSON for docs since you won’t be filtering by them directly.
	•	Supports PostgreSQL JSONB indexing if you want more advanced search later.

⸻

1. History Tracking — Keep or Drop?

Reality check from ATSs like Bullhorn / Greenhouse
	•	They do track history for important structured fields like availability, compensation, work authorization
	•	They don’t store a full history of every field in the main record — that’s too heavy and noisy
	•	They use an activity log or audit table for changes
	•	History is mostly used for recruiter accountability and compliance, not everyday searching

Recommendation for you
	•	Keep current values in the main candidate table
	•	Create a candidate_field_history table for important fields that change


Alright — let’s design this the way Bullhorn, Greenhouse, and other mature ATSs handle it, with the realities of recruiter-agency life in mind.
We’ll tackle:
	1.	History tracking for changing fields
	2.	Multiple recruiters handling the same candidate
	3.	Remote/on-site nuance
	4.	Work authorization
	5.	Schema that’s ATS-grade and scalable

⸻

1. History Tracking — Keep or Drop?

Reality check from ATSs like Bullhorn / Greenhouse
	•	They do track history for important structured fields like availability, compensation, work authorization
	•	They don’t store a full history of every field in the main record — that’s too heavy and noisy
	•	They use an activity log or audit table for changes
	•	History is mostly used for recruiter accountability and compliance, not everyday searching

Recommendation for you
	•	Keep current values in the main candidate table
	•	Create a candidate_field_history table for important fields that change:

candidate_field_history
-----------------------
history_id (PK)
candidate_id (FK)
field_name (string)
old_value (string/JSON)
new_value (string/JSON)
changed_by (user_id)
changed_at (timestamp)


	•	Only add to history table for selected fields (e.g., compensation_range, availability_status, remote_preference, work_authorization)

⸻

2. Multiple Recruiters, Different Info

Problem
	•	One candidate can be in multiple jobs, with multiple recruiters adding different info
	•	Some data (education, work history) should be global for the candidate
	•	Some data (compensation range, location preference, availability) is job-specific

Solution
	•	Split schema into:
	•	Candidate core profile — static, universal info
	•	Candidate-job relationship table — recruiter/job-specific info

candidate_job
-------------
candidate_job_id (PK)
candidate_id (FK)
job_id (FK)
recruiter_id (FK)
comp_min
comp_max
remote_preference
location_preference
availability_status
work_authorization
last_updated


	•	This is how Bullhorn handles per-job variations in candidate info

⸻

3. Remote/On-Site Nuance

Instead of a single “remote” field, model work arrangement as:

work_arrangement (enum: remote_only, hybrid, onsite)
remote_eligible_states (array of state codes, nullable)  -- For remote hires restricted to certain states
onsite_location (city/state/country, nullable)           -- For onsite/hybrid roles
commute_radius_miles (integer, nullable)

This avoids confusion — “remote” doesn’t overwrite on-site preferences.

⸻

4. Work Authorization

For the US, store as enum values with possible multi-select for candidates with multiple authorizations:

work_authorization
------------------
US_Citizen
Green_Card
H1B
F1
OPT
Other (string)

For non-US candidates, add:

country
work_authorization_status
visa_expiration_date (nullable)

In Postgres, this can be:
	•	work_authorization JSONB array for multi-country storage
	•	Or separate table for global compliance

⸻

5. Proposed Schema

candidate — global static profile

candidate
---------
candidate_id (PK)
first_name
last_name
email
phone
location_home_city
location_home_state
location_home_country
years_experience (decimal)
education_summary (text)
work_history_summary (text)
work_authorization (JSONB array)
created_at
updated_at

candidate_job — recruiter/job-specific info

candidate_job
-------------
candidate_job_id (PK)
candidate_id (FK)
job_id (FK)
recruiter_id (FK)
comp_min (int)
comp_max (int)
comp_currency (string)
remote_preference (enum)
onsite_location (string, nullable)
commute_radius_miles (int, nullable)
availability_status (enum)
available_start_date (date, nullable)
available_start_estimate (string, nullable)
last_updated

candidate_field_history — field-level audit

candidate_field_history
-----------------------
history_id (PK)
candidate_id (FK)
field_name (string)
old_value (JSONB)
new_value (JSONB)
changed_by (user_id)
changed_at (timestamp)

candidate_notes — recruiter notes

candidate_notes
---------------
note_id (PK)
candidate_id (FK)
note_type (enum)
note_text
created_by (user_id)
created_at

candidate_communications — emails, calls, Slack messages

candidate_communications
-------------------------
comm_id (PK)
candidate_id (FK)
comm_type (enum: email, phone, slack, sms, other)
direction (enum: inbound, outbound)
subject (string, nullable)
message_body (text)
timestamp
sent_by (user_id)


⸻

Why This Matches Industry Best Practice
	•	Bullhorn: separates candidate, job-specific data, and communication history
	•	Greenhouse: keeps global profile + per-job profile, tracks changes on critical fields
	•	Work authorization & remote: flexible enough for global recruiting + US compliance
	•	History table: only for important fields to keep DB light and auditable

⸻

If you want, I can make an ATS-grade ER diagram for this so you can see the joins and which parts are job-specific vs global — that’s exactly how Greenhouse and Bullhorn visualize their back-end.

Do you want me to prepare that diagram?

Got it — here’s a deep, clear recap on the Option A identity model, how to store unique vs mutable fields, and what top ATS and recruiter tools do for duplicates and multi-agency submissions. I’ll break it down carefully to make the concepts solid.

⸻

1. Option A: Identity model and data storage explained

The core entities
	•	Person (or Candidate) — the canonical real-world individual.
	•	RecruiterCandidate — a recruiter-specific view of that person, containing info gathered by that recruiter.
	•	JobSubmission — one submission of a recruiter’s candidate to a job.

What goes where?

Field type	Stored in Person	Stored in RecruiterCandidate
Unique stable identifiers	Person	(Usually not duplicated here)
- Email	Yes	Optional (recruiter might have alternate)
- Phone	Yes	Optional (recruiter may record own)
- LinkedIn URL	Yes	Optional
- GitHub URL	Yes	Optional
Name (mutable)	Yes (but may change)	Yes (recruiter-specific nicknames, variations)
Education	Yes	No
Work history	Yes	No
Years of experience	Yes	No
Compensation expectation	No	Yes (each recruiter may hear different)
Notes and communications	No	Yes (recruiter-specific context)
Portfolio URLs	Usually in RecruiterCandidate (optional) or a separate linked table	Yes (if needed)

Why split like this?
	•	Person holds the core canonical identity and stable attributes that define who the candidate really is.
	•	RecruiterCandidate holds recruiter-specific, mutable data — personal opinions, notes, multiple resume versions, compensation conversations, etc.
	•	This allows multiple recruiters to have different versions of “the truth” without overwriting each other’s info.

⸻

2. How do we identify duplicates and store the info?
	•	You store unique attributes (email, phone, LinkedIn, GitHub) in the Person table. These serve as keys to link new recruiter candidate records to an existing Person.
	•	When a new candidate is added by a recruiter, you:
	•	Search for an existing Person with matching email/phone/LinkedIn/GitHub.
	•	If found, link the new RecruiterCandidate record to that Person.
	•	If not, create a new Person and link.
	•	Names (and nicknames, alternate spellings) go into RecruiterCandidate since they can vary per recruiter or change over time.
	•	Education and work history, which are relatively stable and core, stay in Person.

⸻

3. What do top ATS and recruiting platforms do?

Platform	Duplicate Handling	Multi-agency Submission Handling
Bullhorn	- Deduplicate based on unique IDs (email, phone).- Maintains canonical candidate record.- Allows multiple recruiter records linked.	- Enforces exclusivity per job and company.- Detects duplicates and prevents multiple submissions of same candidate to same job/company by different recruiters.
RecruiterFlow	- Similar dedupe on unique identifiers.- Recruiter-specific data stored separately.	- Submission exclusivity enforced.- Tracks which recruiter owns which job submission.
Greenhouse	- Internal deduplication during import and manual merge.- Stores canonical candidate.	- Less focused on agency multi-recruiter submissions.- Primarily designed for internal recruitment teams.
Ashby	- Deduplication with unique identifiers.- Allows manual merges and linkage.	- Supports multi-agency but requires custom rules for exclusivity.

	•	Bullhorn and RecruiterFlow are known for multi-agency workflows and strict duplicate enforcement since they serve recruiting agencies.
	•	Greenhouse and Ashby primarily focus on employer-side ATS workflows, with less complexity on agency duplicate handling but still support merges and deduplication.

⸻

4. Summary and best practice recommendation
	•	Keep Person as the single canonical candidate, storing stable unique identifiers, education, work history.
	•	Store name and mutable fields per recruiter in RecruiterCandidate, so nicknames or recruiter-specific notes don’t clash.
	•	Use unique attributes for deduplication and linking on insert/update — email, phone, LinkedIn, GitHub.
	•	For ambiguous cases, flag for manual merge or review.
	•	Enforce submission exclusivity at the Person + job/company level to prevent double submissions.
	•	Audit changes at both Person and RecruiterCandidate level for history and compliance.

⸻

If you want, I can draft a precise ERD showing Person, RecruiterCandidate, JobSubmission, and how unique attributes and mutable fields are split. That might help your team visualize and get buy-in.

Would that be helpful next?

Exactly — this is a classic tradeoff between pragmatic design and edge case coverage.

Here’s a balanced approach to handle this gracefully without overcomplicating or hurting performance:

⸻

1. Optimize for 99.99% common case
	•	Keep Person table as the canonical source of truth for unique IDs (email, phone, LinkedIn, GitHub).
	•	Deduplicate strictly on these fields with exact matching — fast indexed lookups.
	•	Keep recruiter-specific variants in RecruiterCandidate (including notes about conflicting IDs).
	•	Update Person unique IDs carefully, ideally only on manual review or verified corrections.

2. Detect and flag edge cases without breaking flow
	•	Maintain a duplicate_candidate_candidates or candidate_aliases table: stores all unique ID variants from all recruiters linked to the same Person.
	•	When a new candidate comes in, match against all known unique IDs across Person + aliases (fast indexed queries).
	•	If a new unique ID is found that’s not in Person but matches an alias, flag for manual review — no automatic merge or overwrite.
	•	This lets you detect “hidden” duplicates without overloading the Person table or slowing down critical queries.

3. Minimize performance penalty
	•	Index all unique IDs in the alias table for quick lookup.
	•	Cache recent alias lookups to reduce repeated DB hits.
	•	Perform full alias matching asynchronously (batch jobs) if needed, with notifications to recruiters or admins.
	•	Keep Person table minimal with the most trusted unique IDs; aliases hold everything else.

4. Auditing & provenance
	•	Log all unique ID updates with timestamp, user, and source recruiter.
	•	Store original recruiter-submitted data in RecruiterCandidate for full history.
	•	Allow rollback or manual correction if discrepancies appear.

⸻

Summary
	•	Keep Person table simple and fast for majority dedupe
	•	Add a linked alias table to catch and flag edge cases
	•	Do not auto-merge or auto-overwrite unique IDs — require human review
	•	Use indexes and caching to avoid performance degradation

This design balances performance, simplicity, and risk mitigation, handling your rare edge cases without slowing down day-to-day workflows.

⸻

Recommended schema:
Sure! Here’s a clear explanation of each table’s purpose, plus how to handle history logging:

⸻

Table Purposes
	1.	Person

	•	The canonical candidate record.
	•	Stores core candidate info that doesn’t vary by recruiter (education, work history).
	•	Represents the unique individual in your system.

	2.	PersonIdentifiers

	•	Stores unique IDs for a person: email, phone, LinkedIn, GitHub.
	•	Used for duplicate detection across recruiters and submissions.
	•	Allows multiple unique IDs per person.

	3.	RecruiterCandidate

	•	Stores the candidate info as submitted by a specific recruiter.
	•	Includes recruiter-specific versions of names, emails, phones, notes, typos, updates.
	•	Enables each recruiter to see exactly what they entered.

	4.	RecruiterCandidateIdentifiers

	•	Stores the unique IDs (email, phone, LinkedIn, GitHub) as provided by each recruiter for their candidate.
	•	Helps with duplicate detection and recruiter-specific visibility.

	5.	Employer

	•	Employer/company data.

	6.	Submission

	•	Immutable log of candidate submissions to employers (jobs optional).
	•	Records which recruiter submitted which candidate to which employer and when.
	•	Stores snapshot of contact info used in submission (from RecruiterCandidateIdentifiers).
	•	Includes representation start/end dates per submission.

	7.	Representation (optional)

	•	Tracks who currently holds representation rights for a candidate at an employer.
	•	Allows quick lookup and enforcement of exclusive representation rules.

⸻

History/Change Log Table
	•	Purpose: Track changes across critical tables (e.g., RecruiterCandidate data, PersonIdentifiers).
	•	Design:
	•	Single centralized ChangeLog table with fields:
	•	id (PK)
	•	entity_type (e.g., ‘RecruiterCandidate’, ‘PersonIdentifiers’)
	•	entity_id (the primary key of the changed row)
	•	changed_by (user or system)
	•	change_type (insert/update/delete)
	•	changed_at (timestamp)
	•	change_data (JSON or text snapshot of changed fields)
	•	Benefits:
	•	One place to audit all key changes without duplicating log tables.
	•	Easier to maintain and query for history/audit trail.
	•	Supports rollback, debugging, compliance.

⸻

Summary

Table	Purpose	Notes
Person	Unique candidate info shared across recruiters	Core identity
PersonIdentifiers	Unique IDs for Person	Used for duplicate detection
RecruiterCandidate	Recruiter-specific candidate info and contact	Each recruiter’s view and data
RecruiterCandidateIdentifiers	Recruiter-specific unique IDs	Helps duplicate detection & recruiter view
Employer	Employer/company info	
Submission	Immutable candidate submission log	Includes representation period
Representation	Tracks current rep holder per employer	Optional, for quick lookups
ChangeLog	Audit/history of changes for key entities	Single log for all tracked tables


⸻

If you want, I can draft a sample ChangeLog table schema and example queries next. Would you like that?