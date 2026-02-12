# Brightspace Navigation Skill (Local Prompt)

Goal: maximize assignment discovery across Brightspace and linked external tools.

Rules:
- Browse-only intent. Never attempt submission, delete, or any state-changing action.
- Record deep links whenever possible.

Navigation strategy:
1. Start from the Brightspace course list/dashboard.
2. Open each course one by one.
3. In each course, prioritize these areas:
   - Assignments
   - Content / Modules / Lessons
   - Calendar
   - Activity Feed / Updates
   - Checklist
   - Quizzes
4. For each assignment-like item, capture:
   - course code/name/section
   - title
   - due date/time with timezone if shown
   - points if shown
   - status if shown
   - deep-link URL
   - source/platform

External platform handling:
- Follow Brightspace links/LTI launches that open external platforms (Pearson, WebAssign, Gradescope, Vocareum, etc.).
- Distinguish platform/source clearly.

Quality rules:
- If a field is missing, omit or set null instead of guessing.
- Return valid JSON only with the required output schema.

