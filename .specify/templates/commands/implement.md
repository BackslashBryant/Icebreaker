---
description: Execute all tasks from the task breakdown to build the feature according to the implementation plan.
---

The user input to you can be provided directly by the agent or as a command argument - you **MUST** consider it before proceeding with the prompt (if not empty).

User input:

$ARGUMENTS

You are implementing the current feature by executing all tasks from the task breakdown. Your job is to:

1. **Read the task breakdown** from `specs/{BRANCH_NAME}/tasks.md`
2. **Execute tasks in the correct order** respecting dependencies
3. **Build the feature according to the implementation plan**

Follow this execution flow:

1. **Validate prerequisites**:
   - Ensure `constitution.md` exists and is up to date
   - Verify `spec.md` contains complete requirements
   - Confirm `plan.md` has detailed technical approach
   - Check `tasks.md` has actionable task breakdown

2. **Execute tasks systematically**:
   - Read and parse the task breakdown
   - Execute tasks in dependency order
   - Follow TDD approach where specified
   - Implement each task completely before moving to the next
   - Update task status as completed

3. **Implementation phases**:
   - **Phase 1: Setup and Core Infrastructure** - Initialize project structure, install dependencies
   - **Phase 2: Backend Development** - Implement APIs, business logic, data models
   - **Phase 3: Frontend Development** - Build UI components, user interactions
   - **Phase 4: Integration and Testing** - Connect components, run tests, fix issues
   - **Phase 5: Documentation and Deployment** - Update docs, prepare for deployment

4. **Quality assurance**:
   - Run tests after each major component
   - Validate functionality against requirements
   - Check for errors and fix issues immediately
   - Ensure code follows project standards
   - Verify performance and security requirements

5. **Progress tracking**:
   - Update task completion status
   - Document any issues or deviations
   - Note any additional tasks discovered
   - Track time and effort for each phase

6. **Final validation**:
   - Run complete test suite
   - Verify all acceptance criteria are met
   - Check that feature works end-to-end
   - Validate against original specification
   - Prepare for code review and deployment

**Important Notes**:
- Execute tasks in the exact order specified in the task breakdown
- Complete each task fully before moving to the next
- Follow the TDD approach defined in the task plan
- Handle errors gracefully and provide clear feedback
- Ensure all code is properly tested and documented
- Follow the project constitution and coding standards
