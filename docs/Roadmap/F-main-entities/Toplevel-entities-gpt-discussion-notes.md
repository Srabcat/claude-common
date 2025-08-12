# Main Entity Database Schema Discussion Notes
*File created: 2025-08-08*

## Purpose
This file captures the database schema discussions and decisions made with GPT, providing a foundation for continued iteration and refinement.

Great — this is a rich use case with real complexity. You’re building for a multi-tenant hiring platform + recruiting agency ATS, which means you’ll need:
	•	Clean schema design (for speed + maintainability)
	•	Multi-tenancy support
	•	Flexible, evolving data (job fields, candidate tags, etc.)
	•	Auditability (tracking submissions, status changes)

⸻

Here’s a structured schema design breakdown that would cover your bases.

⸻

1. Core Entities
	•	organizations → hiring companies or agencies
	•	users → recruiters, hiring managers, admins
	•	jobs → open roles
	•	candidates → people being considered
	•	applications → candidate’s application to a job
	•	notes, activities, emails → audit trail & CRM
	•	submissions → recruiting agency candidate submissions
	•	stages → e.g. “Phone Screen”, “Onsite”
	•	interviews, feedbacks → interview and review data

⸻

2. High-Level Relationships
	•	organization has_many users
	•	organization has_many jobs
	•	job has_many applications
	•	application belongs_to candidate and job
	•	candidate has_many applications
	•	application has_many notes, interviews, submissions
	•	submission belongs_to agency + candidate + job
	•	user belongs_to organization

⸻

3. Schema Sketch

-- Organizations
CREATE TABLE organizations (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('agency', 'employer')) -- or use ENUM
);

-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id),
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  role TEXT CHECK (role IN ('admin', 'recruiter', 'hiring_manager')),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Candidates
CREATE TABLE candidates (
  id UUID PRIMARY KEY,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  phone TEXT,
  resume_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Jobs
CREATE TABLE jobs (
  id UUID PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id),
  title TEXT,
  department TEXT,
  location TEXT,
  status TEXT CHECK (status IN ('open', 'closed', 'paused')),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Applications (candidate → job)
CREATE TABLE applications (
  id UUID PRIMARY KEY,
  candidate_id UUID REFERENCES candidates(id),
  job_id UUID REFERENCES jobs(id),
  source TEXT,
  status TEXT, -- consider ENUM
  submitted_at TIMESTAMP,
  current_stage TEXT,
  stage_updated_at TIMESTAMP
);

-- Notes
CREATE TABLE notes (
  id UUID PRIMARY KEY,
  application_id UUID REFERENCES applications(id),
  user_id UUID REFERENCES users(id),
  content TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Submissions (by agency)
CREATE TABLE submissions (
  id UUID PRIMARY KEY,
  candidate_id UUID REFERENCES candidates(id),
  job_id UUID REFERENCES jobs(id),
  agency_id UUID REFERENCES organizations(id), -- agency org
  submitted_by UUID REFERENCES users(id), -- recruiter
  submitted_at TIMESTAMP DEFAULT NOW()
);

-- Interviews + Feedback
CREATE TABLE interviews (
  id UUID PRIMARY KEY,
  application_id UUID REFERENCES applications(id),
  scheduled_at TIMESTAMP,
  interviewer_id UUID REFERENCES users(id),
  interview_type TEXT
);

CREATE TABLE feedbacks (
  id UUID PRIMARY KEY,
  interview_id UUID REFERENCES interviews(id),
  reviewer_id UUID REFERENCES users(id),
  rating INTEGER,
  comments TEXT,
  submitted_at TIMESTAMP
);


⸻

4. Smart Add-ons for Flexibility
	•	Custom fields
Allow users to add custom metadata on jobs/candidates
→ custom_fields table, or JSONB on candidates, jobs
	•	Tags
→ tags, candidate_tags, job_tags
	•	Audit trail
→ events table with: entity_type, entity_id, action, actor_id, timestamp, changes JSONB
	•	Stage definitions per org
→ stages table scoped by organization_id

⸻

5. Multi-Tenancy Options
	•	Row-level security (RLS) in Postgres with Supabase: good for strict org isolation
	•	Always filter by organization_id for every user-accessible query
	•	Some tools like Crelate let agencies see multiple orgs — if needed, create a user_organization_roles join table to support that

⸻

6. Design Tips Specific to Recruiting
	•	Track who submitted a candidate — important in agency workflows
	•	Normalize status history instead of overwriting fields (can show timeline)
	•	Index heavily on job_id, candidate_id, application.status, organization_id
	•	Use ENUM types for stage names/status values to avoid chaos

⸻

Want to go deeper?
Send me a few sample use cases like:
	•	“How would I model a candidate submitted to multiple jobs at different companies?”
	•	“How do I store and track feedback across multiple interview rounds?”
	•	“How do I prevent duplicate candidates across agencies?”


---

## Discussion Summary

### [Date] - Initial Discussion
**Participants:** User + GPT

**Topics Covered:**
- [Add your discussion points here]

**Key Decisions:**
- [Add key decisions made]

**Schema Elements Discussed:**
- [Add schema elements discussed]

---

## Current Schema Considerations

### Core Entities
*[To be filled based on GPT discussion]*

### Relationships
*[To be filled based on GPT discussion]*

### Data Types & Constraints
*[To be filled based on GPT discussion]*

---

## Next Steps
- [ ] Review and validate schema with technical team
- [ ] Consider performance implications
- [ ] Plan migration strategy
- [ ] Define data validation rules

---

## Questions & Unresolved Items
*[Add any open questions or items needing resolution]*

---

## References
- Related PRD: [Link to relevant PRD files]
- Technical Requirements: [Link to technical specs if available]