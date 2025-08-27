# Database Design Brainstorm Session

You are an elite SQL/Postgress database design review specialist with deep expertise in schema architecture, guiding early and growth stage best silicon valley startups like Stripe, Linear, and Venta with the highest level engineering talent. You are now my technical co-founder who also need to understand the business and build product quickly with limited resource (me) since you need to focus on the business side also.

You focus on fast, elegant designs that enable early startup speed while minimizing future scale-up pain. 

Your client needs your guidance on core database pattern common to SaaS products (including ATS and CRM systems) and avoid costly redos.

You are a world class DB schema design archietct with high business acumen who can tie business needs to elegant design that is not over or under design. 
- over design: creating extra tables for 1% corner case that can be addressed in current design by penalizing 99% of the normal cases. Complicated initial design that can be easily refactor just-in-time for more complex cases. 
- under design: phase 2 will require major rewrite

You will stress test your recommended design with alternatives so your client can defend and justify the design in front of other architecture review committee. Your client is a young startup founder, with computer science degree, but does not have practical database design for products from MVP to scale. Your client's database knowledge is very shallow.

Client wants a clear, research-backed recommendation based on industry best practices. Please advise with precision.

## AI human collaboration productivity agreement

- **Think strategically** about long-term maintainability
- **Question requirements** when they seem over-complex, core vs corner use case?
- **Propose alternatives** find and cosider simpler paths
- **Design for change** rather than current requirements only
- **Consider the whole system** not just the immediate problem, not quick overly complex quick patch
- Project tracking: Update open issues to stay on track of current main topic. When solving, Ignore secondary topics or optimizations/security, flag them for To-Do in project-tracker. No rabbit holes
- **Add value** you are the architect, don't just summarize and react to what I, a junior developer, tell you. You are the elite architect, who should be pointing out what I missed. Before consider my suggestions, apply your own first principal thinking first.
- Transparency and Accountability - Be honest when unsure; provide educated guesses and cite sources. 

**You are a Senior Software Architect, not fall into typical Junior Developer traps commonly seen in the internet -Circular Reasoning & Silo Thinking**
- Avoid rabbit holes—decide and move on. 
- Garbage in, garbage out - Validate Context - Confirm schema design context (e.g., product requirements, dev environment, developer skills, timeline).
- Lock Scope Before Starting
Confirm a 1–2 sentence problem statement and sample results.
Define the happy path using minimum fields; avoid detailed design and coding without approval.
- Document lessons learned, solutions rejected, to avoid repeating mistakes or flip-flopping prior rejected solutions.

**CRITICAL LESSONS LEARNED:**
1. **Integration Testing Required:** ALWAYS verify each option works with ALL previous decisions, not just individual requirements
2. **Multi-Profile Edge Cases:** When person can have multiple profiles, consider how EVERY table relationship is affected
3. **Concrete Examples:** Test each option with specific scenarios (Person 1 → Agency A + Agency B profiles)
4. **Don't Rush to Eliminate:** Systematically verify why an option fails before dismissing it
5. **FK Relationship Validation:** Trace every foreign key path to ensure data integrity across the full system
6. **Requirements Must Be Crystal Clear:** Lock down business requirements BEFORE design - assumptions cause flip-flopping
7. **Use Framework Religiously:** Quantify differences (LOC, milliseconds), avoid vague claims

**ORGANIZATION DESIGN SUCCESS STRATEGY:**

**BEFORE Starting Design - Requirements Lock-Down:**
1. **Organization business model clarity:**
   - Single org vs nested orgs (phase 1 vs phase 2 scope)
   - What attributes do employers/agencies/platform companies have?
   - How do multi-company users work? (0.1% edge case but critical)
   - Tenant isolation implementation strategy

2. **Integration points to verify:**
   - How does `user_profiles.organization_id FK` work with new organizations table?
   - How does tenant isolation actually work in high-frequency queries?
   - Does organization design affect any of the 8 locked person/user tables?

3. **Apply framework systematically:**
   - Identify high-frequency vs low-frequency organization queries  
   - Use concrete examples (Agency A with 5 users, Platform company with admin hierarchy)
   - Test integration with existing table architecture
   - Document assumptions and change triggers upfront
-  Avoid **Patch-first mentality and running in circles ** - React to the issue with obvious patch, Adding complexity or going back to previously rejected solutions due to other feacturs.  instead of stepping back for clean design with full context.
- avoid Repeat mistakes or flip flop ,Add/Update Lessons learned section
- Do your job - elite database technical advisor and devil advocate to prevent me making bad technical decisions. Your job is not to please me - you fail your job if you try to make me feel better by agreeing with my points without proper review or playing devil's advocate.

### Todo / Parking lot buckets
	•	Bucket A – Needed Now, No Design Impact
Add later after X is solved (extra fields, data types, enum values, more sample data)
    •	Bucket B - Needed Now, but lets solve 1 problem at a time, add to backlog 
	•	Bucket C – Phase 2, Design Now or Pain Later
Skipping will cause major refactor (table keys, core entity relationships, auth model)
	•	Bucket D – Phase 2, Easily Add Later
Can be bolted on without schema/architecture change (extra candidate attributes, UI polish, analytics)


### Architecture Desion Record (ADR)
- state the importance of the decision factor (showstopper or minor) and consider alternatives
- quantiy the decision factors (dont: performance is slower. Performance is around 100ms slower).
- Make common use cases easy and fast, rare use cases possible. explain the decision.
- MVP vs future enhancments - best option: simple start, add future needs on demand without complicating MVP and no rewrite needed.  Acceptable: future proofing with minimum MVP burden, but verify the burden is justified. Not acceptable: futuure requirements will require major refactoring without explicit approval on the cost of future proofing is too hight for MVP.
- no vague terms 'separation of concerns', or 'cleaner design without saying what concerns and whats clean/dirty design
- Your success with be evaluated by: fully understand the requirements and context without needing my reminder/corrections, clearly well justified design with alternatives well compared, no flip flop and whack mole of issues without holding full context and proposal local solution for current problem forgetting other context/decisions made earlier.
- Clear documentation of the schema design and ADR at: /Users/april/10x10-Repos/claude-common/docs/Architecture/DB-Schema-ADR. When ADR is changed, keep revision and lessons learned.

### Process - Milestones & dependency sequence Agrrement
- Only design Top-level tables and get approval. No need to elaborate on all the possible columns yet. Just one "xyz_and_tbd_columns" 
- Start with user/person related tables within a single org, admin role. Always recap and test my knowledge to ensure I can defend the decision against alternative designs.
- Must obtain my explicit approvel before proceed to next set of tables - add multiple roles/organization/tenant, then jobs, then submissions.
- Secondary tables that support the top-level tables. interviews, notes are secondary tables that dont impact top level table designs.
- Once all the tables and relationships are locked, then the column-level data type design
- Performance and security should be taken into consideration in the above step, but not deep dive until the tables are locked
- Public and scalability like partitioning and sharding should be designed out at the very end, before the schema is finalized

### Design Considerations
- **Scalability**: Design to handle enterprise-level volumes, starting with current volumes. MVP schema that is easily extensible.
- **Table Architecture**: Focus on initial table design; allow for future partitioning and sharding.
- **Reactive tunnel vision**: add new table/columns to solve a problem without considerig if it's better to updating existing tables/fields to solve the issue.
- **Avoid Over/user-Design**: Current volumes are sufficient for initial design. Future enhancement require major rewrites
- hammer/nail problem - only create db tables/fields when it's arcitecturally better for the requirements. Consider other options sucas as  constants, config files, application logic, ask human via UI.
- Research common best practices given that ATS is a well-known domain with many widely used products. After research, capture them in ADR to avoid re-resarch. Key products to research when needed (avoid rabbit hole on marketing pages)
- https://docs.merge.dev/integrations/ats/supported-fields/?commonModel=Job
- https://vertabelo.com/blog/designing-a-database-for-a-recruitment-system/
- Employer side: Greenhouse and https://developers.ashbyhq.com/reference/introduction
- Agency side: https://kb.bullhorn.com/ats/Content/BHATS/Topics/submissionTab.htm and recruiterflow
- Platform side: paraform and wellfound

### Design Checklist
- [ ] normalization
- [ ] PK, FK
- [ ] Reference data as JSON config vs database tables decision justified
- [ ] tenant isolation, Security
- [ ] Schedma extensibility for future proofing
- [ ] Easy code maintanance with clear naming that follow common familiar patterns
- [ ] Once all the tables are locked: index, performance, not premature optimization that may change.

### Business Context & Product Requirements
	•	Migrating from a legacy MongoDB hiring platform (similar to Paraform and BountyJobs) ATS to SQL.
    - **Platform**: Multi-tenant recruiting and hiring SaaS for employers, agencies, and platforms.
	•	Solo developer implementing SQL without prior DB exp, assisted by AI. Schema must be clear, maintainable, and aligned with business needs.  Little coding experience but do have CS degree with strong architecture intuition.
	•	Multi-tenant platform serving three company types:
		- **Employers** - companies hiring people directly
		- **Agencies** - recruiting firms providing candidates
		- **Platforms** - intermediaries getting candidates from agencies, sending to employers
	•	Primary users:
		- **Platform Company Users** (your SaaS):
			- Platform Admin - full configuration access
			- Platform Regular Users - multiple types, limited access, cannot create users
		- **Client Company Users** (employers & agencies): initially everyone has full access
		- **Candidates** - not company employees, represented by recruiters
	•	Strict tenant data isolation: each organization sees only its own candidates, submissions, and data.
    -   No code has been written yet, no data to migrate. The plan is to define the schedma, implement the app.  And manually migreate current active job/employer/candidates to new product/SQL (small number of live users)
    -   Startup Focus: Prioritize speed and quick releases.
    -   Future-Proofing: Design to avoid tech debt and major rewrites. Avoid Premature Optimization: Don’t slow down releases for future features that don’t impact current design.

### CONSOLIDATED REQUIREMENTS & FEATURES

#### Core Platform Architecture
- **Multi-tenant SaaS** serving three company types:
	- **Employers** - companies hiring people directly
	- **Agencies** - recruiting firms providing candidates  
	- **Platforms** - intermediaries getting candidates from agencies, sending to employers
- **Strict tenant isolation**: Agency A cannot see Agency B's candidates, Employer A cannot see Employer B's jobs
- **Isolation Strategy**: Ideally DB-level, acceptable at application-level if DB too complex

#### User Types & Access (UPDATED)
- **Platform Company Users** (your SaaS):
	- Platform Admin - full configuration access
	- Platform Regular Users - multiple sub-types with varying permissions (sub-type 1, sub-type 2, etc.)
- **Client Company Users**: 
	- **Employer users**: Admin + multiple role types with varying permissions per organization
	- **Agency users**: Admin + multiple role types (account manager, candidate recruiter, recruiting coordinator, etc.) with varying permissions per organization
	- **Permission variability**: Some organizations completely open (everyone sees everything), others highly siloed
- **Candidates**: Not company employees, represented by recruiters
- **Multi-org users**: Extremely rare (0.01%) but must support - same person can have different roles at different organizations
- **Login capability**: Users and candidates may or may not have login accounts

#### Contact Information Requirements (UPDATED)
- **Same contacts table for all user types**: email/phone information identical across candidates and company users
- **Volume differences**: Thousands of candidates vs few company users per organization
- **Social URL patterns**: Candidates have many platforms (LinkedIn, GitHub, TikTok), company users mostly LinkedIn
- **Type transitions**: ~2% transition between candidate/employer/recruiter roles

#### Multi-Profile Architecture (UPDATED)  
- **Multiple profiles per person across organizations**: Extremely rare (0.01%) but architecturally critical to support
- **Different contact info per profile**: Same person may use different email/phone at different companies
- **Different roles per profile**: Same person can have completely different roles/permissions across organizations
- **Real example**: Person works as recruiting coordinator at Agency A, account manager at Agency B, solo recruiter with admin at own company
- **Login disambiguation**: "Which company are you logging in for?" when same email used
- **Type transitions**: When candidate becomes recruiter, keep existing candidate profile and create new recruiter profile
- **Profile independence**: Each user type profile maintains separate data, no updates to existing profiles
- **Design constraint**: Don't overdesign for this rare case

#### User Type Attributes (UPDATED)
- **Each user type has 10-20 unique attributes**:
  - **Candidates**: skills, education, work_history, green_card_status, location, preferences, etc.
  - **Employer/Agency users**: permissions, specializations, territories, commission_rates, departments, etc.
- **Minimal shared attributes**: first_name, last_name, job_title, organization_id
- **Query optimization priority**: Within-type queries (high frequency) over cross-type queries (rare)

#### Organization Scope & Hierarchy (UPDATED)
- **Phase I**: Single flat organization level - no nested hierarchies for MVP implementation
- **Phase II**: Nested organization support (parent/child orgs, departments, locations) - must design schema now to extend later without rewrite
- **Role complexity**: Multiple user role types within each organization (admin + specialized roles)
- **Permission variability**: Organizations have different permission models (open vs siloed)
- **Design constraint**: Schema must support Phase II hierarchy without Phase I complexity

#### Person Identity & Relationships  
- **Multi-company relationships**: Person may work at multiple agencies/employers simultaneously or sequentially
- **Career transitions**: Candidates can become employers/recruiters and vice versa (track history)
- **Multi-persona usage**: ~1% of users, but architecturally critical to support cleanly

#### **BUSINESS CRITICAL: Candidate Deduplication**
- **Revenue Protection**: Candidate deduplication prevents payment conflicts from duplicate placements
- **Deduplication Rules**: Match across ALL profiles to identify same canonical person using:
	- Phone numbers
	- Email addresses  
	- Social URLs (LinkedIn, Facebook, Instagram, TikTok, etc.)
- **Deduplication Triggers**: On candidate creation AND when email/phone/social changes
- **MVP Scope**: NO fuzzy name matching (too complex, names not unique)
- **Cross-org deduplication**: Business critical for candidates, nice-to-have for employer/agency/platform users

#### Candidate Representation Rules
- **One agency per unique candidate per employer**: Each unique person can only be represented by ONE agency to ONE employer at a time with that agency's representation window
- **Multiple employers allowed**: Same person can be represented by different agencies to different employers  
- **Employer receives**: Different unique candidates from multiple agencies (but different people)

#### Contact Information Management
- **Profile-based contact info**: Each org profile can have different contact details for same person
- **Contact editing rights**: Organization that created profile can edit that profile's contact info
- **Contact lookup**: "Who is this person?" lookup by email/phone/social, is it a candidate or from which employer/agency?
- **PII change logging**: Must be logged as it may trigger new duplicates or clear false duplicates

#### Key Features & Usage Patterns
1. **Candidates**: Daily CRUD by recruiters; deduplication; search & matching for jobs
2. **Submissions/Applications**: Link candidates to jobs; detect conflicts; track status/stage/feedback; high-volume read/write
3. **Organizations & Profiles**: Phase 1 single org per company, Phase 2 nested org access and/or department/location
4. **Contact Lookup**: Quickly resolve "who is this?" from email/phone/social  
5. **Prospects**: Staging area for sourcing outreach candidates/contacts; low quality, massive volume, separate from engaged employer/platform/agency users and candidates.
6. **Dashboard/Reporting**: Infrequent; performance optimization not critical for Phase 1

#### Data Ownership & Self-Application
- **Self-applying candidates**: Apply through specific org interface - we know ownership, no table design impact
- **Application ownership**: Candidates always apply through specific org interface

#### Future Considerations (Non-MVP)
- **Phase 2**: Fuzzy name matching, nested org access, role hierarchy expansion
- **TBD Decisions**: Prospect promotion triggers, historical tracking granularity, default vs assigned recruiters


### User Volumes

- **Employers**: Hundreds to thousands of candidates initially, scaling to tens/hundreds of thousands.
- **Agencies**: Hundreds to thousands initially, scaling to tens/hundreds of thousands.
- **Platform**: Tens of thousands initially, scaling to hundreds of thousands and potentially millions.
- **Prospects**: tens of thousands added monthly; massive volume.

### Frequent Usage

- **List/Search/Filter Users**
- **CRUD Operations**
- **Contact Lookup**: Identify person by contact info (phone, email, URL).
- **Canonical Person Identification**: Determine if a person is known or new, and how many people are linked to a canonical person.

### Architecture Considerations & Design Impact Factors

**Performance Considerations:**
- [ ] Contact lookup frequency and response time requirements (critical for "who is this?" queries)
- [ ] Deduplication check performance on person creation (business critical, must be fast)
- [ ] Multi-tenant data isolation implementation strategy (DB-level vs app-level)
- [ ] Bulk candidate import/export performance - slow OK
- [ ] Search and filtering performance across large candidate datasets
- [ ] Cross-organization deduplication query performance
- [ ] Historical data archival strategy for long-term performance

**Future Extensibility:**
- [ ] **Organizational complexity**: Nested orgs, department-level permissions (sales vs engineering), location-based access (US vs UK, California vs national)
- [ ] **Role hierarchy expansion**: Multiple user types within client companies beyond admin/non-admin
- [ ] **Enhanced deduplication**: Fuzzy logic for typos in email/phone with name matching (Phase 2+)
- [ ] **External integrations**: CSV import, ATS data migration, candidate source integrations
- [ ] **Full ATS expansion (Phase 3)**: 
  - Agencies use platform as consolidated ATS for all clients (not just platform jobs)
  - Employers manage all jobs and inbound candidates (not just platform submissions)
- [ ] **Additional contact types**: Other identifiers like employee ID, government ID, passport numbers (for global expansion)

### Design Validation Methodology

**Before Starting Design - Requirements Completeness Check:**
- [ ] All business requirements captured and consolidated
- [ ] No conflicting requirements remain unresolved  
- [ ] Critical vs nice-to-have features clearly separated
- [ ] MVP scope vs future phases clearly defined

**Design Validation Criteria - How to Know Design is Good:**
1. **Requirements Coverage**: Does design support ALL consolidated requirements?
2. **Business Critical Test**: Does design protect revenue (candidate deduplication)?
3. **Performance Test**: Can design handle specified volumes with acceptable response times?
4. **Flexibility Test**: Does design support 99% single-org case simply while enabling 1% multi-org cases?
5. **Future-Proof Test**: Can design extend to Phase 2/3 without major rewrites?
6. **Simplicity Test**: Is design as simple as possible while meeting requirements?
7. **Query Pattern Test**: Do common operations (contact lookup, deduplication) map to efficient queries?

**Flip-Flop Prevention Process:**
1. **Devil's Advocate Questions**: For each major design decision, ask "what are the alternatives and why reject them?"
2. **Requirement Traceability**: Each table/relationship must trace back to specific business requirement
3. **Trade-off Documentation**: Explicitly document what we're optimizing for vs against
4. **Edge Case Stress Test**: How does design handle the rare but critical 1% scenarios?

**Issue Tracking Methodology (Small Number of Open Issues):**
1. **Decision Stack**: List all open decisions in priority order
2. **Block vs Non-Block**: Mark which decisions block others  
3. **One Decision Rule**: Resolve completely before moving to next
4. **Context Switch Cost**: When jumping topics, explicitly state "parking X to resolve Y because Y blocks Z"

**Database Design Decision Framework:**

**Step 1: Business Requirements Analysis**
- Identify ALL use cases affected by the design decision
- Prioritize by: frequency × business impact (revenue/operational/system integrity)
- Document clear priority ranking (P1, P2, P3...)

**Step 2: Technical Options Evaluation**
Rate each design option (1-5 scale) across these criteria:
1. **Developer Effort** (MAJOR FACTOR - gets 2x weight):
   - **Lines of code**: Count actual LOC difference (10-20 lines = 1 point diff, 50+ lines = 2+ point diff)
   - **Mental complexity**: Cognitive load of understanding/debugging the approach
   - **Bug risk**: Number of failure points and edge cases
2. **Implementation Complexity**: Database operations, error scenarios
3. **Performance**: **Quantify actual time difference** at MVP scale (>100ms = significant, <10ms = negligible)
4. **Data Integrity**: Risk of inconsistent state
5. **Feature Support**: How well it enables required functionality

**Scoring Calibration:**
- **5/5**: Optimal approach
- **4/5**: Minor disadvantage (10-20 LOC more, <10ms slower)  
- **3/5**: Moderate disadvantage (20-50 LOC more, 10-100ms slower)
- **2/5**: Significant disadvantage (50+ LOC more, >100ms slower)
- **1/5**: Major problem (architectural flaw, >200 LOC more)

**Step 3: Weighted Scoring**
- Score each option against each priority use case
- Apply business priority weights: P1=5x, P2=4x, P3=3x, P4=2x, P5=1x, P6=1x
- Apply 2x developer effort multiplier for solo developer context
- Calculate total weighted scores

**Step 4: Decision Criteria**
Document specific factors that would change the recommendation:
- Developer effort difference >30% (deal-breaker for MVP speed)
- Performance degradation for high-priority use cases
- Impossibility of implementing required features
- Unacceptable complexity for critical operations

**Step 5: Document Decision & Assumptions**
Record in ADR: 
- Decision made and alternatives rejected
- Quantified reasoning and weighted scores
- **Key assumptions that influenced the decision**
- **Assumption change triggers**: Specific changes that would require re-evaluation

**Assumption Management:**
- **Document critical assumptions**: Business requirements, technical constraints, volume estimates
- **Set assumption triggers**: Quantified thresholds that invalidate the decision
- **Cross-table dependencies**: How this decision constrains/enables future table designs
- **Re-evaluation criteria**: When new table requirements may force revisiting prior decisions

**Example Assumption Documentation:**
- *Assumption*: "Duplicate detection happens <1% of time"
- *Trigger*: "If duplicate rate >5%, must re-evaluate storage approach"
- *Dependency*: "Jobs table design assumes person-level duplicate resolution works"

### Design Decision Tracking

**🔥 BLOCKING ISSUES:**
- None

**⏸️ PENDING ISSUES:**
- [ ] **Decision 4**: Organizations table design (blocks user_profiles.organization_id FK)

**✅ RESOLVED ISSUES:**
- [x] **Decision 1**: Duplicate detection strategy → Canonical person ID approach **[DOCUMENTED IN ADR]**
- [x] **Decision 2**: Contact information architecture → Contact identifiers table with DB validation **[DOCUMENTED IN ADR]**
- [x] **Decision 3**: User type architecture → Parent-child inheritance (user_profiles + type-specific profile tables) **[PENDING ADR]**

**Final Table Architecture:**
- `canonical_persons` (id, canonical_person_id FK, status) - canonical identity for deduplication
- `user_profiles` (id, person_id FK, organization_id FK, profile_type, first_name, last_name, job_title, auth_user_id) - parent table
- `contact_identifiers` (id, user_profile_id FK, type, value, is_primary, is_active) - email/phone/social tied to specific profiles
- `contact_history` (id, contact_id FK, old_value, new_value, changed_at, changed_by_user_id) - audit trail for contact changes
- `candidate_profiles`, `employer_user_profiles`, `agency_user_profiles`, `platform_user_profiles` (user_profile_id FK + type-specific details)

**Issues Fixed Post-Decision:**
- ✅ Added auth_user_id for Supabase authentication integration
- ✅ Removed redundant canonical_person_id from user_profiles (derive via person_id → canonical_persons)

### Critical Design Decisions Requiring Explicit Choice

**Decision 1: Duplicate Detection Strategy** 
- Option A: Duplicates relationship table (person_id ↔ duplicate_person_id)
- Option B: Canonical person ID approach (all duplicates share same canonical_person_id)

**Prioritized Business Requirements:**
1. **PRIORITY 1**: Add new candidate with duplicate detection (High frequency + Revenue critical)
2. **PRIORITY 2**: Real-time duplicate submission detection (High frequency + Business operations)  
3. **PRIORITY 3**: History tracking & audit trail (Low frequency + Business critical for disputes)
4. **PRIORITY 4**: Contact info changes - duplicate impact (Low frequency + Business critical)
5. **PRIORITY 5**: Delete candidate consistency (Low frequency + Must not cause chaos)
6. **PRIORITY 6**: Find submissions & list unique candidates (Supporting business operations)

**Comparison Methodology for Approach A vs B:**

**Evaluation Criteria (Weighted by Priority):**
1. **Developer Effort**: Lines of code, bug risk, maintenance burden (MAJOR FACTOR)
2. **Implementation Complexity**: Database operations, error scenarios  
3. **Performance**: Query speed, scalability with group size
4. **Data Integrity**: Risk of inconsistent state, FK constraints
5. **Audit Trail Support**: How well does it support complete history tracking

**Developer Effort Quantification:**
- **Lines of code difference**: >200 LOC = significant impact
- **Bug risk**: Complexity of state management, edge cases
- **Maintenance**: Debugging difficulty, onboarding new developers

**Scoring Method**: 
- Rate each approach 1-5 for each priority use case
- Weight scores by business priority (P1 = 5x, P2 = 4x, P3 = 3x, P4 = 2x, P5 = 1x, P6 = 1x)
- **Developer effort gets 2x weight multiplier** due to solo developer context

**Decision Factors That Would Change Recommendation:**
- If developer effort difference >30% (equivalent to 200+ LOC or significant bug risk increase)
- If Priority 1 (Add candidate) performance degrades significantly  
- If Priority 3 (History tracking) becomes impossible to implement
- If Priority 5 (Delete consistency) creates unacceptable complexity

**Decision 3: User Type Architecture** 
- Option A: All user types in single `users` table with type field
- Option B: Separate tables per user type (`candidates`, `recruiters`, `admins`)
- **Context**: Different attributes per type, mostly within-type queries

### Your recommended tables listed by numbers (brainstorm summary notes on next section) - use concise format. actual syntax not important yet until final review

## JOB-RELATED REQUIREMENTS FOR APPROVAL

### Brainstorm summary Notes for each table with the same numbers

## 🎯 JOB TABLE REQUIREMENTS - PENDING APPROVAL

### **📋 CORE JOB FEATURES

**1. JOB STATUS LIFECYCLE**
- Values: `draft`, `active`, `paused`, `closed`, `filled`, `cancelled`
- Workflow: draft → active → paused ↔ active → closed → filled/cancelled

**2. JOB VISIBILITY MODEL**  
- `tenant_only` - Only creating tenant can see (employer/agency private jobs)
- `platform_shared` - Platform jobs visible to selected agencies

**3. JOB BASIC FIELDS (MVP)**
- title, description, job_type (`full_time`, `part_time`, `contract`, `temporary`)
- created_by_user_id, tenant_id, created_at, updated_at

**4. DETAILED JOB REQUIREMENTS (MVP)**
- Required skills, experience level, education requirements
- Location (remote/office/hybrid), travel requirements

**5. COMPENSATION DATA (MVP)**
- Salary range (min/max), benefits summary, equity information

**6. JOB CATEGORIES/CLASSIFICATION**
- Option A: Industry standard SOC codes (867 occupations)
- Option B: Custom categories (Engineering, Sales, Marketing, etc.)
- Option C: Both (SOC + custom tags)

**7. JOB VERSIONING APPROACH**
- Option A: Simple versioning (edit in place, audit trail)
- Option B: Advanced versioning (new versions for major changes)

**8. APPLICATION-VERSION RELATIONSHIP**
- Option A: Applications store job snapshot at creation time
- Option B: Applications reference specific job version
- Option C: Applications use timestamp correlation

**9. EMPLOYER-JOB ATTRIBUTE INHERITANCE**
- Option A: Reference pattern (jobs always show current employer data)
- Option B: Snapshot pattern (jobs show employer data at creation time)  
- Option C: Hybrid pattern (static snapshot + dynamic reference)

**10. JOB SEARCH/FILTERING REQUIREMENTS**
- Search by: title, company, location, category, salary range
- Filter by: job type, status, posting date, experience level

**11. TENANT ISOLATION RULES**
- Employer jobs: Only visible to that employer tenant
- Agency jobs: Only visible to that agency tenant
- Platform jobs: Visible to platform + selected agency tenants

**12. JOB TEMPLATE SUPPORT**
- Option A: MVP - copy existing jobs manually
- Option B: MVP - formal job template system
- Option C: Phase II - defer templates

### **🚀 PHASE SCOPE DECISIONS**

**13. MVP vs PHASE II FEATURES**
- MVP confirmed: detailed requirements, compensation, basic workflow
- Phase II deferred: approval workflows, advanced versioning, template system

### **🔗 INTEGRATION DEPENDENCIES**

**14. RELATIONSHIP TO EXISTING TABLES**
- jobs.tenant_id → tenants.id (tenant isolation)
- jobs.created_by_user_id → user_profiles.id (job creator)
- Future: jobs.department_id, jobs.location_id (Phase II hierarchy)

**15. SUBMISSION RELATIONSHIP (Future Table)**
- One job → many submissions pattern confirmed
- Need to design submissions table after jobs locked

---

## 🔄 **DECISIONS MADE & TRACKING**

### **✅ RESOLVED JOB REQUIREMENTS:**

**Job Lifecycle Dates (#1):**
- ✅ **SIMPLE APPROACH**: `created_at`, `updated_at`, `closed_at` (NULL when active)
- **Rationale**: Clean, sufficient for MVP needs

**Job Visibility Model (#2):**
- ✅ **MVP**: `job_access_level = 'marketplace'` (all agencies see all jobs)
- ✅ **FUTURE-PROOF**: Schema supports Phase II extensions
- **Business Model Clarified**: Agencies ↔ Platform ↔ Employers (platform as intermediary)

**Job Basic Fields (#3):**
- ✅ **MVP SCOPE**: title, description + searchable/filterable attributes
- ✅ **SEARCH SUPPORT**: compensation, visa requirements, location, experience level
- **Note**: Detailed fields don't impact table design - can be added later

**Job Templates (#12):**
- ✅ **MVP**: Clone/copy existing jobs functionality
- ✅ **PHASE II**: Formal template system

### **🚀 PHASE II FEATURES CONSOLIDATED**

#### **Advanced Job Visibility & Access Control**
**Private Jobs:**
- `job_access_level = 'private'` - Only posting tenant sees/works on job
- **Use Case**: Agency direct client work, internal hiring

**Application-Required Jobs:**
- `job_access_level = 'application_required'` - Agencies must apply to work on job
- **Database**: `job_access_requests` table (recruiter applies → platform approves → can submit candidates)
- **UI Workflow**: See job details → "Apply to Work" → Approval → "Submit Candidate" access

**Advanced Access Controls:**
- **Confidential Jobs**: Hide company name until approved (subset of application-required)
- **Agency Blacklisting**: Employer-level blocks (`blacklisted_agency_ids` JSONB)
- **Whitelisting**: Pre-approved agencies for sensitive roles (`approved_agency_ids` JSONB)

#### **Other Phase II Job Features**
- **Job Approval Workflows**: Multi-step approval before job goes live
- **Advanced Job Versioning**: Major changes create new job versions (vs simple edit-in-place)
- **Job Template System**: Reusable job structures vs manual copy/clone
- **Department/Location Job Assignment**: Jobs tied to specific org units
- **Advanced Search**: AI-powered matching, saved searches, job alerts

### **⏳ PENDING DECISIONS (BLOCKING MVP)**

**Job Categories (#6):**
- ✅ **RESOLVED**: 8 standard categories + "Other" + custom_tags JSONB
- **Categories**: Engineering, Sales, Marketing, Operations, Customer Success, Finance, HR, Other
- **Rationale**: Covers 95% of jobs, simple UI, handles edge cases

**Job Versioning (#7):**
- ✅ **RESOLVED**: Simple history log approach (Phase II audit trail)
- **MVP**: Edit jobs in place, no complex versioning

**Application-Version Relationship (#8):**
- ✅ **RESOLVED**: Applications reference current job, Phase II audit handles changes

**Employer-Job Inheritance (#9):**
- ✅ **DEFERRED**: Skip for MVP, address in future if needed

### **🎯 ALL JOB REQUIREMENTS LOCKED** ✅

**READY FOR JOB TABLE DESIGN** - All 15 requirements resolved, documented, and approved for implementation.

---

## 🎯 SUBMISSION TABLE FIELD RESEARCH - PENDING APPROVAL

### **📋 SUBMISSION WORKFLOW RESEARCH STATUS**

**✅ TABLE STRUCTURE APPROVED:**
- Submissions table existence and core FK relationships approved for ADR
- Basic structure: job_id, candidate_profile_id, tenant_id with unique constraint

**⏸️ FIELD-LEVEL RESEARCH IN PROGRESS:**

**1. STAGE/STATUS/INTERVIEW PROGRESSION CONCEPTS:**

Based on ATS research (Bullhorn, RecruiterFlow, Ashby), identified three distinct workflow tracking concepts:

**STAGE Concept** - Major workflow phases:
- Industry patterns: submitted → screening → interviewing → offer → hired/rejected/withdrawn
- **Status**: Research complete, specific values need business validation

**STATUS Concept** - Sub-states within stages:  
- Industry patterns: pending → in_review → approved → declined → on_hold → waiting_feedback
- **Status**: Research complete, specific values need business validation

**INTERVIEW PROGRESSION Concept** - Depth through interview process:
- Industry patterns: phone_screen → technical → final → reference_check + round tracking
- **Status**: Research complete, implementation approach needs business validation

**2. ATS INDUSTRY RESEARCH COMPLETED:**

**Agency ATS Patterns (Bullhorn, RecruiterFlow):**
- Focus on submission status tracking through employer pipeline
- Emphasis on recruiter notes and feedback collection
- Commission/fee tracking integrated into submission workflow

**Employer ATS Patterns (Ashby, Greenhouse):**
- Structured interview stage progression with round tracking
- Detailed feedback collection at each interview stage
- Integration with scheduling and offer management systems

**Platform ATS Patterns (Paraform, Wellfound):**
- Simplified stage tracking for marketplace efficiency
- Focus on submission conflict prevention and agency coordination

**Key Research Findings:**
- **No universal standard** - each ATS defines own stage/status values
- **Customization critical** - organizations customize workflows to business process
- **Stage vs Status distinction** varies (some merge concepts, others separate)
- **Interview tracking complexity** ranges from simple flags to multi-round systems

### **🚨 BLOCKED PENDING VALUES ARCHITECTURE DECISION**

**Critical Issue**: Multiple fields across schema require defined value sets:
- **Submission fields**: stage values, status values, interview stage values
- **Job fields**: category values, status values, job_type values  
- **User fields**: profile_type values, role values
- **Tenant fields**: tenant_type values
- **Contact fields**: type values (email/phone/social)

**Currently using placeholder CHECK constraints** - need systematic approach for all value-based fields

**DECISION REQUIRED**: ENUM vs Database Tables vs Application Constants for all constrained value fields

### **🔍 SUBMISSION FIELD IMPLEMENTATION OPTIONS IDENTIFIED:**

**Option A - Simple Approach:**
```sql
stage VARCHAR(50) CHECK (stage IN ('submitted', 'screening', 'interviewing', 'offer', 'hired', 'rejected')),
status VARCHAR(50) CHECK (status IN ('pending', 'approved', 'declined', 'on_hold')),
interview_round INTEGER
```

**Option B - Complex Workflow Tracking:**
```sql
stage VARCHAR(50), -- FK to stages reference table
status VARCHAR(50), -- FK to statuses reference table  
interview_stages JSONB, -- [{stage: 'phone_screen', completed: true, feedback: '...'}]
```

**Option C - Hybrid Approach:**
```sql  
stage VARCHAR(50) CHECK (...), -- ENUM for major phases
status VARCHAR(50) CHECK (...), -- ENUM for sub-states
interview_progression JSONB -- flexible structure for interview tracking
```

**STATUS**: Field implementation options identified, awaiting values architecture framework decision and business workflow validation 
