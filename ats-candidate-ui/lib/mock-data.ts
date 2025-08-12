import { Candidate, User, Organization, UserRole, CandidateStatus } from '@/types'
import { generateId } from './utils'

// Mock organizations
export const mockOrganizations: Organization[] = [
  { id: 'org-platform', name: 'ATS Platform', type: 'platform' },
  { id: 'org-tech-agency', name: 'TechTalent Agency', type: 'agency' },
  { id: 'org-startup-inc', name: 'Startup Inc', type: 'employer' },
  { id: 'org-big-corp', name: 'BigCorp Technologies', type: 'employer' },
]

// Mock users
export const mockUsers: User[] = [
  {
    id: 'user-admin',
    name: 'Alex Platform',
    email: 'alex@atsplatform.com',
    role: 'platform_admin',
    organizationId: 'org-platform',
    organizationName: 'ATS Platform',
    avatar: 'AP'
  },
  {
    id: 'user-agency-1',
    name: 'Sarah Johnson',
    email: 'sarah@techtalent.com',
    role: 'agency_recruiter',
    organizationId: 'org-tech-agency',
    organizationName: 'TechTalent Agency',
    avatar: 'SJ'
  },
  {
    id: 'user-employer-1',
    name: 'Mike Chen',
    email: 'mike@startup.com',
    role: 'employer_recruiter',
    organizationId: 'org-startup-inc',
    organizationName: 'Startup Inc',
    avatar: 'MC'
  },
  {
    id: 'user-prototype',
    name: 'Platform Prototype',
    email: 'prototype@atsplatform.com',
    role: 'platform_prototype',
    organizationId: 'org-platform',
    organizationName: 'ATS Platform (Prototype View)',
    avatar: 'PP'
  }
]

// Generate random candidate data
const firstNames = [
  'John', 'Jane', 'Michael', 'Sarah', 'David', 'Emily', 'Robert', 'Lisa',
  'James', 'Maria', 'William', 'Jennifer', 'Richard', 'Patricia', 'Christopher',
  'Linda', 'Matthew', 'Elizabeth', 'Anthony', 'Barbara', 'Mark', 'Susan',
  'Steven', 'Jessica', 'Andrew', 'Margaret', 'Kenneth', 'Dorothy', 'Paul',
  'Lisa', 'Joshua', 'Nancy', 'Kevin', 'Karen', 'Brian', 'Betty'
]

const lastNames = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller',
  'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez',
  'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
  'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark',
  'Ramirez', 'Lewis', 'Robinson', 'Walker', 'Young', 'Allen', 'King'
]

const companies = [
  'Google', 'Apple', 'Microsoft', 'Amazon', 'Meta', 'Netflix', 'Tesla',
  'Uber', 'Airbnb', 'Stripe', 'Spotify', 'Slack', 'Zoom', 'Dropbox',
  'Adobe', 'Salesforce', 'Oracle', 'IBM', 'Intel', 'Nvidia'
]

const skills = [
  'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'Java',
  'Go', 'Rust', 'AWS', 'Docker', 'Kubernetes', 'PostgreSQL', 'MongoDB',
  'GraphQL', 'REST APIs', 'Machine Learning', 'DevOps', 'CI/CD',
  'Product Management', 'UI/UX Design', 'Data Science', 'Marketing'
]

const locations = [
  'San Francisco, CA', 'New York, NY', 'Seattle, WA', 'Austin, TX',
  'Boston, MA', 'Los Angeles, CA', 'Chicago, IL', 'Denver, CO',
  'Portland, OR', 'Miami, FL', 'Remote', 'London, UK', 'Berlin, Germany',
  'Toronto, Canada', 'Sydney, Australia'
]

const statuses: CandidateStatus[] = ['sourced', 'contacted', 'interviewing', 'offered', 'hired', 'declined']

const tags = [
  'Senior', 'Mid-level', 'Junior', 'Remote', 'Full-time', 'Contract',
  'Frontend', 'Backend', 'Full-stack', 'Mobile', 'DevOps', 'AI/ML',
  'Product', 'Design', 'Marketing', 'Sales', 'Data', 'Security'
]

// Job-related mock data
export interface Job {
  id: string
  title: string
  company: string
  location: string
  type: 'full-time' | 'part-time' | 'contract' | 'internship'
  status: 'active' | 'paused' | 'filled' | 'cancelled'
  postedAt: Date
  salary?: { min: number; max: number; currency: string }
  description: string
  requirements: string[]
  benefits: string[]
  recruiterId: string
  employerId: string
  submissions: number
  interviews: number
  offers: number
}

export interface Employer {
  id: string
  name: string
  logo?: string
  industry: string
  size: string
  location: string
  description: string
  website?: string
  activeJobs: number
  totalHires: number
  averageTimeToHire: number
  rating: number
  contactPerson: string
  email: string
  phone?: string
  joinedAt: Date
}

export interface Agency {
  id: string
  name: string
  logo?: string
  specialization: string[]
  location: string
  description: string
  website?: string
  activeRecruiters: number
  totalPlacements: number
  successRate: number
  rating: number
  contactPerson: string
  email: string
  phone?: string
  joinedAt: Date
  tier: 'gold' | 'silver' | 'bronze' | 'new'
}

export interface Contact {
  id: string
  name: string
  email: string
  phone?: string
  company: string
  position: string
  type: 'employer' | 'agency' | 'candidate' | 'vendor'
  lastContact: Date
  notes?: string
  tags: string[]
  linkedinUrl?: string
}

export interface Interview {
  id: string
  candidateId: string
  candidateName: string
  jobId: string
  jobTitle: string
  company: string
  type: 'phone' | 'video' | 'in-person' | 'technical'
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show'
  scheduledAt: Date
  interviewers: string[]
  notes?: string
  feedback?: string
  rating?: number
}

// Mock Jobs (10 jobs as requested)
export const mockJobs: Job[] = [
  {
    id: 'job-1',
    title: 'Senior Frontend Developer',
    company: 'TechCorp Inc',
    location: 'San Francisco, CA',
    type: 'full-time',
    status: 'active',
    postedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    salary: { min: 120000, max: 160000, currency: 'USD' },
    description: 'Building next-generation web applications with React and TypeScript.',
    requirements: ['React', 'TypeScript', '5+ years experience'],
    benefits: ['Health Insurance', '401k', 'Remote Work'],
    recruiterId: 'user-admin',
    employerId: 'emp-1',
    submissions: 15,
    interviews: 5,
    offers: 2
  },
  {
    id: 'job-2',
    title: 'Product Manager',
    company: 'StartupXYZ',
    location: 'New York, NY',
    type: 'full-time',
    status: 'active',
    postedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    salary: { min: 110000, max: 140000, currency: 'USD' },
    description: 'Lead product strategy and development for our core platform.',
    requirements: ['Product Management', '3+ years experience', 'Agile'],
    benefits: ['Equity', 'Health Insurance', 'Flexible PTO'],
    recruiterId: 'user-agency-1',
    employerId: 'emp-2',
    submissions: 8,
    interviews: 3,
    offers: 0
  },
  {
    id: 'job-3',
    title: 'DevOps Engineer',
    company: 'CloudTech Solutions',
    location: 'Austin, TX',
    type: 'full-time',
    status: 'active',
    postedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    salary: { min: 100000, max: 130000, currency: 'USD' },
    description: 'Manage cloud infrastructure and deployment pipelines.',
    requirements: ['AWS', 'Docker', 'Kubernetes', '4+ years experience'],
    benefits: ['Remote First', 'Learning Budget', 'Health Insurance'],
    recruiterId: 'user-employer-1',
    employerId: 'emp-3',
    submissions: 12,
    interviews: 4,
    offers: 1
  },
  {
    id: 'job-4',
    title: 'UI/UX Designer',
    company: 'DesignStudio Pro',
    location: 'Remote',
    type: 'contract',
    status: 'active',
    postedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    salary: { min: 80000, max: 100000, currency: 'USD' },
    description: 'Create beautiful and intuitive user experiences.',
    requirements: ['Figma', 'User Research', '3+ years experience'],
    benefits: ['Flexible Hours', 'Portfolio Projects'],
    recruiterId: 'user-agency-1',
    employerId: 'emp-4',
    submissions: 6,
    interviews: 2,
    offers: 0
  },
  {
    id: 'job-5',
    title: 'Data Scientist',
    company: 'AI Innovations',
    location: 'Seattle, WA',
    type: 'full-time',
    status: 'paused',
    postedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    salary: { min: 130000, max: 170000, currency: 'USD' },
    description: 'Develop machine learning models and data pipelines.',
    requirements: ['Python', 'Machine Learning', 'PhD preferred'],
    benefits: ['Research Time', 'Conference Budget', 'Stock Options'],
    recruiterId: 'user-admin',
    employerId: 'emp-5',
    submissions: 20,
    interviews: 8,
    offers: 3
  },
  {
    id: 'job-6',
    title: 'Backend Engineer',
    company: 'ScaleUp Tech',
    location: 'Boston, MA',
    type: 'full-time',
    status: 'active',
    postedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    salary: { min: 95000, max: 125000, currency: 'USD' },
    description: 'Build scalable APIs and microservices.',
    requirements: ['Node.js', 'PostgreSQL', 'API Design'],
    benefits: ['Mentorship', 'Growth Opportunities'],
    recruiterId: 'user-employer-1',
    employerId: 'emp-1',
    submissions: 4,
    interviews: 1,
    offers: 0
  },
  {
    id: 'job-7',
    title: 'Marketing Manager',
    company: 'GrowthCo',
    location: 'Los Angeles, CA',
    type: 'full-time',
    status: 'filled',
    postedAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000),
    salary: { min: 85000, max: 110000, currency: 'USD' },
    description: 'Lead digital marketing campaigns and growth initiatives.',
    requirements: ['Digital Marketing', 'Analytics', '4+ years experience'],
    benefits: ['Creative Freedom', 'Marketing Budget'],
    recruiterId: 'user-agency-1',
    employerId: 'emp-2',
    submissions: 25,
    interviews: 12,
    offers: 4
  },
  {
    id: 'job-8',
    title: 'Mobile Developer',
    company: 'AppMakers Inc',
    location: 'Remote',
    type: 'contract',
    status: 'active',
    postedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    salary: { min: 70000, max: 90000, currency: 'USD' },
    description: 'Develop iOS and Android applications.',
    requirements: ['React Native', 'iOS', 'Android'],
    benefits: ['Flexible Schedule', 'Latest Devices'],
    recruiterId: 'user-admin',
    employerId: 'emp-3',
    submissions: 9,
    interviews: 3,
    offers: 1
  },
  {
    id: 'job-9',
    title: 'Sales Director',
    company: 'Enterprise Solutions',
    location: 'Chicago, IL',
    type: 'full-time',
    status: 'active',
    postedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    salary: { min: 120000, max: 180000, currency: 'USD' },
    description: 'Lead enterprise sales team and drive revenue growth.',
    requirements: ['Enterprise Sales', 'Team Leadership', '8+ years experience'],
    benefits: ['Commission Structure', 'Company Car', 'Stock Options'],
    recruiterId: 'user-employer-1',
    employerId: 'emp-4',
    submissions: 18,
    interviews: 6,
    offers: 2
  },
  {
    id: 'job-10',
    title: 'Security Engineer',
    company: 'CyberShield Corp',
    location: 'Washington, DC',
    type: 'full-time',
    status: 'active',
    postedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
    salary: { min: 110000, max: 150000, currency: 'USD' },
    description: 'Implement security measures and conduct vulnerability assessments.',
    requirements: ['Cybersecurity', 'Penetration Testing', 'Security Clearance'],
    benefits: ['Security Clearance Bonus', 'Training Certifications'],
    recruiterId: 'user-agency-1',
    employerId: 'emp-5',
    submissions: 7,
    interviews: 2,
    offers: 0
  }
]

// Mock Employers (5 employers)
export const mockEmployers: Employer[] = [
  {
    id: 'emp-1',
    name: 'TechCorp Inc',
    industry: 'Technology',
    size: '1000-5000',
    location: 'San Francisco, CA',
    description: 'Leading technology company building the future of web applications.',
    website: 'https://techcorp.com',
    activeJobs: 3,
    totalHires: 45,
    averageTimeToHire: 28,
    rating: 4.5,
    contactPerson: 'John Smith',
    email: 'hiring@techcorp.com',
    phone: '+1-555-0101',
    joinedAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000)
  },
  {
    id: 'emp-2',
    name: 'StartupXYZ',
    industry: 'Fintech',
    size: '50-200',
    location: 'New York, NY',
    description: 'Innovative fintech startup revolutionizing digital payments.',
    website: 'https://startupxyz.com',
    activeJobs: 2,
    totalHires: 12,
    averageTimeToHire: 21,
    rating: 4.2,
    contactPerson: 'Sarah Johnson',
    email: 'careers@startupxyz.com',
    joinedAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
  },
  {
    id: 'emp-3',
    name: 'CloudTech Solutions',
    industry: 'Cloud Services',
    size: '500-1000',
    location: 'Austin, TX',
    description: 'Cloud infrastructure and DevOps solutions provider.',
    website: 'https://cloudtech.com',
    activeJobs: 2,
    totalHires: 28,
    averageTimeToHire: 35,
    rating: 4.3,
    contactPerson: 'Mike Chen',
    email: 'talent@cloudtech.com',
    phone: '+1-555-0102',
    joinedAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000)
  },
  {
    id: 'emp-4',
    name: 'DesignStudio Pro',
    industry: 'Design',
    size: '20-50',
    location: 'Remote',
    description: 'Premium design agency serving enterprise clients.',
    website: 'https://designstudio.pro',
    activeJobs: 2,
    totalHires: 8,
    averageTimeToHire: 18,
    rating: 4.7,
    contactPerson: 'Emily Davis',
    email: 'hello@designstudio.pro',
    joinedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000)
  },
  {
    id: 'emp-5',
    name: 'AI Innovations',
    industry: 'Artificial Intelligence',
    size: '200-500',
    location: 'Seattle, WA',
    description: 'AI research and development company pushing the boundaries of machine learning.',
    website: 'https://aiinnovations.com',
    activeJobs: 2,
    totalHires: 22,
    averageTimeToHire: 42,
    rating: 4.6,
    contactPerson: 'Dr. Alex Wilson',
    email: 'research-jobs@aiinnovations.com',
    phone: '+1-555-0103',
    joinedAt: new Date(Date.now() - 240 * 24 * 60 * 60 * 1000)
  }
]

// Mock Agencies (5 agencies)
export const mockAgencies: Agency[] = [
  {
    id: 'agency-1',
    name: 'TechTalent Agency',
    specialization: ['Software Engineering', 'Product Management', 'DevOps'],
    location: 'San Francisco, CA',
    description: 'Premier technology recruiting agency with 15+ years of experience.',
    website: 'https://techtalent.com',
    activeRecruiters: 8,
    totalPlacements: 245,
    successRate: 78,
    rating: 4.8,
    contactPerson: 'Sarah Johnson',
    email: 'partnerships@techtalent.com',
    phone: '+1-555-0201',
    joinedAt: new Date(Date.now() - 300 * 24 * 60 * 60 * 1000),
    tier: 'gold'
  },
  {
    id: 'agency-2',
    name: 'Executive Search Pro',
    specialization: ['C-Level', 'VP Level', 'Director Level'],
    location: 'New York, NY',
    description: 'Executive search firm specializing in senior leadership roles.',
    website: 'https://execsearchpro.com',
    activeRecruiters: 5,
    totalPlacements: 89,
    successRate: 85,
    rating: 4.9,
    contactPerson: 'Robert Williams',
    email: 'info@execsearchpro.com',
    phone: '+1-555-0202',
    joinedAt: new Date(Date.now() - 450 * 24 * 60 * 60 * 1000),
    tier: 'gold'
  },
  {
    id: 'agency-3',
    name: 'Digital Marketing Experts',
    specialization: ['Digital Marketing', 'Content Creation', 'Growth Marketing'],
    location: 'Austin, TX',
    description: 'Specialized recruiting for digital marketing and growth roles.',
    website: 'https://digitalmarketingexperts.com',
    activeRecruiters: 4,
    totalPlacements: 123,
    successRate: 72,
    rating: 4.4,
    contactPerson: 'Lisa Chen',
    email: 'hello@digitalmarketingexperts.com',
    joinedAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
    tier: 'silver'
  },
  {
    id: 'agency-4',
    name: 'Creative Collective',
    specialization: ['Design', 'Creative Direction', 'Brand Strategy'],
    location: 'Los Angeles, CA',
    description: 'Creative recruiting agency connecting design talent with innovative companies.',
    website: 'https://creativecollective.co',
    activeRecruiters: 6,
    totalPlacements: 67,
    successRate: 69,
    rating: 4.2,
    contactPerson: 'Mark Thompson',
    email: 'talent@creativecollective.co',
    phone: '+1-555-0203',
    joinedAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000),
    tier: 'silver'
  },
  {
    id: 'agency-5',
    name: 'Sales Force Recruiting',
    specialization: ['Sales', 'Business Development', 'Account Management'],
    location: 'Chicago, IL',
    description: 'Sales recruiting specialists with deep industry connections.',
    website: 'https://salesforcerecruiting.com',
    activeRecruiters: 3,
    totalPlacements: 34,
    successRate: 65,
    rating: 4.0,
    contactPerson: 'Jennifer Davis',
    email: 'partnerships@salesforcerecruiting.com',
    joinedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
    tier: 'bronze'
  }
]

// Mock Contacts (10 contacts)
export const mockContacts: Contact[] = [
  {
    id: 'contact-1',
    name: 'John Smith',
    email: 'john.smith@techcorp.com',
    phone: '+1-555-0101',
    company: 'TechCorp Inc',
    position: 'VP of Engineering',
    type: 'employer',
    lastContact: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    notes: 'Interested in senior frontend developers',
    tags: ['Decision Maker', 'Tech'],
    linkedinUrl: 'https://linkedin.com/in/johnsmith'
  },
  {
    id: 'contact-2',
    name: 'Sarah Johnson',
    email: 'sarah@techtalent.com',
    phone: '+1-555-0201',
    company: 'TechTalent Agency',
    position: 'Senior Recruiter',
    type: 'agency',
    lastContact: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    notes: 'Top performer in tech recruiting',
    tags: ['High Volume', 'Tech', 'Reliable']
  },
  {
    id: 'contact-3',
    name: 'Emily Davis',
    email: 'emily@designstudio.pro',
    company: 'DesignStudio Pro',
    position: 'Creative Director',
    type: 'employer',
    lastContact: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    notes: 'Looking for senior UX designers',
    tags: ['Creative', 'Remote-Friendly']
  },
  {
    id: 'contact-4',
    name: 'David Wilson',
    email: 'david.wilson@email.com',
    phone: '+1-555-0301',
    company: 'DataCorp',
    position: 'Data Scientist',
    type: 'candidate',
    lastContact: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    notes: 'PhD in Machine Learning, interested in AI roles',
    tags: ['AI/ML', 'PhD', 'Senior'],
    linkedinUrl: 'https://linkedin.com/in/davidwilson'
  },
  {
    id: 'contact-5',
    name: 'Lisa Chen',
    email: 'lisa@digitalmarketingexperts.com',
    company: 'Digital Marketing Experts',
    position: 'Principal Recruiter',
    type: 'agency',
    lastContact: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    notes: 'Specializes in growth marketing roles',
    tags: ['Marketing', 'Growth']
  }
]

// Mock Interviews (8 interviews)
export const mockInterviews: Interview[] = [
  {
    id: 'interview-1',
    candidateId: 'candidate-1',
    candidateName: 'John Doe',
    jobId: 'job-1',
    jobTitle: 'Senior Frontend Developer',
    company: 'TechCorp Inc',
    type: 'video',
    status: 'scheduled',
    scheduledAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    interviewers: ['John Smith', 'Sarah Tech'],
    notes: 'Technical interview focusing on React and TypeScript'
  },
  {
    id: 'interview-2',
    candidateId: 'candidate-2',
    candidateName: 'Jane Smith',
    jobId: 'job-2',
    jobTitle: 'Product Manager',
    company: 'StartupXYZ',
    type: 'video',
    status: 'completed',
    scheduledAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    interviewers: ['Mike Product', 'Lisa Strategy'],
    feedback: 'Strong product sense, good communication skills',
    rating: 4
  },
  {
    id: 'interview-3',
    candidateId: 'candidate-3',
    candidateName: 'Mike Johnson',
    jobId: 'job-3',
    jobTitle: 'DevOps Engineer',
    company: 'CloudTech Solutions',
    type: 'technical',
    status: 'scheduled',
    scheduledAt: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    interviewers: ['Alex DevOps'],
    notes: 'Live coding session with Kubernetes scenarios'
  },
  {
    id: 'interview-4',
    candidateId: 'candidate-4',
    candidateName: 'Sarah Davis',
    jobId: 'job-4',
    jobTitle: 'UI/UX Designer',
    company: 'DesignStudio Pro',
    type: 'in-person',
    status: 'completed',
    scheduledAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    interviewers: ['Emily Davis', 'Mark Design'],
    feedback: 'Excellent portfolio, creative problem-solving approach',
    rating: 5
  },
  {
    id: 'interview-5',
    candidateId: 'candidate-5',
    candidateName: 'Robert Brown',
    jobId: 'job-5',
    jobTitle: 'Data Scientist',
    company: 'AI Innovations',
    type: 'phone',
    status: 'no-show',
    scheduledAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    interviewers: ['Dr. Alex Wilson'],
    notes: 'Candidate did not show up, will reschedule'
  },
  {
    id: 'interview-6',
    candidateId: 'candidate-1',
    candidateName: 'John Doe',
    jobId: 'job-6',
    jobTitle: 'Backend Engineer',
    company: 'ScaleUp Tech',
    type: 'video',
    status: 'scheduled',
    scheduledAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    interviewers: ['Backend Lead', 'CTO'],
    notes: 'System design interview'
  }
]

function getRandomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)]
}

function getRandomItems<T>(array: T[], count: number = 3): T[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, Math.max(1, Math.floor(Math.random() * count) + 1))
}

function generateMockCandidate(index: number): Candidate {
  const firstName = getRandomItem(firstNames)
  const lastName = getRandomItem(lastNames)
  const name = `${firstName} ${lastName}`
  const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@email.com`
  const recruiter = getRandomItem(mockUsers.filter(u => u.role !== 'platform_admin'))
  
  return {
    id: `candidate-${generateId()}`,
    name,
    email,
    phone: Math.random() > 0.3 ? `+1-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}` : undefined,
    status: getRandomItem(statuses),
    addedAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000), // Random date within last 30 days
    recruiterId: recruiter.id,
    recruiterName: recruiter.name,
    organizationId: recruiter.organizationId,
    organizationName: recruiter.organizationName,
    tags: getRandomItems(tags, 4),
    notes: Math.random() > 0.5 ? `Experienced professional with ${Math.floor(Math.random() * 10) + 1} years at ${getRandomItem(companies)}.` : undefined,
    linkedinUrl: Math.random() > 0.4 ? `https://linkedin.com/in/${firstName.toLowerCase()}-${lastName.toLowerCase()}` : undefined,
    location: getRandomItem(locations),
    experience: `${Math.floor(Math.random() * 15) + 1} years`,
    skills: getRandomItems(skills, 6)
  }
}

// Generate 5 mock candidates for feature testing
export const mockCandidates: Candidate[] = Array.from({ length: 5 }, (_, index) => 
  generateMockCandidate(index)
)

// Current user (can be changed via role switcher)
export let currentUser: User = mockUsers[0] // Default to platform admin

export function setCurrentUser(user: User) {
  currentUser = user
}

export function getCurrentUser(): User {
  return currentUser
}

// Navigation items based on role - Research-based structure
export const getNavigationItems = (role: UserRole) => {
  switch (role) {
    case 'platform_admin':
      return [
        { id: 'dashboard', title: 'Dashboard', href: '/dashboard' },
        { id: 'jobs', title: 'All Jobs', href: '/jobs' },
        { id: 'candidates', title: 'Candidates', href: '/candidates' },
        { id: 'employers', title: 'Employers', href: '/employers' },
        { id: 'agencies', title: 'Agencies', href: '/agencies' },
        { id: 'contacts', title: 'Contacts', href: '/contacts' },
        { id: 'analytics', title: 'Analytics', href: '/analytics' },
      ]
    
    case 'agency_recruiter':
      return [
        { id: 'dashboard', title: 'Dashboard', href: '/dashboard' },
        { id: 'browse', title: 'Browse', href: '/browse' },  // Job marketplace (like Paraform)
        { id: 'my-jobs', title: 'My Jobs', href: '/my-jobs' },
        { id: 'candidates', title: 'Candidates', href: '/candidates' },
        { id: 'contacts', title: 'Contacts', href: '/contacts' },
        { id: 'settings', title: 'Settings', href: '/settings' },
      ]
    
    case 'employer_recruiter':
      return [
        { id: 'dashboard', title: 'Dashboard', href: '/dashboard' },
        { id: 'jobs', title: 'Jobs', href: '/jobs' },
        { id: 'candidates', title: 'Candidates', href: '/candidates' },
        { id: 'agencies', title: 'Agencies', href: '/agencies' },
        { id: 'interviews', title: 'Interviews', href: '/interviews' },
        { id: 'settings', title: 'Settings', href: '/settings' },
      ]
    
    case 'platform_prototype':
      return [
        { id: 'dashboard', title: 'Dashboard', href: '/dashboard' },
        { id: 'marketplace', title: 'Marketplace', href: '/marketplace' },
        { id: 'jobs', title: 'All Jobs', href: '/jobs' },
        { id: 'candidates', title: 'Candidates', href: '/candidates' },
        { id: 'employers', title: 'Employers', href: '/employers' },
        { id: 'agencies', title: 'Agencies', href: '/agencies' },
        { id: 'contacts', title: 'Contacts', href: '/contacts' },
        { id: 'interviews', title: 'Interviews', href: '/interviews' },
        { id: 'analytics', title: 'Analytics', href: '/analytics' },
        { id: 'ai-agents', title: 'AI Agents', href: '/ai-agents' },
        { id: 'settings', title: 'Settings', href: '/settings' },
      ]
    
    default:
      return []
  }
}