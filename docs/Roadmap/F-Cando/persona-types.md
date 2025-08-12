# All Person Types in ATS System

## Core Active Participants (people table)

### Agency/Recruiting Firm Personas
- **Agency Owner** - Has login, manages agency, pays for platform
- **Agency Manager** - Has login, manages teams and clients
- **Senior Recruiter** - Has login, works on senior roles, manages other recruiters
- **Recruiter** - Has login, sources and submits candidates
- **Recruiting Coordinator** - Has login, schedules interviews, admin tasks
- **Agency Admin** - Has login, manages users and settings

### Employer/Company Personas  
- **Hiring Manager** - Has login, makes hiring decisions, reviews candidates
- **HR Manager** - Has login, manages hiring process and compliance
- **HR Coordinator** - Has login, schedules interviews, admin tasks
- **CEO/Founder** - May have login, final approval on senior hires
- **Department Head** - May have login, approves hires for their department
- **Interview Panel Member** - May have login, participates in interviews
- **HR Admin** - Has login, manages employer account settings

### Candidate Personas
- **Active Job Seeker** - May have login, actively looking for jobs
- **Passive Candidate** - May have login, open to opportunities
- **Referred Candidate** - May have login, came through referral
- **Former Employee** - May have login, applying to return

### Platform Personas
- **Platform Admin** - Has login, manages entire platform
- **Customer Success Manager** - Has login, supports clients
- **Platform Support** - Has login, handles technical issues

## Prospecting/Sourcing Targets (prospects table)

### Potential Candidates (Cold Outreach)
- **LinkedIn Prospect** - Sourced from LinkedIn, no login
- **GitHub Developer** - Sourced from GitHub, no login  
- **Industry Expert** - Found through research, no login
- **Conference Speaker** - Identified at events, no login
- **Referral Prospect** - Mentioned by someone, no login
- **Database Match** - Found in external databases, no login

### Potential Employer Contacts (Business Development)
- **Target Hiring Manager** - Identified for outreach, no login
- **Target HR Leader** - Potential client contact, no login
- **Industry Contact** - Networking prospect, no login
- **Former Client** - Re-engagement target, no login
- **Referral Lead** - Business referral, no login

## Person Status Flow

### Conversion Path: Prospect → Active Participant
```
prospects (cold outreach) 
    ↓ (responds positively)
people (active in system)
    ↓ (gets login access) 
people (with login credentials)
```

### Database Representation
- **Core people**: Active participants in hiring process
- **Prospects**: High-volume sourcing/outreach targets
- **Separate tables**: Prevents pollution of core operations
- **Conversion tracking**: When prospects become active participants

## Key Distinctions

### Has Login Account
- Agency staff (all types)
- Some employer contacts (managers, coordinators)
- Some candidates (active job seekers)
- Platform staff (all types)

### Contact Only (No Login)
- Senior executives (CEO, VP) - we track them but they don't use platform
- Interview panel members - participate but don't need accounts
- Passive candidates - in system but no login

### Prospects (Separate Table)
- LinkedIn sourcing targets
- Cold outreach candidates  
- Business development leads
- 99% never respond, 1% convert to active participants