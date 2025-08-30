
## State Management Architecture (Required)

### Technology Stack
- **TanStack Query (React Query)** - Server state management
- **Zustand** - Client/UI state management  
- **useState** - Local component state only

### State Decision Framework
**MUST follow this exact order:**

1. **Server data** (API responses, DB records) → **TanStack Query**
2. **Multi-component sharing** (selected items, global filters) → **Zustand**  
3. **Cross-session persistence** (user preferences, selected state) → **Zustand + persist**
4. **Multi-user real-time** (collaborative editing, live updates) → **Zustand + WebSocket**
5. **Local component UI** (form inputs, hover states, dropdowns) → **useState**

### Pre-Code Architecture Check (Required)
Before writing ANY state management code, answer these questions:

**State Audit Questions:**
- Does this state already exist in Zustand store?
- Can I get this data via props from parent?
- Can I derive this from existing state?
- Is this actually server data that TanStack Query should handle?
- Do other components need this state RIGHT NOW?
- Will this state trigger actions in OTHER components?
- Should this state persist across browser refresh/navigation?
- Do multiple users need to see state changes in real-time?

**Required Output:** State management plan with justification before coding.

### Persistence Strategy Guidelines

#### Browser Storage (localStorage + Zustand persist):
✅ **Use for:**
- User preferences (theme, language, layout)
- UI state (selected filters, view mode)
- Draft form data (before submission)
- Temporary selections across page refresh
- Non-critical data that can be lost

❌ **Never use for:**
- Sensitive data (tokens, passwords)
- Critical business data
- Data other users need to see
- Large datasets (storage limits)
- Data requiring audit trails

#### Database Persistence (via API):
✅ **Use for:**
- All business-critical data
- Data shared between users
- Data requiring backup/recovery
- Audit trails and compliance data
- Large datasets
- Sensitive information

**Decision Test:** "What happens if this data disappears from user's browser?"
- No problem → Browser storage OK
- Business breaks → Must be in database

### State Management Anti-patterns (NEVER DO)

❌ **Duplicate State:**
```javascript
// Wrong - duplicate state for same data
const [selectedId, setSelectedId] = useState(123)  
const selectedCandidate = useStore(state => state.selected)
```

❌ **Server Data in useState:**
```javascript
// Wrong - API data in useState
const [candidates, setCandidates] = useState([])
useEffect(() => { fetchCandidates().then(setCandidates) }, [])

// Right - use TanStack Query
const { data: candidates } = useQuery(['candidates'], fetchCandidates)
```

❌ **Props When Store Exists:**
```javascript
// Wrong - passing data through props when Zustand store exists
<CandidateCard candidate={candidate} />

// Right - component reads from store
function CandidateCard() {
  const candidate = useStore(state => state.selectedCandidate)
}
```

❌ **State for Derived Data:**
```javascript
// Wrong - storing computed values
const [fullName, setFullName] = useState('')
useEffect(() => setFullName(`${first} ${last}`), [first, last])

// Right - compute on render
const fullName = `${first} ${last}`
```

### Junior Engineer Common Mistakes

❌ **State Synchronization Issues:**
- Forgetting to sync Zustand state with server after mutations
- Not invalidating TanStack Query cache after updates
- Creating "stale state" where UI shows old data

❌ **State Timing Issues:**
```javascript
// Wrong - using state immediately after setState
setCount(count + 1)
console.log(count) // Still old value!

// Right - use functional updates or useEffect
setCount(prev => prev + 1)
```

❌ **Memory Leaks:**
- Forgetting cleanup in useEffect
- Not cancelling API requests on component unmount
- Subscriptions without unsubscribe

❌ **Direct State Mutation:**
```javascript
// Wrong - mutates state directly
state.candidates.push(newCandidate)

// Right - immutable update
setState(prev => [...prev, newCandidate])
```