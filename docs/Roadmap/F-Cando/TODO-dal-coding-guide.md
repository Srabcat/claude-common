# TODO: DAL (Data Access Layer) Coding Guide

**Priority**: Medium  
**Created**: 2025-08-11  
**Status**: Parked - Complete multi-tenant schema design first

## Current State Analysis

**Existing DAL Structure:**
- `/lib/db/queries.ts` - Data access functions
- `/lib/db/schema.ts` - Table definitions  
- `/lib/db/drizzle.ts` - Database connection
- Uses Drizzle ORM with PostgreSQL

**Issues Identified:**
- ❌ No coding guide for database access patterns
- ❌ No enforcement of DAL isolation
- ❌ Missing rules about direct db calls vs queries.ts
- ❌ No database abstraction documentation

## Tasks to Complete

### 1. Database Access Rules Documentation
- Define GOOD vs BAD patterns for database access
- Enforce "all queries go through queries.ts" rule
- Document error handling patterns
- Create examples of proper DAL usage

### 2. Abstraction Level Decision
- **Option A**: True database agnosticism (PostgreSQL → MongoDB switchable)
- **Option B**: SQL flexibility only (PostgreSQL → MySQL via Drizzle)
- **Decision needed**: Which level of abstraction is required?

### 3. Team Coding Standards
- Document patterns for new team members
- Create linting rules to enforce DAL patterns
- Add examples of proper component → DAL interaction
- Define return type standards (plain objects vs ORM types)

### 4. Implementation
- Create coding guide document
- Add linting/TypeScript rules if needed
- Update existing code to follow patterns
- Train team on DAL best practices

## Questions to Address

1. **Database switching requirement**: PostgreSQL only or need true DB agnosticism?
2. **Enforcement level**: Documentation only or automated linting?
3. **Team adoption**: How to migrate existing code patterns?
4. **Performance considerations**: Abstraction vs direct query optimization

## Dependencies

- Complete multi-tenant schema design first
- Decision on database abstraction requirements
- Team consensus on coding standards approach

---

**Note**: This is parked until multi-tenant database schema design is complete.