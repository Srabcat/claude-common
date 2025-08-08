# ATS Platform Terminology Research
**Date:** 2025-08-08  
**Status:** Research Complete  
**Purpose:** Establish consistent terminology for ATS marketplace platform development

---

## RESEARCH SUMMARY

Comprehensive research into industry-standard terminology for three critical concepts in the ATS marketplace platform:

1. **Company Entity Terminology** - How to refer to organizations using the platform
2. **Candidate-Job Relationship** - What to call the many-to-many tracking concept
3. **Recruiting Lifecycle** - Stages and statuses for the complete hiring process

---

## 1. COMPANY ENTITY: "EMPLOYER" ✅

### **RECOMMENDATION: Use "Employer"**

**Why "Employer" is the best choice:**
- **Industry Standard**: All major ATS platforms (Greenhouse, Workday, BambooHR) use "employer"
- **Clear Meaning**: Unambiguous - the entity that hires people
- **Avoids Confusion**: Distinguishes between recruiting agencies and hiring companies
- **Professional**: Fits the business context better than transactional terms can you tell me the ATS for recruiting agencies, which product uses submitters and any other terminology are used? It sounds to me what you are saying is recruiting ATS for agencies will use submitters, but the ATS for employers will use applications.

As a hiring platform in the middle, we are working with both recruiting agency submittals and then turn them into applications in Ashby and Greenhouse. How do other platforms and how do you recommend we handle this transition? In the database, the table is usually the same table because it's the same life cycle for the same candidate to job pair. 

**Why NOT the alternatives:**
- **"Client"** is ambiguous - could mean either the recruiting agency's client OR the platform's client
- **"Customer"** is too transactional and doesn't capture the hiring relationship

**Industry Evidence:** ATS documentation consistently uses "employers," "hiring managers," and "hiring organizations."

---

## 2. CANDIDATE-JOB RELATIONSHIP: "SUBMITTAL" ✅

### **RECOMMENDATION: Use "Submittal"**

**Why "Submittal" is most precise:**
- **Industry-Specific**: Precise meaning in recruiting - when an agency formally presents a candidate
- **Value-Add Implied**: Suggests agency enhancement/vetting vs raw application
- **Many-to-Many Tracking**: One candidate can have multiple submittals to different jobs
- **Professional Standard**: Used by recruiting agencies and ATS platforms

**Why NOT the alternatives:**
- **"Application"** suggests direct candidate action, not agency-mediated
- **"Engagement"** is too broad and vague for specific tracking purposes

**Definition:** A submittal is when a recruiting agency formally presents a candidate to an employer for a specific role, often with coaching and profile enhancement.

---

## 3. RECRUITING LIFECYCLE: 6-STAGE FRAMEWORK ✅

### **RECOMMENDATION: 6-Stage Lifecycle with Status Tracking**

Based on 2025 ATS industry standards and your marketplace requirements:

#### **STAGE 1: SOURCING**
*Agency identifies and contacts potential candidates*
- **Statuses:**
  - `Identified` - Candidate found but not yet contacted
  - `Contacted` - Initial outreach sent
  - `Responded` - Candidate replied with interest
  - `Not Interested` - Candidate declined opportunity

#### **STAGE 2: SCREENING**
*Agency qualifies candidate for specific roles*
- **Statuses:**
  - `Initial Screen Scheduled` - First screening call booked
  - `Phone Screen Complete` - Screening completed
  - `Qualified` - Candidate meets role requirements
  - `Disqualified` - Candidate doesn't meet requirements

#### **STAGE 3: CLIENT REVIEW**
*Critical handoff from Agency to Employer*
- **Statuses:**
  - `Submitted to Client` - Submittal sent to employer
  - `Under Review` - Employer reviewing candidate
  - `Approved for Interview` - Employer wants to interview
  - `Rejected` - Employer declined candidate

#### **STAGE 4: INTERVIEW**
*Employer conducts various interview stages*
- **Statuses:**
  - `Interview Scheduled` - Initial interview booked
  - `Technical Screen` - Technical evaluation in progress
  - `Homework/Project` - Take-home assignment given
  - `Onsite Interview` - In-person/final rounds
  - `Final Round` - Last interview stage
  - `Interview Complete` - All interviews finished

#### **STAGE 5: DECISION**
*Employer makes hiring decision and extends offers*
- **Statuses:**
  - `Offer Pending` - Decision made, offer being prepared
  - `Offer Extended` - Formal offer sent to candidate
  - `Offer Accepted` - Candidate accepted offer
  - `Offer Declined` - Candidate declined offer
  - `Rejected` - Employer decided not to hire

#### **STAGE 6: PLACEMENT & GUARANTEE**
*Post-hire tracking for agency placements*
- **Statuses:**
  - `Start Date Confirmed` - Employment start date set
  - `Started` - Candidate began employment
  - `30-Day Check` - 30-day milestone reached
  - `90-Day Guarantee Complete` - Guarantee period fulfilled
  - `Replaced` - Candidate left, replacement needed

---

## IMPLEMENTATION CONSIDERATIONS

### Database Design
- Use `employer` table instead of `client` or `customer`
- Many-to-many relationship: `submittal` table linking `candidate` and `job`
- Stage/status tracking with timestamps for analytics

### UI/UX Consistency
- All interfaces should use consistent terminology
- Help text and tooltips should explain recruiting-specific terms
- Status progression should be visually clear

### API Design
- Endpoint naming: `/employers/`, `/submittals/`, `/stages/`
- Clear field names in JSON responses
- Consistent status values across all endpoints

---

## COMPETITIVE RESEARCH SOURCES

### Terminology Research
- Major ATS platforms: Greenhouse, Workday, BambooHR, Ashby
- Recruiting industry publications and glossaries
- Staffing agency best practices
- 2025 ATS workflow standards

### Key Insights
1. **Employer** is universally used in ATS systems vs ambiguous alternatives
2. **Submittal** is recruiting industry standard vs generic "application"
3. **6-Stage lifecycle** balances completeness with practical tracking needs
4. Status granularity enables better analytics and user experience

---

## NEXT STEPS

1. **Database Schema**: Apply terminology in schema design documents
2. **API Specification**: Use consistent naming in all API endpoints  
3. **UI Mockups**: Implement terminology in all user interface designs
4. **Documentation**: Update all product documentation with standard terms
5. **Team Training**: Ensure all team members use consistent terminology

This terminology foundation supports clear communication across all stakeholders: recruiting agencies, employers, platform administrators, and development team.