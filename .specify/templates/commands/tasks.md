---
description: Generate actionable task lists from the implementation plan, breaking down the work into manageable, ordered tasks.
---

The user input to you can be provided directly by the agent or as a command argument - you **MUST** consider it before proceeding with the prompt (if not empty).

User input:

$ARGUMENTS

You are creating a task breakdown for the current feature implementation. Your job is to:

1. **Read the implementation plan** from `specs/{BRANCH_NAME}/plan.md`
2. **Generate actionable tasks** in `specs/{BRANCH_NAME}/tasks.md`
3. **Organize tasks in logical phases with proper dependencies**

Follow this execution flow:

1. **Load the implementation plan**:
   - Read `specs/{BRANCH_NAME}/plan.md`
   - Understand the technical approach and requirements
   - Identify all components and modules to be built

2. **Create task breakdown**:
   - Copy `tasks-template.md` to `specs/{BRANCH_NAME}/tasks.md`
   - Break down implementation into specific, actionable tasks
   - Organize tasks into logical phases (Setup, Backend, Frontend, Integration, Testing, Deployment)
   - Identify task dependencies and ordering requirements
   - Estimate complexity and effort for each task

3. **Task organization**:
   - **Phase 1: Setup and Core Infrastructure** - Project setup, dependencies, basic structure
   - **Phase 2: Backend Development** - APIs, business logic, data models
   - **Phase 3: Frontend Development** - UI components, user interactions, state management
   - **Phase 4: Integration and Testing** - End-to-end testing, bug fixes, performance optimization
   - **Phase 5: Documentation and Deployment** - Documentation updates, deployment preparation

4. **Task details**:
   - Each task should be specific and actionable
   - Include acceptance criteria for each task
   - Specify any prerequisites or dependencies
   - Add notes about implementation approach
   - Include testing requirements

5. **Validation**:
   - Ensure all requirements from the plan are covered
   - Verify task dependencies are correct
   - Check that tasks are appropriately sized
   - Validate that the sequence makes sense

6. **Output summary**:
   - Total number of tasks created
   - Number of tasks per phase
   - Estimated timeline
   - Next steps (implement, etc.)

**Important Notes**:
- Tasks should be small enough to complete in 1-4 hours
- Include both development and testing tasks
- Consider parallel execution where possible
- Add clear acceptance criteria for each task
- Include any necessary setup or configuration tasks
