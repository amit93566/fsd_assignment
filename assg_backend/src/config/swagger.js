import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'SEML Portal API',
      version: '1.0.0',
      description: 'API documentation for School Equipment Management & Lending Portal',
      contact: {
        name: 'API Support',
        email: 'support@seml.com',
      },
      license: {
        name: 'ISC',
      },
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 8000}`,
        description: 'Development server',
      },
      {
        url: 'https://api.seml.com',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'token',
          description: 'Authentication token stored in HTTP-only cookie',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              example: 'error',
            },
            message: {
              type: 'string',
              example: 'Error message',
            },
          },
        },
        Success: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              example: 'success',
            },
            message: {
              type: 'string',
              example: 'Success message',
            },
            data: {
              type: 'object',
            },
          },
        },
        User: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              example: '507f1f77bcf86cd799439011',
            },
            name: {
              type: 'string',
              example: 'John Doe',
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'john.doe@example.com',
            },
            role: {
              type: 'string',
              enum: ['ADMIN', 'STAFF', 'STUDENT'],
              example: 'STUDENT',
            },
            sclass: {
              type: 'string',
              example: '10',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Equipment: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              example: '507f1f77bcf86cd799439011',
            },
            name: {
              type: 'string',
              example: 'Microscope',
            },
            category: {
              type: 'string',
              enum: ['Electronics', 'Furniture', 'Sports Equipment', 'Laboratory Equipment'],
              example: 'Laboratory Equipment',
            },
            condition: {
              type: 'string',
              enum: ['Excellent', 'Good', 'Fair', 'Poor'],
              example: 'Good',
            },
            quantity: {
              type: 'number',
              example: 5,
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Reservation: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              example: '507f1f77bcf86cd799439011',
            },
            equipment: {
              $ref: '#/components/schemas/Equipment',
            },
            user: {
              $ref: '#/components/schemas/User',
            },
            quantity: {
              type: 'number',
              example: 2,
            },
            fromDate: {
              type: 'string',
              format: 'date',
              example: '2024-01-15',
            },
            toDate: {
              type: 'string',
              format: 'date',
              example: '2024-01-20',
            },
            status: {
              type: 'string',
              enum: ['PENDING', 'ACTIVE', 'RETURNED', 'REJECTED'],
              example: 'PENDING',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
      },
    },
    tags: [
      {
        name: 'Authentication',
        description: 'User authentication endpoints',
      },
      {
        name: 'Users',
        description: 'User management endpoints',
      },
      {
        name: 'Staff',
        description: 'Staff management endpoints',
      },
      {
        name: 'Equipment',
        description: 'Equipment management endpoints',
      },
      {
        name: 'Reservations',
        description: 'Equipment reservation endpoints',
      },
    ],
  },
  apis: ['./src/routes/*.js'], // Path to the API files
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;

