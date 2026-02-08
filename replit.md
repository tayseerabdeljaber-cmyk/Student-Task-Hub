# StudyFlow - Student Task Management App

## Overview
A mobile-first student task management app designed to feel stress-relieving and calming. Built with React + TypeScript frontend and Express + PostgreSQL backend.

## Recent Changes
- Feb 8, 2026: Added Activities Management system (classes, recurring, events, sleep schedule)
- Feb 8, 2026: Built Calendar/Schedule page with Month/Week/Day/Agenda views
- Feb 8, 2026: Added AI Schedule Generation (algorithmic, no external API)
- Feb 8, 2026: Expanded bottom nav to 6 tabs (Today, Week, Activities, Schedule, All, Settings)
- Feb 8, 2026: Seeded 14 realistic activities (5 classes + 9 recurring/events)
- Feb 8, 2026: Added login/signup/onboarding flow with localStorage auth
- Feb 8, 2026: Enhanced Today View with focus mode, notifications, streak counter, premium upsell
- Feb 8, 2026: Added Settings page
- Feb 8, 2026: Improved Week View with month navigation, time grouping, jump-to-today
- Feb 8, 2026: Improved All Tasks with search, sort, filter, collapsible sections, task detail modal
- Feb 8, 2026: Added platform field to assignments (Brightspace, Gradescope, etc.)
- Feb 8, 2026: Seeded 24+ realistic Purdue University assignments
- Feb 8, 2026: Set up calming indigo/slate color scheme

## Project Architecture
- Frontend: React + TypeScript + Tailwind + wouter routing + TanStack Query
- Backend: Express + PostgreSQL + Drizzle ORM
- Auth: localStorage-based (demo/MVP)
- State: TanStack Query for server state, useState/localStorage for UI state

## Key Routes
- `/login` - Login page (default for unauthenticated users)
- `/signup` - Signup page
- `/onboarding` - Brightspace connection onboarding
- `/` - Today View (main page)
- `/week` - Week calendar view
- `/activities` - Activities management (classes, recurring, events, sleep)
- `/schedule` - Calendar/schedule with AI generation
- `/all` - All tasks view with filters
- `/settings` - Settings page

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
