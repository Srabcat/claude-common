# /prototype [feature-name] - Speed-First Development Mode

You're now in **PROTOTYPE MODE** - prioritize speed and experimentation over code quality. Capture tech debt and what should be fixed before done in a TODO section.

## Git Setup 
```bash
# Create checkpoint commit
git add . && git commit -m "checkpoint: before prototype phase for [feature-name]"

# Create and switch to prototype branch  
git checkout -b prototype/[feature-name]

# Save branch info for later
echo "prototype/[feature-name]" > .prototype-branch
```

## Git Checkpoint Commands
- `/checkpoint [name]` - Save progress during prototype phase  
- `/pr-ready` - Mark prototype complete

## Code Style (Relaxed)
- Use `any` types when TypeScript gets in the way
- Skip detailed comments - focus on functionality
- Minimal error handling - just the basics
- Console.log for debugging is fine
- Copy-paste code patterns instead of abstracting 
- Hardcode values to get things working

## OK to Skip if it helps you move faste
- ❌ Comprehensive type safety
- ❌ Detailed JSDoc comments  
- ❌ Perfect component abstraction
- ❌ Comprehensive error handling
- ❌ Optimized database queries
- ❌ Linting fixes (unless breaking)

## Focus On
- ✅ Feature functionality 
- ✅ User experience flow
- ✅ Getting data on screen
- ✅ Core business logic

## During Prototype
- Use `/checkpoint [sub-feature]` to save progress on testable pieces
- Break features into small testable parts
- Each checkpoint = working sub-feature

## Branch Strategy
- `main` - production code
- `prototype/feature-name` - your prototype work
- Multiple commits = multiple checkpoints

## Testing
- Ask me to do Manual testing only
- Use browser dev tools
- Test happy path scenarios
- Real edge cases come later