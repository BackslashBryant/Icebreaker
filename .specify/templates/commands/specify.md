---
description: Create a new feature specification from user requirements, establishing a new feature branch and spec document.
---

The user input to you can be provided directly by the agent or as a command argument - you **MUST** consider it before proceeding with the prompt (if not empty).

User input:

$ARGUMENTS

You are creating a new feature specification. Your job is to:

1. **Create a new feature branch** using the naming convention `001-feature-name` (where 001 is the next sequential number)
2. **Create a new specification document** in `specs/001-feature-name/spec.md`
3. **Populate the specification** with user stories, functional requirements, and acceptance criteria

Follow this execution flow:

1. **Determine the next feature number**:
   - Check existing `specs/` directory for numbered features
   - Use the next sequential number (001, 002, 003, etc.)

2. **Create feature branch**:
   - Branch name format: `{NUMBER}-{FEATURE_NAME}`
   - Feature name should be kebab-case, descriptive but concise
   - Switch to the new branch

3. **Create feature directory structure**:
   - Create `specs/{BRANCH_NAME}/` directory
   - Copy `spec-template.md` to `specs/{BRANCH_NAME}/spec.md`

4. **Populate the specification**:
   - Extract user stories from the user input
   - Identify functional requirements
   - Define acceptance criteria
   - Add non-functional requirements (performance, security, usability)
   - Include dependencies and risks

5. **Validate the specification**:
   - Ensure all user stories are clear and actionable
   - Verify functional requirements are testable
   - Check that acceptance criteria are measurable

6. **Output summary**:
   - Feature branch name
   - Specification file location
   - Key user stories identified
   - Next steps (clarify, plan, etc.)

**Important Notes**:
- Focus on **what** and **why**, not **how** (technical implementation comes later)
- Be explicit about user needs and business value
- Include edge cases and error scenarios
- Make requirements testable and measurable
