# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Cubetive is a web-based Rubik's Cube speedcubing timer and analytics platform. It provides WCA (World Cube Association) standard timing controls, statistics tracking, and public profile sharing.

## Commands

```bash
npm run dev      # Start dev server at http://localhost:5173
npm run build    # TypeScript check + production build (outputs to /dist)
npm run lint     # Run ESLint
npm run preview  # Preview production build locally
```

## Tech Stack

- **Frontend**: React 19 with React Compiler, TypeScript 5.9 (strict mode), Vite (rolldown-based)
- **Backend**: Supabase (PostgreSQL v17, Auth, RLS policies, auto-generated REST API)
- **Hosting**: Vercel (frontend), Supabase (backend)

## Architecture

### Frontend Structure
- `/src` - React application source (currently early MVP stage)
- `/supabase/migrations` - Database migrations with RLS policies

### Backend (Supabase)
Direct frontend-to-database communication using Supabase client. No custom API layer - RLS policies handle authorization at the database level.

**Core Tables:**
- `profiles` - User profiles extending auth.users (username, visibility, denormalized stats like pb_single, pb_ao5, pb_ao12)
- `solves` - Individual solve records (time_ms, scramble, penalty_type)

All tables use soft deletes (`deleted_at` column) and have RLS enabled.

### Key Patterns
- Timer logic, scramble generation, and statistics calculations (Ao5, Ao12, Ao100) are handled client-side
- React hooks for local state, Supabase as server-side source of truth
- Database triggers auto-create profiles on signup and maintain `updated_at` timestamps

## Environment Variables

Create `.env.local`:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Documentation

- `/.ai/prd.md` - Full product requirements document
- `/.ai/DATABASE_SCHEMA.md` - Database design documentation
- `/.ai/tech-stack-decision.md` - Tech stack rationale
- `/supabase/migrations/001_initial_schema.sql` - Database schema with RLS policies
