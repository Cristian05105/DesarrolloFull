const express = require("express");
const cors = require("cors");
const path = require("path");

const authRoutes = require("./routes/auth.routes");
const productRoutes = require("./routes/product.routes");

function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());


  const staticDir = path.join(__dirname, "views");
  console.log("STATIC:", staticDir);
  app.use(express.static(staticDir));


  app.use("/api/auth", authRoutes);
  app.use("/api/products", productRoutes);

  app.get("/health", (req, res) => res.json({ ok: true }));

  return app;
}

module.exports = { createApp };
