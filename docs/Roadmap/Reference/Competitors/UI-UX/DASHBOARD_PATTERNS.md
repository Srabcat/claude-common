# Dashboard & Interface Design Patterns

## Dashboard Layout Analysis

### Wellfound (Startup-Focused)
**Dashboard Characteristics:**
- **Hero Section**: Large search bar with AI-powered matching emphasis
- **Job Discovery**: Card-based layout with salary/equity upfront
- **Founder Connections**: Direct founder message previews
- **Quick Actions**: One-click apply, save, and filter buttons

**Key Design Elements:**
- Startup ecosystem branding (tech stack, funding stage, equity visible)
- Mobile-first responsive design
- Minimal friction - reduce clicks to core actions
- Social proof (company logos, founder profiles)

### Greenhouse (Enterprise ATS)
**Dashboard Architecture:**
- **Role-Based Entry**: Different dashboards for recruiters vs hiring managers
- **Pipeline Overview**: Visual funnel with stage-by-stage candidate counts
- **Action Items**: Prominent "needs attention" section
- **Team Activity**: Recent team actions and notifications

**Enterprise Features:**
- Dense information display for power users
- Customizable dashboard widgets
- Advanced filtering and saved views
- Bulk action capabilities throughout interface

### Ashby (Modern Analytics-First)
**Dashboard Innovation:**
- **Native Analytics**: Charts and metrics embedded throughout
- **Smart Insights**: AI-generated insights and recommendations
- **Visual Pipeline**: Drag-and-drop candidate management
- **Real-time Updates**: Live data synchronization across team

**Modern UX Elements:**
- Clean, minimal design with generous whitespace
- Contextual actions that appear on hover
- Keyboard shortcuts prominently displayed
- Progressive disclosure of complex features

### RecruiterFlow (Agency CRM)
**Agency-Specific Dashboard:**
- **Client Overview**: Multiple client contexts visible
- **Business Development**: Deal pipeline and revenue tracking
- **Performance Metrics**: Success rates and productivity indicators
- **Task Management**: Follow-ups, deadlines, and action items

**Agency-Focused Elements:**
- Client branding and customization options
- Revenue and commission tracking
- Multi-client context switching
- Performance benchmarking against other agencies

## Information Architecture Patterns

### Card-Based Layouts (Modern Standard)
```typescript
interface DashboardCard {
  id: string
  title: string
  type: 'metric' | 'list' | 'chart' | 'action'
  data: any
  actions?: Action[]
  
  // Layout properties
  size: 'small' | 'medium' | 'large' | 'full'
  priority: number
  permissions?: string[]
}

// Example cards by user type
const agencyCards = [
  { id: 'active-submissions', title: 'Active Submissions', type: 'metric' },
  { id: 'client-pipeline', title: 'Client Pipeline', type: 'list' },
  { id: 'performance-trends', title: 'Performance', type: 'chart' }
]
```

### List vs. Grid View Patterns
**When Platforms Use Lists:**
- Candidate browsing (detailed info needed)
- Submission pipelines (status and actions)
- Interview schedules (chronological order)

**When Platforms Use Grids:**
- Job postings (visual browsing)
- Team member management (profile pictures)
- Document/file management (thumbnails)

### Filter & Search UI Patterns

#### Advanced Filter Patterns (Ashby/Greenhouse Style)
```typescript
interface FilterUIPattern {
  // Progressive disclosure
  basicFilters: Filter[] // Always visible
  advancedFilters: Filter[] // Behind "Advanced" toggle
  
  // Filter types
  quickFilters: QuickFilter[] // One-click common filters
  savedFilters: SavedFilter[] // User-defined filter sets
  smartFilters: SmartFilter[] // AI-suggested filters
}

// Example filter UI structure
const candidateFilters = {
  basic: ['skills', 'location', 'experience_level'],
  advanced: ['salary_range', 'availability', 'last_contacted'],
  quick: [
    { label: 'Available Now', filters: { availability_status: 'active' } },
    { label: 'Senior Level', filters: { years_experience: { min: 5 } } },
    { label: 'Remote OK', filters: { remote_preference: ['remote', 'hybrid'] } }
  ]
}
```

## Responsive Design Patterns

### Mobile-First Approach (RippleMatch)
**Mobile Optimization:**
- Bottom navigation for primary actions
- Swipe gestures for quick actions (archive, favorite)
- Collapsible information sections
- Touch-friendly button sizes and spacing

**Progressive Enhancement:**
- Mobile: Essential information only
- Tablet: Side navigation appears, more details
- Desktop: Full feature set, keyboard shortcuts

### Collaboration UI Patterns

#### Real-Time Indicators (Slack-Inspired)
```typescript
interface CollaborationUI {
  onlineIndicators: {
    userId: string
    status: 'online' | 'away' | 'busy'
    lastSeen: Date
    currentContext?: string // "Viewing John Doe's profile"
  }[]
  
  activityFeed: {
    type: 'submission_update' | 'interview_scheduled' | 'message_sent'
    actor: string
    timestamp: Date
    preview: string
  }[]
  
  notifications: {
    id: string
    type: 'urgent' | 'normal' | 'info'
    message: string
    read: boolean
    actionable: boolean
  }[]
}
```

#### Multi-Party Context Switching
```typescript
interface ContextSwitcher {
  currentContext: {
    type: 'agency_view' | 'employer_view' | 'collaboration_view'
    organizationId: string
    displayName: string
  }
  
  availableContexts: Context[]
  recentContexts: Context[]
  
  // Visual indicators
  contextBadges: {
    [contextId: string]: {
      unreadCount: number
      urgentItems: number
      lastActivity: Date
    }
  }
}
```

## Data Visualization Patterns

### Metrics Display (Enterprise Standard)
**KPI Cards:**
```typescript
interface MetricCard {
  title: string
  currentValue: number | string
  previousValue?: number | string
  change?: {
    value: number
    direction: 'up' | 'down' | 'flat'
    isGood: boolean // Is this change positive for business?
  }
  trend?: DataPoint[] // Sparkline data
  target?: number
  unit?: string
}

// Example metrics by role
const employerMetrics = [
  { title: 'Time to Hire', currentValue: 23, previousValue: 28, unit: 'days' },
  { title: 'Interview Rate', currentValue: 68, previousValue: 64, unit: '%' },
  { title: 'Offer Acceptance', currentValue: 78, previousValue: 82, unit: '%' }
]
```

### Pipeline Visualization
**Funnel Charts (Greenhouse Style):**
- Visual representation of candidate progression
- Clickable stages for drill-down
- Conversion rates between stages
- Bottleneck identification with visual cues

**Kanban Boards (Ashby Style):**
- Drag-and-drop candidate movement
- Swim lanes for different job roles
- Visual priority indicators
- Bulk operations on selected items

## Form Design Patterns

### Multi-Step Forms (Complex Data Entry)
```typescript
interface StepperForm {
  steps: {
    id: string
    title: string
    description: string
    fields: FormField[]
    validation: ValidationRule[]
    optional: boolean
  }[]
  
  navigation: {
    allowSkipping: boolean
    showProgress: boolean
    savePartialProgress: boolean
  }
  
  completion: {
    reviewStep: boolean
    confirmationStep: boolean
    redirectUrl?: string
  }
}
```

### Inline Editing Patterns
**Modern UX (Ashby/Modern Platforms):**
- Click to edit any field
- Auto-save on blur or explicit save
- Visual feedback during save states
- Undo functionality for accidental changes

## Table & List Design

### Data Table Patterns (Enterprise Standard)
**Features from Greenhouse/Ashby:**
- Sortable columns with multi-sort
- Resizable column widths
- Column show/hide controls
- Bulk selection with actions
- Inline editing for quick updates
- Export functionality

**Performance Features:**
- Virtual scrolling for large datasets
- Progressive loading
- Search-as-you-type filtering
- Cached results with smart refresh

### List Item Patterns
```typescript
interface ListItemDesign {
  // Primary information (always visible)
  primary: {
    avatar?: string
    title: string
    subtitle: string
  }
  
  // Secondary information (responsive visibility)
  secondary: {
    metadata: KeyValue[]
    tags: Tag[]
    actions: Action[]
  }
  
  // States and indicators
  state: {
    status: 'active' | 'inactive' | 'pending'
    priority?: 'low' | 'medium' | 'high'
    notifications?: number
  }
}
```

## Our UI/UX Competitive Advantages

### Multi-Stakeholder Design
**Unique to Our Platform:**
- Same interface serves agencies and employers differently
- Context switching without losing state
- Collaborative workspaces with shared visibility
- Real-time coordination indicators

### Partnership-First UX
**Design Principles:**
- Enhance relationships vs replace them
- Transparency in all interactions
- Mutual success metrics prominently displayed
- Communication built into workflow (not separate)

### Modern UX with Professional Depth
**Balance to Strike:**
- Consumer-grade ease of use
- Professional feature depth
- Collaborative workflow optimization
- Mobile-first responsive design

## Implementation Recommendations

### Phase 1: Core Dashboard (Immediate)
- Role-based dashboard with customizable cards
- Basic metrics display with real-time updates
- Responsive navigation for mobile/desktop
- Context switching between agency/employer views

### Phase 2: Advanced Interactions (Month 2-3)
- Drag-and-drop pipeline management
- Inline editing throughout interface
- Advanced filtering with saved searches
- Real-time collaboration indicators

### Phase 3: Sophisticated UX (Month 4-6)
- AI-powered insights and recommendations
- Advanced data visualizations
- Keyboard shortcuts and power user features
- Comprehensive mobile optimization

**Reference**: More detailed UI patterns and screenshots to be added to this directory when researching advanced features.