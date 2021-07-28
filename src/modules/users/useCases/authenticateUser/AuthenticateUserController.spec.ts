import request from "supertest";
import { Connection } from "typeorm";
import createMyConnection from "../../../../database";
import { app } from "./../../../../app";

let connection: Connection;
describe("Authentication", () => {
  beforeAll(async () => {
    connection = await createMyConnection("localhost");

    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be authenticate user ", async () => {
    await request(app).post("/api/v1/users").send({
      name: "diogo",
      email: "admin@rentx.com.br",
      password: "12345",
    });

    const response = await request(app).post("/api/v1/sessions").send({
      email: "admin@rentx.com.br",
      password: "12345",
    });

    expect(response.body).toHaveProperty("token");
  });

  it("should not be authenticate user when incorrect password", async () => {
    await request(app).post("/api/v1/users").send({
      name: "diogo",
      email: "admin@rentx.com.br",
      password: "12345",
    });

    const response = await request(app).post("/api/v1/sessions").send({
      email: "admin@rentx.com.br",
      password: "incorrect",
    });

    expect(response.statusCode).toEqual(401);
  });
});
