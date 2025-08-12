

Research Summary: ATS and Multi-Tenant Database Design

Key Learnings from ATS Database Structures:

•
Core Entities: A typical ATS database revolves around a set of core entities:

•
users: Stores information about all users of the system (recruiters, hiring managers, admins).

•
roles and permissions: Manage access control.

•
companies or tenants: Represents the customer organization.

•
job_postings: Contains all information about a job opening.

•
candidates: Stores candidate information.

•
applications: Links candidates to specific job postings.

•
interviews: Tracks the interview process.

•
candidate_feedback: Stores feedback from interviewers.

•
documents: Manages resumes, cover letters, etc.



•
Relationships:

•
A company has many users.

•
A user has a role.

•
A company has many job_postings.

•
A job_posting has many applications.

•
A candidate can have many applications.

•
An application has one candidate and one job_posting.

•
An application can have multiple interviews.



Multi-Tenancy Models:

I have researched three primary multi-tenancy models:

1.
Shared Database, Shared Schema:

•
All tenants share the same database and tables.

•
A tenant_id column is used to isolate data.

•
Pros: Cost-effective, simple maintenance and schema management.

•
Cons: Higher risk of data leaks, potential for "noisy neighbor" performance issues, limited customization.



2.
Shared Database, Separate Schemas (PostgreSQL supported):

•
Each tenant has its own schema within a shared database.

•
Pros: Better data isolation than shared schema, still cost-effective.

•
Cons: More complex schema management, potential for resource contention at the database level.



3.
Database per Tenant:

•
Each tenant has a completely separate database.

•
Pros: Maximum data isolation and security, easiest to customize, no "noisy neighbor" issues.

•
Cons: Highest operational complexity and cost, resource underutilization for smaller tenants.



Recommendations for this Project:

•
Given the multi-tenant nature of the platform and the need to support both agencies and in-house teams, a robust multi-tenancy model is crucial.

•
The Shared Database, Shared Schema approach with a tenant_id in each relevant table is a good starting point. It's the most common and generally recommended for SaaS applications unless there are specific, stringent data isolation requirements from the start.

•
For the "split platform" feature, we'll need to carefully design the relationships between companies (who post jobs), agencies (who submit candidates), and the job_postings and applications tables.

Next Steps:

Based on this research, I will now proceed to define the high-level entities and their relationships for your platform. I will then present these to you for feedback before diving into the detailed schema design.

