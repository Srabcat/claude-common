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

// Generate 50 mock candidates
export const mockCandidates: Candidate[] = Array.from({ length: 50 }, (_, index) => 
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
    
    default:
      return []
  }
}