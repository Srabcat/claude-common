# Complex Project: Research & Planning Phase
**Last Update Date:** 2025-08-08  
**Phase:** Research & Discovery  
**Status:** In Progress  

---
## 2025-08-08 SIMPLIFIED GOALS - CANDIDATE-FIRST APPROACH 🎯

**FOCUS**: Start with candidate entity only (much simpler than full marketplace)

### Today's Implementation Plan:
1. **Candidate Schema Design** - Simple candidate table with recruiter relationship
2. **Basic Navigation** - Platform admin view with candidate add/view functionality  
3. **Recruiter Assignment** - Link candidates to recruiting user (agency recruiter, platform, or employer)

### Core Data Model (Simplified):
```
Candidate:
- candidate_id (primary key)
- recruiter_user_id (foreign key to Users table) 
- basic_attributes (name, email, phone, etc.)
```

### Terminology Update:
- **"Agency Recruiter"** = user from agency partner (replaces generic "recruiter")
- **Recruiter Types**: Agency Recruiter, Platform Recruiter, Employer Recruiter

---

## DEFERRED TO LATER (Too Complex for MVP):
- Job submissions workflow
- Multi-sided marketplace features
- Complete data structure design for complex candidate data
- PostgreSQL multi-tenant configuration  
- Role hierarchy and complex access control 




---
## Project Overview
**PRODUCT VISION:** AI-powered recruiting marketplace + ATS that automates repetitive tasks and uses voice commands/agents to streamline workflows across three user personas.

**USER PERSONAS:**
1. **Recruiting Agencies (Supply Side)** - Find, manage, and submit candidates
2. **Employers (Demand Side)** - Post jobs, review candidates, manage hiring pipeline  
3. **Platform Admin (Marketplace)** - Facilitate matches, handle disputes, manage both sides

---

## RESEARCH FILES & DOCUMENTATION ✅

### File Tracking System
**Purpose**: Prevent duplicate information - UPDATE existing files with today's date stamps in the file name, don't create new ones

| File Name | Purpose | Last Updated | Status |
|-----------|---------|--------------|--------|
| `2025-08-07-ATS-consolidated-research-claude-manus.md` | **MASTER RESEARCH SUMMARY** - All competitive findings | 2025-08-07 | ✅ Complete |
| `2025-08-07-ATS-pain-points-reference.md` | Pain points with sources - reference only | 2025-08-07 | ✅ Complete |
| `2025-08-07-ATS-claude-independent-UI-research.md` | Visual UI research - 8 platforms analyzed | 2025-08-07 | ✅ Complete |
| `2025-08-07-ATS-claude-vs-manus-navigation-comparison.md` | Research validation - conflicts documented | 2025-08-07 | ✅ Complete |
| `2025-08-07-ATS-navigation-design-final.md` | **FINAL NAVIGATION SPEC** - Implementation ready | 2025-08-07 | ✅ Complete |
| `2025-08-07-ATS-marketplace-mvp-roadmap.md` | Feature prioritization and roadmap | 2025-08-07 | ✅ Complete |
| `2025-08-08-ATS-terminology-research.md` | Platform terminology (employer, submittal, lifecycle) | 2025-08-08 | ✅ Complete |
| `planning/database-schema/candidate-submissions-schema.md` | Database schema for candidate submissions workflow | 2025-08-08 | ✅ Complete |
| `planning/database-schema/gpt-discussion-notes.md` | Database design discussion notes | 2025-08-08 | ✅ Complete |
| `planning/database-schema/2025-08-08-ATS-user-candidate-schema-design.md` | **MAIN SCHEMA DESIGN** - Users, organizations, candidates with flexible access control | 2025-08-08 | ✅ Complete |
| `planning/frontend-architecture/2025-08-08-ATS-flexible-layout-technical-design.md` | **FRONTEND TECHNICAL DESIGN** - Flexible layout architecture | 2025-08-08 | ✅ Complete |
| `planning/frontend-architecture/2025-08-08-ATS-engineering-design-decisions.md` | Engineering standards and anti-patterns documentation | 2025-08-08 | ✅ Complete |

**REFERENCE FILES** (good examples, may reference later):
- `2025-08-07-ATS-manus-research-input.md` - Comprehensive navigation analysis with competitive breakdown
- `2025-08-07-ATS-claude-navigation-design-v1.md` - Initial design hypothesis before research validation

**RULE**: Before creating any new file, check if existing file can be updated with new date stamp

---

## CURRENT SCOPE - PHASE 1 MVP ⚡ DESIGNING NOW

### 1. ENTITY TERMINOLOGY 🎯 IN PROGRESS
- **Top-Level Entities**: Candidate, Agency Recruiter, Employer, Job, Submittals, Users
- **Database Schema Design** - **PENDING - CRITICAL**
- **User Table Structure** - **PENDING - ONE vs MULTIPLE TABLES?**

### 2. CANDIDATE-FIRST IMPLEMENTATION ✅ 
- **Simple Candidate Schema** with agency_recruiter_id
- **Platform Admin View** - add/view candidates
- **Basic CRUD Operations** - start here, expand later

---

## REFERENCE SECTION 📚

### Research & Analysis (Completed - For Reference)
- **Competitive Pain Points** (validated through 15+ platforms) - `2025-08-07-ATS-consolidated-research-claude-manus.md`
- **UI Navigation Research** (8 platforms visual analysis) - `2025-08-07-ATS-claude-independent-UI-research.md`
- **Navigation Design** (implementation-ready) - `2025-08-07-ATS-navigation-design-final.md`
- **Table Stakes vs Advanced Features** - `2025-08-07-ATS-marketplace-mvp-roadmap.md`

---

## FUTURE PHASES - TO DO LATER 📋

### Phase 2 - Advanced Features (OUT OF CURRENT SCOPE)
- **Mobile-First Responsive Strategy** - TO DO
- **Integration Requirements** (calendar, email, payment) - TO DO  
- **Advanced UI Design** (beyond navigation) - TO DO
- **AI Enhancement Implementation** - TO DO

### Phase 3 - System Architecture (OUT OF CURRENT SCOPE)
- **Multi-sided Marketplace** - TO DO
- **Complex Access Control** - TO DO
- **Technical Architecture** - TO DO

---

## Research & Planning Roadmap

### Phase 1: Product Concept & Market Research ✅ COMPLETE
**Timeline:** Completed 2025-01-08

**Deliverables:**
- [x] **Product Concept Definition**
  - ✅ Core value proposition: AI-powered recruiting marketplace + ATS
  - ✅ Target personas: Recruiting agencies, employers, platform admin
  - ✅ Product category: Multi-sided marketplace with voice-first AI automation
  
- [x] **Competitive Landscape Analysis**
  - ✅ Direct competitors identified across all three personas
  - ✅ Feature comparison completed (table stakes vs advanced)
  - ✅ Pricing models documented (deferred to later phase)
  - ✅ Strengths/weaknesses mapped with market gaps identified
  - ✅ AI automation opportunities documented

- [x] **User Research Foundation** 
  - ✅ Personas validated through competitive analysis
  - ✅ Specific actionable pain points identified with sources
  - ✅ Use cases defined from pain point analysis
  - ✅ Market gaps identified (voice-first, mobile, true AI automation)

### Phase 2: Strategic Planning & Architecture 📋 CURRENT PHASE
**Timeline:** Started 2025-08-07

**Deliverables:**
- [x] **MVP Feature Prioritization**
  - ✅ Core features vs nice-to-have identified (table stakes vs Phase 2 AI)
  - ✅ Pain point to feature mapping completed
  - ✅ Manus UI research integrated
  - ✅ Consolidated research analysis completed
  - [ ] Technical complexity assessment
  - [ ] Resource requirements estimation

- [ ] **System Architecture Planning**
  - [x] Platform terminology research (employer, submittal, 6-stage lifecycle) ✅ 2025-08-08
  - [x] Candidate submissions database schema design ✅ 2025-08-08
  - [ ] Complete database schema design (all entities)
  - [ ] High-level technical approach
  - [ ] Integration requirements
  - [ ] Scalability considerations

- [x] **UI/UX Strategy** ✅ COMPLETE
  - [x] Manus navigation analysis received
  - [x] Independent UI navigation research (Claude) - 8 platforms analyzed
  - [x] Navigation design recommendations - Final design validated
  - [x] Comparison of Claude vs Manus navigation findings - Conflicts documented
  - [ ] Key user flows identification
  - [ ] Accessibility requirements
  - [ ] Mobile/responsive strategy (mobile-first identified as key differentiator)

### Phase 3: Detailed Planning & Roadmap
**Timeline:** [TBD after Phase 2 completion]

**Deliverables:**
- [ ] **MVP Roadmap**
  - Milestone breakdown
  - Feature release sequence
  - Resource allocation plan
  - Risk assessment

- [ ] **Technical Specifications**
  - Database schema design
  - API architecture
  - Third-party integrations
  - Security requirements

- [ ] **Design System Foundation**
  - Component library planning
  - Brand/visual direction
  - Prototyping approach
  - User testing strategy

### Phase 4: PRD & Implementation Planning
**Timeline:** [TBD after Phase 3 completion]

**Deliverables:**
- [ ] **Comprehensive PRD**
  - Detailed feature specifications
  - User stories and acceptance criteria
  - Success metrics definition

- [ ] **Implementation Plan**
  - Development sprints planning
  - Team resource allocation
  - Timeline and milestones
  - Launch strategy

---

## Next Steps
1. **Product Concept Input Needed** - Awaiting high-level product vision and personas
2. **Competitive Research** - Begin once concept is defined
3. **Market Analysis** - Parallel to competitive research
4. **Strategic Planning** - After research phase completion

---

## Research Framework

### Competitive Analysis Template
**For each competitor, we'll analyze:**
- Product overview and positioning
- Core features and functionality
- Pricing model and tiers
- Target audience and use cases
- Strengths and differentiators
- Weaknesses and gaps
- User feedback and reviews
- Market traction/funding

### Feature Prioritization Framework
**We'll use a scoring matrix considering:**
- User value/impact (1-10)
- Technical complexity (1-10)
- Competitive necessity (1-10)
- Business value (1-10)
- Resource requirements (1-10)

### MVP Definition Criteria
**Features must meet:**
- Solves core user problem
- Technically feasible with current resources
- Creates measurable user value
- Establishes competitive differentiation
- Enables user feedback collection

---

**Ready for input to begin Phase 1 research and planning.**