const express = require("express");
const connectDB = require("./config/dbConnection");
const errorHandler = require("./middleware/errorHandler");
const dotenv = require("dotenv").config();

connectDB();
const app = express();

const port = process.env.PORT || 5000;
app.use(express.json());
app.use("/api/order", require("./routes/orderRoutes"));
app.use(errorHandler)

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
