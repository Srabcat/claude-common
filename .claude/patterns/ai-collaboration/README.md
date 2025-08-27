# AI Collaboration Patterns

Proven patterns for effective human-AI collaboration in software development.

## Core Patterns

### **Session Continuity Pattern**
**Problem**: AI loses context between sessions, causing repeated explanations
**Solution**: 
- Global hook shows sync reminders after every task
- Project commands provide exact phrases for context loading
- Persistent PROJECT-TODO.md maintains state across sessions

**Implementation**: Templates in `/templates/sync-commands/`

### **3-Phase Development Pattern**  
**Problem**: AI over-engineers during prototyping or under-engineers for production
**Solution**:
1. **Prototype**: Speed over quality, minimal error handling
2. **Implementation**: TDD, architecture audit, production patterns  
3. **Polish**: Performance, security, deployment readiness

**Implementation**: Mode commands with different quality gates per phase

### **State Management Decision Framework**
**Problem**: AI randomly chooses between useState, Zustand, React Query
**Solution**: Clear priority hierarchy:
1. Server data → React Query
2. Multi-component sharing → Zustand  
3. Local component only → useState

**Implementation**: Pre-code architecture check in coding guidelines

### **Context Window Management**
**Problem**: AI forgets earlier decisions in long conversations
**Solution**:
- Reset triggers: 50+ messages, confusion signs, contradictions
- Context recovery: Load from PROJECT-TODO.md and documentation
- Progress checkpoints: Regular saves to persistent files

**Implementation**: `/context-check` command and reset procedures

## Anti-Patterns to Avoid

### **The Copy-Paste Explosion**
AI duplicates similar code instead of creating reusable patterns
**Prevention**: Explicit architecture audit phase, component review

### **The Optimization Trap**  
AI adds useMemo/useCallback during prototyping
**Prevention**: Phase-based development with explicit optimization gates

### **The State Duplication Bug**
AI creates multiple state stores for same data
**Prevention**: Pre-code state audit questions, architecture review

## Measurement & Success Criteria

### **Session Continuity Success**
- Zero repeated explanations of previous decisions
- Consistent architecture across sessions
- Progress builds incrementally

### **Development Velocity**  
- Prototype phase: Features working quickly
- Implementation phase: Tests passing, architecture solid
- Polish phase: Production-ready code

### **Code Quality**
- No duplicate state management
- Consistent patterns across codebase  
- Clear separation of concerns

## Evolution & Improvement

These patterns should evolve based on:
- Real project experience
- AI capability improvements  
- Team feedback and pain points
- New development paradigms

Update patterns when better approaches are discovered and proven in practice.