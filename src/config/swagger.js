import swaggerJsdoc from 'swagger-jsdoc'
import swaggerUiExpress from 'swagger-ui-express'
import 'dotenv/config'

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'E-commerce Backend API',
      version: '1.0.0',
      description:
        'API do zarządzania produktami, kategoriami, zamówieniami i opiniami w systemie e-commerce',
      contact: {
        name: 'API Support',
      },
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3000}`,
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Wprowadź token JWT uzyskany z endpointu /login',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Komunikat błędu',
            },
          },
        },
        LoginRequest: {
          type: 'object',
          required: ['username', 'password'],
          properties: {
            username: {
              type: 'string',
              description: 'Nazwa użytkownika',
              example: 'admin',
            },
            password: {
              type: 'string',
              format: 'password',
              description: 'Hasło użytkownika',
              example: 'admin',
            },
          },
        },
        LoginResponse: {
          type: 'object',
          properties: {
            accessToken: {
              type: 'string',
              description: 'Token dostępu JWT',
            },
            refreshToken: {
              type: 'string',
              description: 'Token odświeżania JWT',
            },
            user: {
              type: 'object',
              properties: {
                id: { type: 'integer' },
                username: { type: 'string' },
                email: { type: 'string' },
                role: { type: 'string', enum: ['ADMIN', 'USER', 'KLIENT'] },
              },
            },
          },
        },
        RefreshRequest: {
          type: 'object',
          required: ['refreshToken'],
          properties: {
            refreshToken: {
              type: 'string',
              description: 'Token odświeżania',
            },
          },
        },
        RefreshResponse: {
          type: 'object',
          properties: {
            accessToken: {
              type: 'string',
              description: 'Nowy token dostępu JWT',
            },
            refreshToken: {
              type: 'string',
              description: 'Nowy token odświeżania JWT',
            },
          },
        },
        Product: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
            description: { type: 'string' },
            price: { type: 'number', format: 'decimal' },
            weight: { type: 'number', format: 'decimal' },
            category_id: { type: 'integer' },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' },
            category: {
              type: 'object',
              properties: {
                id: { type: 'integer' },
                name: { type: 'string' },
              },
            },
          },
        },
        ProductCreate: {
          type: 'object',
          required: ['name', 'description', 'price', 'weight', 'category_id'],
          properties: {
            name: {
              type: 'string',
              description: 'Nazwa produktu',
              example: 'Laptop',
            },
            description: {
              type: 'string',
              description: 'Opis produktu',
              example: 'Wydajny laptop do pracy',
            },
            price: {
              type: 'number',
              format: 'decimal',
              minimum: 0,
              description: 'Cena produktu',
              example: 2999.99,
            },
            weight: {
              type: 'number',
              format: 'decimal',
              minimum: 0,
              description: 'Waga produktu',
              example: 1.5,
            },
            category_id: {
              type: 'integer',
              minimum: 1,
              description: 'ID kategorii',
              example: 1,
            },
          },
        },
        ProductUpdate: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            description: { type: 'string' },
            price: { type: 'number', format: 'decimal', minimum: 0 },
            weight: { type: 'number', format: 'decimal', minimum: 0 },
            category_id: { type: 'integer', minimum: 1 },
          },
        },
        Category: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
          },
        },
        Status: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
          },
        },
        OrderItem: {
          type: 'object',
          required: ['product_id', 'quantity', 'unit_price'],
          properties: {
            product_id: {
              type: 'integer',
              description: 'ID produktu',
              example: 1,
            },
            quantity: {
              type: 'integer',
              minimum: 1,
              description: 'Ilość',
              example: 2,
            },
            unit_price: {
              type: 'number',
              format: 'decimal',
              minimum: 0,
              description: 'Cena jednostkowa',
              example: 99.99,
            },
          },
        },
        OrderCreate: {
          type: 'object',
          required: ['items'],
          properties: {
            items: {
              type: 'array',
              minItems: 1,
              items: { $ref: '#/components/schemas/OrderItem' },
            },
          },
        },
        Order: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            user_id: { type: 'integer' },
            status_id: { type: 'integer' },
            approved_at: { type: 'string', format: 'date-time', nullable: true },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' },
            status: { $ref: '#/components/schemas/Status' },
            items: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'integer' },
                  order_id: { type: 'integer' },
                  product_id: { type: 'integer' },
                  quantity: { type: 'integer' },
                  unit_price: { type: 'number' },
                  product: { $ref: '#/components/schemas/Product' },
                },
              },
            },
            opinions: {
              type: 'array',
              items: { $ref: '#/components/schemas/Opinion' },
            },
            user: {
              type: 'object',
              properties: {
                id: { type: 'integer' },
                username: { type: 'string' },
                email: { type: 'string' },
              },
            },
          },
        },
        OrderStatusUpdate: {
          type: 'object',
          required: ['status'],
          properties: {
            status: {
              type: 'string',
              description: 'Nazwa statusu (np. ZATWIERDZONE, ZREALIZOWANE, ANULOWANE)',
              example: 'ZATWIERDZONE',
            },
          },
        },
        Opinion: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            order_id: { type: 'integer' },
            rating: { type: 'integer', minimum: 1, maximum: 5 },
            content: { type: 'string' },
            created_at: { type: 'string', format: 'date-time' },
          },
        },
        OpinionCreate: {
          type: 'object',
          required: ['rating', 'content'],
          properties: {
            rating: {
              type: 'integer',
              minimum: 1,
              maximum: 5,
              description: 'Ocena od 1 do 5',
              example: 5,
            },
            content: {
              type: 'string',
              description: 'Treść opinii',
              example: 'Profesjonalna obsługa',
            },
          },
        },
        SEODescription: {
          type: 'object',
          properties: {
            product_id: { type: 'integer' },
            product_name: { type: 'string' },
            seo_description: { type: 'string' },
          },
        },
        InitResponse: {
          type: 'object',
          properties: {
            message: { type: 'string' },
            count: { type: 'integer' },
          },
        },
      },
    },
    tags: [
      {
        name: 'Autentykacja',
        description: 'Endpointy do logowania i odświeżania tokenów',
      },
      {
        name: 'Produkty',
        description: 'Operacje na produktach',
      },
      {
        name: 'Kategorie',
        description: 'Operacje na kategoriach',
      },
      {
        name: 'Zamówienia',
        description: 'Operacje na zamówieniach',
      },
      {
        name: 'Statusy',
        description: 'Operacje na statusach zamówień',
      },
      {
        name: 'Inicjalizacja',
        description: 'Inicjalizacja produktów',
      },
    ],
  },
  apis: ['./src/routes/*.js'],
}

const swaggerSpec = swaggerJsdoc(options)

export { swaggerSpec, swaggerUiExpress as swaggerUi }
