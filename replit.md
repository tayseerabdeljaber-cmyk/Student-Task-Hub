# StudyFlow - Student Task Management App

## Overview
A mobile-first student task management app designed to feel stress-relieving and calming. Built with React + TypeScript frontend and Express + PostgreSQL backend.

## Recent Changes
- Feb 8, 2026: Comprehensive dark mode support across all 18+ pages/components (semantic tokens: bg-background, bg-card, text-foreground, etc.)
- Feb 8, 2026: Added ErrorBoundary component wrapping entire app with crash recovery UI
- Feb 8, 2026: Added OfflineBanner component with framer-motion animation for offline detection
- Feb 8, 2026: Added AssignmentWithCourse type to useAssignments hook for proper TypeScript typing
- Feb 8, 2026: Added SyncIndicator component showing sync status in app header
- Feb 8, 2026: Upgraded PremiumModal with trial system, feature list, pricing tiers
- Feb 8, 2026: Enhanced NotificationsDropdown with grouped notifications (Today/Yesterday/This Week/Earlier), mark-all-read, dismiss
- Feb 8, 2026: Added Smart Recommendations card to Today view (start early, exam prep, workload balancing)
- Feb 8, 2026: Added Premium trial banner on Today view for free users
- Feb 8, 2026: Built Analytics/Insights page with Recharts charts (weekly activity, workload, course distribution, completion by type)
- Feb 8, 2026: Enhanced multi-step onboarding flow (welcome, connect platforms, study preferences, goals, summary)
- Feb 8, 2026: Built hooks for localStorage-backed state: use-preferences (sync, notifications, subscription), use-notifications, use-recommendations
- Feb 8, 2026: Added Activities Management system (classes, recurring, events, sleep schedule)
- Feb 8, 2026: Built Calendar/Schedule page with Month/Week/Day/Agenda views
- Feb 8, 2026: Added AI Schedule Generation (algorithmic, no external API)
- Feb 8, 2026: Expanded bottom nav to 6 tabs (Today, Week, Activities, Schedule, All, Settings)
- Feb 8, 2026: Seeded 14 realistic activities (5 classes + 9 recurring/events)
- Feb 8, 2026: Added login/signup/onboarding flow with localStorage auth
- Feb 8, 2026: Enhanced Today View with focus mode, notifications, streak counter, premium upsell
- Feb 8, 2026: Added Settings page with 6 sections (Subscription, Data & Sync, Notifications, Accounts, Streak, Dark Mode)
- Feb 8, 2026: Improved Week View with month navigation, time grouping, jump-to-today
- Feb 8, 2026: Improved All Tasks with search, sort, filter, collapsible sections, task detail modal
- Feb 8, 2026: Added platform field to assignments (Brightspace, Gradescope, etc.)
- Feb 8, 2026: Seeded 24+ realistic Purdue University assignments
- Feb 8, 2026: Set up calming indigo/slate color scheme

## Project Architecture
- Frontend: React + TypeScript + Tailwind + wouter routing + TanStack Query
- Backend: Express + PostgreSQL + Drizzle ORM
- Auth: Replit Auth (OpenID Connect) with passport, sessions stored in PostgreSQL
- State: TanStack Query for server state, useState/localStorage for UI state

## Authentication
- Server: setupAuth() + registerAuthRoutes() in server/routes.ts (before other routes)
- Auth module: server/replit_integrations/auth/ (replitAuth.ts, storage.ts, routes.ts)
- Client hook: client/src/hooks/use-auth.ts (useAuth)
- Auth routes: /api/login, /api/logout, /api/callback, /api/auth/user
- Schema: shared/models/auth.ts (users, sessions tables)
- Landing page shown for logged-out users, authenticated app for logged-in users

## Key Routes
- `/` - Landing page (logged out) or Today View (logged in)
- `/api/login` - Replit Auth login flow
- `/api/logout` - Logout flow
- `/week` - Week calendar view
- `/activities` - Activities management (classes, recurring, events, sleep)
- `/schedule` - Calendar/schedule with AI generation
- `/all` - All tasks view with filters
- `/analytics` - Study Insights page with charts (weekly activity, workload, course distribution)
- `/settings` - Settings page (subscription, sync, notifications, accounts, streak, dark mode)

## Key Hooks (localStorage-backed)
- `use-preferences.ts` - useSyncStatus, useNotificationPreferences, useSubscription, useStudyPreferences
- `use-notifications.ts` - useAppNotifications (grouped, mark-read, dismiss)
- `use-recommendations.ts` - useRecommendations (start early, exam prep, workload balancing)

## Key Components
- `SyncIndicator.tsx` - Floating sync status bar
- `PremiumModal.tsx` - Premium upgrade modal with trial system
- `NotificationsDropdown.tsx` - Grouped notification center with badges

## API Endpoints
- GET /api/courses - List all courses
- GET /api/assignments - List all assignments with course data
- GET /api/assignments/:id - Get single assignment
- PATCH /api/assignments/:id - Update assignment
- PATCH /api/assignments/:id/toggle - Toggle completion
- DELETE /api/assignments/:id - Delete assignment
- GET /api/activities - List all activities
- POST /api/activities - Create activity
- PATCH /api/activities/:id - Update activity
- DELETE /api/activities/:id - Delete activity
- GET /api/schedule-blocks - List all schedule blocks
- POST /api/schedule-blocks - Create schedule block
- POST /api/schedule-blocks/bulk - Bulk create schedule blocks
- PATCH /api/schedule-blocks/:id - Update schedule block
- PATCH /api/schedule-blocks/:id/toggle - Toggle block completion
- DELETE /api/schedule-blocks/generated - Clear all generated blocks (must be registered before /:id route)
- DELETE /api/schedule-blocks/:id - Delete schedule block

## Database Schema
- `courses`: id, code, name, color
- `assignments`: id, courseId, title, type, platform, dueDate, completed
- `activities`: id, name, type, icon, color, frequency, daysOfWeek, startTime, endTime, durationMinutes, flexible, location, priority, bufferBefore, bufferAfter, courseId, eventDate, completed
- `schedule_blocks`: id, activityId, assignmentId, date, startTime, endTime, title, type, icon, color, location, isGenerated, isLocked, isCompleted
