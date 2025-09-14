# StreamPoints Channel Points System

## Overview

StreamPoints is a comprehensive channel points management system designed for livestream communities. The application allows viewers to earn and redeem points for various rewards, while providing streamers and administrators with powerful tools to manage their channel point economy. Built with a modular reward action system, it supports different types of rewards including chat messages, sound effects, screen effects, and custom actions.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite for development tooling
- **UI Components**: Radix UI primitives with shadcn/ui component library for consistent design
- **Styling**: Tailwind CSS with custom theme configuration supporting dark/light modes
- **State Management**: TanStack Query for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Authentication**: Firebase Authentication with Google OAuth integration

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Session Management**: Express sessions with PostgreSQL session store
- **API Design**: RESTful API with middleware for authentication and error handling
- **Database Schema**: Comprehensive schema covering users, rewards, redemptions, transactions, and categories

### Reward Action System
- **Modular Design**: Plugin-based action handler system supporting multiple reward types
- **Built-in Actions**: Chat messages, sound effects, screen effects, music control, and custom actions
- **Configuration**: JSON-based action configuration with validation
- **Extensibility**: Easy addition of new reward types through the action handler interface

### Authentication & Authorization
- **Firebase Integration**: Google OAuth for user authentication
- **JWT Tokens**: Firebase ID tokens for secure API requests
- **Role-based Access**: Admin and premium user tiers with different permissions
- **Session Management**: Server-side session storage with database persistence

### Data Storage Solutions
- **Primary Database**: PostgreSQL via Neon serverless for scalability
- **ORM**: Drizzle ORM with TypeScript integration for type safety
- **Migrations**: Database schema versioning with Drizzle Kit
- **Connection Management**: Connection pooling for optimal performance

### Design System
- **Theme Architecture**: CSS custom properties with dark/light mode support
- **Color Palette**: Gaming-inspired purple/gray gradients with accent colors
- **Typography**: Inter font family with tabular numbers for point displays
- **Component Library**: Consistent spacing, elevation, and interaction patterns

## External Dependencies

### Core Infrastructure
- **Neon Database**: Serverless PostgreSQL hosting for scalable data storage
- **Firebase**: Authentication service providing Google OAuth integration
- **Replit**: Development and deployment platform with integrated tooling

### Frontend Libraries
- **React Ecosystem**: React 18, React DOM, TanStack Query for reactive data management
- **UI Framework**: Radix UI for accessible component primitives, Tailwind CSS for styling
- **Development Tools**: Vite build system, TypeScript for type safety, Wouter for routing

### Backend Dependencies
- **Express Framework**: Web server with middleware for sessions and authentication
- **Database Tools**: Drizzle ORM, connection pooling with node-postgres adapter
- **Validation**: Zod schema validation integrated with Drizzle for type safety
- **Session Storage**: PostgreSQL-backed session management with connect-pg-simple

### Development & Build Tools
- **Build System**: Vite for frontend bundling, esbuild for server compilation
- **Type Safety**: TypeScript across frontend and backend with shared schema types
- **Code Quality**: ESLint configuration, Prettier for formatting
- **Asset Management**: Public asset serving with fallback handling for images