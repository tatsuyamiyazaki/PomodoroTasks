# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Development Commands

### Development Server
- `npm run dev` - Start Vite development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Environment Setup
- Requires Node.js
- Install dependencies: `npm install`
- Set `GEMINI_API_KEY` in `.env.local` for AI features

## Project Architecture

### Core Application Structure
This is a React-based Pomodoro task management application built with Vite and TypeScript. The app uses a component-based architecture with a single-page application design.

**Main Application State (App.tsx:83-187):**
- Tasks and projects stored in React state with localStorage persistence
- Pomodoro timer state management with session tracking
- Theme and sidebar settings with localStorage persistence
- Multiple modal states for task/project editing and settings

**Key Data Models (types.ts):**
- `Task`: Core entity with priority, due dates, recurrence patterns, and time estimates
- `Project`: Simple grouping entity with name and color
- `PomodoroSession`: Completed focus session tracking
- `View`: Type-safe view system with different filtered views (Today, Overdue, Calendar, etc.)

**Component Architecture:**
- `App.tsx`: Main orchestrator handling all state and business logic
- `Sidebar`: Navigation and view switching
- `MainContent`: Task display and management for list views
- `CalendarView`: Calendar-based task visualization
- `ReportsView`: Analytics and pomodoro session history
- Modal components for editing (TaskEditModal, ProjectEditModal, SettingsModal, PomodoroFocusModal)

### Key Features
**Recurring Tasks (App.tsx:16-80):** Complex recurrence calculation logic supporting daily, weekly, monthly, and yearly patterns with custom intervals and specific days.

**Pomodoro Integration:** Timer state managed in App.tsx with automatic session tracking. Tasks have estimated minutes that integrate with pomodoro durations.

**View System (types.ts:49-72):** Type-safe view definitions supporting filtered task lists (Today, Overdue, Projects) and special views (Calendar, Reports).

**Data Persistence:** All user data persists to localStorage including tasks, projects, settings, theme, and pomodoro history.

### File Structure
- Root contains main app files (App.tsx, types.ts, constants.ts)
- `/components/` contains all React components
- Vite configuration includes path alias `@/` pointing to root
- Environment variables loaded via Vite with `process.env.GEMINI_API_KEY`

### Development Notes
- Uses Lucide React for icons
- Dark mode support via Tailwind CSS classes
- No external state management library - uses React built-in state
- TypeScript strict mode enabled
- All dates handled as JavaScript Date objects with careful timezone handling