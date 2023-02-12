// Load environment variables from .env file
require("dotenv").config();

// Set default PORT to 3000, or use value from environment variables
const { PORT = 3000 } = process.env;

// Require express and create an instance of the app
const express = require("express");
const app = express();

// Use CORS middleware
const cors = require('cors');
app.use(cors());

// Use Morgan middleware for logging
const morgan = require("morgan");
app.use(morgan("dev"));

// Parse JSON in request body
app.use(express.json());

// Require API router and mount it at "/api"
const apiRouter = require("./api");
app.use("/api", apiRouter);

// Require and connect to the database client
const client = require("./db/client");
client.connect();

// Export app for use in other parts of the application
module.exports = app;



