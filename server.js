const express = require("express");
const connectDB = require("./config/dbConnection");
const errorHandler = require("./middleware/errorHandler");
const dotenv = require("dotenv").config();
const cors = require("cors");

connectDB();

const app = express();

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', "https://serenity-mart-backend.vercel.app/", "https://www.serenitymartpk.com/", process.env.CLIENT_URL],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));

const port = process.env.PORT || 5001;

app.use(express.json());
app.get("/", (req, res) => {
  res.send("Serenity Mart Backend API");
});

app.use("/api/couponCode", require("./routes/couponCodeRoutes"));
app.use("/api/categories", require("./routes/categoriesRoutes"));
app.use("/api/products", require("./routes/productsRoutes"));
app.use("/api/order", require("./routes/orderRoutes"));
app.use("/api/stripe", require("./routes/stripeRoutes"));

app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

module.exports = app