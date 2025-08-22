# Database Design Brainstorm Session

## Your and my **role and responsibility**:

- We are co-founders of a silicon very startups building the world-class hiring platform ATS - muli-tenant SaaS ATS. Limited resourced. Prioritization and focus, not side track, is critical for startup speed. Sound architecture avoids future rework. We both have light web application development experience, so both will be learning, and they're reaching AI to build this world class web application.

- Me: has many years of recruiting experience, has a CS degree but no real-world software development experience.

- You are a world-class **PostgreSQL schema architect** advising Silicon Valley top startups like **Stripe, Linear, Vanta**. Your Role: Elite technical advisor and devil's advocate. Your job is preventing bad technical decisions, not pleasing/agreeing with my suggestions. Challenge assumptions, demand clarity, ensure sound architecture. We are using **Postrges** (likely Superbase)

### Business Context & Product Requirements
	•	Migrating from a legacy MongoDB hiring platform (similar to Paraform and BountyJobs) ATS to SQL.
    - **Platform**: Multi-tenant recruiting and hiring SaaS for employers, agencies, and platforms.
	•	Multi-tenant platform serving three tenent types:
		- **Employers** - companies hiring people directly
		- **Agencies** - recruiting firms providing candidates
		- **Platforms** - intermediaries getting candidates from agencies, sending to employers
	•	Primary users:
		- **Platform Company Users** (your SaaS):
			- Platform Admin - full configuration access
			- Platform other Users - multiple types, limited access, cannot create users
		- **Client Users** (employers & agencies): initially everyone has full access
		- **Candidates** - not company employees, represented by recruiters
	•	Strict tenant data isolation: each organization sees only its own candidates, submissions, and data.
    -   No code has been written yet, no data to migrate. The plan is to define the schedma, implement the app.  And manually migreate current active job/employer/candidates to new product/SQL (small number of live users)
    -   Startup Focus: Prioritize speed and quick releases.
    -   Future-Proofing: Design to avoid tech debt and major rewrites. Avoid Premature Optimization: Don’t slow down releases for future features that don’t impact current design.

## **Core Philosophy**
- **Right-sized** design: Avoid over-engineering (1% edge cases penalizing 99% usage) and under-engineering (Phase 2 rewrites). 
- **80-20 rule**: know the 80% usage and optimize for it. 20% can be harder to do as long as its possible.
- Non-negotiatioables - know whats non-negotiables that you can not take short cuts even if it rarely happens.
- **Stress-test** recommendations with alternatives for architecture review defense
- Industry **best practices with research-backed** decisions, dont reinvent the wheel for common patterns (many ATS widely used by startups and enterprises)

## **3 key Files** - you own updating (always add timestamp)

Follow structure of the file, dont add new files, update/revise rather than adding new sections
1.  **Project tracking** (PROJECT-TRACKER.md) When solving current issue, Ignore secondary topics or optimizations/security, flag. No rabbit holes. **Buckets**
  - Next: need solve now but different topic. 
  - Details: need to solve now, same topic, but secondary details.  Eg: naming, security, performance
  - Future proofing: Design now, painful to change later
  - Easy phase 2: Phase 2 scope, easily added later 

 **Decision Stack**: List all open decisions in priority order
 **Block vs Non-Block**: Mark which decisions block others  
 **One Decision Rule**: Resolve completely before moving to next
 **Context Switch Cost**: When jumping topics, explicitly state "parking X to resolve Y because Y blocks Z"


2. **Project context**(this file)- requirements, priority, research, lessons learned

3. **Approved Architecture Decision Record (ADR)** (DB-Schema-ADR file) - 
- Top section: All SQL at the top of the file.  
- Bottom sections: Each decision capture requirements, alternatives considered inclduing devil's advocates, all the info to prevent flip flop. And related issues to be solved (detailed DB fields and syntax, phase 2 impact)
- state the importance of the decision factor (showstopper or minor) and consider alternatives
- quantiy the decision factors (dont: performance is slower - vague. Performance is around 100ms slower).
- Make common use cases easy and fast, rare use cases possible. explain the decision.
- MVP vs future enhancments - best option: simple start, add future needs on demand without complicating MVP and no rewrite needed.  Acceptable: future proofing with minimum MVP burden, but verify the burden is justified. Not acceptable: futuure requirements will require major refactoring without explicit approval on the cost of future proofing is too hight for MVP.
- no vague terms 'separation of concerns', or 'cleaner design without saying what concerns and whats clean/dirty design
- Your success with be evaluated by: fully understand the requirements and context without needing my reminder/corrections, clearly well justified design with alternatives well compared, no flip flop and whack mole of issues without holding full context and proposal local solution for current problem forgetting other context/decisions made earlier.
- Clear documentation of the schema design and ADR at: /Users/april/10x10-Repos/claude-common/docs/Architecture/DB-Schema-ADR. When ADR is changed, keep revision and lessons learned.

## **AI human collaboration productivity agreement**

- **Think strategically / design for change ** about long-term maintainability
- **Question requirements/priority ** when they seem over-complex, core vs corner use case? non-negotiable?
- **Propose alternatives** find and cosider simpler paths, including non DB based options
- **Consider the whole system** not just the immediate problem, not quick patch with side effects
- Transparency and Accountability - Be honest when unsure; say it's educated guesses (no falas claims) and cite sources. 
- **Add value** you are the architect, don't just summarize and react to what I, a junior developer, tell you. You are the elite architect, who should be pointing out what I missed. Before consider my suggestions, apply your own first principal thinking first.

## DESIGN PROCESS AGREEMENT - Before start, consideration, alternative design, validate design, 

### **BEFORE Starting Design - Requirements Lock-Down Checklist:**
Garbage in, Garbage out design the wrong requirements.
- [ ] Research - Call out critical missed key requirements from competitors
- [ ] Research - Avoid reinventing the wheel rather than leveraging battle tested design.
- [ ] Context: All business requirements captured, consolidated, prioritized, with no open questions
- [ ] No conflicting requirements remain unresolved  
- [ ] Critical vs nice-to-have features clearly separated
- [ ] MVP scope vs future phases clearly defined
- [ ] Market competitive research done on features and their DB design
- [ ] confirm with me: 1–2 sentence problem statement, expected (sample) results, and how to validate the design is good.
- [ ] All assumptions and research documented in topic specific section in this file

### DESIGN CONSIDATION AND CHECKLIST

1. **Organization business model clarity:** Eg: 
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

4. Get top level design approved, **stop rabbit hole secondary designs**
    - Define the happy path using minimum fields; 
    - Dont side track with **premature optimization** - all fields in the table, security, performance, before the design is approved.
    - Capture pending topics identified such as performance, security todos in project tracking file rather than rabbit hole. 1 main topic at a time.

5. Not reinventing the wheel - leverage battle tested solutions. Useful research (only if needed)

### Well know ATS Research Sources (2025-08-20) - if needed

**API Documentation Links:** - only if more research is needed
- Merge.dev ATS Jobs API: https://docs.merge.dev/ats/jobs/#jobs_list - good consolidated features across many ATS
- Ashby Job Create API: https://developers.ashbyhq.com/reference/jobcreate  
- Greenhouse Email Templates API: https://developers.greenhouse.io/harvest.html#the-email-template-object
- https://developer.salesforce.com/docs/atlas.en-us.object_reference.meta/object_reference/sforce_api_objects_account.htm

**Existing Research Files:**
- `/docs/Roadmap/Reference/Competitors/Technical/DATA_SCHEMAS.md` - Comprehensive schema analysis
- `/docs/Roadmap/Reference/Competitors/Technical/API_PATTERNS.md` - API architecture patterns
- `/docs/Roadmap/Reference/Competitors/Technical/DATABASE_ARCHITECTURE.md` - Database design patterns

**Implementation Files:**
- `/docs/Architecture/Complete-Database-Field-Specifications.md` - All table SQL definitions with field explanations and constraints


### Design Considerations
- **Scalability**: Design to handle enterprise-level volumes, starting with current volumes. MVP schema that is easily extensible.
- **Table Architecture**: Focus on initial table design; allow for future partitioning and sharding.
- **Reactive tunnel vision**: add new table/columns to solve a problem without considerig if it's better to updating existing tables/fields to solve the issue.
- **Avoid Over/user-Design**: Current volumes are sufficient for initial design. Future enhancement require major rewrites
- hammer/nail problem - only create db tables/fields when it's arcitecturally better for the requirements. Consider other options sucas as  constants, config files, application logic, ask human via UI.

#### Design Checklist
- [ ] normalization
- [ ] PK, FK relationships (including prior designed tables)
- [ ] **Values Architecture Framework Decision**: ENUM vs lookup tables vs application constants vs JSON config for all constrained value fields
- [ ] **Migration Risk Assessment**: Zero-downtime value changes vs schema lock implications
- [ ] **Multi-tenant Value Isolation**: Global vs tenant-customizable value requirements
- [ ] **Performance Tiering**: High-frequency vs low-frequency value field optimization
- [ ] **Regulatory Immutability**: Value change history requirements for compliance/audit
- [ ] **API Contract Stability**: External system integration impact of value structure changes
- [ ] Reference data as JSON config vs database tables decision justified
- [ ] tenant isolation, Security
- [ ] Schedma extensibility for future proofing
- [ ] Easy code maintanance with clear naming that follow common familiar patterns
- [ ] Once all the tables are locked: index, performance, not premature optimization that may change.

### **STOP Anti-Patterns** SELF CHECK (common from your training data set)
* Patch-first mentality: React with obvious patches instead of clean design with full context
* Circular reasoning: Repeating mistakes or flip-flopping to previously rejected solutions
* Silo thinking: Optimizing one component without system-wide consideration
- Avoid rabbit holes—decide and move on. 
- Do your job - elite database technical advisor and devil advocate to prevent me making bad technical decisions. Your job is not to please me - you fail your job if you try to make me feel better by agreeing with my points without proper review or playing devil's advocate.
**Flip-Flop Prevention Process:**
1. **Devil's Advocate Questions**: For each major design decision, ask "what are the alternatives and why reject them?"
2. **Requirement Traceability**: Each table/relationship must trace back to specific business requirement
3. **Trade-off Documentation**: Explicitly document what we're optimizing for vs against
4. **Edge Case Stress Test**: How does design handle the rare but critical 1% scenarios?

### **IMPPORTANT** - Alternative Design Decision Framework - **SCORECARD** for Evaluation Criteria (Weighted by Priority):

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

### **Design Validation Criteria - How to Know Design is Good:**
1. **Requirements Coverage**: Does design support ALL consolidated requirements?
2. **Business Critical Test**: Does design protect revenue (candidate deduplication)?
3. **Performance Test**: Can design handle specified volumes with acceptable response times?
4. **Flexibility Test**: Does design support 99% single-org case simply while enabling 1% multi-org cases?
5. **Future-Proof Test**: Can design extend to Phase 2/3 without major rewrites?
6. **Simplicity Test**: Is design as simple as possible while meeting requirements?
7. **Query Pattern Test**: Do common operations (contact lookup, deduplication) map to efficient queries?


## **CRITICAL LESSONS LEARNED:**
1. **Integration Testing Required:** ALWAYS verify each option works with ALL previous decisions, not just individual requirements
2. **Multi-Profile Edge Cases:** When person can have multiple profiles, consider how EVERY table relationship is affected
3. **Concrete Examples:** Test each option with specific scenarios (Person 1 → Agency A + Agency B profiles)
4. **Don't Rush to Eliminate:** Systematically verify why an option fails before dismissing it
5. **FK Relationship Validation:** Trace every foreign key path to ensure data integrity across the full system
6. **Requirements Must Be Crystal Clear:** Lock down business requirements BEFORE design - assumptions cause flip-flopping
7. **Name Tables for Clarity:** Parent-child relationships and FK targets should be obvious from naming
8. **Use Framework Religiously:** Quantify differences (LOC, milliseconds), avoid vague claims

## Architecture Considerations & Design Impact Factors

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


## REQUIREMENTS & FEATURES & RESEARCH

### Core Platform Architecture
- **Multi-tenant SaaS** serving three company types:
	- **Employers** - companies hiring people directly
	- **Agencies** - recruiting firms providing candidates  
	- **Platforms** - intermediaries getting candidates from agencies, sending to employers
- **Strict tenant isolation**: Agency A cannot see Agency B's candidates, Employer A cannot see Employer B's jobs
- **Isolation Strategy**: Ideally DB-level, acceptable at application-level if DB too complex

### User Types & Access (UPDATED)
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

#### Multi-Profile Architecture 
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


---

## CONSTRAINED VALUES FIELD ARCHITECTURE FRAMEWORK DECISION (2025-08-20)

### Problem Statement
Database schema contains numerous fields with constrained value sets (user_roles, job_status, submission_stage, tenant_types, contact_types, etc.). Need systematic framework to determine optimal data type/storage approach for each field type.

### Architecture Options
1. **PostgreSQL ENUM types**
2. **Lookup tables with foreign keys**
3. **Application constants (hardcoded)**
4. **JSON config files**
5. **String storage with application validation**
6. **Integer storage with mapping tables**

### Critical Architecture Factors 

**SHOWSTOPPER Factors (5x weight):**
- **Value Retirement Strategy**: How to deprecate/remove values without breaking existing data
- **Customization Level**: Company-level vs tenant-level vs global value customization requirements
- **Data Integrity**: Referential integrity vs application-level validation trade-offs

**CRITICAL Factors (4x weight - MVP focus):**
- **Change Likelihood**: MVP→Phase II value additions/modifications frequency  
- **Developer Effort**: Absolute LOC overhead (>1000 lines = deal-breaker, >100 lines = significant consideration, <50 lines = manageable)
- **Data Consistency**: Breaking changes during value evolution
- **Query Performance**: High-frequency operations (string comparison vs integer FK lookup) if More than 100ms delta from user's perspective based on the foreseeable volume of entries.

**IMPORTANT Factors (3x weight):**
- **Schema Evolution**: Adding/removing values without breaking deployments. Small downtime (less than an hour) is acceptable.
- **Consistency**: Developer cognitive load from mixed approaches across schema
- **International Future-Proofing**: Global expansion value requirements

**FUTURE-PROOFING Factors (2x weight - Phase II considerations):**
- **Migration Safety**: ENUM changes require ALTER TYPE with table locks (Phase II production concern)
- **API Stability**: External system integration impact when value structures change (Phase II API concern)
- **Regulatory Compliance**: Immutable audit trails for submission stage changes (Phase II compliance)

**REMOVED Factors (truly negligible):**
- ~~Storage efficiency~~ (negligible even at massive scale)

### Field Categorization Matrix

**High-Frequency + Stable Values** (job_status, submission_stage):
- Query frequency: >1000x/day per tenant
- Change frequency: Quarterly at most
- Multi-tenant: Some need customization

**High-Frequency + Evolving Values** (user_roles, contact_types):
- Query frequency: >1000x/day per tenant
- Change frequency: Monthly feature releases
- Multi-tenant: Mostly global, some tenant-specific

**Low-Frequency + Stable Values** (tenant_types, system_config):
- Query frequency: <100x/day per tenant
- Change frequency: Major releases only
- Multi-tenant: Global only

**Low-Frequency + Evolving Values** (integration_types, notification_preferences):
- Query frequency: <100x/day per tenant  
- Change frequency: Feature-driven
- Multi-tenant: Mixed requirements

### Key Assumptions & Validation Criteria

**Critical Assumptions (UPDATED 2025-08-20):**
- Migration downtime acceptable for MVP (small customer base, no production system yet)
- Company-level customization needed for user_roles (not just tenant-level)
- 30% of companies will need custom submission stages within 12 months
- Developer effort difference >100 LOC absolute overhead is deal-breaker for MVP speed
- No external APIs in Phase I, API stability matters for Phase II
- International expansion will require different value sets (work authorization, education)

**Validation Criteria:**
1. **Value Retirement Test**: Can deprecated values be removed without data loss?
2. **Customization Test**: Can companies configure their own value sets efficiently?
3. **Performance Test**: <50ms response for high-frequency value filtering queries
4. **Developer Test**: <100 LOC absolute overhead for common CRUD operations
5. **Evolution Test**: Can new values be added AND old values be retired without breaking existing code?
6. **Consistency Test**: Are similar field types handled consistently across schema?

**Re-evaluation Triggers:**
- If company-level customization requirements exceed 80% of fields
- If international requirements become immediate (non-US customers)
- If performance degrades >100ms for high-frequency queries
- If developer complexity exceeds 100 LOC absolute overhead

---

## USER-RELATED CONSTRAINED VALUE FIELDS - REQUIREMENTS & OPEN ISSUES (2025-08-20)

### Identified Fields Analysis

**Core Identity Fields:**
- `tenant_types`: 'employer', 'agency', 'platform' 
  - **OPEN ISSUE**: Should 'candidate' be a tenant type or just a data entity?
- `contact_types`: 'email', 'phone', 'linkedin', 'github', 'tiktok', etc.
  - **Change Likelihood**: HIGH (new social platforms emerge ~annually)
  - **Customization**: Global values

**User Management Fields:**
- `user_roles`: Role-based permissions per company
  - **CRITICAL REQUIREMENT**: Company-level customization (not just tenant-level)
  - **Examples**: 'admin', 'account_manager', 'recruiting_coordinator', 'candidate_recruiter'
  - **Change Likelihood**: MEDIUM (companies add custom roles)
  - **Customization**: Company-level (each org defines own roles)

**Account Management Fields:**
- `account_status`: 'active', 'inactive', 'suspended', 'pending_verification'
  - **RESEARCH NEEDED**: What do competitors use? What does 'suspended' vs 'pending_verification' mean?
- `login_status`: 'enabled', 'disabled', 'password_reset_required'
  - **OPEN ISSUE**: Is this redundant with account_status? Do all users need login capability?
  - **FUTURE CONSIDERATION**: 2FA, biometric authentication states

**International/Future-Proofing Fields:**
- `work_authorization`: 'citizen', 'permanent_resident', 'h1b', 'opt', 'no_authorization'
  - **OPEN ISSUE**: US-only for MVP, but how to future-proof for UK/Japan/global?
  - **Change Likelihood**: MEDIUM (immigration law changes, international expansion)
- `education_level`: 'high_school', 'associates', 'bachelors', 'masters', 'phd'
  - **RESEARCH NEEDED**: What standards do LinkedIn/competitors use?
  - **OPEN ISSUE**: International education systems differ significantly

**Candidate-Specific Fields:**
- `candidate_source`: 'linkedin', 'referral', 'job_board', 'cold_outreach', 'self_applied'
  - **OPEN ISSUE**: Granularity level? Which referral? Which job board?
- `experience_level`: 'entry', 'mid', 'senior', 'staff', 'principal', 'executive'

### Open Architecture Questions

**Company-Level vs Tenant-Level Customization:**
- Which fields need company-level customization vs tenant-level vs global?
- How to handle same role names with different responsibilities across companies?

**Field Overlap & Necessity:**
- `login_status` vs `account_status`: Are both needed?
- `profile_visibility`: Do any competitors use this? Is it necessary?

**Value Retirement Strategy:**
- How to handle deprecated values without breaking historical data?
- Migration path for international expansion (US → global work authorization values)?


### Research Findings (COMPLETED 2025-08-20)

**From Greenhouse API + Competitor Analysis:**
- `application_status`: "active", "rejected", "hired", "converted" 
  - **"converted"**: When candidate application becomes employee record (hired → converted to employee)
- `attachment_visibility`: "public", "private", "admin_only"
  - **"public"**: Visible to all hiring team members
  - **"private"**: Visible only to uploader/specific users
  - **"admin_only"**: Visible only to system administrators
- `experience_level`: "entry", "mid", "senior", "staff", "principal", "executive"
- `candidate_source`: "job_board", "referral", "agency", "direct"

**Key Architectural Findings:**
1. **Company-Level Customization Confirmed**: Greenhouse uses extensive `customFields: Record<string, any>`
2. **Separate Application vs Account Status**: All major platforms distinguish these
3. **No Login Status Field**: Not found in competitor APIs - likely combined with account status
4. **Profile Visibility Not Standard**: Not found in major ATS platforms - potentially unnecessary

### Constrained Value Field Recommendations

**HIGH Customization (Company-Level):**
- `user_roles`: Each company defines own roles ("account_manager" means different things)
- Custom hiring stages/submission stages per organization

**MEDIUM Customization (Tenant-Level):**
- `work_authorization`: US-standard for MVP, country-specific for international
- `candidate_source`: Core values + org-specific sources

**GLOBAL Standards (No Customization):**
- `tenant_types`: "employer", "agency", "platform" (architectural constants)
- `contact_types`: "email", "phone", "linkedin", "github" (universal)
- `application_status`: "active", "rejected", "hired", "converted" (industry standard)
- `experience_level`: Industry-standard levels

### Open Architecture Questions (UPDATED)

1. **RESOLVED**: `profile_visibility` - NOT needed based on competitor analysis
   - **Why suggested earlier**: Privacy controls for candidate data sharing across organizations
   - **Why removing**: No evidence in major ATS platforms, adds complexity without business value
2. **RESOLVED**: `login_status` vs `account_status` - Use single `account_status` field
   - **Rationale**: Application and account are distinct entities (candidate+job vs person)
3. **RESOLVED**: Candidate as tenant type - Keep candidates as data entities, not tenants
   - **Rationale**: Data volume imbalance, different permission models, competitor patterns
4. **OPEN**: Work authorization international expansion strategy

---

## CONSTRAINED VALUE FIELD DESIGN DECISIONS (2025-08-20)

### Decision Framework Application

**Scoring Scale**: 0 = Impossible, 1 = Very Poor, 2 = Poor, 3 = Moderate, 4 = Good, 5 = Excellent

### 1. USER_ROLES Field Decision

**Requirement**: Each company must define their own role values (Company A: "Senior Recruiter", Company B: "Lead Talent Acquisition")

**Scoring Matrix:**

| Factor | Weight | ENUM | Lookup Table | App Constants | JSON Config |
|--------|---------|------|--------------|---------------|-------------|
| **Company-Level Customization** | 5x | 0 (Impossible - DB-wide ENUMs) | 5 (Excellent - company_id column) | 0 (Impossible - hardcoded) | 4 (Good - per-company files) |
| **Change Likelihood** | 4x | 1 (ALTER TYPE required) | 5 (Simple INSERT/UPDATE) | 2 (Code deployment) | 4 (Config file edit) |
| **Developer Effort** | 4x | 4 (Simple if worked) | 3 (FK + joins ~50 LOC) | 5 (Hardcoded map ~20 LOC) | 3 (Config loading ~60 LOC) |

**Weighted Scores:**
- ENUM: (0×5) + (1×4) + (4×4) = **20**
- Lookup Table: (5×5) + (5×4) + (3×4) = **57** ✅ **WINNER**
- App Constants: (0×5) + (2×4) + (5×4) = **28**
- JSON Config: (4×5) + (4×4) + (3×4) = **48**

**DECISION: Lookup Table**
- **Implementation**: `user_roles` table with `(id, company_id, role_name, description, permissions_json, active)`
- **FK**: `users.role_id → user_roles.id`
- **Validation**: Application ensures role belongs to user's company

