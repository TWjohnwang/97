import db from "./database/config";
import { Product, PurchaseData } from "../utils/interface";
import { v4 as uuidv4 } from "uuid";

class PurchaseClass {
  constructor(
    public name?: string,
    public purchase_price?: string | number,
    public quantity_purchased?: number
  ) {
    this.name = name;
    this.purchase_price = purchase_price;
    this.quantity_purchased = quantity_purchased;
  }

  public static async fetchAllPurchase(): Promise<PurchaseData[] | false | 0> {
    try {
      const data: PurchaseData[] = await db("purchase_records")
        .select(
          "name",
          "purchase_price",
          "quantity_purchased",
          "date_purchased"
        )
        .join("product", "purchase_records.product_id", "product.id");
      return data.length ? data : 0;
    } catch (error) {
      return false;
    } finally {
      db.destroy();
    }
  }

  public async fetchPurchaseByCondition() {
    try {
      const data: PurchaseData[] = await db("purchase_records")
        .select(
          "name",
          "purchase_price",
          "quantity_purchased",
          "date_purchased"
        )
        .join("product", "purchase_records.product_id", "product.id")
        .where((builder) => {
          if (this.name) {
            builder.where("name", this.name);
          }
          if (this.purchase_price) {
            builder.where("purchase_price", this.purchase_price);
          }
          if (this.quantity_purchased) {
            builder.where("quantity_purchased", this.quantity_purchased);
          }
        });

      return data.length ? data : 0;
    } catch (error) {
      return false;
    } finally {
      db.destroy();
    }
  }

  public async addPurchase() {
    try {
      const product: Product = await db("product")
        .where("name", this.name)
        .first();

      if (product && this.quantity_purchased) {
        // Update inventory
        await db("product")
          .where("id", product.id)
          .update({
            inventory: db.raw("?? + ?", ["inventory", this.quantity_purchased]),
          });

        // Add record to purchase_records
        await db("purchase_records").insert({
          id: uuidv4(),
          product_id: product.id,
          purchase_price: this.purchase_price,
          quantity_purchased: this.quantity_purchased,
        });
        return 200;
      }
      return 404;
    } catch (error) {
      return 500;
    }
  }
}

export default PurchaseClass;
