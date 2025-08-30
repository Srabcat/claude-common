# Project TODO & Changelog - Claude Common

> **Last Updated:** 2025-08-29 15:45 PST  
> **Current Mode:** FILE_CLEANUP

**Legend:**
- ✅=Done, ⏳=Pending, **→**=AI done (needs human ✓)
- **Priority:** P1=Critical, P2=Important, P3=Nice-to-have  
- **Complexity:** S=Simple, M=Medium, L=Large

## ACTIVE Tasks 🔥
**MSG-90: Repository Cleanup** *(P1-M)*
├── 90-1: **→ Create PROJECT-TODO.md template** [AI-DONE] ⏳ *(pending human ✓)*
└── 90-3: Consolidate scattered TODO files [PENDING] ⏳
- /commands files

**MSG-89: Architecture Decision Documentation** *(due: this session)*
└── 89-3: Folder structure decisions [PENDING] ⏳
├── 89-1: Error handling strategy [AI-DONE] *2025-08-29*
├── 89-2: **→ Sentry free tier recommendation** [AI-DONE] ⏳ *(pending human ✓)*
- Navigation design

## Next Session (Priority) ⏭️
**MSG-85: Next.js Architecture Deep Dive** *(P1-L, parked)*
├── 85-1: Database schema design [PENDING] ⏳
├── 85-2: Data validation layer strategy [PENDING] ⏳
├── 85-3: State management boundaries [PENDING] ⏳
├── 85-4: API architecture decisions [PENDING] ⏳
├── 85-5: File storage strategy [PENDING] ⏳
├── 85-6: Deployment architecture [PENDING] ⏳
├── 85-7: Database migration strategy [PENDING] ⏳
├── 85-8: Folder structure organization [PENDING] ⏳
└── 85-9: Authentication strategy [PENDING] ⏳
Starterkit - Migrate from SWR to Zustand + TanStack Query v5
  - Replace SWRConfig in app/layout.tsx
  - Install: pnpm add zustand @tanstack/react-query
  - Move user/team data fetching to TanStack Query
  - Use Zustand for client-side state (user prefs, UI state)
  - Should be straightforward since current SWR usage is minimal 


## Long-term Enterprise 🏢
**MSG-82: Advanced Claude Configurations** *(P3-M)*
├── 82-1: Specialized agent development [PENDING] ⏳
├── 82-2: Advanced MCP server setup [PENDING] ⏳
└── 82-3: Cross-repository automation [PENDING] ⏳

**MSG-80: Performance & Monitoring** *(P3-L)*
├── 80-1: Error tracking implementation [PENDING] ⏳
├── 80-2: Performance monitoring setup [PENDING] ⏳
└── 80-3: Advanced logging strategies [PENDING] ⏳


## DONE Tasks 🔥
**MSG-88: Claude Mode System** *(P5-S)*
├── 88-1: Mode storage in CLAUDE.md [RESOLVED] ✅ *2025-08-29*
├── 88-2: Status line integration [RESOLVED] ✅ *2025-08-29*

**MSG-87: Team Portability** *(P5-M)*
├── 87-1: Fix hardcoded paths in .mcp.json [RESOLVED] ✅ *2025-08-29*
├── 87-2: Fix hardcoded paths in hooks [RESOLVED] ✅ *2025-08-29*
└── 87-3: **→ Create team setup documentation** [AI-DONE] ⏳ *(pending human ✓)*
----------------------------------------------------------------------------------------------------------------

# Changelog History

## 2025-08-29 - Session 89-90
### Completed
- Mode system in CLAUDE.md with status line integration  
- Fixed hardcoded paths in .mcp.json and hooks for team portability
- Created PROJECT-TODO format with tree structure and changelog

### Files Generated/Modified
- `PROJECT-TODO.md` - Combined TODO and changelog format
- Updated: `CLAUDE.md`, `.claude/settings.json`, `.mcp.json`, `.claude/mcp-setup.md`
- Created: `.claude/TEAM-SETUP.md`

## 2025-08-25

### Added
- **State Management Architecture**: TanStack Query + Zustand framework with decision tree
- **3-Phase Development Workflow**: Prototype → Implementation → Polish with specific checklists
- **Junior Engineer Gotchas Prevention**: Common mistakes and anti-patterns documentation
- **Architecture Audit Framework**: Required checks for Phase 2 (Implementation)

### Research Completed
- **GitHub Issues & Automation**: 2025 best practices, sub-issues, AI-enhanced triage
- **Frontend Testing Strategy**: Vitest + React Testing Library + Playwright (recommended over Jest)
- **Testing Framework Decision**: Vitest preferred for new projects due to speed and ESM support

### Files Modified
- `docs/coding.md` - Enhanced with comprehensive state management guidelines
- `docs/coding.md` - Added development phase workflows and checklists
- `docs/coding.md` - Added persistence strategy (browser storage vs database)

### Decisions Made
- **Testing Stack**: Vitest > Jest for unit tests, Playwright for E2E
- **State Management**: TanStack Query (server) + Zustand (client) + useState (local)
- **Development Phases**: 3-phase approach with different quality gates per phase
- **Documentation Strategy**: Separate concerns across different files


