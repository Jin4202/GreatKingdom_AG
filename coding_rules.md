# Great Kingdom - Coding Rules

For the development of Great Kingdom, all features and components must strictly follow this 5-step workflow:

## 1. Planning
*   Plan what to develop and how to develop the feature.
*   Identify the requirements and constraints based on `game_rules.md`.
*   Decide on the architecture, data structures, and algorithms to use.

## 2. Slicing
*   Divide the planned feature into small, manageable tasks.
*   Document these small tasks (e.g., in `task.md` or as inline comments) to track progress accurately.

## 3. Creating Tests
*   Before full implementation, establish the testing boundaries.
*   Write unit tests or integration tests for the sliced components.
*   Identify edge cases (e.g., board edges, Neutral Castle interactions, sudden death triggers).

## 4. Implementation
*   Write the actual code following the plan and to pass the defined tests.
*   Keep the logic clean and adhere to the architectural decisions.
*   Continuously refactor for readability and performance.

## 5. Test
*   Run the created automated tests.
*   Perform manual verification and edge-case testing (e.g., through the browser).
*   Ensure that no regressions have been introduced and the feature is fully functional.
