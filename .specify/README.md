# Spec Kit Directory Structure

This directory contains the Spec Kit configuration and artifacts for spec-driven development.

## Directory Structure

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
├── scripts/                    # Spec Kit utility scripts
└── cursor-commands.md          # Cursor slash commands reference
```

## Usage

### For Users
1. Use the slash commands in Cursor to create specifications and plans
2. All artifacts are automatically created in the appropriate directories
3. Reference the constitution for project principles

### For Developers
1. Templates in `templates/` define the structure for new artifacts
2. Scripts in `scripts/` provide utility functions
3. The `cursor-commands.md` file documents available slash commands

## Slash Commands

- `/constitution` - Create project principles
- `/specify` - Define what to build
- `/clarify` - Clarify requirements
- `/plan` - Create implementation plan
- `/tasks` - Generate task list
- `/implement` - Execute implementation

## Workflow

1. Start with `/constitution` to establish principles
2. Use `/specify` to define requirements
3. Use `/clarify` to refine requirements
4. Use `/plan` to create technical plan
5. Use `/tasks` to break down into tasks
6. Use `/implement` to execute the plan

## Integration

This Spec Kit integration works with:
- Cursor IDE
- GitHub Issues workflow
- Existing git automation
- MCP integrations

The Spec Kit enhances the development workflow without replacing existing tools and processes.
