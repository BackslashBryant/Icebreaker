---
description: Create a technical implementation plan from the current feature specification, including tech stack choices and architecture decisions.
---

The user input to you can be provided directly by the agent or as a command argument - you **MUST** consider it before proceeding with the prompt (if not empty).

User input:

$ARGUMENTS

You are creating a technical implementation plan for the current feature. Your job is to:

1. **Read the current feature specification** from `specs/{BRANCH_NAME}/spec.md`
2. **Create a comprehensive implementation plan** in `specs/{BRANCH_NAME}/plan.md`
3. **Include technical architecture, data models, and implementation details**

Follow this execution flow:

1. **Load the feature specification**:
   - Read `specs/{BRANCH_NAME}/spec.md`
   - Understand the functional requirements and user stories
   - Identify technical challenges and constraints

2. **Create implementation plan**:
   - Copy `plan-template.md` to `specs/{BRANCH_NAME}/plan.md`
   - Fill in technical approach based on user input and requirements
   - Define data model changes
   - Specify API endpoints (if applicable)
   - Detail UI/UX considerations
   - Plan testing strategy
   - Address security considerations
   - Define deployment strategy

3. **Research and validation**:
   - Research chosen technologies and frameworks
   - Validate technical feasibility
   - Check for potential issues or conflicts
   - Update research document with findings

4. **Create supporting documents**:
   - `data-model.md` - Database schema and data structures
   - `research.md` - Technology research and decisions
   - `quickstart.md` - Quick start guide for the feature

5. **Validate the plan**:
   - Ensure all requirements are addressed
   - Verify technical approach is sound
   - Check for missing components or dependencies
   - Validate against project constitution

6. **Output summary**:
   - Implementation plan location
   - Key technical decisions made
   - Technologies and frameworks chosen
   - Next steps (tasks, implement, etc.)

**Important Notes**:
- Be specific about technology choices and rationale
- Include detailed implementation steps
- Address performance and scalability concerns
- Plan for testing and quality assurance
- Consider security implications
- Document any assumptions or dependencies
