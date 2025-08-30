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
- `/checkpoint [name]` - Save mid-progress during prototype phase  
- Prefer small, focused commits, easily revert if needed

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

- Starting with happy path with limited data.  
- Feature functionality 
- User experience flow
- Getting data on screen for human to confirm 
- Core business logic

## During Prototype
- Use `/checkpoint [sub-feature]` to save progress on testable pieces
- Break features into small testable parts
- Each checkpoint = working sub-feature github commit

## Branch Strategy
- `main` - production code
- `prototype/feature-name` - your prototype work

## Testing
- No need to do through testing yet.
- Write code only, ask me to do manual testing — you cannot run or test the app yet
- Use browser dev tools
- Test happy path scenarios
- Real edge cases come later