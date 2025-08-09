# Manus AI Research Input
**Date:** 2025-01-08  
**Purpose:** Research findings from Manus AI for consolidation with Claude research

---

## Instructions
Please paste your research findings from Manus AI here. I will consolidate this with the existing competitive analysis and pain point research.

---

**[PASTE MANUS RESEARCH BELOW]**
ATS Navigation Design Document

Executive Summary: Key Findings & Strategic Overview

This document outlines a strategic approach to designing the user interface and navigation for a new Applicant Tracking System (ATS) that aims to achieve a competitive advantage through superior UI/UX and usability. The analysis is based on extensive research of 11 leading ATS and executive search platforms, identifying common pain points, critical features, and effective navigation patterns across various user roles.

Our research indicates that while specific UI layouts vary, the most successful platforms prioritize clarity, efficiency, and role-specific workflows. A recurring theme is the challenge users face with high cognitive load, inefficient context-switching, and managing disorganized communication. The proposed design directly addresses these issues by leveraging proven navigation hierarchies and prioritizing features that streamline core recruiting and hiring processes.

This document provides a detailed breakdown of recommended navigation structures for both Recruiting Agency and Employer personas, along with a strategic product roadmap to guide development, ensuring a user-centric and highly competitive product from day one.

1. Common Pain Points & Top Features

This section summarizes the key challenges faced by users in the recruiting ecosystem and identifies the most frequently implemented and critical features across the analyzed competitor products. These insights form the foundation for our navigation and feature prioritization.

Top User Pain Points to Solve:

•
High Cognitive Load: Users often feel overwhelmed by cluttered interfaces, excessive information density, and a lack of clear visual hierarchy, leading to mental fatigue and errors.

•
Inefficient Context-Switching: Recruiters and hiring managers frequently need to switch between different jobs, candidates, and communication threads. Poor navigation design forces excessive clicks and re-orientation, wasting valuable time.

•
Disorganized Communication: Tracking email threads, internal notes, and feedback from multiple stakeholders for a single candidate or job is a major challenge, leading to missed information and delays.

•
Manual, Repetitive Tasks: Many daily recruiting activities, such as scheduling interviews, sending follow-up emails, and updating candidate statuses, are often manual and time-consuming, reducing efficiency.

•
Lack of Actionable Insights: While data might be available, users struggle to interpret it to identify bottlenecks, measure performance, or make data-driven decisions (e.g., understanding why a specific hiring stage is slow).

Most Common & Critical Features (The "Table Stakes"):

These are the fundamental features that every competitive ATS must offer to meet basic user expectations and enable core workflows.

•
Centralized Job & Candidate Databases: A single, comprehensive source of truth for all open positions and all candidate profiles, accessible and manageable from one place.

•
Visual Candidate Pipeline (Kanban/List): An intuitive, visual representation of candidates moving through various stages of the hiring process, allowing for easy drag-and-drop updates and quick status checks.

•
Global Search: A powerful, fast, and accurate search functionality that allows users to instantly find any job, candidate, contact, or company record across the entire platform.

•
Activity Feed: A chronological, detailed log of all interactions, notes, and status changes related to a specific candidate or job, providing a complete history at a glance.

•
Email Integration & Templates: The ability to send and receive emails directly from within the ATS, often with customizable templates for common communications (e.g., interview requests, rejection letters).

•
Role-Based Dashboards: Personalized landing pages that provide an at-a-glance overview of the most urgent tasks, new notifications, and key performance indicators relevant to the specific user's role (Recruiter, Employer, Admin).

2. Recommended Product Roadmap

This roadmap outlines a phased approach to product development, prioritizing the most critical features for a Minimum Viable Product (MVP) in Phase I, followed by strategic enhancements in Phase II. This ensures a rapid market entry with core functionality while planning for future competitive advantages.

Phase I (MVP - Core Workflow Engine):

Focus on building the foundational elements that enable the primary workflows for both recruiters and employers, ensuring a smooth and intuitive user experience from the outset.

•
Navigation & UI Framework: Implement the recommended navigation structures for all initial personas (Recruiting Agency, Employer), ensuring responsiveness for mobile access.

•
User Roles & Permissions: Establish basic account creation, login, and role-based access control for Agencies and Employers.

•
Job Management (Employer Side): Functionality for Employers to create, edit, and publish job postings to the marketplace.

•
Job Marketplace (Agency Side): Agencies can browse, search, and accept job opportunities posted by Employers.

•
Candidate Submission: Agencies can submit candidates to specific jobs, including attaching resumes and basic profile information.

•
Candidate Review (Employer Side): Employers can view submitted candidate profiles, resumes, and basic notes.

•
Core Pipeline View: A functional Kanban or list view for both Employers (to track candidates for their jobs) and Agencies (to track candidates they've submitted), allowing for manual stage progression.

•
Basic Notes & Activity Feed: The ability to add simple text notes to candidate and job records, and a chronological feed of key actions (e.g., candidate submitted, stage changed).

Phase II (Enhancements & Integrations):

Building upon the MVP, Phase II introduces features that significantly enhance efficiency, collaboration, and data insights, driving user stickiness and competitive differentiation.

•
Advanced Communications: Full email integration (send/receive), customizable email templates, and bulk messaging capabilities for common recruiter/employer communications.

•
Interview Scheduling & Coordination: Tools to facilitate interview scheduling, send calendar invites, and manage interview logistics for multiple rounds.

•
Scorecards & Structured Feedback: Implement customizable scorecards for interviewers to provide structured feedback, enabling objective candidate comparison.

•
Comprehensive Analytics & Reporting: Dashboards and reports providing insights into hiring funnel metrics, time-to-fill, source effectiveness, and agency performance.

•
Sourcing Tools & Integrations: Browser extensions or direct integrations to easily import candidate profiles from professional networks (e.g., LinkedIn).

•
External Job Board Integrations: Automated posting of jobs to popular job boards and career sites.

•
Referral Programs: Functionality to manage internal or external referral programs.

•
Mobile App Enhancements: Beyond responsive web, consider native app features for on-the-go tasks (e.g., quick candidate review, interview reminders).

3. Detailed Navigation Design: Employer Persona

The navigation for the Employer is designed for simplicity and focus, enabling hiring managers and internal recruiters to efficiently manage their open roles and review candidates. Employers primarily interact with their own company's jobs and the candidates submitted to them. The design utilizes a Primary Vertical Sidebar, a model proven by top-tier ATS like Greenhouse and Recruiterflow, providing excellent scalability and a clear, stable separation between navigation and the main content area.

Universal Horizontal Features (Top of Screen)

These tools are always visible at the top right of the screen, providing consistent global functionality across the application.

IconFeatureDescription+Quick AddA dropdown to instantly perform the most common action: "Post a New Job".🔍Global SearchA powerful search bar to find any Job, Candidate, or Agency by name.🔔NotificationsAlerts for new candidate submissions, messages, and interview updates.👤User ProfileA menu for Account Settings, Company Profile, Billing, and Logout.




Primary Navigation (1st Level - Vertical Sidebar)

This is the main navigation bar on the left side of the screen, containing the core modules for the employer workflow. It provides clear access to the most frequently used areas of the application.

IconFeatureDescription🏠DashboardThe landing page. Displays an overview of active jobs, candidates needing review, and upcoming interviews.📂JobsThe main area to view all company jobs, check their status (Active, Paused, Filled), and manage their details. This is where new jobs are posted.👥CandidatesA master list of all candidates submitted to all jobs, with powerful filtering and search capabilities. This is the primary review area for employers.🤝AgenciesA directory to view and manage relationships with approved recruitment agencies on the platform.📅InterviewsA centralized calendar showing all scheduled interviews across all jobs, allowing for easy management and coordination.




Contextual Navigation (2nd Level - Horizontal Tabs)

This navigation appears as a set of tabs within the main content area after a user selects an item from the primary navigation. It provides detailed views and actions relevant to the selected record.

Example 1: When a user clicks on a specific "Job" from the Jobs list:

•
A set of tabs appears for that job, allowing the employer to manage different aspects of the hiring process for that specific role:

•
Pipeline: The main Kanban or list view of all candidates for this specific job, showing their current stage.

•
Job Details: The original job description, compensation details, and requirements. This is where the job can be edited or un-published.

•
Scorecard: The rubric and set of questions for interviewers for this role, ensuring consistent and objective feedback.

•
Hiring Team: A list of internal users assigned to this job, with their roles and permissions.



Example 2: When a user clicks on a specific "Candidate" from the Candidates list:

•
A set of tabs appears for that candidate's profile, providing a comprehensive view of their application and progress:

•
Profile & Resume: The candidate's detailed information, contact details, and attached resume file.

•
Activity: A chronological feed of all actions related to this candidate (submissions, stage changes, feedback requests, messages).

•
Feedback: A collection of all completed scorecards and interview notes from the hiring team, allowing for easy comparison.

•
Communications: A log of all messages sent to and from the candidate, including email threads and platform messages.



4. Detailed Navigation Design: Recruiting Agency Persona

The navigation for the Recruiting Agency user is designed for high-volume candidate management, efficient job acquisition from the marketplace, and streamlined communication. Agencies often manage multiple jobs across various employers, requiring robust tools for context switching and pipeline oversight. The design leverages a Primary Vertical Sidebar, a pattern successfully employed by platforms like Bullhorn and Recruiterflow, offering a stable and scalable interface.

Universal Horizontal Features (Top of Screen)

These tools are always visible at the top right of the screen, providing consistent global functionality across the application.

IconFeatureDescription+Quick AddA dropdown to instantly add a new Candidate, Contact, or Job.🔍Global SearchA powerful search bar to find any Job, Candidate, Employer, or Contact by name.🔔NotificationsAlerts for new job postings in the marketplace, client messages, and interview updates.👤User ProfileA menu for Account Settings, Agency Profile, Billing, and Logout.




Primary Navigation (1st Level - Vertical Sidebar)

This is the main navigation bar on the left side of the screen, containing the core modules for the recruiting agency's daily operations.

IconFeatureDescription🏠DashboardThe command center. Displays urgent tasks, new client messages, recent candidate activity, and key performance metrics (e.g., submissions, interviews).🛒Job MarketplaceThe primary area for agencies to browse, search, and accept new job opportunities posted by Employers. This is a critical top-level item for a marketplace platform.💼My JobsA list of all jobs the agency is actively working on, filterable by employer and status.👥CandidatesThe agency's entire talent pool. A searchable database of all their candidates, independent of any specific job, allowing for talent pool management.👤ContactsIndividual contacts (hiring managers, HR personnel) at client companies. Critical for relationship management as contacts may move between companies.🏢CompaniesClient companies and prospects. Track which companies are active, their hiring patterns, and relationship status.📧OutreachTools for candidate sourcing, email campaigns, and managing LinkedIn outreach activities.📊AnalyticsReports on submission volume, interview rates, time-to-fill, and earnings, providing insights into agency performance.





Contextual Navigation (2nd Level - Horizontal Tabs)

This navigation appears as a set of tabs within the main content area after a user selects an item from the primary navigation. It provides detailed views and actions relevant to the selected record.

Example 1: When a user clicks on a specific "My Job" from the My Jobs list:

•
A set of tabs appears for that job, allowing the agency to manage their candidates and communication for that specific role:

•
Pipeline: The main Kanban or list view of all candidates submitted by the agency for this specific job.

•
Notes: Internal notes and reminders related to the job or client.

•
Client Communication: A log of all messages and interactions with the employer for this job.

•
Files: Relevant documents for the job (e.g., detailed job description, client brief).



Example 2: When a user clicks on a specific "Candidate" from the Candidates list:

•
A set of tabs appears for that candidate's profile, providing a comprehensive view of their information and activity:

•
Profile & Resume: The candidate's detailed information, contact details, and attached resume file.

•
Activity: A chronological feed of all actions related to this candidate (submissions, interviews, notes, emails).

•
Notes: Internal notes and feedback related to the candidate.

•
Submissions: A list of all jobs this candidate has been submitted to by the agency.






5. Appendix: Detailed Competitive Navigation Analysis

This section provides a detailed breakdown of the navigation structure and key features for each of the 11 competitor products analyzed during the research phase. This data serves as the evidence base for the strategic recommendations provided in the main body of this document.

5.1 Bullhorn (High-Volume Recruiting)

•
Key Features: Comprehensive CRM for candidates, contacts, jobs; robust pipeline management; email integration; reporting.

•
Universal Horizontal Features (Top Right): Main Menu (hamburger icon), Bullhorn Logo, "Fast Find" Search Bar, Marketplace, Help, User Profile/Settings.

•
Primary Navigation (1st Level - Vertical Sidebar): Dashboard, Candidates, Contacts, Jobs, Placements, Notes, Tasks.

•
Contextual Navigation (2nd Level - Horizontal Tabs within a record):

•
Inside a Job record: Summary, Edit, Files, Submissions, Notes, Activity.

•
Inside a Candidate record: Overview, Edit, Submissions, Notes, Activity.



5.2 Crelate (High-Volume Recruiting)

•
Key Features: Highly customizable views; strong CRM capabilities; flexible data management; reporting.

•
Universal Horizontal Features (Top Right): Global Search, "Create New" button, Tasks, Notifications, User Profile Menu.

•
Primary Navigation (1st Level - Vertical Sidebar): Search, Home (Dashboard), Jobs, Candidates, Contacts, Sales, Reports.

•
Contextual Navigation (2nd Level - Horizontal Bar, changes based on 1st Level selection):

•
If "Jobs" is selected: "All Jobs," "My Open Jobs," "Recently Viewed," etc.

•
If "Candidates" is selected: "All Candidates," "Hot Candidates," "Available," etc.



•
Detailed Record Navigation (3rd Level - Vertical Tabs within a record):

•
Inside a Candidate record: Profile, Resume, Activities, Notes, Files, Files, Placements.



5.3 Invenias (Executive Search)

•
Key Features: Deep integration with Microsoft Outlook; strong relationship management; project-centric workflow.

•
Universal Horizontal Features (Top Right): Global Search (within Outlook ribbon), Outlook Help (?), Outlook User Profile.

•
Primary Navigation (1st Level - Vertical Sidebar): People, Companies, Assignments, Lists, My Activities.

•
Contextual Navigation (2nd Level - Horizontal Ribbon, contextual to Outlook selection): New (Person, Company, etc.), Record Email, View Record, Add Note.

•
Detailed Record Navigation (3rd Level - Vertical Tabs within a record):

•
Inside an Assignment record: Details, Longlist, Shortlist, Target Companies, Client Reports, Notes & Files.



5.4 Clockwork (Executive Search)

•
Key Features: Clean interface; strong project management; client collaboration features; business development tracking.

•
Universal Horizontal Features (Top Right): Notifications (bell icon), User Profile Menu.

•
Primary Navigation (1st Level - Vertical Sidebar): Dashboard, Projects, People, Companies, Deals (Business Development).

•
Contextual Navigation (2nd Level - Horizontal Tabs within a record):

•
Inside a Project record: Strategy, Longlist, Candidates, Scorecard, Files, Client View.



•
Detailed Record Navigation (3rd Level - Tabs/Sections within a record):

•
Inside a Candidate record: Overview, Notes, Projects they are in, Files.



5.5 Thrive TRM (Executive Search)

•
Key Features: Talent relationship management; strong analytics; modern interface; focus on network building.

•
Universal Horizontal Features (Top Right): Global Search, "Quick Create" (+ icon), Notifications (bell icon), Help (?), User Profile Menu.

•
Primary Navigation (1st Level - Vertical Sidebar): Home (Dashboard), Searches, People, Companies, Discussions, Reports, Actions (Tasks).

•
Contextual Navigation (2nd Level - Horizontal Tabs within a record):

•
Inside a Search record: Dashboard (for that specific search), Pipeline, Internal Discussion, Client View, Reporting.



•
Detailed Record Navigation (3rd Level - Vertical Tabs within a record):

•
Inside a Person record: Profile, Activity, Compensation, Relationships, Resume.



5.6 Greenhouse (Employer ATS)

•
Key Features: Structured hiring process; robust interview management; scorecards; reporting.

•
Universal Horizontal Features (Top Right): "Create New" (+ icon), Global Search, Help (?), User Profile Menu.

•
Primary Navigation (1st Level - Vertical Sidebar): Dashboard, Jobs, Candidates, Reports, Configure (Admin/Settings).

•
Contextual Navigation (2nd Level - Horizontal Tabs/Links within a record):

•
Inside a Job record: Job Setup, Pipeline, Scorecard, Hiring Team, Sourcing.



•
Detailed Record Navigation (3rd Level - Tabs/Sections within a record):

•
Inside a Candidate record: Activity Feed, Details, Scorecards, Offers, Private Notes.



5.7 Ashby (Employer ATS)

•
Key Features: Data-driven talent acquisition; strong sourcing tools; analytics; modern UI.

•
Universal Horizontal Features (Top Right): Notifications (bell icon), "Add" (+ icon), Global Search, User Profile Menu.

•
Primary Navigation (1st Level - Horizontal Bar): Pipeline, Jobs, Candidates, Sourcing, Reports, Dashboards, Admin.

•
Contextual Navigation (2nd Level - Vertical Sidebar, contextual to 1st Level selection):

•
Sidebar when "Candidates" is selected: All People, My Favorites, Talent Pools (and other saved searches/views).



•
Detailed Record Navigation (3rd Level - Tabs/Sections within a record):

•
Inside a Candidate record: Profile, Activity, Reviews, Emails.



5.8 Bounty Jobs (Marketplace)

•
Key Features: Marketplace for connecting employers and agencies; job posting and candidate submission; reporting.

•
Universal Horizontal Features (Top Right): Global Search, Help/Support, Notifications (bell icon), User Profile Menu.

•
Primary Navigation (1st Level - Horizontal Bar, role-dependent):

•
Employer View: Dashboard, Bounties (Jobs), Agencies, Reports.

•
Recruiter View: Dashboard, Bounties (Marketplace), My Candidates, Reports.



•
Contextual Navigation (2nd Level - Horizontal Tabs within a record):

•
Inside a Bounty (Job): Candidates, Details, Activity (for Employer); Submit Candidate, Details, My Submissions (for Recruiter).



5.9 Paraform (Marketplace)

•
Key Features: Marketplace for connecting employers and agencies; focus on referrals; streamlined communication.

•
Universal Horizontal Features (Top Right): Global Search, Weekly Bonus/Stats widget, User Profile Menu.

•
Primary Navigation (1st Level - Horizontal Bar): Browse (Job Marketplace), Clients, Candidates, Messages, Calls, Menu (...).

•
Contextual Navigation (2nd Level - Horizontal Tabs/Filters within a module):

•
When "Browse" is selected: Filter by Titles, Filter by Company, Filter by Schools, Saved Searches.



•
Detailed Record Navigation (3rd Level - Modals/Views within a record):

•
Inside a Candidate record: Experiences, Education, Skills.



5.10 Recruiterflow

•
Key Features: Applicant tracking, CRM, email campaigns, job board integrations, reporting.

•
Universal Horizontal Features (Top Right): Global Search, "Quick Add" (+ icon), Notifications (bell icon), Help/Support (?), User Profile Menu.

•
Primary Navigation (1st Level - Vertical Sidebar): Home (Dashboard), Jobs, Candidates, Contacts, Companies, Campaigns, Reports.

•
Contextual Navigation (2nd Level - Horizontal Tabs within a record):

•
Inside a Job record: Pipeline, Scorecards, Notes, Files, Activity.



•
Detailed Record Navigation (3rd Level - Tabs/Sections within a record):

•
Inside a Candidate record: Profile, Scorecards, Notes, Files, Emails, Activity.



5.11 Polymer

•
Key Features: ATS, CRM, interview scheduling, task management, reporting.

•
Universal Horizontal Features (Top Right): Global Search, Notifications (bell icon), User Profile Menu.

•
Primary Navigation (1st Level - Vertical Sidebar): Dashboard, Jobs, Candidates, Companies, Interviews, Tasks, Reports.

•
Contextual Navigation (2nd Level - Horizontal Tabs within a record):

•
Inside a Job record: Overview, Pipeline, Sourcing, Team, Settings.



•
Detailed Record Navigation (3rd Level - Tabs/Sections within a record):

•
Inside a Candidate record: Overview, Timeline (Activity Feed), Resume, Notes, Feedback.



6. Organizational Hierarchy and Role-Based Access Control (RBAC) in ATS Navigation

Effective ATS design must account for the complex organizational structures and varying levels of access required by different users within both employer and agency environments. This section explores how leading platforms manage hierarchy and RBAC, and its implications for navigation.

6.1 Employer-Side Hierarchy and RBAC

Employers often have diverse recruiting needs across departments (e.g., Sales, Engineering, Marketing) and different user roles within their hiring teams. Navigation needs to adapt to provide relevant views and access.

•
Common Roles:

•
Admin/Super Admin: Full access to all jobs, candidates, reports, and system configurations. May manage user accounts and permissions.

•
Hiring Manager: Access to jobs they own or are part of the hiring team for. Can review candidates, provide feedback, and participate in interview scheduling. Their dashboard and job lists are typically filtered to their relevant roles.

•
Recruiter (Internal): Manages all jobs and candidates for their company. May have access to broader reporting and sourcing tools. Can create and edit jobs, move candidates through pipelines, and manage communications.

•
Interviewer: Limited access, primarily to review candidate profiles, submit interview feedback, and view interview schedules for specific candidates they are assigned to.



•
Navigation Implications:

•
Filtered Views: Dashboards, Job lists, and Candidate lists are dynamically filtered based on the user's role and assigned permissions (e.g., a Hiring Manager only sees jobs they are responsible for).

•
Feature Visibility: Certain top-level navigation items or sub-sections may only be visible to users with the appropriate permissions (e.g.,



a 'Configure' or 'Admin' section is only visible to system administrators).
*   Contextual Actions: Actions available within a record (e.g., 'Edit Job,' 'Change Candidate Stage') are permission-gated.
*   Departmental/Team Filters: Navigation may include filters or quick-select options to view jobs/candidates by department or hiring team, allowing users to focus on their specific area of responsibility.

6.2 Recruiting Agency-Side Hierarchy and RBAC

Recruiting agencies, especially larger ones, have complex internal structures with specialized roles. The ATS must support these workflows and ensure data segregation and appropriate access levels.

•
Common Roles:

•
Agency Owner/Admin: Full oversight of all clients, jobs, candidates, and financial data. Can manage all user accounts and system settings.

•
Account Manager: Manages relationships with specific employer clients. Responsible for job intake, understanding client requirements, and presenting candidates. Their view is typically client-centric.

•
Candidate Recruiter/Sourcer: Focuses on finding, screening, and presenting candidates. May not have direct client-facing responsibilities. Their view is candidate-centric, often with access to sourcing tools and the candidate database.

•
Researcher: May have read-only access to the candidate database for market mapping or talent intelligence.

•
Sales/Business Development: Focuses on acquiring new employer clients. Their view is client-centric, often with CRM functionalities.



•
Navigation Implications:

•
Role-Specific Dashboards: Dashboards are tailored to show metrics and tasks relevant to the user's role (e.g., Account Manager sees client-specific metrics; Candidate Recruiter sees candidate pipeline metrics).

•
Client/Job Filtering: Agencies managing many clients will need robust filtering in their 'My Jobs' and 'Candidates' sections to quickly switch context between clients or specific search assignments.

•
Permission-Gated Modules: Certain top-level modules (e.g., 'Financials,' 'Admin') are only accessible to owners or designated administrators.

•
Workflow-Specific Tools: Navigation may expose tools relevant to a specific role (e.g., 'Outreach' module for sourcers, 'Client Management' for account managers).

•
Data Segregation: Ensures that recruiters only see candidates or jobs they are permitted to access, especially crucial in large agencies with multiple teams working on different clients.



6.3 Platform Admin-Side Hierarchy and RBAC

For a marketplace platform connecting employers and agencies, the platform administrator role is crucial for managing the ecosystem, ensuring fair play, and overseeing operations. While direct public-facing examples of admin UIs are rare, we can infer necessary functionalities by analyzing the employer and recruiter interfaces of marketplace platforms like Hired.com and Paraform.

•
Common Responsibilities:

•
User Management: Onboarding, offboarding, and managing accounts for both employers and agencies.

•
Job Moderation: Reviewing and approving job postings to ensure compliance and quality.

•
Candidate Oversight: Monitoring candidate submissions and activity, potentially resolving disputes.

•
Financial Management: Overseeing billing, payments, and commission structures.

•
Dispute Resolution: Mediating conflicts between employers and agencies.

•
Platform Health Monitoring: Tracking key metrics like job volume, candidate flow, and successful placements.

•
Content Management: Managing platform-wide content, terms of service, and FAQs.



•
Navigation Implications:

•
Comprehensive Dashboards: A high-level overview of marketplace activity, financial performance, and user engagement.

•
Dedicated Management Modules: Top-level navigation items for managing each core entity: Employers, Agencies, Jobs, Candidates, Transactions.

•
Reporting & Analytics: Access to detailed reports on platform usage, user behavior, and financial metrics.

•
System Configuration: Tools for managing platform settings, user roles, and permissions.

•
Communication Tools: Ability to communicate with specific users or broadcast announcements.



5.12 Hired.com (now LHH Recruitment Solutions)

•
Key Features: AI-driven talent marketplace for tech professionals; curated candidates and employers; direct communication platform; interview scheduling.

•
Universal Horizontal Features (Top Right): Based on general marketplace patterns, likely includes: Global Search, Notifications, User Profile/Settings.

•
Primary Navigation (1st Level - Inferred Horizontal Bar): Given its marketplace nature and focus on matching, the primary navigation is likely horizontal, similar to Paraform and Bounty Jobs, emphasizing core marketplace functions.

•
Employer View (Inferred): Dashboard, Candidates (to browse/review), Interviews, Jobs (to manage postings), Messages.

•
Recruiter/Candidate View (Inferred): Dashboard, Opportunities (jobs matched to them), Interviews, Messages, Profile.



•
Contextual Navigation (2nd Level - Inferred Horizontal Tabs/Sections within a record): When viewing a specific candidate profile or job opportunity, details would be organized into tabs or sections.

•
Inside a Candidate Profile (Employer View): Overview, Skills, Experience, Salary Expectations, Interview History, Messages.

•
Inside a Job Opportunity (Candidate/Recruiter View): Job Details, Company Info, Interview Requests, Messages.



•
Note on Research: Direct UI screenshots and detailed navigation breakdowns for Hired.com's (now LHH Recruitment Solutions) internal platform are not readily available through public web searches. This analysis is inferred based on their described workflows, product reviews, and common patterns observed in similar talent marketplaces.

5. Detailed Navigation Design: Platform Administrator Persona

The Platform Administrator role is critical for managing the entire marketplace ecosystem, ensuring smooth operations, user satisfaction, and financial health. This navigation is designed for comprehensive oversight and control, drawing inferences from marketplace models like Bounty Jobs and Paraform, and general admin panel best practices.

Universal Horizontal Features (Top of Screen)

These tools are always visible at the top right of the screen, providing consistent global functionality for the administrator.

IconFeatureDescription+Quick AddA dropdown to quickly add new Employer accounts, Agency accounts, or manually create a Job.🔍Global SearchA powerful search bar to find any Employer, Agency, Job, or Candidate record across the entire platform.🔔NotificationsAlerts for critical system events, new user registrations, flagged content, or financial anomalies.👤User ProfileA menu for Admin Account Settings, System Configuration, and Logout.




Primary Navigation (1st Level - Vertical Sidebar)

This is the main navigation bar on the left side of the screen, providing direct access to the core management modules of the marketplace.

IconFeatureDescription📊Global DashboardA high-level overview of marketplace activity, key performance indicators (KPIs), financial summaries, and system health metrics.🏢EmployersManage all employer accounts, including user details, job postings, and activity logs.🤝AgenciesManage all recruiting agency accounts, including user details, performance metrics, and payout information.💼All JobsA master list of every job posted on the platform, with tools for moderation, status changes, and detailed viewing.👥All CandidatesA master list of all candidate profiles on the platform, with tools for review, data management, and dispute resolution.⚖️Compliance & DisputesA dedicated module for managing terms of service, user agreements, and mediating disputes between employers and agencies.💰FinancialsOversee all financial transactions, including platform fees, agency payouts, invoicing, and revenue reporting.⚙️System SettingsConfigure platform-wide settings, user roles, permissions, integrations, and data management policies.




Contextual Navigation (2nd Level - Horizontal Tabs)

This navigation appears as a set of tabs within the main content area after a user selects an item from the primary navigation. It provides detailed views and actions relevant to the selected record or module.

Example 1: When a user clicks on a specific "Employer" from the Employers list:

•
A set of tabs appears for that employer's detailed profile:

•
Account Details: Basic company information, contact details, and subscription status.

•
Users: Manage individual user accounts associated with this employer, including roles and permissions.

•
Jobs: A list of all jobs posted by this employer, with direct links to job details.

•
Activity Log: A chronological record of all actions performed by this employer on the platform.

•
Billing History: Financial transactions related to this employer.



Example 2: When a user clicks on the "Financials" module:

•
A set of tabs appears to navigate different financial aspects:

•
Overview: Summary of platform revenue, pending payouts, and recent transactions.

•
Payouts: Manage and track payments to agencies.

•
Invoicing: Generate and manage invoices for employers.

•
Reports: Financial reports and analytics.






7. Conclusion

This document provides a comprehensive framework for designing a highly usable and competitive ATS navigation system. By focusing on role-specific needs, leveraging proven UI patterns, and prioritizing features based on user pain points and a strategic roadmap, the platform can achieve its goal of superior UI/UX. The detailed competitive analysis serves as a strong foundation, ensuring that the proposed design is both innovative and grounded in industry best practices. The emphasis on organizational hierarchy and RBAC ensures the system can scale to complex real-world scenarios for both employers and recruiting agencies.







---

**Once you add content above, I'll:**
1. Review and consolidate with existing research
2. Identify any gaps or conflicting findings  
3. Update the main project roadmap with combined insights
4. Flag any new pain points or competitive insights discovered