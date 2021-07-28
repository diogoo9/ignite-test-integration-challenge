import { Connection, createConnection, getConnectionOptions } from "typeorm";

export default async function createMyConnection(host = "database") {
  const connectionOptions = await getConnectionOptions();

  return createConnection(
    Object.assign(connectionOptions, {
      host: process.env.NODE_ENV === "test" ? "localhost" : host,
      database:
        process.env.NODE_ENV === "test"
          ? "fin_api_test"
          : connectionOptions.database,
    })
  );
}
