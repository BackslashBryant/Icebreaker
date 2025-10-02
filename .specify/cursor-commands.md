# Spec Kit Slash Commands for Cursor

This document defines the slash commands available in Cursor for Spec-Driven Development.

## Available Commands

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

## Workflow

1. **Start with `/constitution`** - Establish project principles
2. **Use `/specify`** - Define what to build
3. **Use `/clarify`** - Clarify any underspecified areas
4. **Use `/plan`** - Create technical implementation plan
5. **Use `/tasks`** - Generate actionable task list
6. **Use `/implement`** - Execute the implementation

## Notes

- Commands should be used in sequence for best results
- Each command builds upon the previous ones
- The AI will reference the constitution and previous outputs when executing commands
- All outputs are stored in the `.specify/` directory structure
