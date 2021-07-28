import request from "supertest";
import { Connection } from "typeorm";
import createMyConnection from "../../../../database";
import { app } from "./../../../../app";

let connection: Connection;
describe("Create User", () => {
  beforeAll(async () => {
    connection = await createMyConnection("localhost");

    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be create a new  user ", async () => {
    const response = await request(app).post("/api/v1/users").send({
      name: "diogo",
      email: "admin@rentx.com.br",
      password: "12345",
    });

    expect(response.statusCode).toEqual(201);
  });

  it("should not be create a new user", async () => {
    const response = await request(app).post("/api/v1/users").send({
      name: "diogo",
      email: "admin@rentx.com.br",
      password: "12345",
    });

    expect(response.statusCode).toEqual(400);
  });
});
