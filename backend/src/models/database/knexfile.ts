import type { Knex } from "knex";
import * as path from "path";
import * as dotenv from "dotenv";

dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

interface KnexConfig {
  [key: string]: Knex.Config;
}

const config: KnexConfig = {
  development: {
    client: "mysql",
    connection: {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DATABASE,
    },
    pool: {
      min: 2,
      max: 10,
    },
    // debug: true,
    migrations: {
      extension: "ts",
    },
  },

  staging: {
    client: "mysql",
    connection: {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DATABASE,
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      extension: "ts",
    },
  },

  production: {
    client: "mysql",
    connection: {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DATABASE,
    },
    pool: {
      min: 10,
      max: 20,
    },
    migrations: {
      extension: "ts",
    },
  },
};

export default config;
