Requirements Summary


⏺ Duplicate Detection Requirements Recap

	•	Detect and maintain one canonical record per one candidate (deduplication) - always
	•	Track every submission to the canonical candidate, linked to recruiter and agency, and across all agencies - often (10% of candidates)
  - Each duplicate can store its own copy of reality that maybe different across recruiters.
	•	Flag real-time duplicates and submission conflicts at creation, submission, or attribute edits.
	•	Keep history of identifier changes (email, phone).
	•	Give visibility into duplicates and conflicts for recruiters, agencies, and platform

  -----------------------------

#### Unique Attributes
- **Primary IDs**: Email and phone number 
- **Additional IDs**: LinkedIn, GitHub URL (for simplicity, ignore them for now).
#### Multiple Submissions
- Different recruiters can submit the same candidate.
- The same recruiter can submit the same candidate multiple times, sometimes with different information (e.g., corrected typos, updated phone numbers).
- All submissions are logged immutably.

#### Duplicate Detection
- Runs per employer at submission.
- Matches email or phone within a 6-month window.
- New submissions flagged if active representation exists.
- Same or New recruiters can represent expired candidates.

#### Representation Tracking
- Exclusive per employer.
- Time-bound (6-12 months from submission date).
- Sequential representation allowed.
- Multiple recruiters can have concurrent representations for the same candidate across different employers.

#### Submission Table
- Immutable log of recruiter submissions.
- Admins can correct, recruiters cannot.
- Status includes duplication flags and representation status.

#### Views
- **Recruiters**: See only their submitted data (not other recruiters' data)
- **Employers**: See only data from the current representative recruiter.

### Corner Cases Summary **Value Changes (Typo Correction or Real Change)**:
- Changing a unique attribute value (e.g., email, phone number) can:
     - **Trigger a New Conflict**: The recruiter may become the first or subsequent submitter of a candidate, potentially causing a new duplicate detection.
     - **Resolve Existing Duplicates**: The change might clear existing conflicts, making previously duplicated candidates no longer duplicates.
- **Re-evaluation Required**: Any change to unique attributes necessitates re-evaluating duplicates and alerting the admin if a potential representation change is triggered.


⸻
use Cases example: TBD
- But cando also has expectation who is the recruiter.
- Employer already received info from R1 and R4 
- When attribute change, recacluate all submissions with any of these attributes and see if represntation changes. If so, alert admin for human arbitration since cando may have expectation of who is their recruiter and R1/R2/R4 can also get upset, this is not something we can just inform cando and recruiters without providing proper explaination. 


| Case ID | Submission Date | Recruiter | Email  | Phone  | Unique Cando | Duplicate Cando | To Employer | Representation Conflict | Representation | Duplicate Reason | Notes                                                                |
| ------- | --------------- | --------- | ------ | ------ | ------------ | --------------- | ----------- | ----------------------- | -------------- | ---------------- | -------------------------------------------------------------------- |
| 1       | Day 1           | R1        | email1 | phone1 | C1           | No              | Emp1        | No                      | R1             |                  | First submission with correct info, R1 gets representation           |
| 2       | Day 2           | R2        | email1 | phone2 | C1           | Yes             | Emp1        | Yes                     | R1             | Email overlap    | Duplicate detected, R1 retains representation                        |
| 3       | Day 3           | R3        | email3 | phone2 | C1           | Yes             | Emp1        | Yes                     | R1             | Phone overlap    | Duplicate detected, R1 retains representation                        |
| 4       | Day 4           | R3        | email3 | phone2 | C1           | Yes             | Emp2        | No                      | R3             | Phone overlap    | Different employer, no representation conflict                       |
| 5       | Day 5           | R4        | email4 | phone4 | C2           | No              | Emp1        | No                      | R4             |                  | New candidate with correct info, R4 gets representation              |
| 6       | Day 6           | R1        | email4 | -      | C1 -> C2     | Yes             | - Emp1      | R4 owns C2, R2 owns C1  | Pending Review | Email overlap    | R1 corrects typo, potential representation change flagged for review |
| 7       | Day 7           | R1        | -      | phone2 | C1 = C2      | Yes             | - Emp1      | R2 and R4 both lose. R1 owns C1                    | Pending Review | -                | R1 corrects typo, potential representation change flagged for review |


⸻ DB Schema -----

1. Clear separation of concerns
	•	PersonAlias stores all unique IDs linked to a canonical Person—this is about identity management.
	•	RecruiterCandidate stores recruiter-specific info—like notes, compensation, nicknames, resumes.
	•	Mixing identity keys into RecruiterCandidate makes dedupe and lookup logic messy and less efficient.

2. Efficient duplicate detection and lookup
	•	You want a single place to quickly find any unique ID tied to a Person.
	•	Searching across recruiter candidates (potentially many per Person) for unique IDs is slower and more complex.
	•	A dedicated alias table can be indexed specifically for unique ID lookups.

3. Avoid data duplication and inconsistency
	•	Unique IDs (email, phone, GitHub, LinkedIn) belong to the Person, not recruiters.
	•	If stored in RecruiterCandidate, you risk inconsistent or conflicting unique IDs per recruiter.
	•	Alias table centralizes all known unique IDs, making it easier to detect conflicts or missing IDs.

4. Easier updates and merges
	•	When a new unique ID is discovered, just insert one row in alias table linked to Person.
	•	Updating or correcting unique IDs becomes straightforward without touching recruiter data.
	•	Merging Persons or aliases is simpler with a normalized structure.

5. Cleaner querying and scaling
	•	Queries to find duplicates or link candidates stay fast and straightforward by hitting the alias table.
	•	RecruiterCandidate can stay lean with only recruiter-specific data, improving performance on recruiter workflows.

⸻

In short: The alias table is a single, authoritative index of all unique identity keys per Person, separate from recruiter-specific info. This keeps your data clean, queries fast, and deduplication reliable.

⸻

Want me to sketch a quick schema for Person, PersonAlias, RecruiterCandidate to visualize this?

====
