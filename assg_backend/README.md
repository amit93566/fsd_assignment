# Backend Application Setup

This is a comprehensive backend application built with Express.js, featuring:

## Features

- **Express.js** - Web framework
- **MongoDB with Mongoose** - Database and ODM
- **Morgan** - HTTP request logging
- **Helmet** - Security headers
- **Axios** - HTTP client for external API calls
- **Winston** - Comprehensive logging system
- **Express Rate Limit** - Rate limiting middleware
- **CORS** - Cross-origin resource sharing
- **Environment Configuration** - Dotenv support
- **Swagger/OpenAPI** - API documentation with Swagger UI

## Installation

1. Install dependencies:
```bash
npm install
```

2. Copy environment configuration:
```bash
cp env.example .env
```

3. Update `.env` file with your configuration:
```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/assg_backend
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
LOG_LEVEL=info
LOG_FILE_PATH=./logs/app.log
```

## Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

## API Documentation

The API documentation is available via Swagger UI when the server is running:

**Development:** `http://localhost:8000/api-docs`

The Swagger documentation includes:
- All API endpoints with detailed descriptions
- Request/response schemas
- Authentication requirements
- Query parameters and filters
- Example requests and responses

### API Endpoints Overview

#### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user information
- `GET /api/auth/dashboard` - Get dashboard data (Admin only)
- `GET /api/auth/studentslist` - Get all students list
- `GET /api/auth/classes` - Get all classes

#### Staff Management
- `POST /api/staff/create` - Create new staff member (Admin only)
- `GET /api/staff/stafflist` - Get all staff list (Admin only)

#### Equipment Management
- `POST /api/equip/create` - Create new equipment (Admin only)
- `GET /api/equip/get` - Get equipment list
- `PUT /api/equip/update/:id` - Update equipment (Admin only)
- `DELETE /api/equip/delete/:id` - Delete equipment (Admin only)

#### Reservations
- `POST /api/equip/request/:id` - Request equipment (Student only)
- `POST /api/equip/accept/:id` - Accept reservation (Staff/Admin only)
- `POST /api/equip/reject/:id` - Reject reservation (Staff/Admin only)
- `GET /api/equip/reservations/my` - Get my reservations
- `GET /api/equip/reservations/all` - Get all reservations (Admin/Staff only)
- `POST /api/equip/return/:reservationId` - Return equipment

#### Health Check
- `GET /health` - Health check endpoint

## Logging

The application uses Winston for comprehensive logging:
- Console logging in development
- File logging in production
- Separate error and combined logs
- Structured JSON logging
- HTTP request logging with Morgan

Logs are stored in the `logs/` directory:
- `error.log` - Error level logs
- `combined.log` - All logs

## Rate Limiting

The application implements multiple rate limiting strategies:
- **General Rate Limiting**: 100 requests per 15 minutes per IP
- **API Rate Limiting**: 200 requests per 15 minutes per IP
- **Auth Rate Limiting**: 5 requests per 15 minutes per IP

## Security Features

- Helmet.js for security headers
- CORS configuration
- Rate limiting
- Input validation
- Error handling
- Request logging

## Database

The application uses MongoDB with Mongoose ODM:
- User model with validation
- Automatic timestamps
- Indexes for performance
- Connection monitoring

## Project Structure

```
src/
├── config/
│   ├── database.js      # MongoDB connection
│   ├── logger.js        # Winston logging configuration
│   └── swagger.js       # Swagger/OpenAPI configuration
├── middleware/
│   ├── errorHandler.js  # Error handling middleware
│   ├── rateLimiter.js   # Rate limiting configuration
│   └── auth.js          # Authentication middleware
├── models/
│   ├── User.js          # User model
│   ├── Equipments.js    # Equipment model
│   └── Reservation.js   # Reservation model
├── routes/
│   ├── userRoutes.js    # User/Auth routes
│   ├── equipRoutes.js   # Equipment routes
│   └── staffRoutes.js   # Staff routes
├── controllers/
│   ├── userController.js
│   ├── equipController.js
│   └── staffController.js
└── server.js            # Main server file
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 3000 |
| NODE_ENV | Environment | development |
| MONGODB_URI | MongoDB connection string | mongodb://localhost:27017/assg_backend |
| RATE_LIMIT_WINDOW_MS | Rate limit window in milliseconds | 900000 |
| RATE_LIMIT_MAX_REQUESTS | Max requests per window | 100 |
| LOG_LEVEL | Logging level | info |
| LOG_FILE_PATH | Log file path | ./logs/app.log |
