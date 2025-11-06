# Equipment Management System

A full-stack web application for managing equipment reservations and staff assignments with role-based access control.

## Architecture

The application follows a client-server architecture with a clear separation between frontend and backend components.

### Backend (`assg_backend/`)

Built with **Express.js** and **MongoDB**, the backend provides a RESTful API with the following structure:

- **Server** (`src/server.js`): Main entry point that configures Express middleware, connects to MongoDB, and initializes routes
- **Routes** (`src/routes/`): API endpoints for authentication, staff management, and equipment management
- **Controllers** (`src/controllers/`): Business logic handlers for each route
- **Models** (`src/models/`): MongoDB schemas using Mongoose
- **Middleware** (`src/middleware/`): Authentication, rate limiting, error handling, and request validation
- **Services** (`src/services/`): Reusable service layer for database operations
- **Config** (`src/config/`): Database connection, logging (Winston), and admin initialization

**Key Features:**
- JWT-based authentication with HTTP-only cookies
- Rate limiting for API protection
- Request logging with Morgan and Winston
- Input validation with express-validator
- Error handling middleware

### Frontend (`assg-frontend/`)

Built with **React** and **Vite**, the frontend provides a responsive user interface:

- **Pages** (`src/pages/`): Route components for different views (Login, Dashboard, Admin, Staff, Student)
- **Components** (`src/components/`): Reusable UI components
- **Layout** (`src/layout/`): Layout wrappers for authenticated and public routes
- **Routes** (`src/routes/`): React Router configuration with lazy loading
- **Services** (`src/services/`): API client functions for backend communication
- **Lib** (`src/lib/`): Utility functions and configurations

**Key Features:**
- Role-based routing (Admin, Staff, Student)
- State management with Zustand
- Form handling with Formik and Yup validation
- UI components with Radix UI
- Styling with Tailwind CSS
- Toast notifications with React Hot Toast

### Data Flow

1. User interacts with React frontend
2. Frontend makes HTTP requests to Express backend via Axios
3. Backend validates requests, checks authentication, and processes business logic
4. Backend queries MongoDB for data operations
5. Backend returns JSON responses
6. Frontend updates UI based on response data

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or remote instance)
- npm or yarn

### Backend Setup

1. Navigate to `assg_backend/`
2. Install dependencies: `npm install`
3. Copy `env.example` to `.env` and configure:
   - `MONGODB_URI`: MongoDB connection string
   - `JWT_SECRET`: Secret key for JWT tokens
   - `PORT`: Server port (default: 8000)
4. Start the server: `npm run dev` (development) or `npm start` (production)

### Frontend Setup

1. Navigate to `assg-frontend/`
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev`
4. The application will be available at `http://localhost:5173`

## User Roles

- **Admin**: Manage staff, equipment, and view all students
- **Staff**: Accept equipment requests and view student lists
- **Student**: Request equipment and view current reservations

## API Endpoints

- `/api/auth/*` - Authentication routes (login, register)
- `/api/staff/*` - Staff management routes
- `/api/equip/*` - Equipment management routes
- `/health` - Health check endpoint

