import request from "supertest";
import { Connection } from "typeorm";
import createMyConnection from "../../../../database";
import { app } from "./../../../../app";

let connection: Connection;
describe("Get Statement Operation", () => {
  beforeAll(async () => {
    connection = await createMyConnection("localhost");

    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able operation", async () => {
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

    const responseDeposit = await request(app)
      .post(`/api/v1/statements/deposit`)
      .set({
        Authorization: `Bearer ${token}`,
      })
      .send({
        amount: 200.0,
        description: "bolsa de estudo",
      });

    const deposit_id = responseDeposit.body.id;

    const response = await request(app)
      .get(`/api/v1/statements/${deposit_id}`)
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.statusCode).toBe(200);
    expect(response.body).toMatchObject({
      amount: "200.00",
      description: "bolsa de estudo",
    });
  });

  it("should not be able operation when operation id is invalid", async () => {
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
      .get(`/api/v1/statements/b567d458-550a-4afe-b412-2513fdee3a19`)
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.statusCode).toBe(404);
  });

  it("should not be able whe token is invalid", async () => {
    const response = await request(app)
      .get(`/api/v1/statements/b567d458-550a-4afe-b412-2513fdee3a19`)
      .set({
        Authorization: `Bearer invalid-token`,
      });

    expect(response.statusCode).toBe(401);
  });
});
