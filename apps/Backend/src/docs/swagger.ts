import swaggerJSDoc from "swagger-jsdoc";

export const swaggerSpec = swaggerJSDoc({
  definition: {
    openapi: "3.0.3",
    info: {
      title: "Vehicle Tracker API",
      version: "1.0.0",
    },
    components: {
      securitySchemes: {
        cookieAuth: { type: "apiKey", in: "cookie", name: "accessToken" },
        bearerAuth: { type: "http", scheme: "bearer" },
      },
    },
    security: [{ cookieAuth: [] }],
  },
  apis: [], // (opsional: tambahkan JSDoc @swagger pada routes untuk detail)
});
