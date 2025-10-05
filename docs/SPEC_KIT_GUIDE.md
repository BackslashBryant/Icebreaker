_Template placeholder. Replace or remove once your project defines this content._

# Official GitHub Spec Kit Integration Guide

## Overview

This template includes integration with the official GitHub Spec Kit for spec-driven development. Spec Kit provides structured slash commands in Cursor for creating specifications, plans, and implementing features.

## What is Spec Kit?

Spec Kit is an official GitHub tool that enables **Spec-Driven Development** - a methodology where specifications become executable, directly generating working implementations rather than just guiding them.

## Installation

Spec Kit is already installed in this template via `uv`:

```bash
# Check if Spec Kit is installed
specify --version

# If not installed, install it
uv tool install specify-cli --from git+https://github.com/github/spec-kit.git
```

**Prerequisites:**
- `uv` package manager
- Python 3.11+
- Git
- Cursor IDE

## Available Slash Commands

### `/constitution`
Create or update project governing principles and development guidelines.

**Usage**: `/constitution [description of principles to create]`

**Example**: 
```
/constitution Create principles focused on code quality, testing standards, user experience consistency, and performance requirements
```

**Output**: Creates or updates `.specify/memory/constitution.md`

### `/specify`
Define what you want to build (requirements and user stories).

**Usage**: `/specify [description of what to build]`

**Example**:
```
/specify Build a task management application that allows users to create, assign, and track tasks in a Kanban-style board
```

**Output**: Creates specification in `.specify/specs/[feature-name]/spec.md`

### `/clarify`
Clarify underspecified areas (must be run before `/plan` unless explicitly skipped).

**Usage**: `/clarify`

**Example**:
```
/clarify
```

**Output**: Updates specification with clarifications section

### `/plan`
Create technical implementation plans with your chosen tech stack.

**Usage**: `/plan [technical requirements and stack choices]`

**Example**:
```
/plan Use React with TypeScript for the frontend, Node.js with Express for the backend, and PostgreSQL for the database
```

**Output**: Creates implementation plan in `.specify/specs/[feature-name]/plan.md`

### `/tasks`
Generate actionable task lists for implementation.

**Usage**: `/tasks`

**Example**:
```
/tasks
```

**Output**: Creates task breakdown in `.specify/specs/[feature-name]/tasks.md`

### `/implement`
Execute all tasks to build the feature according to the plan.

**Usage**: `/implement`

**Example**:
```
/implement
```

**Output**: Executes the implementation plan step by step

## Complete Workflow Example

### Step 1: Establish Project Principles
```
/constitution Create principles focused on code quality, testing standards, user experience consistency, and performance requirements. Include governance for how these principles should guide technical decisions and implementation choices.
```

### Step 2: Define What to Build
```
/specify Build Taskify, a team productivity platform. It should allow users to create projects, add team members, assign tasks, comment and move tasks between boards in Kanban style. Users will be predefined (one product manager and four engineers). Create three different sample projects with standard Kanban columns: "To Do," "In Progress," "In Review," and "Done." No login required for this initial version.
```

### Step 3: Clarify Requirements
```
/clarify
```

### Step 4: Create Implementation Plan
```
/plan The application uses React with TypeScript for the frontend, Node.js with Express for the backend, and PostgreSQL for the database. Implement drag-and-drop functionality for task cards, real-time updates, and a clean, modern UI.
```

### Step 5: Generate Task List
```
/tasks
```

### Step 6: Execute Implementation
```
/implement
```

## Directory Structure

After using Spec Kit commands, your project will have this structure:

```
.specify/
├── memory/
│   └── constitution.md          # Project governing principles
├── specs/
│   └── [feature-name]/         # Feature specifications
│       ├── spec.md             # Feature specification
│       ├── plan.md             # Implementation plan
│       ├── tasks.md            # Task breakdown
│       └── clarifications.md   # Clarification responses
├── templates/
│   ├── spec-template.md        # Specification template
│   ├── plan-template.md        # Plan template
│   └── tasks-template.md       # Tasks template
└── cursor-commands.md          # Cursor slash commands reference
```

## Integration with Existing Workflow

### GitHub Issues Integration
- Spec Kit features can be tracked as GitHub Issues
- Link Spec Kit artifacts to GitHub Issues
- Use existing git automation for Spec Kit work

### MCP Integration
- Use MCP tools for research during specification
- Use MCP tools for validation during implementation
- Maintain existing MCP quality gates

### Quality Gates
- All Spec Kit outputs must meet quality standards
- Use existing linting, testing, and security checks
- Maintain existing CI/CD integration

## When to Use Spec Kit

### Use Spec Kit For:
- Complex features affecting multiple components
- Breaking changes or API modifications
- Architecture decisions
- Multi-step implementations with dependencies
- New feature development
- System refactoring

### Use GitHub Issues Workflow For:
- Simple bug fixes (single file, <50 lines)
- Typo corrections or formatting
- Documentation-only changes
- Test additions for existing functionality
- Dependency updates without behavior changes

## Best Practices

### Specification Creation
- Be explicit about what and why, not how
- Focus on user stories and functional requirements
- Include acceptance criteria and success metrics
- Don't specify the tech stack in the specification phase

### Planning
- Choose appropriate technology stack
- Consider performance, security, and scalability
- Document architectural decisions
- Research current best practices for chosen technologies

### Implementation
- Follow TDD approach
- Execute tasks in dependency order
- Validate against specifications
- Maintain code quality standards

### Documentation
- Keep specifications up to date
- Document decisions and rationale
- Maintain clear traceability between specs, plans, and implementation

## Troubleshooting

### Spec Kit Commands Not Working
1. Ensure Spec Kit is installed: `specify --version`
2. Check that you're in a project directory with `.specify/` folder
3. Verify Cursor IDE is properly configured
4. Try running commands in sequence (constitution → specify → clarify → plan → tasks → implement)

### Command Failures
- Check the `.specify/` directory structure
- Ensure all required files exist
- Review error messages for specific guidance
- Fall back to GitHub Issues workflow if needed

### Integration Issues
- Verify existing git automation still works
- Check MCP integrations are functioning
- Ensure quality gates are passing
- Review Cursor rules configuration

## Resources

- [Official Spec Kit Repository](https://github.com/github/spec-kit)
- [Spec-Driven Development Guide](https://github.com/github/spec-kit/blob/main/spec-driven.md)
- [Spec Kit Documentation](https://github.com/github/spec-kit#readme)

## Support

For Spec Kit specific issues:
- Open an issue in the [official Spec Kit repository](https://github.com/github/spec-kit/issues)
- Check the troubleshooting section above
- Review the official documentation

For template-specific issues:
- Open an issue in this template repository
- Check the existing documentation
- Review the Cursor rules configuration