require("dotenv").config();

const request = require("supertest");
const { createApp } = require("../app");
const db = require("./setup");

let app;
let token;

jest.setTimeout(30000); // ✅ aumenta timeout global de este archivo

beforeAll(async () => {
  await db.connect();      // ✅ conectar 1 vez
  app = createApp();
});

afterEach(async () => {
  await db.clear();        // ✅ limpiar después de cada test (1 sola vez)
});

afterAll(async () => {
  await db.close();        // ✅ cerrar
});

async function getToken() {
  // crea usuario y loguea para token
  await request(app).post("/api/auth/register").send({
    email: "prod@test.com",
    password: "123456",
  });

  const login = await request(app).post("/api/auth/login").send({
    email: "prod@test.com",
    password: "123456",
  });

  return login.body.token;
}

describe("Product Routes", () => {
  beforeEach(async () => {
    token = await getToken(); // ✅ token por test
  });

  test("Debe crear producto", async () => {
    const res = await request(app)
      .post("/api/products")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "gomitas", price: 100 });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("name", "gomitas");
  });

  test("Debe listar productos", async () => {
    await request(app)
      .post("/api/products")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "coca", price: 20 });

    const res = await request(app)
      .get("/api/products")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
