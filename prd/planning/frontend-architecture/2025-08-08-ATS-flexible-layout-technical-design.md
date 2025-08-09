# ATS Flexible Layout System - Technical Design
**Date:** 2025-08-08  
**Status:** Implementation Ready  
**Type:** Frontend Architecture Design  
**Estimated Implementation:** 1 hour setup + 45 minutes per role  

---

## OBJECTIVE

Design a flexible layout system that supports role-based navigation patterns (horizontal vs vertical) while maintaining loose coupling between navigation components and page content. Minimize per-page implementation overhead while enabling seamless role switching.

---

## ARCHITECTURE OVERVIEW

### Core Principles
1. **Layout-Agnostic Pages** - Content components independent of navigation layout
2. **Role-Based Navigation** - Different navigation patterns per user role  
3. **Loose Coupling** - Navigation changes don't require page rebuilds
4. **Performance First** - Minimal runtime overhead, optimal bundle splitting

### Role-to-Layout Mapping
```
EMPLOYER    → Horizontal Navigation (marketplace browsing pattern)
AGENCY      → Vertical Sidebar (ATS workflow pattern)  
ADMIN       → Vertical Sidebar (management interface pattern)
```

---

## TECHNICAL IMPLEMENTATION

### Component Architecture

**Compound Components Pattern** (Primary Architecture):
```typescript
// contexts/NavigationContext.tsx
interface NavigationState {
  userRole: UserRole;
  activeRoute: string;
  sidebarCollapsed: boolean;
  permissions: Permission[];
}

const NavigationContext = createContext<NavigationState | undefined>(undefined);

export const NavigationProvider = ({ children, userRole, permissions }: Props) => {
  const [state, dispatch] = useReducer(navigationReducer, {
    userRole,
    activeRoute: '/',
    sidebarCollapsed: false,
    permissions
  });

  const contextValue = useMemo(() => ({
    ...state,
    actions: {
      setActiveRoute: (route: string) => dispatch({ type: 'SET_ACTIVE_ROUTE', payload: route }),
      toggleSidebar: () => dispatch({ type: 'TOGGLE_SIDEBAR' }),
      updatePermissions: (perms: Permission[]) => dispatch({ type: 'UPDATE_PERMISSIONS', payload: perms })
    }
  }), [state]);

  return (
    <NavigationContext.Provider value={contextValue}>
      {children}
    </NavigationContext.Provider>
  );
};
```

**Layout Orchestration Component**:
```typescript
// components/layout/LayoutOrchestrator.tsx
interface LayoutOrchestratorProps {
  children: React.ReactNode;
  userRole: UserRole;
  permissions: Permission[];
}

export const LayoutOrchestrator = ({ children, userRole, permissions }: LayoutOrchestratorProps) => {
  const LayoutComponent = getLayoutComponent(userRole);
  const navigationConfig = getNavigationConfig(userRole);

  return (
    <NavigationProvider userRole={userRole} permissions={permissions}>
      <LayoutComponent navigationConfig={navigationConfig}>
        <UniversalTopBar />
        <main className="content-area">
          {children}
        </main>
      </LayoutComponent>
    </NavigationProvider>
  );
};

// Layout component selection
const getLayoutComponent = (userRole: UserRole): React.ComponentType<LayoutProps> => {
  switch (userRole) {
    case 'EMPLOYER':
      return HorizontalLayout;
    case 'AGENCY':
    case 'ADMIN':
      return VerticalLayout;
    default:
      return DefaultLayout;
  }
};
```

### Navigation Component Structure

**Horizontal Navigation (Employers)**:
```typescript
// components/navigation/HorizontalNavigation.tsx
export const HorizontalNavigation = ({ navigationConfig }: NavigationProps) => {
  const { activeRoute, actions } = useNavigation();

  return (
    <nav className="horizontal-nav">
      <div className="nav-container">
        {navigationConfig.items.map(item => (
          <NavigationItem
            key={item.href}
            href={item.href}
            label={item.label}
            icon={item.icon}
            isActive={activeRoute === item.href}
            onClick={() => actions.setActiveRoute(item.href)}
            permissions={item.requiredPermissions}
          />
        ))}
      </div>
    </nav>
  );
};
```

**Vertical Navigation (Agencies/Admin)**:
```typescript
// components/navigation/VerticalNavigation.tsx
export const VerticalNavigation = ({ navigationConfig }: NavigationProps) => {
  const { activeRoute, sidebarCollapsed, actions } = useNavigation();

  return (
    <aside className={clsx('vertical-nav', { collapsed: sidebarCollapsed })}>
      <div className="nav-header">
        <button onClick={actions.toggleSidebar} aria-label="Toggle sidebar">
          <CollapseIcon />
        </button>
      </div>
      
      <nav className="nav-menu">
        {navigationConfig.sections.map(section => (
          <NavigationSection
            key={section.id}
            title={section.title}
            items={section.items}
            activeRoute={activeRoute}
            onRouteChange={actions.setActiveRoute}
          />
        ))}
      </nav>
    </aside>
  );
};
```

**Universal Top Bar**:
```typescript
// components/layout/UniversalTopBar.tsx
export const UniversalTopBar = () => {
  const { userRole, permissions } = useNavigation();

  return (
    <header className="universal-top-bar">
      <div className="top-bar-content">
        {/* Global Search */}
        <GlobalSearch className="search-center" />
        
        {/* Right Side Actions */}
        <div className="top-bar-actions">
          <QuickAddButton userRole={userRole} permissions={permissions} />
          <NotificationsDropdown />
          <UserProfileDropdown />
          {process.env.NODE_ENV === 'development' && (
            <RoleSwitcher /> {/* Development only */}
          )}
        </div>
      </div>
    </header>
  );
};
```

### Layout Components

**Horizontal Layout**:
```typescript
// components/layout/HorizontalLayout.tsx
export const HorizontalLayout = ({ children, navigationConfig }: LayoutProps) => {
  return (
    <div className="layout-horizontal">
      <HorizontalNavigation navigationConfig={navigationConfig} />
      <div className="content-wrapper">
        {children}
      </div>
    </div>
  );
};
```

**Vertical Layout**:
```typescript
// components/layout/VerticalLayout.tsx
export const VerticalLayout = ({ children, navigationConfig }: LayoutProps) => {
  const { sidebarCollapsed } = useNavigation();

  return (
    <div className={clsx('layout-vertical', { 'sidebar-collapsed': sidebarCollapsed })}>
      <VerticalNavigation navigationConfig={navigationConfig} />
      <div className="content-wrapper">
        {children}
      </div>
    </div>
  );
};
```

---

## CSS ARCHITECTURE

### Tailwind CSS Approach (Recommended)
```css
/* Base layout styles */
.layout-horizontal {
  @apply min-h-screen flex flex-col;
}

.layout-vertical {
  @apply min-h-screen flex;
}

.layout-vertical.sidebar-collapsed {
  @apply ml-16; /* Collapsed sidebar width */
}

/* Navigation styles */
.horizontal-nav {
  @apply bg-white border-b border-gray-200 sticky top-0 z-50;
}

.vertical-nav {
  @apply w-64 bg-gray-900 text-white fixed inset-y-0 left-0 z-40 transition-all duration-300;
}

.vertical-nav.collapsed {
  @apply w-16;
}

/* Universal top bar */
.universal-top-bar {
  @apply bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-50;
}

/* Content area */
.content-area {
  @apply flex-1 p-6;
}

/* Responsive adjustments */
@screen md {
  .layout-vertical {
    @apply ml-64; /* Sidebar width */
  }
  
  .layout-vertical.sidebar-collapsed {
    @apply ml-16;
  }
}

@screen lg {
  .content-area {
    @apply p-8;
  }
}
```

### CSS Custom Properties for Dynamic Theming
```css
/* CSS variables for role-based theming */
:root {
  --nav-bg-employer: #ffffff;
  --nav-bg-agency: #1f2937;
  --nav-bg-admin: #7c2d12;
  --nav-text-employer: #374151;
  --nav-text-agency: #ffffff;
  --nav-text-admin: #ffffff;
}

.horizontal-nav[data-role="employer"] {
  background-color: var(--nav-bg-employer);
  color: var(--nav-text-employer);
}

.vertical-nav[data-role="agency"] {
  background-color: var(--nav-bg-agency);
  color: var(--nav-text-agency);
}

.vertical-nav[data-role="admin"] {
  background-color: var(--nav-bg-admin);
  color: var(--nav-text-admin);
}
```

---

## ROLE-BASED NAVIGATION CONFIGURATION

### Navigation Config System
```typescript
// config/navigation.ts
interface NavigationItem {
  href: string;
  label: string;
  icon: React.ComponentType;
  requiredPermissions: Permission[];
  exactMatch?: boolean;
}

interface NavigationSection {
  id: string;
  title: string;
  items: NavigationItem[];
}

interface NavigationConfig {
  layout: 'horizontal' | 'vertical';
  items?: NavigationItem[]; // For horizontal
  sections?: NavigationSection[]; // For vertical
}

const EMPLOYER_NAVIGATION: NavigationConfig = {
  layout: 'horizontal',
  items: [
    {
      href: '/dashboard',
      label: 'Dashboard',
      icon: HomeIcon,
      requiredPermissions: ['dashboard:read']
    },
    {
      href: '/browse-talent',
      label: 'Browse Talent',
      icon: UsersIcon,
      requiredPermissions: ['candidates:browse']
    },
    {
      href: '/my-jobs',
      label: 'My Jobs',
      icon: BriefcaseIcon,
      requiredPermissions: ['jobs:read']
    },
    {
      href: '/active-candidates',
      label: 'Active Candidates',
      icon: UserCheckIcon,
      requiredPermissions: ['candidates:read']
    },
    {
      href: '/messages',
      label: 'Messages',
      icon: ChatBubbleLeftIcon,
      requiredPermissions: ['messages:read']
    },
    {
      href: '/analytics',
      label: 'Analytics',
      icon: ChartBarIcon,
      requiredPermissions: ['analytics:read']
    }
  ]
};

const AGENCY_NAVIGATION: NavigationConfig = {
  layout: 'vertical',
  sections: [
    {
      id: 'main',
      title: 'Main',
      items: [
        {
          href: '/dashboard',
          label: 'Dashboard',
          icon: HomeIcon,
          requiredPermissions: ['dashboard:read']
        },
        {
          href: '/my-jobs',
          label: 'My Jobs',
          icon: BriefcaseIcon,
          requiredPermissions: ['jobs:read']
        },
        {
          href: '/candidates',
          label: 'Candidates',
          icon: UsersIcon,
          requiredPermissions: ['candidates:read']
        }
      ]
    },
    {
      id: 'tools',
      title: 'Tools',
      items: [
        {
          href: '/outreach',
          label: 'Outreach',
          icon: MailIcon,
          requiredPermissions: ['outreach:read']
        },
        {
          href: '/commissions',
          label: 'Commissions',
          icon: CurrencyDollarIcon,
          requiredPermissions: ['commissions:read']
        }
      ]
    },
    {
      id: 'settings',
      title: 'Settings',
      items: [
        {
          href: '/settings',
          label: 'Settings',
          icon: CogIcon,
          requiredPermissions: ['settings:read']
        }
      ]
    }
  ]
};

export const getNavigationConfig = (userRole: UserRole): NavigationConfig => {
  switch (userRole) {
    case 'EMPLOYER':
      return EMPLOYER_NAVIGATION;
    case 'AGENCY':
      return AGENCY_NAVIGATION;
    case 'ADMIN':
      return ADMIN_NAVIGATION;
    default:
      throw new Error(`No navigation config for role: ${userRole}`);
  }
};
```

---

## PERFORMANCE OPTIMIZATIONS

### Code Splitting Strategy
```typescript
// Lazy load role-specific navigation components
const HorizontalNavigation = lazy(() => import('./navigation/HorizontalNavigation'));
const VerticalNavigation = lazy(() => import('./navigation/VerticalNavigation'));

// Bundle splitting for role-specific features
const loadRoleSpecificFeatures = (userRole: UserRole) => {
  switch (userRole) {
    case 'EMPLOYER':
      return import('@/features/employer');
    case 'AGENCY':
      return import('@/features/agency');
    case 'ADMIN':
      return import('@/features/admin');
  }
};
```

### Memoization Strategy
```typescript
// Memoize navigation components
export const MemoizedHorizontalNavigation = React.memo(HorizontalNavigation, (prev, next) => (
  prev.navigationConfig === next.navigationConfig &&
  prev.activeRoute === next.activeRoute
));

// Memoize expensive computations
const useNavigationItems = (userRole: UserRole, permissions: Permission[]) => {
  return useMemo(() => {
    const config = getNavigationConfig(userRole);
    return filterItemsByPermissions(config, permissions);
  }, [userRole, permissions]);
};
```

### Bundle Optimization
```javascript
// webpack.config.js or next.config.js
module.exports = {
  webpack: (config) => {
    config.optimization.splitChunks.chunks = 'all';
    config.optimization.splitChunks.cacheGroups = {
      ...config.optimization.splitChunks.cacheGroups,
      navigation: {
        test: /[\\/]components[\\/]navigation[\\/]/,
        name: 'navigation',
        chunks: 'all',
        priority: 10,
      },
      layout: {
        test: /[\\/]components[\\/]layout[\\/]/,
        name: 'layout',
        chunks: 'all',
        priority: 10,
      },
    };
    return config;
  },
};
```

---

## TESTING STRATEGY

### Unit Testing
```typescript
// __tests__/LayoutOrchestrator.test.tsx
describe('LayoutOrchestrator', () => {
  it('renders horizontal layout for employer role', () => {
    render(
      <LayoutOrchestrator userRole="EMPLOYER" permissions={[]}>
        <div>Content</div>
      </LayoutOrchestrator>
    );
    
    expect(screen.getByRole('navigation')).toHaveClass('horizontal-nav');
  });

  it('renders vertical layout for agency role', () => {
    render(
      <LayoutOrchestrator userRole="AGENCY" permissions={[]}>
        <div>Content</div>
      </LayoutOrchestrator>
    );
    
    expect(screen.getByRole('navigation')).toHaveClass('vertical-nav');
  });

  it('filters navigation items by permissions', () => {
    const limitedPermissions = ['dashboard:read'];
    
    render(
      <LayoutOrchestrator userRole="EMPLOYER" permissions={limitedPermissions}>
        <div>Content</div>
      </LayoutOrchestrator>
    );
    
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.queryByText('Analytics')).not.toBeInTheDocument();
  });
});
```

### Integration Testing
```typescript
// __tests__/RoleSwitching.integration.test.tsx
describe('Role Switching Integration', () => {
  it('preserves page content when switching roles', async () => {
    const user = userEvent.setup();
    
    render(<App initialRole="EMPLOYER" />);
    
    // Navigate to a page
    await user.click(screen.getByText('My Jobs'));
    expect(screen.getByText('Job Listings')).toBeInTheDocument();
    
    // Switch role
    await user.click(screen.getByText('Switch to Agency'));
    
    // Content should persist, navigation should change
    expect(screen.getByText('Job Listings')).toBeInTheDocument();
    expect(screen.getByRole('navigation')).toHaveClass('vertical-nav');
  });
});
```

---

## IMPLEMENTATION PHASES

### Phase 1: Core Layout System (1 hour)
1. **Setup Navigation Context** - State management for role/route
2. **Create Layout Components** - Horizontal and vertical layouts
3. **Implement Universal Top Bar** - Search, notifications, profile
4. **Build Navigation Items** - Reusable navigation item component
5. **Add CSS Architecture** - Tailwind classes and responsive design

### Phase 2: Role-Based Navigation (45 minutes per role)
1. **Define Navigation Configs** - Role-specific navigation items
2. **Implement Permission Filtering** - Hide unauthorized items
3. **Add Role Switching** - Development tool for testing
4. **Test Layout Switching** - Verify smooth transitions

### Phase 3: Page Integration (5% per page)
1. **Wrap Pages in Layout** - Add LayoutOrchestrator to pages
2. **Test Content Areas** - Verify pages work in both layouts
3. **Add Role-Specific Content** - Conditional rendering based on permissions

---

## FILE STRUCTURE

```
/components
  /layout
    - LayoutOrchestrator.tsx
    - HorizontalLayout.tsx
    - VerticalLayout.tsx
    - UniversalTopBar.tsx
  /navigation
    - HorizontalNavigation.tsx
    - VerticalNavigation.tsx
    - NavigationItem.tsx
    - NavigationSection.tsx
    - RoleSwitcher.tsx (dev only)
/contexts
  - NavigationContext.tsx
/config
  - navigation.ts
  - permissions.ts
/hooks
  - useNavigation.ts
  - usePermissions.ts
/types
  - navigation.ts
  - user.ts
/styles
  - layout.css
  - navigation.css
```

---

## SUCCESS METRICS

### Performance Targets
- **Layout Switch Time**: <200ms
- **First Paint with Navigation**: <100ms  
- **Bundle Size Impact**: <10KB per role
- **Lighthouse Performance**: 90+ score

### Development Efficiency
- **New Page Integration**: 5% overhead maximum
- **Navigation Changes**: Zero page component updates
- **Role Addition**: <1 hour implementation time

### User Experience
- **Navigation Clarity**: Clear role-appropriate navigation
- **Responsive Behavior**: Smooth mobile/desktop transitions
- **Accessibility**: WCAG 2.1 AA compliance

**IMPLEMENTATION READY - Architecture provides flexible, performant, maintainable foundation for role-based navigation with minimal per-page overhead**