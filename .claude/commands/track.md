# /track [category] [text] - Project Tracking & Focus Management

**PROJECT TRACKER** - Keep focused, organized, and on track with consolidated task management.

## Usage
```bash
/track mvp "Smart Add-ons for Flexibility..."           # Add to MVP To-Do
/track rfe "Advanced search filters for better UX"      # Request for Enhancement  
/track today active "Finish API integration testing"    # Today's active work
/track today review "User auth flow implementation"     # Needs review
/track today approved "Database schema updates"         # Approved for next
/track later "Mobile app development phase"             # Phase II items
/track list                                            # Show all categories & file location
```

## Categories
- **mvp** - MVP To-Do items (critical path)
- **rfe** - Request for Enhancement (RVP improvements)  
- **today** - Today's tasks with subcategories:
  - `active` - Currently working on
  - `review` - Needs review/approval
  - `approved` - Approved, ready for implementation
- **prototype** - Architecture exploration and validation
- **later** - Phase II / Future items

## What This Does
1. **Consolidates text** into focused bullet points with timestamps
2. **Organizes by category** in project tracking file
3. **Stores detailed reference** at end of file with timestamps
4. **Prevents sidetracking** by maintaining clear focus areas
5. **Tracks prototyping decisions** and architecture choices

## File Location
Tracking file: `/Users/april/10x10-Repos/PROJECT-TRACKER.md`

## List View
```bash
/track list        # Shows current items by category + file location
```

**Stay focused. Build systematically. Track progress.**