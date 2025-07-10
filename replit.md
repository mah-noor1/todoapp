# Task Management Application

## Overview

This is a full-stack task management application built with React, Express, and PostgreSQL. The application provides a modern interface for managing tasks with features like Kanban boards, priority filtering, due date notifications, and recurring tasks. It uses a clean architecture with shared TypeScript schemas and a component-based frontend design.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Full-Stack Architecture
The application follows a monorepo structure with clear separation between client, server, and shared code:

- **Frontend**: React with TypeScript, using Vite for development and building
- **Backend**: Express.js server with TypeScript
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Shared**: Common TypeScript schemas and types used by both client and server

### Build and Development Strategy
- Uses Vite for fast development with hot module replacement
- ESBuild for production server bundling
- TypeScript for type safety across the entire stack
- Development and production environments handled through NODE_ENV

## Key Components

### Frontend Architecture
- **React Router**: Uses Wouter for lightweight client-side routing
- **State Management**: TanStack Query for server state management
- **UI Framework**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS custom properties for theming
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Express Server**: RESTful API with middleware for logging and error handling
- **Database Layer**: Drizzle ORM with PostgreSQL dialect
- **Storage Interface**: Abstracted storage interface with in-memory implementation for development
- **API Routes**: Organized CRUD operations for tasks and users

### Database Schema
- **Users Table**: Basic user authentication with username/password
- **Tasks Table**: Comprehensive task management with:
  - Basic properties (title, description, category)
  - Priority levels (high, medium, low)
  - Status tracking (todo, in-progress, review, done)
  - Due dates and recurring patterns
  - Completion tracking and timestamps

## Data Flow

### Client-Server Communication
1. Frontend makes API requests using a custom `apiRequest` utility
2. TanStack Query handles caching, loading states, and error management
3. Server processes requests through Express middleware chain
4. Database operations performed through Drizzle ORM
5. Responses return JSON data matching shared TypeScript schemas

### State Management Pattern
- Server state managed by TanStack Query with automatic caching
- Local component state for UI interactions
- Form state handled by React Hook Form
- Global UI state (toasts, dialogs) through React context

### Real-time Features
- Browser notifications for due/overdue tasks
- Automatic task status updates with optimistic UI updates
- Client-side filtering and search with server-side data fetching

## External Dependencies

### Core Framework Dependencies
- **React 18**: Modern React with hooks and concurrent features
- **Express**: Lightweight Node.js server framework
- **Drizzle ORM**: Type-safe database operations
- **Vite**: Fast development build tool

### UI and Styling
- **Radix UI**: Headless UI components for accessibility
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Modern icon library

### Database and Infrastructure
- **@neondatabase/serverless**: Serverless PostgreSQL driver
- **PostgreSQL**: Production database
- **connect-pg-simple**: PostgreSQL session store

### Development Tools
- **TypeScript**: Type safety across the stack
- **ESBuild**: Fast JavaScript bundler for production
- **Drizzle Kit**: Database migration and introspection tools

## Deployment Strategy

### Development Environment
- Vite dev server for frontend with HMR
- Express server with file watching via tsx
- In-memory storage for rapid development iteration
- Replit-specific development tooling integration

### Production Build
1. Frontend built with Vite to static assets
2. Server bundled with ESBuild to single JavaScript file
3. Static assets served by Express in production
4. Database migrations run via Drizzle Kit

### Database Strategy
- Development uses configurable storage interface (memory or PostgreSQL)
- Production requires DATABASE_URL environment variable
- Schema migrations managed through Drizzle Kit
- Type-safe database operations through generated schemas

### Environment Configuration
- NODE_ENV determines development vs production behavior
- DATABASE_URL required for PostgreSQL connection
- Vite handles client-side environment variables
- Server configuration through environment variables

The application is designed for easy deployment on platforms like Replit, with automatic detection of development vs production environments and graceful fallbacks for missing configuration.