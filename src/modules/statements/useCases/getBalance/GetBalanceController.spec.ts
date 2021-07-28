import request from "supertest";
import { Connection } from "typeorm";
import createMyConnection from "../../../../database";
import { app } from "./../../../../app";

let connection: Connection;
describe("Get Balance", () => {
  beforeAll(async () => {
    connection = await createMyConnection("localhost");

    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able return balance without values and statements", async () => {
    await request(app).post("/api/v1/users").send({
      name: "diogo",
      email: "admin@rentx.com.br",
      password: "12345",
    });

    const responseAuth = await request(app).post("/api/v1/sessions").send({
      email: "admin@rentx.com.br",
      password: "12345",
    });

    const token = responseAuth.body.token;

    const response = await request(app)
      .get(`/api/v1/statements/balance`)
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.body.balance).toBe(0);
    expect(response.body.statement.length).toBe(0);
  });

  it("should be able return balance with statements", async () => {
    await request(app).post("/api/v1/users").send({
      name: "diogo",
      email: "admin@rentx.com.br",
      password: "12345",
    });

    const responseAuth = await request(app).post("/api/v1/sessions").send({
      email: "admin@rentx.com.br",
      password: "12345",
    });

    const token = responseAuth.body.token;

    await request(app)
      .post(`/api/v1/statements/deposit`)
      .set({
        Authorization: `Bearer ${token}`,
      })
      .send({
        amount: 200,
        description: "bolsa de estudo",
      });

    await request(app)
      .post(`/api/v1/statements/withdraw`)
      .set({
        Authorization: `Bearer ${token}`,
      })
      .send({
        amount: 50,
        description: "lanche",
      });

    const response = await request(app)
      .get(`/api/v1/statements/balance`)
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.body.balance).toBe(150);
    expect(response.body.statement.length).toBe(2);
  });

  it("should not be able return balance when token is invalid", async () => {
    const response = await request(app).get(`/api/v1/statements/balance`).set({
      Authorization: `Bearer invalid-token`,
    });

    expect(response.statusCode).toBe(401);
  });
});
