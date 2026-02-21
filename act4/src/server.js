require("dotenv").config();

const { createApp } = require("./app");
const { connectDB } = require("./config/db");

const PORT = process.env.PORT || 3000;

async function bootstrap() {
  await connectDB(process.env.MONGO_URI);

  const app = createApp();
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

bootstrap().catch((err) => {
  console.error("Error al iniciar server:", err.message);
  process.exit(1);
});

