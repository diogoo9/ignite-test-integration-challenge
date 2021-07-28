import request from "supertest";
import { Connection } from "typeorm";
import createMyConnection from "../../../../database";
import { app } from "./../../../../app";

let connection: Connection;
describe("Create Statement", () => {
  beforeAll(async () => {
    connection = await createMyConnection("localhost");

    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be deposit value", async () => {
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
      .post(`/api/v1/statements/deposit`)
      .set({
        Authorization: `Bearer ${token}`,
      })
      .send({
        amount: 200,
        description: "bolsa de estudo",
      });

    expect(response.body).toHaveProperty("id");
  });

  it("should be withdraw", async () => {
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
      .post(`/api/v1/statements/withdraw`)
      .set({
        Authorization: `Bearer ${token}`,
      })
      .send({
        amount: 50,
        description: "lanche",
      });

    expect(response.body).toHaveProperty("id");
  });

  it("should not be withdraw when value above the available", async () => {
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
      .post(`/api/v1/statements/withdraw`)
      .set({
        Authorization: `Bearer ${token}`,
      })
      .send({
        amount: 500,
        description: "lanche",
      });

    expect(response.statusCode).toBe(400);
  });

  it("should not be withdraw when token is invalid", async () => {
    const response = await request(app)
      .post(`/api/v1/statements/withdraw`)
      .set({
        Authorization: `Bearer invalid-token`,
      })
      .send({
        amount: 500,
        description: "lanche",
      });

    expect(response.statusCode).toBe(401);
  });

  it("should not be deposit when token is not valid", async () => {
    const response = await request(app)
      .post(`/api/v1/statements/deposit`)
      .set({
        Authorization: `Bearer invalid-token`,
      })
      .send({
        amount: 500,
        description: "lanche",
      });

    expect(response.statusCode).toBe(401);
  });
});
