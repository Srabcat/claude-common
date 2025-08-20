1+2+3 summary
1. Identification table should be 3 tables
2. DAL prompt
3. Complete DB architecture footprint - user/org extension table + JASON blob - micro migration
---
Of course. This is the perfect way to close this chapter and ensure the foundation is solid before we build upon it. Here is the final, comprehensive recap of our entire user-centric database design.

---

### Architectural Recap: The Person & User Data Model

This document summarizes the final design for handling all people, users, and their associated data in our system.

**1. Core Principle: "Person-First" Identity**

The most fundamental decision is to separate the concept of a unique human being from their login account.

*   **`persons` Table:** This is the canonical source of truth for a unique individual. Its only job is to represent one person and assign them a permanent, unique `id`. This is the key to our deduplication strategy.
*   **`users` Table:** This table represents an *account* that can log in to the system. It is linked directly to a `persons` record. This design correctly models that a person can exist in our system (e.g., as a candidate) long before they ever create a login.

**2. Contact Information & Deduplication: The Three-Table Model**

To handle contact information robustly and enable powerful deduplication, we are using three distinct tables, each linked to the `persons` table.

*   **Tables:** `person_emails`, `person_phones`, `person_socials`.
*   **Rationale (The "Insurance Policy"):**
    *   **Integrity:** Each table uses specific database constraints (e.g., `CHECK (email LIKE '%@%')`) that act as a final, unbreakable line of defense against corrupt data, even if our application code fails.
    *   **Performance:** This model allows for small, hyper-fast indexes on each contact type, guaranteeing that our most critical feature—duplicate checking—remains fast as we scale to millions of records.
    *   **Clarity:** The explicit schema is easier for both human developers and AI assistants to understand and query correctly, reducing the risk of bugs.

**3. User Roles & Specialization: The Extension Table (Hybrid) Model**

To handle the different types of users (recruiters, employer staff, etc.), we are using extension tables with a flexible `JSONB` component.

*   **Tables:** `recruiter_profile`, `employer_user_profile`, `platform_user_profile`.
*   **Structure:** Each table is linked directly to the `users` table via `user_id`.
*   **Methodology ("Build as You Go"):**
    *   **Structured Columns:** For data that is critical and well-understood (e.g., `commission_rate`), we will use dedicated, strongly-typed columns.
    *   **`settings` JSONB Column:** For data that is experimental, rapidly changing, or less critical, we will use the `JSONB` field. This gives us Mongo-like flexibility for prototyping.
    *   **"Micro-Migrations":** As fields in the `JSONB` blob prove their value and stabilize, we will promote them to their own structured columns.

**4. Multi-Tenancy & Data Isolation: The `organizations` Link**

All data is isolated by tenant through a clear ownership model centered on the `organizations` table.

*   **`organizations` Table:** This is the central "tenant" table. It defines the company (Employer, Agency, or Platform).
*   **`organization_members` Table:** This crucial junction table links a `user` to an `organization`, officially making them a member of that tenant. All access control rules will stem from this relationship. For the MVP, simple membership is enough to grant access. For the future, this table is where we will add `role_id` to enable fine-grained permissions.

This comprehensive design provides a secure, scalable, and maintainable foundation for managing user identity and data access in our multi-tenant SaaS application.


----
1. Identification table should be 3 tables
Final Verdict: One Table vs. Three (Concise Summary)
My Intuition: "A single person_contacts table feels simpler and faster to build with right now."
Our Decision: We are using three separate tables (person_emails, person_phones, person_socials).
Why We're Overriding Intuition (The 3 "Insurance Policies"):
- Insurance Against "Emergency" Mistakes: When we inevitably need to write a rushed script (like a bulk import) that bypasses the application's validation, the database's strict rules on each of the three tables will be our last line of defense against corrupting our own data. A single generic table offers no such defense.
- Insurance Against Future Slowness: Our most critical query is duplicate checking. The three-table model uses small, hyper-fast indexes that are guaranteed to stay fast when we have millions of candidates. A single table creates a performance bottleneck that will be very costly to fix later.
- Insurance Against AI Confusion: An explicit schema with three distinct tables is clearer for an AI assistant to understand and query correctly. This reduces the risk of subtle, AI-generated bugs in our core logic.
We are paying a small, one-time cost (creating two extra tables) to buy permanent, long-term protection against data corruption, performance issues, and buggy code.
------
2. DAL prompt
You have raised an absolutely critical point. You are 100% right. I used the term "Repository" as a piece of developer jargon, assuming the AI would understand the design pattern. That's a mistake. A truly effective prompt must be self-contained and define its own terms clearly. An AI, especially a general one, might not have the specific context of the "Repository Pattern" from enterprise software design.

Thank you for catching this. It will make the final prompt infinitely more robust. Let's rewrite the DAL Mandate to be crystal clear, explicitly defining what a "Repository" is and what its "Guardian" role entails.

Of course. This is the perfect way to conclude. We will create a definitive "Architectural Blueprint" document. This will serve as your guide, solidifying our decisions and providing a clear path forward so you can focus on building. The new information about multi-tenancy and organizational hierarchy is critical, and we will integrate it directly into the plan.

Here is your complete architectural blueprint.

***

## Architectural Blueprint: A Unified ATS

### 1. The Final Architectural Decision: "Build as You Go" Hybrid Model

We will implement a **hybrid database model** that combines the strengths of traditional relational tables with the flexibility of `JSONB`.

*   **Core Principle:** Data that is **critical, stable, and well-understood** will be stored in strongly-typed columns within dedicated **extension tables**. Data that is **experimental, non-critical, or has a rapidly changing structure** will be stored in a `settings` **`JSONB`** column on those same extension tables.
*   **Methodology:** We will start by defining the full relational schema for the parts of the product we understand well (the "Platform"). For "fuzzy" future areas (Employers, Agencies), we will start with placeholder extension tables and use the `JSONB` column for schema discovery. As fields within the `JSONB` prove their value and stabilize, we will promote them to dedicated columns via small, manageable "micro-migrations."

---

### 2. The "Why": Justification and Devil's Advocate Counter-Arguments

We chose this path after weighing the pros and cons of several architectural patterns. This model is specifically tailored to your unique context.

| Architectural Choice & Rationale | Devil's Advocate Risk | Why We Chose This Path Anyway (Our Mitigation) |
| :--- | :--- | :--- |
| **Use a Hybrid Model (Relational + JSONB)**<br>_It provides safety for critical data while allowing Mongo-like flexibility for new/unstable features._ | **The "Two-Headed Dragon" for AI**<br>_The AI might get confused about whether to query a real column or a JSONB key, leading to complex bugs._ | **We will actively manage the AI.** By using an explicit "Source of Truth" prompting pattern, leveraging Zod schemas as a shared language, and isolating hybrid logic in a dedicated repository layer, we can guide the AI effectively and minimize confusion. You, as the architect, will direct the AI. |
| **Use Extension Tables for Core Entities**<br>_This provides the highest level of data integrity and type safety for financial and critical data, which is essential for a production system._ | **Initial Rigidity Slows Prototyping**<br>_Defining a schema upfront feels slow when the requirements are not 100% clear._ | **Your vision for the core product is 80-90% clear.** The cost of defining what you already know is low. The `JSONB` `settings` field provides an "escape hatch" for the 10-20% of uncertainty, giving us the best of both worlds. |
| **Allow "Micro-Migrations"**<br>_This allows us to evolve the schema from JSONB to structured columns in small, safe, manageable steps as the product grows._ | **"Death by a Thousand Cuts"**<br>_Constant context-switching to perform migrations could kill development velocity._ | **This matches your established workflow.** Your comfort and experience with Mongo's flexible-to-rigid pattern means these "micro-migrations" are not a burden but a familiar process. We can batch them to minimize disruption. |

---

### 3. Multi-Tenancy and Data Isolation: The Core Model

This is the most critical part of a multi-tenant SaaS application. We will handle this at the database level with a clear ownership model.

**The Golden Rule:** Every single piece of data that is not globally public (like a user's own profile) **MUST** belong to an `organization`. There will be no "freestanding" jobs or candidates.

**Candidate Isolation:**
You are right, a `candidate` is not an organization. A candidate is a person who exists *in the context of the platform and its tenants*. They should **not** be in the `organizations` table.

*   **The `candidates` Table:** This will be a top-level table similar to `users`. It will hold PII (Personally Identifiable Information) and core skills.
*   **The `applications` Junction Table:** This is the key to isolation. To connect a `candidate` to a `job` (which belongs to an organization), we use a junction table: `applications`.
    *   `applications (id, candidate_id, job_id, organization_id, status)`
    *   When Recruiting Agency A wants to see their candidates, you query for applications where `organization_id` is theirs. This prevents them from ever seeing candidates who applied to Agency B.
    *   The platform (you) can query this table without the `organization_id` filter to see everything.

**Organizational Hierarchy and Permissions:**
Your description of nested organizations and roles (HQ > California > SF) points to a classic **Role-Based Access Control (RBAC)** system combined with an **adjacency list** for the hierarchy.

*   **`organizations` Table:** We will add a `parent_id` column.
    *   `organizations (id, name, type, parent_id REFERENCES organizations(id))`
    *   The SF office's row would have `parent_id` pointing to the California office's ID. The HQ's `parent_id` would be `NULL`.
*   **`roles` Table:** Defines roles (`recruiting_coordinator`, `hiring_manager`).
*   **`permissions` Table:** Defines permissions (`can_edit_job`, `can_view_candidate_salary`).
*   **`role_permissions` Table:** Maps which permissions each role gets.
*   **`user_roles` Table:** Assigns roles to users *within a specific organizational context*.
    *   `user_roles (user_id, role_id, organization_id)`
    *   This is how you grant a user the "Recruiter" role for the "Sales" division (which is just another entry in the `organizations` table).

This structure is incredibly flexible and powerful. It handles both tenancy (a user from Org A can't see Org B's data) and permissions (a coordinator in Org A can't do the same things as a manager in Org A).

---

### 4. The SQL Schema: Initial Draft

Here is the starting point for your `schema.ts` file using Drizzle's syntax.

```typescript
// schema.ts
import { pgTable, uuid, varchar, jsonb, decimal, timestamp, foreignKey } from 'drizzle-orm/pg-core';

// --- Core Identity & Hierarchy ---
export const organizations = pgTable('organizations', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name').notNull(),
  type: varchar('type', { enum: ['employer', 'agency', 'platform'] }).notNull(),
  parentId: uuid('parent_id').references(() => organizations.id), // For hierarchy
  createdAt: timestamp('created_at').defaultNow(),
});

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email').notNull().unique(),
  // etc...
});

// A user's membership in an organization
export const organizationMembers = pgTable('organization_members', {
    userId: uuid('user_id').references(() => users.id),
    organizationId: uuid('organization_id').references(() => organizations.id),
});


// --- Extension Tables ---
export const employers = pgTable('employers', {
  orgId: uuid('org_id').primaryKey().references(() => organizations.id),
  settings: jsonb('settings').default('{}'), // For schema discovery
});

export const agencies = pgTable('agencies', {
  orgId: uuid('org_id').primaryKey().references(() => organizations.id),
  settings: jsonb('settings').default('{}'),
});

export const platforms = pgTable('platforms', {
  orgId: uuid('org_id').primaryKey().references(() => organizations.id),
  marketplaceFee: decimal('marketplace_fee', { precision: 5, scale: 2 }).notNull(), // Known critical field
  settings: jsonb('settings').default('{}'),
});


// --- Candidate & Application Model for Isolation ---
export const candidates = pgTable('candidates', {
    id: uuid('id').primaryKey().defaultRandom(),
    firstName: varchar('first_name'),
    lastName: varchar('last_name'),
    email: varchar('email').unique(),
    // ... other PII and core skills
    profileData: jsonb('profile_data').default('{}'), // For custom fields, resume data, etc.
});

export const jobs = pgTable('jobs', {
    id: uuid('id').primaryKey().defaultRandom(),
    title: varchar('title').notNull(),
    organizationId: uuid('organization_id').references(() => organizations.id).notNull(), // Every job MUST belong to an org
});

export const applications = pgTable('applications', {
    id: uuid('id').primaryKey().defaultRandom(),
    candidateId: uuid('candidate_id').references(() => candidates.id).notNull(),
    jobId: uuid('job_id').references(() => jobs.id).notNull(),
    organizationId: uuid('organization_id').references(() => organizations.id).notNull(), // Denormalized for easy tenancy queries
    status: varchar('status').notNull().default('applied'),
});
```

---

### 5. Guide for the Data Access Layer (DAL) with Zod

Your DAL (i.e., your repositories) is the firewall between your application's business logic and the database's complex reality.

**Principle:** The DAL's job is to return clean, predictable objects. The rest of the app should not know if the data came from a `JOIN` or a `JSONB` key.

**Workflow:**
1.  **Define the "Perfect" Object with Zod:** Create a Zod schema for the ideal object shape your UI wants to receive. This is your contract.
    ```typescript
    // types/employer-types.ts
    export const employerProfileSchema = z.object({
      orgId: z.string().uuid(),
      name: z.string(),
      industry: z.string().optional(), // This might live in JSONB
      hrisIntegration: z.string().optional(), // This might also live in JSONB
    });
    export type EmployerProfile = z.infer<typeof employerProfileSchema>;
    ```
2.  **Implement the Repository Method:** Write the Drizzle query to fetch data from both structured columns and the `JSONB` blob.
3.  **Transform and Validate:** In your repository method, manually construct the "perfect" object from the raw database result and then **run it through `employerProfileSchema.parse()` before returning**. This ensures the data shape is always correct.

```typescript
// repositories/employer-repository.ts
class EmployerRepository {
  async findById(id: string): Promise<EmployerProfile | undefined> {
    // 1. Fetch raw data from DB
    const result = await db.query... // Your Drizzle query joining organizations and employers

    // 2. Transform raw data into the "perfect" shape
    const rawData = result[0];
    const profile = {
      orgId: rawData.orgId,
      name: rawData.organization.name,
      industry: rawData.employer.settings?.industry, // Safely access JSONB
      hrisIntegration: rawData.employer.settings?.hrisIntegration,
    };

    // 3. Validate and return
    return employerProfileSchema.parse(profile);
  }
}
```

---

### 6. Guide for AI Prompts

Of course. This is the perfect way to conclude. We will create a definitive "Architectural Blueprint" document. This will serve as your guide, solidifying our decisions and providing a clear path forward so you can focus on building. The new information about multi-tenancy and organizational hierarchy is critical, and we will integrate it directly into the plan.

Here is your complete architectural blueprint.

***

## Architectural Blueprint: A Unified ATS

### 1. The Final Architectural Decision: "Build as You Go" Hybrid Model

We will implement a **hybrid database model** that combines the strengths of traditional relational tables with the flexibility of `JSONB`.

*   **Core Principle:** Data that is **critical, stable, and well-understood** will be stored in strongly-typed columns within dedicated **extension tables**. Data that is **experimental, non-critical, or has a rapidly changing structure** will be stored in a `settings` **`JSONB`** column on those same extension tables.
*   **Methodology:** We will start by defining the full relational schema for the parts of the product we understand well (the "Platform"). For "fuzzy" future areas (Employers, Agencies), we will start with placeholder extension tables and use the `JSONB` column for schema discovery. As fields within the `JSONB` prove their value and stabilize, we will promote them to dedicated columns via small, manageable "micro-migrations."

---

### 2. The "Why": Justification and Devil's Advocate Counter-Arguments

We chose this path after weighing the pros and cons of several architectural patterns. This model is specifically tailored to your unique context.

| Architectural Choice & Rationale | Devil's Advocate Risk | Why We Chose This Path Anyway (Our Mitigation) |
| :--- | :--- | :--- |
| **Use a Hybrid Model (Relational + JSONB)**<br>_It provides safety for critical data while allowing Mongo-like flexibility for new/unstable features._ | **The "Two-Headed Dragon" for AI**<br>_The AI might get confused about whether to query a real column or a JSONB key, leading to complex bugs._ | **We will actively manage the AI.** By using an explicit "Source of Truth" prompting pattern, leveraging Zod schemas as a shared language, and isolating hybrid logic in a dedicated repository layer, we can guide the AI effectively and minimize confusion. You, as the architect, will direct the AI. |
| **Use Extension Tables for Core Entities**<br>_This provides the highest level of data integrity and type safety for financial and critical data, which is essential for a production system._ | **Initial Rigidity Slows Prototyping**<br>_Defining a schema upfront feels slow when the requirements are not 100% clear._ | **Your vision for the core product is 80-90% clear.** The cost of defining what you already know is low. The `JSONB` `settings` field provides an "escape hatch" for the 10-20% of uncertainty, giving us the best of both worlds. |
| **Allow "Micro-Migrations"**<br>_This allows us to evolve the schema from JSONB to structured columns in small, safe, manageable steps as the product grows._ | **"Death by a Thousand Cuts"**<br>_Constant context-switching to perform migrations could kill development velocity._ | **This matches your established workflow.** Your comfort and experience with Mongo's flexible-to-rigid pattern means these "micro-migrations" are not a burden but a familiar process. We can batch them to minimize disruption. |

---

### 3. Multi-Tenancy and Data Isolation: The Core Model

This is the most critical part of a multi-tenant SaaS application. We will handle this at the database level with a clear ownership model.

**The Golden Rule:** Every single piece of data that is not globally public (like a user's own profile) **MUST** belong to an `organization`. There will be no "freestanding" jobs or candidates.

**Candidate Isolation:**
You are right, a `candidate` is not an organization. A candidate is a person who exists *in the context of the platform and its tenants*. They should **not** be in the `organizations` table.

*   **The `candidates` Table:** This will be a top-level table similar to `users`. It will hold PII (Personally Identifiable Information) and core skills.
*   **The `applications` Junction Table:** This is the key to isolation. To connect a `candidate` to a `job` (which belongs to an organization), we use a junction table: `applications`.
    *   `applications (id, candidate_id, job_id, organization_id, status)`
    *   When Recruiting Agency A wants to see their candidates, you query for applications where `organization_id` is theirs. This prevents them from ever seeing candidates who applied to Agency B.
    *   The platform (you) can query this table without the `organization_id` filter to see everything.

**Organizational Hierarchy and Permissions:**
Your description of nested organizations and roles (HQ > California > SF) points to a classic **Role-Based Access Control (RBAC)** system combined with an **adjacency list** for the hierarchy.

*   **`organizations` Table:** We will add a `parent_id` column.
    *   `organizations (id, name, type, parent_id REFERENCES organizations(id))`
    *   The SF office's row would have `parent_id` pointing to the California office's ID. The HQ's `parent_id` would be `NULL`.
*   **`roles` Table:** Defines roles (`recruiting_coordinator`, `hiring_manager`).
*   **`permissions` Table:** Defines permissions (`can_edit_job`, `can_view_candidate_salary`).
*   **`role_permissions` Table:** Maps which permissions each role gets.
*   **`user_roles` Table:** Assigns roles to users *within a specific organizational context*.
    *   `user_roles (user_id, role_id, organization_id)`
    *   This is how you grant a user the "Recruiter" role for the "Sales" division (which is just another entry in the `organizations` table).

This structure is incredibly flexible and powerful. It handles both tenancy (a user from Org A can't see Org B's data) and permissions (a coordinator in Org A can't do the same things as a manager in Org A).

---

### 4. The SQL Schema: Initial Draft

Here is the starting point for your `schema.ts` file using Drizzle's syntax.

```typescript
// schema.ts
import { pgTable, uuid, varchar, jsonb, decimal, timestamp, foreignKey } from 'drizzle-orm/pg-core';

// --- Core Identity & Hierarchy ---
export const organizations = pgTable('organizations', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name').notNull(),
  type: varchar('type', { enum: ['employer', 'agency', 'platform'] }).notNull(),
  parentId: uuid('parent_id').references(() => organizations.id), // For hierarchy
  createdAt: timestamp('created_at').defaultNow(),
});

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email').notNull().unique(),
  // etc...
});

// A user's membership in an organization
export const organizationMembers = pgTable('organization_members', {
    userId: uuid('user_id').references(() => users.id),
    organizationId: uuid('organization_id').references(() => organizations.id),
});


// --- Extension Tables ---
export const employers = pgTable('employers', {
  orgId: uuid('org_id').primaryKey().references(() => organizations.id),
  settings: jsonb('settings').default('{}'), // For schema discovery
});

export const agencies = pgTable('agencies', {
  orgId: uuid('org_id').primaryKey().references(() => organizations.id),
  settings: jsonb('settings').default('{}'),
});

export const platforms = pgTable('platforms', {
  orgId: uuid('org_id').primaryKey().references(() => organizations.id),
  marketplaceFee: decimal('marketplace_fee', { precision: 5, scale: 2 }).notNull(), // Known critical field
  settings: jsonb('settings').default('{}'),
});


// --- Candidate & Application Model for Isolation ---
export const candidates = pgTable('candidates', {
    id: uuid('id').primaryKey().defaultRandom(),
    firstName: varchar('first_name'),
    lastName: varchar('last_name'),
    email: varchar('email').unique(),
    // ... other PII and core skills
    profileData: jsonb('profile_data').default('{}'), // For custom fields, resume data, etc.
});

export const jobs = pgTable('jobs', {
    id: uuid('id').primaryKey().defaultRandom(),
    title: varchar('title').notNull(),
    organizationId: uuid('organization_id').references(() => organizations.id).notNull(), // Every job MUST belong to an org
});

export const applications = pgTable('applications', {
    id: uuid('id').primaryKey().defaultRandom(),
    candidateId: uuid('candidate_id').references(() => candidates.id).notNull(),
    jobId: uuid('job_id').references(() => jobs.id).notNull(),
    organizationId: uuid('organization_id').references(() => organizations.id).notNull(), // Denormalized for easy tenancy queries
    status: varchar('status').notNull().default('applied'),
});
```

---

### 5. Guide for the Data Access Layer (DAL) with Zod

Your DAL (i.e., your repositories) is the firewall between your application's business logic and the database's complex reality.

**Principle:** The DAL's job is to return clean, predictable objects. The rest of the app should not know if the data came from a `JOIN` or a `JSONB` key.

**Workflow:**
1.  **Define the "Perfect" Object with Zod:** Create a Zod schema for the ideal object shape your UI wants to receive. This is your contract.
    ```typescript
    // types/employer-types.ts
    export const employerProfileSchema = z.object({
      orgId: z.string().uuid(),
      name: z.string(),
      industry: z.string().optional(), // This might live in JSONB
      hrisIntegration: z.string().optional(), // This might also live in JSONB
    });
    export type EmployerProfile = z.infer<typeof employerProfileSchema>;
    ```
2.  **Implement the Repository Method:** Write the Drizzle query to fetch data from both structured columns and the `JSONB` blob.
3.  **Transform and Validate:** In your repository method, manually construct the "perfect" object from the raw database result and then **run it through `employerProfileSchema.parse()` before returning**. This ensures the data shape is always correct.

```typescript
// repositories/employer-repository.ts
class EmployerRepository {
  async findById(id: string): Promise<EmployerProfile | undefined> {
    // 1. Fetch raw data from DB
    const result = await db.query... // Your Drizzle query joining organizations and employers

    // 2. Transform raw data into the "perfect" shape
    const rawData = result[0];
    const profile = {
      orgId: rawData.orgId,
      name: rawData.organization.name,
      industry: rawData.employer.settings?.industry, // Safely access JSONB
      hrisIntegration: rawData.employer.settings?.hrisIntegration,
    };

    // 3. Validate and return
    return employerProfileSchema.parse(profile);
  }
}
```

---

### 6. Guide for AI Prompts

This is your playbook for directing the AI and minimizing confusion.

**The Golden Rule:** Be explicit. Be the architect.

| Prompting Tactic | Example |
| :--- | :--- |
| **1. Use the "Source of Truth" Pattern** | "Write a Drizzle query. **Source of Truth:** `name` is a column on `organizations`. `team_size` is a key in the `settings` JSONB column on `employers`." |
| **2. Provide a Zod Schema as the Target** | "The function must return an object that validates against this Zod schema: `const schema = z.object({ name: z.string(), teamSize: z.number() });`" |
| **3. Enforce the Repository Boundary** | "Write a *service function* that calls `EmployerRepository.getProfile(id)`. This function must **not** contain any database queries itself." |
| **4. Demand Edge Case Handling** | "Now, add logic to handle cases where the `settings` column is null or the `team_size` key is missing from the JSON." |
| **5. Ask for the "Why"** | "Explain the Drizzle query you just wrote. Why did you use a `leftJoin`? Why did you use the `->>` operator for the JSONB field?" |

By following this blueprint, you have a robust, scalable, and well-documented plan that is tailored to your specific needs, skills, and development process.

---

### AI Prompting Guide: The Data Access Layer (DAL) Mandate (Revised for Clarity)

**Objective:** To ensure all database interactions are safe, maintainable, and routed through a single, validated layer. This is a non-negotiable rule for our codebase.

**The Prompt Component:**

> **DAL MANDATE: STRICT ADHERENCE REQUIRED**
>
> **1. Introduction to Our Data Access Layer (DAL):**
> In our project, we use a specific design pattern to access the database. We create a dedicated TypeScript class for each main database entity (e.g., `users`, `organizations`). We call this class a **"Repository"** (e.g., `UserRepository`, `OrganizationRepository`). The *only* purpose of a Repository is to handle all communication with its corresponding database tables.
>
> **2. The Core Rule: Repositories Are the Only Path to the Database:**
> All database queries (SELECT, INSERT, UPDATE, DELETE) **MUST** be executed exclusively within a method of a **Repository class**. Other parts of the code (like business logic, API endpoints, or service functions) are **STRICTLY FORBIDDEN** from containing raw database queries. Instead of accessing the database directly, they **MUST** call a method on the appropriate Repository class.
>
> **3. The "Guardian" Role of a Repository:**
> Think of a Repository as a **"Guardian"** that protects the database and the rest of the application from each other. Every public method in a Repository must perform these three guardian duties:
>    a.  **Control Input:** It takes simple, predictable arguments (like a user ID or a pre-validated data object).
>    b.  **Execute & Translate:** It performs the necessary database query using our ORM (Drizzle) and translates the raw, sometimes complex, database result into a clean, simple JavaScript object.
>    c.  **Guarantee Output:** Before returning the final object, it **MUST** validate that object against its corresponding Zod schema. This guarantees that the rest of the application always receives data in a predictable, safe, and correct format.
>
> **4. Example Task Flow:**
>    *   **My Request:** "Create a service function to update a user's name."
>    *   **Your Required Action Plan:**
>        1.  First, you will check if a method like `UserRepository.updateName(userId, newName)` already exists.
>        2.  If it does not, you will **create that method inside the `UserRepository` class first.** This new method will contain the actual `db.update(...)` query.
>        3.  Only after the repository method is ready will you create the service function `updateUserService(userId, newName)`.
>        4.  The *only* line of code inside this service function will be a call to the repository method: `return UserRepository.updateName(userId, newName);`.
>
> **Acknowledge this mandate. Any violation of these rules, especially direct database access from outside a Repository, will be rejected.**

--------------



Here is your complete architectural blueprint.

***

## Architectural Blueprint: A Unified ATS

### 1. The Final Architectural Decision: "Build as You Go" Hybrid Model

We will implement a **hybrid database model** that combines the strengths of traditional relational tables with the flexibility of `JSONB`.

*   **Core Principle:** Data that is **critical, stable, and well-understood** will be stored in strongly-typed columns within dedicated **extension tables**. Data that is **experimental, non-critical, or has a rapidly changing structure** will be stored in a `settings` **`JSONB`** column on those same extension tables.
*   **Methodology:** We will start by defining the full relational schema for the parts of the product we understand well (the "Platform"). For "fuzzy" future areas (Employers, Agencies), we will start with placeholder extension tables and use the `JSONB` column for schema discovery. As fields within the `JSONB` prove their value and stabilize, we will promote them to dedicated columns via small, manageable "micro-migrations."

---

### 2. The "Why": Justification and Devil's Advocate Counter-Arguments

We chose this path after weighing the pros and cons of several architectural patterns. This model is specifically tailored to your unique context.

| Architectural Choice & Rationale | Devil's Advocate Risk | Why We Chose This Path Anyway (Our Mitigation) |
| :--- | :--- | :--- |
| **Use a Hybrid Model (Relational + JSONB)**<br>_It provides safety for critical data while allowing Mongo-like flexibility for new/unstable features._ | **The "Two-Headed Dragon" for AI**<br>_The AI might get confused about whether to query a real column or a JSONB key, leading to complex bugs._ | **We will actively manage the AI.** By using an explicit "Source of Truth" prompting pattern, leveraging Zod schemas as a shared language, and isolating hybrid logic in a dedicated repository layer, we can guide the AI effectively and minimize confusion. You, as the architect, will direct the AI. |
| **Use Extension Tables for Core Entities**<br>_This provides the highest level of data integrity and type safety for financial and critical data, which is essential for a production system._ | **Initial Rigidity Slows Prototyping**<br>_Defining a schema upfront feels slow when the requirements are not 100% clear._ | **Your vision for the core product is 80-90% clear.** The cost of defining what you already know is low. The `JSONB` `settings` field provides an "escape hatch" for the 10-20% of uncertainty, giving us the best of both worlds. |
| **Allow "Micro-Migrations"**<br>_This allows us to evolve the schema from JSONB to structured columns in small, safe, manageable steps as the product grows._ | **"Death by a Thousand Cuts"**<br>_Constant context-switching to perform migrations could kill development velocity._ | **This matches your established workflow.** Your comfort and experience with Mongo's flexible-to-rigid pattern means these "micro-migrations" are not a burden but a familiar process. We can batch them to minimize disruption. |

---

### 3. Multi-Tenancy and Data Isolation: The Core Model

This is the most critical part of a multi-tenant SaaS application. We will handle this at the database level with a clear ownership model.

**The Golden Rule:** Every single piece of data that is not globally public (like a user's own profile) **MUST** belong to an `organization`. There will be no "freestanding" jobs or candidates.

**Candidate Isolation:**
You are right, a `candidate` is not an organization. A candidate is a person who exists *in the context of the platform and its tenants*. They should **not** be in the `organizations` table.

*   **The `candidates` Table:** This will be a top-level table similar to `users`. It will hold PII (Personally Identifiable Information) and core skills.
*   **The `applications` Junction Table:** This is the key to isolation. To connect a `candidate` to a `job` (which belongs to an organization), we use a junction table: `applications`.
    *   `applications (id, candidate_id, job_id, organization_id, status)`
    *   When Recruiting Agency A wants to see their candidates, you query for applications where `organization_id` is theirs. This prevents them from ever seeing candidates who applied to Agency B.
    *   The platform (you) can query this table without the `organization_id` filter to see everything.

**Organizational Hierarchy and Permissions:**
Your description of nested organizations and roles (HQ > California > SF) points to a classic **Role-Based Access Control (RBAC)** system combined with an **adjacency list** for the hierarchy.

*   **`organizations` Table:** We will add a `parent_id` column.
    *   `organizations (id, name, type, parent_id REFERENCES organizations(id))`
    *   The SF office's row would have `parent_id` pointing to the California office's ID. The HQ's `parent_id` would be `NULL`.
*   **`roles` Table:** Defines roles (`recruiting_coordinator`, `hiring_manager`).
*   **`permissions` Table:** Defines permissions (`can_edit_job`, `can_view_candidate_salary`).
*   **`role_permissions` Table:** Maps which permissions each role gets.
*   **`user_roles` Table:** Assigns roles to users *within a specific organizational context*.
    *   `user_roles (user_id, role_id, organization_id)`
    *   This is how you grant a user the "Recruiter" role for the "Sales" division (which is just another entry in the `organizations` table).

This structure is incredibly flexible and powerful. It handles both tenancy (a user from Org A can't see Org B's data) and permissions (a coordinator in Org A can't do the same things as a manager in Org A).

---

### 4. The SQL Schema: Initial Draft

Here is the starting point for your `schema.ts` file using Drizzle's syntax.

```typescript
// schema.ts
import { pgTable, uuid, varchar, jsonb, decimal, timestamp, foreignKey } from 'drizzle-orm/pg-core';

// --- Core Identity & Hierarchy ---
export const organizations = pgTable('organizations', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name').notNull(),
  type: varchar('type', { enum: ['employer', 'agency', 'platform'] }).notNull(),
  parentId: uuid('parent_id').references(() => organizations.id), // For hierarchy
  createdAt: timestamp('created_at').defaultNow(),
});

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email').notNull().unique(),
  // etc...
});

// A user's membership in an organization
export const organizationMembers = pgTable('organization_members', {
    userId: uuid('user_id').references(() => users.id),
    organizationId: uuid('organization_id').references(() => organizations.id),
});


// --- Extension Tables ---
export const employers = pgTable('employers', {
  orgId: uuid('org_id').primaryKey().references(() => organizations.id),
  settings: jsonb('settings').default('{}'), // For schema discovery
});

export const agencies = pgTable('agencies', {
  orgId: uuid('org_id').primaryKey().references(() => organizations.id),
  settings: jsonb('settings').default('{}'),
});

export const platforms = pgTable('platforms', {
  orgId: uuid('org_id').primaryKey().references(() => organizations.id),
  marketplaceFee: decimal('marketplace_fee', { precision: 5, scale: 2 }).notNull(), // Known critical field
  settings: jsonb('settings').default('{}'),
});


// --- Candidate & Application Model for Isolation ---
export const candidates = pgTable('candidates', {
    id: uuid('id').primaryKey().defaultRandom(),
    firstName: varchar('first_name'),
    lastName: varchar('last_name'),
    email: varchar('email').unique(),
    // ... other PII and core skills
    profileData: jsonb('profile_data').default('{}'), // For custom fields, resume data, etc.
});

export const jobs = pgTable('jobs', {
    id: uuid('id').primaryKey().defaultRandom(),
    title: varchar('title').notNull(),
    organizationId: uuid('organization_id').references(() => organizations.id).notNull(), // Every job MUST belong to an org
});

export const applications = pgTable('applications', {
    id: uuid('id').primaryKey().defaultRandom(),
    candidateId: uuid('candidate_id').references(() => candidates.id).notNull(),
    jobId: uuid('job_id').references(() => jobs.id).notNull(),
    organizationId: uuid('organization_id').references(() => organizations.id).notNull(), // Denormalized for easy tenancy queries
    status: varchar('status').notNull().default('applied'),
});
```

---

### 5. Guide for the Data Access Layer (DAL) with Zod

Your DAL (i.e., your repositories) is the firewall between your application's business logic and the database's complex reality.

**Principle:** The DAL's job is to return clean, predictable objects. The rest of the app should not know if the data came from a `JOIN` or a `JSONB` key.

**Workflow:**
1.  **Define the "Perfect" Object with Zod:** Create a Zod schema for the ideal object shape your UI wants to receive. This is your contract.
    ```typescript
    // types/employer-types.ts
    export const employerProfileSchema = z.object({
      orgId: z.string().uuid(),
      name: z.string(),
      industry: z.string().optional(), // This might live in JSONB
      hrisIntegration: z.string().optional(), // This might also live in JSONB
    });
    export type EmployerProfile = z.infer<typeof employerProfileSchema>;
    ```
2.  **Implement the Repository Method:** Write the Drizzle query to fetch data from both structured columns and the `JSONB` blob.
3.  **Transform and Validate:** In your repository method, manually construct the "perfect" object from the raw database result and then **run it through `employerProfileSchema.parse()` before returning**. This ensures the data shape is always correct.

```typescript
// repositories/employer-repository.ts
class EmployerRepository {
  async findById(id: string): Promise<EmployerProfile | undefined> {
    // 1. Fetch raw data from DB
    const result = await db.query... // Your Drizzle query joining organizations and employers

    // 2. Transform raw data into the "perfect" shape
    const rawData = result[0];
    const profile = {
      orgId: rawData.orgId,
      name: rawData.organization.name,
      industry: rawData.employer.settings?.industry, // Safely access JSONB
      hrisIntegration: rawData.employer.settings?.hrisIntegration,
    };

    // 3. Validate and return
    return employerProfileSchema.parse(profile);
  }
}
```

---

### 6. Guide for AI Prompts

This is your playbook for directing the AI and minimizing confusion.

**The Golden Rule:** Be explicit. Be the architect.

| Prompting Tactic | Example |
| :--- | :--- |
| **1. Use the "Source of Truth" Pattern** | "Write a Drizzle query. **Source of Truth:** `name` is a column on `organizations`. `team_size` is a key in the `settings` JSONB column on `employers`." |
| **2. Provide a Zod Schema as the Target** | "The function must return an object that validates against this Zod schema: `const schema = z.object({ name: z.string(), teamSize: z.number() });`" |
| **3. Enforce the Repository Boundary** | "Write a *service function* that calls `EmployerRepository.getProfile(id)`. This function must **not** contain any database queries itself." |
| **4. Demand Edge Case Handling** | "Now, add logic to handle cases where the `settings` column is null or the `team_size` key is missing from the JSON." |
| **5. Ask for the "Why"** | "Explain the Drizzle query you just wrote. Why did you use a `leftJoin`? Why did you use the `->>` operator for the JSONB field?" |

By following this blueprint, you have a robust, scalable, and well-documented plan that is tailored to your specific needs, skills, and development process.