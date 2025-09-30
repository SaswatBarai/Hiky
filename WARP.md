# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

Hiky is a real-time chat application built with a modern full-stack architecture. The project consists of two main parts:
- **Frontend**: React + Vite application with real-time WebSocket communication
- **Backend**: Node.js Express server with MongoDB, Redis, and WebSocket support

## Common Development Commands

### Frontend (React + Vite)
```bash
cd frontend
pnpm install           # Install dependencies
pnpm dev              # Start development server (usually port 5173)
pnpm build            # Build for production
pnpm preview          # Preview production build locally
pnpm lint             # Run ESLint
```

### Backend (Node.js + Express)
```bash
cd backend
pnpm install           # Install dependencies  
pnpm dev              # Start development server with nodemon (port 8000)
pnpm start            # Start production server
```

### Full Application Development
To run the complete application locally:
1. Start backend: `cd backend && pnpm dev`
2. Start frontend: `cd frontend && pnpm dev`
3. Ensure MongoDB and Redis are running locally or provide remote connection strings

## Architecture Overview

### Frontend Architecture
- **Framework**: React 19 with Vite for build tooling
- **State Management**: Redux Toolkit for global state, React Query for server state
- **UI Components**: Custom component library built on Radix UI primitives with Tailwind CSS
- **Routing**: React Router v7 with nested routes and route protection
- **Real-time Communication**: Custom WebSocket hook (`useWebSocket`) for chat functionality
- **Authentication**: JWT-based with refresh tokens stored in HTTP-only cookies

### Backend Architecture  
- **Framework**: Express.js with ES modules
- **Database**: MongoDB with Mongoose ODM for data modeling
- **Caching/Session Store**: Redis for WebSocket state management and caching
- **Authentication**: JWT access/refresh token system with bcrypt password hashing
- **File Upload**: Cloudinary integration for profile images and media
- **Email Service**: Nodemailer for email verification and password reset
- **Rate Limiting**: Express rate limiting middleware

### Real-time Communication System
The WebSocket implementation uses a hybrid architecture:
- **WebSocket Server**: Built on native `ws` library attached to HTTP server
- **State Management**: Redis stores online users, room participants, typing indicators, and offline message queues  
- **Message Flow**: Messages are broadcast to room participants via WebSocket, with offline message queuing for disconnected users
- **Connection Management**: Automatic reconnection with exponential backoff in frontend

### Data Models
- **User**: Authentication, profile data, friend relationships
- **Room**: Chat rooms (private/group) with participant management
- **Message**: Chat messages with delivery status, read receipts, reactions, and soft delete
- **UserActivity**: Activity tracking and analytics

## Key Integration Points

### Environment Variables
Frontend requires `VITE_API_URL` and optionally `VITE_WS_URL` for WebSocket connections.
Backend requires multiple environment variables including database URLs, JWT secrets, and external service credentials.

### API Structure
- REST API follows `/api/v1/` prefix pattern
- WebSocket endpoint at `/ws` path
- Authentication middleware protects routes requiring login
- Validation middleware uses Zod schemas

### Component Architecture
- **Layouts**: Separate layouts for public pages (`Layout`) and authenticated chat (`ChatLayout`)  
- **Route Protection**: `<Guest>` and `<Protect>` wrapper components handle authentication routing
- **UI Components**: Reusable components in `src/components/ui/` following shadcn/ui patterns
- **Custom Hooks**: Specialized hooks for data fetching (`usegetData`), WebSocket (`useWebSocket`), and notifications
- **Animations**: Minimal Framer Motion animations in Landing and Unauthorized pages for enhanced UX

### Deployment Configuration
- **Frontend**: Configured for Vercel deployment with `vercel.json`
- **Backend**: Configured for Render deployment with `render.yaml` 
- **Database**: MongoDB Atlas and Redis Cloud for production
- **File Storage**: Cloudinary for media uploads

## Development Notes

### Frontend Development
- Uses Vite's HMR for fast development
- Tailwind CSS with custom design system
- Component development follows composition patterns with Radix UI
- React Router handles both public and authenticated routes with proper guards

### Backend Development  
- ES modules throughout the codebase
- Mongoose models include advanced features like soft delete, read receipts, and message reactions
- WebSocket service is decoupled from HTTP routes for scalability
- Redis services are modularized for different data types (online users, rooms, messages)

### Testing
No test framework is currently configured. Consider adding Jest or Vitest for unit testing and Cypress or Playwright for E2E testing.

### WebSocket Message Types
The WebSocket implementation handles these message types:
- `register`: User connection registration
- `joinRoom`/`leaveRoom`: Room participation management
- `message`: Chat message sending
- `typing`: Typing indicator management  
- `getOnlineStatus`: Friend online status requests
- `markAsRead`: Message read receipt handling

### Security Considerations
- Helmet.js for security headers (CSP disabled for WebSocket)
- CORS configured for specific frontend origins
- Rate limiting on all routes
- JWT tokens with short expiration and refresh mechanism
- Password validation with complexity requirements

## Package Management
Uses `pnpm` for both frontend and backend dependencies. Lock files are committed to ensure consistent installs across environments.