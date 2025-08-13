## 📋 **Session Plan** - Must track/update this plan and let's score ourselves on how we are doing!

### **Morning Goals (Extended to 12pm)**
1. ✅ **COMPLETED 9:45am** - Architecture review + GitHub documentation + **CRITICAL DECISION: Contact info storage (separate table)**
2. **COMPLETED 3:30pm** - Duplicate candidate detection DB schema ✅
   - ✅ **COMPLETED:** Created minimal schema enhancement approach (enhance existing tables vs new tables)
   - ✅ **COMPLETED:** Updated DB Schema Design Guide to prevent unnecessary table creation
   - ✅ **COMPLETED:** Separated duplicate candidates from submission conflicts  
   - ✅ **COMPLETED:** Designed composite key for candidate table (person_id, recruiter_person_id)
   - ✅ **COMPLETED:** Complete duplicate candidate detection logic at `/Users/april/10x10-Repos/claude-common/docs/Roadmap/F-DuplicateConflict/duplicate-candidate-detection-logic.md`
   - ✅ **COMPLETED:** Engineering requirements: triggers, services, indexes, constraints, testing
   - ✅ **COMPLETED:** Updated consolidated-ats-schema.sql with all changes (composite keys, history tracking, triggers)
   - ✅ **COMMITTED:** Git checkpoint - candidate duplicate detection schema complete
   
   **RESOLVED ISSUES:**
   - ✅ **UI Issue:** Multiple emails per user - need UI design to identify which email to replace
   - ✅ **Database Issue:** `changed_by_person_id` with `changed_by_table_type` for clarity
   - ✅ **Design Clarity:** Documented Duplicate (person-level) vs Representation Conflict (submission-level)
   - ✅ **Submission Flags:** Clarified `is_duplicate=true` logic with examples
   - ✅ **Array Design:** Specified JSON format for `duplicate_reason` and `detected_duplicates`
   
3. **PAUSED** - Submission conflict detection design (schema needs revision first)

4. **CRITICAL SCHEMA REVISIONS** - Fix startup-hostile design issues ✅ **COMPLETED (2025-08-13)**
   - ✅ **COMPLETED:** Replace composite primary key with simple UUID in candidate table 
     - Changed to: candidate_id UUID PRIMARY KEY + UNIQUE(person_id, recruiter_person_id)
     - Updated all child tables: candidate_skill, candidate_work_location, candidate_work_authorization
     - Simplified foreign key relationships for startup-friendly development


   - ✅ **COMPLETED:** Move duplicate detection from database triggers to application layer
     - Removed complex trigger functions from schema
     - Added database constraints as backup safety net (performance optimized)
     - Updated DB design guide with trigger avoidance rules

   - ✅ **DEFERRED:** Simplify status enumeration (changed to status_TBD for later implementation)
     - Too complex for current phase, requires submission conflict business logic design
     - Will revisit when implementing submission conflict application logic

  ---
  Fresh Critical Review #2: Technical Debt Assessment

   - ✅ **COMPLETED:** Use database constraints instead of materialized views for performance
     - Added representation_expires_at column (eliminates date math in queries)
     - Added EXCLUDE constraint ensuring only one active representation per (person, employer)
     - Fast simple query: no ORDER BY or LIMIT needed (constraint guarantees uniqueness)

   - ✅ **COMPLETED:** Centralize 6-month rule in single application constant
     - Use single constant: REPRESENTATION_WINDOW_MONTHS = 6
     - Replace all hardcoded "6" references with constant
     - Simple, consistent, startup-friendly approach


   - ✅ **COMPLETED:** Clarify data ownership (person_identifier vs candidate_submission emails)
     - person_identifier = CURRENT TRUTH (contact info can change over time)
     - candidate_submission = IMMUTABLE SUBMISSION RECORD (legal/contractual proof of what was sent to employer)
     - "Inconsistency" is intentional: employer needs to know exact email/phone we submitted, not current info
   
   **EASY TODO - LATER:**
   - AI created yet another file - /Users/april/10x10-Repos/claude-common/docs/Roadmap/F-DuplicateConflict/requirements-and-current-schema.md
   - 📝 **Corner Case:** Candidate self-updating their own data (practically never happens, design for recruiter-only for now)
   - 📝 **Performance Optimization:** Index optimization for duplicate detection (not needed for prototyping)
     - Remove redundant indexes (idx_identifier_lookup vs idx_identifier_tenant_type_value)  
     - Add covering indexes for common query patterns
     - Add candidate dashboard indexes
   
   - 📝 **Contact Type Enhancement:** Add `identifier_subtype` column to person_identifier
     - Email subtypes: Personal, Work, School, Other
     - Phone subtypes: Mobile, Home, Work, Fax, Other  
     - Social subtypes: LinkedIn, GitHub, Twitter, Portfolio, Website, Other
     - Note: Social types don't need is_primary flag
     - Database change: `ALTER TABLE person_identifier ADD COLUMN identifier_subtype VARCHAR(20)`
3. **Create DAL functions** for core operations  
4. **Test data insertion** with real examples

### **Afternoon Goals (If time permits)**  
4. **Integrate navigation** with actual data
5. **Frontend best practices** guide
6. **Performance optimization** checklist

### **Success Metrics**
- ✅ Schema deployed and working
- ✅ DAL functions tested
- ✅ Navigation shows real data
- ✅ No over-engineering or rabbit holes - Productive process. 
- ✅ **COMPLETED:** Architecture documentation created at `/Users/april/10x10-Repos/claude-common/docs/Architecture/ATS-Schema-Documentation.md`
- Good doc (easy to find and undertsnad file path/name, DRY, save ) - move research to refernece. Archive old solutions. Checkin to github.
