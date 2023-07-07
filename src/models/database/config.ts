import knex from "knex";
import config from "./knexfile";
import * as path from "path";
import * as dotenv from "dotenv";

dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

const environment = process.env.NODE_ENV || "development";
const connection = knex(config[environment]);

export default connection;
