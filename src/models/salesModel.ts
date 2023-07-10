import db from "./database/config";
import _ from "lodash";
import { SalesData, ProductSalesData } from "../utils/interface";
import { v4 as uuidv4 } from "uuid";

class SalesClass {
  constructor(private requestBody: SalesData[]) {
    this.requestBody = requestBody;
  }

  public static async fetchAllSales(page: number) {
    try {
      const data = await db("sales_detail")
        .select("sales_records.id", "name", "selling_price", "quantity_sold")
        .join("product", "sales_detail.product_id", "product.id")
        .join("sales_records", "sales_detail.sales_id", "sales_records.id")
        .offset((page - 1) * 10)
        .limit(10);
      if (Array.isArray(data) && data.length !== 0) {
        // Group by id
        const groups = _.groupBy(data, "id");

        // Calculate total amount for each group
        const result = _.mapValues(groups, (array) =>
          array.map((item) => {
            let result = _.omit(item, "id");
            result["revenue"] = item.selling_price * item.quantity_sold;
            return result;
          })
        );

        return result;
      }
      return 0;
    } catch (error) {
      return false;
    }
  }

  public async addSales() {
    const names = this.requestBody.map((item) => item.name);
    try {
      await db.transaction(async (trx) => {
        const productData: ProductSalesData[] = await trx("product")
          .select("id", "name", "selling_price", "inventory")
          .whereIn("name", names);
        const productName = productData.map((item) => item.name);
        // Check if the names are the same (case-sensitive)
        if (
          names.length !== productData.length ||
          !_.isEqual(names.sort(), productName.sort())
        ) {
          throw new Error("Product not found");
        }

        for (const item of this.requestBody) {
          const foundProduct = _.find(productData, { name: item.name });
          if (foundProduct && foundProduct.inventory < item.quantity) {
            throw new Error("Inventory not enough");
          }
        }
        const totalRevenue = _.sum(
          _.map(productData, (item) => {
            const foundQuantity = _.find(this.requestBody, { name: item.name });
            if (foundQuantity) {
              return item.selling_price * foundQuantity.quantity;
            }
          })
        );
        const salesId = uuidv4();

        await trx("sales_records").insert({
          id: salesId,
          total_revenue: totalRevenue,
        });

        const insertSalesRecords = _.map(this.requestBody, (item) => {
          const foundProduct = _.find(productData, { name: item.name });
          if (foundProduct) {
            return {
              sales_id: salesId,
              product_id: foundProduct.id,
              quantity: item.quantity,
              total_revenue: foundProduct.selling_price * item.quantity,
            };
          }
          return null;
        }).filter((item) => item !== null);

        await trx("sales_detail").insert(insertSalesRecords);

        for (const item of this.requestBody) {
          await trx("product")
            .where("name", item.name)
            .update({
              inventory: db.raw("?? - ?", ["inventory", item.quantity]),
              quantity_sold: db.raw("?? + ?", ["quantity_sold", item.quantity]),
            });
        }
      });
      return 200;
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "Product not found") {
          return 404;
        }
        if (error.message === "Inventory not enough") {
          return 400;
        }
        return 500;
      }
    }
  }
}

export default SalesClass;
