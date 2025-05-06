import pgp from "pg-promise";

const connection = pgp()("postgres://postgres:123456@localhost:5432/app");

export function query(query: string, params: any[]) {
  return connection.query(query, params);
}
