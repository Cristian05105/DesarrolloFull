// src/config/db.js
const mongoose = require("mongoose");

async function connectDB(uri) {
  if (!uri) {
    throw new Error("MONGO_URI no está definida en .env");
  }

  mongoose.set("strictQuery", true);
  await mongoose.connect(uri);
  console.log("BD conectada");
}

module.exports = { connectDB };
