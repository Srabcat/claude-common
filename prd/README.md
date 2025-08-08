# Product Requirements Document (PRD) Repository

Central location for planning and documenting product requirements across 10x10 platform projects.

## Directory Structure

```
prd/
├── README.md              # This file
├── templates/             # PRD templates for different project types
├── active/               # Currently active PRD projects
├── archive/              # Completed/cancelled PRD projects
└── guidelines/           # PRD writing standards and best practices
```

## Usage

### Starting a New Project
1. Copy appropriate template from `templates/` to `active/`
2. Rename file with project name and date: `YYYY-MM-DD-project-name.md`
3. Fill out all template sections
4. Update regularly as requirements evolve

### Project Lifecycle
- **Active**: PRD is being developed or project is in progress
- **Archive**: Move completed or cancelled PRDs here for reference

### Naming Convention
- Format: `YYYY-MM-DD-project-name.md`
- Use kebab-case for project names
- Include version numbers for major revisions: `v2-project-name.md`

## Best Practices
- Keep PRDs living documents - update as requirements change
- Include acceptance criteria for each feature
- Link to related technical specs and design docs
- Review PRDs with stakeholders before development begins