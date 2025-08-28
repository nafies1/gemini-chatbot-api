import swaggerJsdoc from 'swagger-jsdoc';

const PORT = process.env.PORT || 3000;

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Gemini Flash API',
      version: '1.0.0',
      description: 'A simple Express API to interact with the Google Gemini API'
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
      }
    ]
  },
  apis: ['./index.js']
};

const specs = swaggerJsdoc(options);

export default specs;