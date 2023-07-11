import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("sales_records", (table: Knex.TableBuilder) => {
    table.uuid("id").primary();
    table.integer("total_revenue").notNullable().checkPositive();
    table.timestamp("date_sold").notNullable().defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable("sales_records");
}
