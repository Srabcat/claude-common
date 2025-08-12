# ATS Database Schema Design Session - 2025-08-12

## Context Continuation Summary
**Previous Work**: Claude usage limit reached during schema design. Conversation resumed from consolidated schema work.

## Key Accomplishments Today

### 1. Core Schema Foundation Completed
- **File**: `/Users/april/10x10-Repos/claude-common/docs/Roadmap/F-Cando/consolidated-ats-schema.sql`
- **Achievement**: Single consolidated schema combining multi-tenant + candidate requirements
- **Key Innovation**: Person-based architecture supporting all user types

### 2. Persona Mapping Completed  
- **File**: `/Users/april/10x10-Repos/claude-common/docs/Roadmap/F-Cando/persona-types.md`
- **Achievement**: Comprehensive mapping of all person types in system
- **Key Insight**: Clear separation between core participants vs prospects

### 3. Naming Conventions Established
- **File**: `/Users/april/10x10-Repos/claude-common/docs/Roadmap/F-Cando/table-field-naming-best-practices.md`
- **Achievement**: Explicit naming rules to avoid confusion
- **Key Principle**: Explicit over generic naming

### 4. Prospect Table Added
- **Achievement**: High-volume sourcing table separate from core people
- **Design Decision**: Shared table for candidate + employer prospects
- **Rationale**: Prevents pollution of core person table

## Critical Design Decisions Made

### Table Bloat Concern Resolution
- **Problem**: Original design required 4+ tables per login user
- **Solution**: Simplified to person + person_identifier + prospect tables
- **Research Finding**: Modern ATS uses 2-3 core tables, not 4+

### Login Email Duplication Decision
- **Problem**: Email needed in both person table (login) and person_identifier (duplicates)
- **Initial Decision**: Accept duplication for clarity and performance
- **Final Decision**: Remove login fields - handled by Supabase Auth framework
- **Rationale**: Authentication should be framework responsibility

### Contacts Without Accounts Support
- **Requirement**: Track people who don't need platform login (CEOs, VPs)
- **Solution**: Person records without corresponding Auth users
- **Implementation**: Framework handles user accounts, we handle business contacts

### Prospect vs Core People Separation
- **Requirement**: Separate high-volume sourcing from active participants  
- **Solution**: Dedicated prospect table for cold outreach
- **Benefit**: Keeps core person table clean, supports 99% no-response rate

## Key Assumptions Documented

### Framework Integration
- **Assumption**: Supabase handles authentication (login_email, password_hash)
- **Assumption**: Starter kit provides user management foundation
- **Implication**: Focus on business logic, not authentication infrastructure

### Multi-Tenant Architecture
- **Assumption**: teams table = tenant boundary (existing from starter kit)
- **Assumption**: Row-Level Security for tenant isolation
- **Design**: All business tables include tenant_id for isolation

### Person-Centric Model
- **Assumption**: Everyone is a person first, role second
- **Benefit**: Handles dual roles (user + candidate, recruiter + candidate)
- **Challenge**: Duplicate detection across person_identifier table

## Lessons Learned

### Research Methodology Issues
- **Problem**: Went down research rabbit holes multiple times
- **User Feedback**: "Stop going to the weeds" - focus on solving, not researching
- **Lesson**: Research should support decisions, not delay them
- **Future**: Quick research, document sources, move to implementation

### Over-Engineering Prevention  
- **Problem**: Initially designed complex 4+ table structure
- **User Insight**: "4 tables per user seems like a lot"
- **Lesson**: Question complexity, validate against real-world patterns
- **Future**: Start simple, add complexity only when justified

### Normalization vs Practicality
- **Problem**: Pure normalization led to performance/complexity concerns
- **Solution**: Accept strategic duplication when it improves clarity
- **Example**: Login email duplication was acceptable until removed entirely
- **Lesson**: Normalization is a tool, not a religion

## Technical Debt / Parking Lot Items

### High Priority
1. **Update table naming conventions** - Apply new naming rules to consolidated schema
2. **Clean up duplicate documentation** - Archive superseded schema files

### Research Needed
1. **Login email duplication sources** - Get verified examples from real systems  
2. **2-table duplicate detection performance** - Quantify actual query impact
3. **ATS terminology standardization** - team vs tenant vs organization

### Future Considerations
1. **Duplicate detection triggers** - Implement 6-month representation logic
2. **Cross-tenant marketplace** - If needed for platform features
3. **Advanced permissions** - Beyond basic tenant isolation

## Database Design Patterns Identified

### Modern ATS Architecture
- **Pattern**: Person-based core with role-specific extensions
- **Pattern**: Shared prospect table with type differentiation  
- **Pattern**: Framework authentication + business contact separation
- **Pattern**: Multi-tenant via tenant_id + Row-Level Security

### Performance Optimization
- **Pattern**: Strategic denormalization for frequently accessed data
- **Pattern**: Separate high-volume tables (prospects) from core operations
- **Pattern**: Index design considers tenant isolation first

## Next Session Priorities

### Immediate Tasks
1. Apply naming conventions to consolidated schema
2. Clean up documentation files
3. Resolve parking lot research items

### Validation Needed
- Review final schema with fresh eyes
- Validate against original requirements
- Confirm framework integration assumptions

## Files to Review Tomorrow
1. **Main Schema**: `/Users/april/10x10-Repos/claude-common/docs/Roadmap/F-Cando/consolidated-ats-schema.sql`
2. **Persona Types**: `/Users/april/10x10-Repos/claude-common/docs/Roadmap/F-Cando/persona-types.md`
3. **Naming Guide**: `/Users/april/10x10-Repos/claude-common/docs/Roadmap/F-Cando/table-field-naming-best-practices.md`

## Success Metrics Achieved
- ✅ Single consolidated schema file
- ✅ All persona types documented  
- ✅ Naming conventions established
- ✅ Core design decisions made and documented
- ✅ Framework integration clarified (Supabase Auth)

**Status**: Foundation complete, ready for refinement and cleanup.