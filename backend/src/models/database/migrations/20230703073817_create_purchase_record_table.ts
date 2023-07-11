import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable(
    "purchase_records",
    (table: Knex.TableBuilder) => {
      table.uuid("id").primary();
      table.uuid("product_id").references("id").inTable("product");
      table
        .decimal("purchase_price", 13, 6)
        .notNullable()
        .checkBetween([0, 1000000]);
      table
        .integer("quantity_purchased")
        .notNullable()
        .checkBetween([0, 1000000]);
      table.timestamp("date_purchased").notNullable().defaultTo(knex.fn.now());
    }
  );
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable("purchase_records");
}
