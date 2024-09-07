const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const connect = await mongoose.connect(process.env.CONNECTION_STRING, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(
      `MongoDB connected: ${connect.connection.host}; Database: ${connect.connection.name}`
    );
  } catch (err) {
    console.error(`Error: ${err.message}`);
    // To log stack trace for further debugging
    console.error(err.stack);
    process.exit(1);
  }
};

module.exports = connectDB;
