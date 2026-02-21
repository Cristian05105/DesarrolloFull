const request = require("supertest");
const { createApp } = require("../app");
const db = require("./setup");
require("dotenv").config();

let app;

beforeAll(async () => {
  await db.connect();
  app = createApp();
});

afterEach(async () => {
  await db.clear();
});

afterAll(async () => {
  await db.close();
});

describe("Auth Routes", () => {

  test("Debe registrar un usuario", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        email: "test@test.com",
        password: "123456"
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("email");
  });

  test("Debe hacer login y devolver token", async () => {
    await request(app)
      .post("/api/auth/register")
      .send({
        email: "login@test.com",
        password: "123456"
      });

    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: "login@test.com",
        password: "123456"
      });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("token");
  });

});
