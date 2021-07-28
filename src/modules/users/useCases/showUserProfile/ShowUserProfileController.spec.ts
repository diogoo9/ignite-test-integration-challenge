import request from "supertest";
import { Connection } from "typeorm";
import createMyConnection from "../../../../database";
import { app } from "./../../../../app";

let connection: Connection;
describe("Show Profile", () => {
  beforeAll(async () => {
    connection = await createMyConnection("localhost");

    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be show a profile ", async () => {
    const responseUser = await request(app).post("/api/v1/users").send({
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
      .get(`/api/v1/profile`)
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.statusCode).toBe(200);
    expect(response.body).toMatchObject({
      name: "diogo",
      email: "admin@rentx.com.br",
    });
  });

  it("should not be show a profile when send invalid token", async () => {
    const response = await request(app).get(`/api/v1/profile`).set({
      Authorization: `Bearer xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`,
    });
    expect(response.statusCode).toBe(401);
  });
});
