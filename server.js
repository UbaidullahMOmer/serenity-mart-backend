const express = require("express");
const connectDB = require("./config/dbConnection");
const errorHandler = require("./middleware/errorHandler");
const dotenv = require("dotenv").config();
const cors = require("cors");
const path = require("path");

connectDB();

const app = express();

const corsOptions = {
  origin: '*',
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.use('/images', express.static(path.join(__dirname, 'public/images')));
const port = process.env.PORT || 5001;

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Serenity Mart Backend API");
});

app.use("/api/couponCode", require("./routes/couponCodeRoutes"));
app.use("/api/categories", require("./routes/categoriesRoutes"));
app.use("/api/products", require("./routes/productsRoutes"));
app.use("/api/deals", require("./routes/dealsRoutes"));
app.use("/api/order", require("./routes/orderRoutes"));
app.use("/api/stripe", require("./routes/stripeRoutes"));

app.use(errorHandler);
console.log(path.join(__dirname, 'public/images'));
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

module.exports = app;