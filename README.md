# School Equipment Management & Lending (SEML) Portal - AI Enhanced

A full-stack web application for managing school equipment loans, built with React and Node.js. This system digitizes the manual process of tracking equipment lending, approvals, and returns, eliminating scheduling conflicts and missing records.

## AI-Specific Enhancements

This AI-enhanced version includes improvements that are **not present in the non-AI version** (`fsd-assg` folder).

### Backend Security Enhancement

#### Helmet.js Security Headers (`assg_backend/package.json` & `assg_backend/src/server.js`)
The AI version adds **Helmet.js** (`helmet: ^7.1.0`) for enhanced security headers:

- **Content Security Policy (CSP)**: Configured with directives for:
  - `defaultSrc`: Restricts to same-origin
  - `styleSrc`: Allows same-origin and inline styles
  - `scriptSrc`: Restricts to same-origin
  - `imgSrc`: Allows same-origin, data URIs, and HTTPS sources
- **Cross-Origin Embedder Policy**: Set to false for compatibility
- Automatically sets various HTTP headers to help secure the application against common vulnerabilities

**Implementation**: The helmet middleware is configured in `src/server.js` with custom CSP policies to balance security and functionality.

**Note**: The non-AI version (`fsd-assg`) does **not** include Helmet.js and relies on basic CORS and rate limiting for security.

#### Swagger/OpenAPI Documentation (`assg_backend/package.json` & `assg_backend/src/server.js`)
The AI version adds **Swagger/OpenAPI** documentation for comprehensive API documentation:

- **swagger-jsdoc** (`^6.2.8`): Generates OpenAPI specifications from JSDoc comments
- **swagger-ui-express** (`^5.0.1`): Provides interactive API documentation UI

**Features**:
- Interactive API documentation available at `/api-docs` endpoint
- Auto-generated from JSDoc comments in route files
- Includes all API endpoints with detailed descriptions
- Request/response schemas
- Authentication requirements
- Query parameters and filters
- Example requests and responses
- Custom styling (topbar hidden for cleaner UI)

**Implementation**: 
- Swagger configuration is set up in `src/config/swagger.js`
- All routes are documented with JSDoc `@swagger` annotations in:
  - `src/routes/userRoutes.js`
  - `src/routes/equipRoutes.js`
  - `src/routes/staffRoutes.js`
- Swagger UI middleware is configured in `src/server.js`

**Note**: The non-AI version (`fsd-assg`) does **not** include Swagger documentation. API endpoints are documented manually in the README only.

### Frontend Enhancements

See `assg-frontend/README.md` for details on:
- Icon improvements in tables and navigation
- Enhanced UI components

