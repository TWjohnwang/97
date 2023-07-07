import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("sales_detail", (table: Knex.TableBuilder) => {
    table.uuid("sales_id").references("id").inTable("sales_records");
    table.uuid("product_id").references("id").inTable("product");
    table.integer("quantity").notNullable().checkPositive();
    table.decimal("total_revenue", 13, 6).notNullable().checkPositive();
    table.primary(["sales_id", "product_id"]);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable("sales_detail");
}
