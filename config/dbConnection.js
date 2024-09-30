const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const connect = await mongoose.connect(
      "mongodb+srv://ubaidullahmomer:TMUlFP0xwtahxB37@ubaidullahcluster.hdqsh.mongodb.net/serenity-mart?retryWrites=true&w=majority&appName=ubaidullahcluster"
    );
    console.log(
      `MongoDB connected: ${connect.connection.host}; Database: ${connect.connection.name}`
    );
  } catch (err) {
    console.error(`Error: ${err.message}`);
    console.error(err.stack);
    process.exit(1);
  }
};

module.exports = connectDB;
