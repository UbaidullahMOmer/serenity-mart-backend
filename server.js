const express = require("express");
const connectDB = require("./config/dbConnection");
const errorHandler = require("./middleware/errorHandler");
const dotenv = require("dotenv").config();
const cors = require("cors");

connectDB();

const app = express();

// Updated CORS configuration
app.use(cors({
  origin: ['http://localhost:5173', process.env.CLIENT_URL], // Add your Vite dev server URL
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));

const port = process.env.PORT || 5001; // Make sure this matches the port you're using

app.use(express.json());

app.use("/api/order", require("./routes/orderRoutes"));
app.use("/api/stripe", require("./routes/stripeRoutes"));

app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});


module.exports = app; // if 'app' is your Express instance
