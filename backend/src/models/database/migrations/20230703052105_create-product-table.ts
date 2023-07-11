import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("product", (table: Knex.TableBuilder) => {
    table.uuid("id").primary();
    table.string("name").notNullable().unique();
    table.decimal("selling_price", 13, 6).notNullable().checkPositive();
    table.integer("quantity_sold").notNullable().checkBetween([0, 1000000]);
    table.integer("inventory").notNullable().checkBetween([0, 1000000]);
    table
      .timestamp("last_modified")
      .notNullable()
      .defaultTo(knex.raw("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"));
    table.text("note");
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable("product");
}
