import db from "./database/config";
import _ from "lodash";
import {
  SalesData,
  ProductSalesData,
  SalesReturnData,
  SalesRequestBody
} from "../utils/interface";
import { v4 as uuidv4 } from "uuid";

class SalesClass {
  constructor(private requestBody: SalesData[] | SalesRequestBody ) {
    this.requestBody = requestBody;
  }

  public static async fetchAllSales(page: number) {
    try {
      const data = await db("sales_detail")
        .select("sales_records.id", "name", "selling_price", "quantity")
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
            result["revenue"] = item.selling_price * item.quantity;
            return result;
          })
        );

        return result as unknown as SalesReturnData[];
      }
      return 0;
    } catch (error) {
      return false;
    }
  }
  
  public async fetchSalesByCondition() {
    try {
      const data = await db("sales_detail")
        .select(
          "sales_records.id",
          "name",
          "selling_price",
          "quantity_sold"
        )
        .join("product", "sales_detail.product_id", "product.id")
        .join("sales_records", "sales_detail.sales_id", "sales_records.id")
        .where((builder) => {
          if (!Array.isArray(this.requestBody)){
          if (this.requestBody.id !== undefined) {
            builder.where("sales_records.id", this.requestBody.id);
          }
          if (this.requestBody.name !== undefined) {
            builder.where("name", this.requestBody.name);
          }
          if (this.requestBody.quantity_sold !== undefined) {
            builder.where("quantity_sold", this.requestBody.quantity_sold);
          }}
        });
      if (Array.isArray(data) && data.length !== 0) {
        // Group by id
        const groups = _.groupBy(data, "id");
        // Calculate total amount for each group
        const res = _.mapValues(groups, (array) =>
          array.map((item) => {
            let result = _.omit(item, "id");
            result["revenue"] = item.selling_price * item.quantity_sold;
            if (!Array.isArray(this.requestBody)){
              if (this.requestBody.revenue !== undefined) {
                if (result["revenue"] !== this.requestBody.revenue) {
                  return;
                }
              }
              return result;
            }
          }).filter((item) => item !== undefined)
        );
        return res as unknown as SalesReturnData[];
      }
      return 0;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  public async addSales() {
    const body = this.requestBody as SalesData[];
    const names = body.map((item) => item.name);
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

          for (const item of body) {
            const foundProduct = _.find(productData, { name: item.name });
            if (foundProduct && foundProduct.inventory < item.quantity) {
              throw new Error("Inventory not enough");
            }
          }
          const totalRevenue = _.sum(
            _.map(productData, (item) => {
              const foundQuantity = _.find(body, { name: item.name });
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

          const insertSalesRecords = _.map(body, (item) => {
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

          for (const item of body) {
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
