# StudyFlow - Student Task Management App

## Overview
A mobile-first student task management app designed to feel stress-relieving and calming. Built with React + TypeScript frontend and Express + PostgreSQL backend.

## Recent Changes
- Feb 8, 2026: Added login/signup/onboarding flow with localStorage auth
- Feb 8, 2026: Enhanced Today View with focus mode, notifications, streak counter, premium upsell
- Feb 8, 2026: Added Settings page as 4th navigation tab
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
- `/all` - All tasks view with filters
- `/settings` - Settings page

## API Endpoints
- GET /api/courses - List all courses
- GET /api/assignments - List all assignments with course data
- GET /api/assignments/:id - Get single assignment
- PATCH /api/assignments/:id - Update assignment
- PATCH /api/assignments/:id/toggle - Toggle completion
- DELETE /api/assignments/:id - Delete assignment

## Database Schema
- `courses`: id, code, name, color
- `assignments`: id, courseId, title, type, platform, dueDate, completed
