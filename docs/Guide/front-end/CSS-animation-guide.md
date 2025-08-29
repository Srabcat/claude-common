# Frontend Animation Style Guide 

## PURPOSE

Define consistent animation standards for the ATS platform ensuring smooth, professional user experience for busy recruiters across all role-based interfaces (Employer, Agency, Platform Admin). 

**Context**: Recruiters are extremely busy, often interrupted throughout the day - animations must enhance productivity, not distract.

---

## CORE ANIMATION PRINCIPLES

### Design Philosophy
- **Subtlety over spectacle** - Motion should help, not entertain
- **Purpose-driven** - Only animate to help users follow context changes  
- **No distractions** - Avoid looping, flashy, or large motion effects
- **Professional feel** - Notion/Linear-style calm, minimal transitions

### Performance Requirements
- **GPU-accelerated properties only**: `transform`, `opacity`, `filter`
- **Avoid CPU-heavy properties**: `width`, `height`, `top`, `left`, `padding`
- **Maximum 2-3 simultaneous animations** on busy screens
- **60fps target** for all animations

## TIMING & EASING STANDARDS

### Duration Guidelines
```css
--animation-duration-micro: 100ms;    /* Button hover, focus */
--animation-duration-fast: 200ms;     /* Modal, dropdown */
--animation-duration-medium: 300ms;   /* Page transition */
--animation-duration-slow: 500ms;     /* Layout switching */
```

### Easing Curves
- **Standard**: `cubic-bezier(0.4, 0, 0.2, 1)` - General purpose
- **Enter**: `cubic-bezier(0, 0, 0.2, 1)` - Elements appearing
- **Exit**: `cubic-bezier(0.4, 0, 1, 1)` - Elements disappearing
- **Use ease-out for 90% of cases**

---

## IMPLEMENTATION STRATEGY

### Tool Selection Decision Matrix

| Animation Type | Tool | Rationale |
|----------------|------|-----------|
| Button hover, focus | CSS/Tailwind | Simple, GPU-accelerated, no JS |
| Modal open/close | Framer Motion | State-driven, orchestration needed |
| Page transitions | Framer Motion | Complex layout shifts |
| Skeleton loaders | CSS keyframes | Lightweight, works without JS |
| Sidebar collapse | Framer Motion | Animated width/height changes |
| Table sorting | CSS/Tailwind | Simple opacity/transform |

### Implementation Priority
1. **Start with CSS/Tailwind** for 80% of animations
2. **Add Framer Motion** only when CSS can't handle complexity
3. **Bundle size matters** - avoid over-engineering

---

## CODE EXAMPLES

### CSS/Tailwind Microinteractions
```jsx
// Button hover states
<button className="transition-colors duration-200 hover:bg-gray-100 focus:ring-2 focus:ring-blue-500">
  Add Candidate
</button>

// Loading states
<div className="animate-pulse bg-gray-200 h-4 rounded" />

// Focus rings
<input className="transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
```

### Framer Motion Complex Animations
```jsx
import { motion } from "framer-motion";

// Modal with proper enter/exit
export function Modal({ isOpen, children }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="fixed inset-0 bg-white shadow-lg p-4 rounded-lg"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Page transitions
const pageVariants = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 }
};
```

---

## ATS-SPECIFIC ANIMATION PATTERNS

### Role-Based Navigation Animations
```jsx
// Navigation switching between horizontal/vertical
const navigationVariants = {
  horizontal: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  },
  vertical: {
    initial: { opacity: 0, x: -240 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -240 }
  }
};

// Candidate table row interactions
<tr className="transition-colors duration-200 hover:bg-gray-50 cursor-pointer">
  <td>John Doe</td>
</tr>
```

### Universal Elements
- **Search bar**: Focus ring fade-in (200ms)
- **Notifications**: Badge pulse for new items
- **Profile dropdown**: Slide down with opacity
- **Quick actions**: Scale feedback on click

---

## IMPLEMENTATION TODOS

### TODO: Global CSS Integration
```css
/* Add to globals.css */
@tailwind base;
@tailwind components;  
@tailwind utilities;

@layer base {
  :root {
    --animation-duration-micro: 100ms;
    --animation-duration-fast: 200ms;
    --animation-duration-medium: 300ms;
    --animation-duration-slow: 500ms;
    --animation-easing-standard: cubic-bezier(0.4, 0, 0.2, 1);
    --animation-easing-enter: cubic-bezier(0, 0, 0.2, 1);
    --animation-easing-exit: cubic-bezier(0.4, 0, 1, 1);
  }

  /* ACCESSIBILITY: Zero overhead reduced motion support */
  @media (prefers-reduced-motion: reduce) {
    * {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }
}

@layer components {
  .animate-fade-in {
    animation: fade-in var(--animation-duration-fast) var(--animation-easing-enter);
  }
  
  .transition-standard {
    transition: all var(--animation-duration-fast) var(--animation-easing-standard);
  }
}

@keyframes fade-in {
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: translateY(0); }
}
```

---

## PERFORMANCE & CONSTRAINTS

### Must Not Impact Layout Performance
- Navigation switching must stay <200ms
- Table sorting animations <100ms
- Modal opening <200ms
- No animation should block user input

### Bundle Size Constraints
- Framer Motion: Only load when complex animations needed
- Prefer CSS animations for 80% of interactions
- Lazy load animation libraries per route if needed

---