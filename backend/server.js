const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");
const connectDB = require("./config/db");

// Configurazione delle variabili d'ambiente
dotenv.config();

// Connessione al database MongoDB
connectDB();

// Inizializzazione dell'app Express
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Importazione delle rotte
const userRoutes = require("./routes/userRoutes");
const heroRoutes = require("./routes/heroRoutes");
const tradeRoutes = require("./routes/tradeRoutes");
const packageRoutes = require("./routes/packageRoutes");

// Utilizzo delle rotte
app.use("/api/users", userRoutes);
app.use("/api/heroes", heroRoutes);
app.use("/api/trades", tradeRoutes);
app.use("/api/packages", packageRoutes);

// Configurazione Swagger
const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "AFSE API",
      version: "1.0.0",
    },
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        BearerAuth: [],
      },
    ],
  },
  apis: [
    "./routes/userRoutes.js",
    "./routes/heroRoutes.js",
    "./routes/tradeRoutes.js",
    "./routes/packageRoutes.js",
  ],
};

const specs = swaggerJsdoc(options);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));


// Configurazione della porta del server
const PORT = process.env.PORT || 5000;

// Avvio del server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
