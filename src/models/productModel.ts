import db from "./database/config";
import { ProductData, ErrorMessage } from "../utils/interface";
import { v4 as uuidv4 } from "uuid";

class ProductClass {
  constructor(
    public name?: string,
    public selling_price?: string | number,
    public quantity_sold?: number,
    public inventory?: number,
    public note?: string
  ) {
    this.name = name;
    this.selling_price = selling_price;
    this.quantity_sold = quantity_sold;
    this.inventory = inventory;
    this.note = note;
  }
  public static async fetchAllProduct(): Promise<ProductData[] | false | 0> {
    try {
      const data: ProductData[] = await db("product")
        .select("name", "selling_price", "quantity_sold", "inventory", "note")
        .from("product");
      return data.length ? data : 0;
    } catch (error) {
      return false;
    }
  }

  public async fetchProductByCondition(): Promise<ProductData[] | false | 0> {
    try {
      const data: ProductData[] = await db("product")
        .select("name", "selling_price", "quantity_sold", "inventory", "note")
        .where((builder) => {
          if (this.name !== undefined) {
            builder.where("name", this.name);
          }
          if (this.selling_price !== undefined) {
            builder.where("selling_price", this.selling_price);
          }
          if (this.quantity_sold !== undefined) {
            builder.where("quantity_sold", this.quantity_sold);
          }
          if (this.inventory !== undefined) {
            builder.where("inventory", this.inventory);
          }
        });
      return data.length ? data : 0;
    } catch (error) {
      return false;
    }
  }
  public async addProduct() {
    try {
      await db("product").insert({
        id: uuidv4(),
        name: this.name,
        selling_price: this.selling_price,
        quantity_sold: this.quantity_sold,
        inventory: this.inventory,
        note: this.note,
      });
      return {
        status: 200,
      };
    } catch (e) {
      const error = e as ErrorMessage;
      if (
        error.code === "PROTOCOL_CONNECTION_LOST" ||
        error.code === "ER_ACCESS_DENIED_ERROR"
      ) {
        return {
          status: 500,
        };
      }
      return {
        status: 400,
        message: error.sqlMessage,
      };
    }
  }

  public async updateProduct(newName: string | undefined) {
    const updateData: Partial<ProductData> = {};
    if (newName !== undefined) {
      updateData.name = newName;
    }

    if (
      this.selling_price !== undefined &&
      typeof this.selling_price !== "string"
    ) {
      updateData.selling_price = this.selling_price;
    }

    if (this.quantity_sold !== undefined) {
      updateData.quantity_sold = this.quantity_sold;
    }

    if (this.inventory !== undefined) {
      updateData.inventory = this.inventory;
    }

    if (this.note !== undefined) {
      updateData.note = this.note;
    }

    try {
      const result = await db("product")
        .where("name", this.name)
        .update(updateData);

      if (!result) {
        return 404;
      }
      return 200;
    } catch (e) {
      return e;
    }
  }

  public async deleteProduct() {
    try {
      const result = await db("product").where("name", this.name).del();
      if (!result) {
        return 404;
      }
      return 200;
    } catch (e) {
      if (e instanceof Error && "a foreign key constraint") {
        return 400;
      }
      return 500;
    }
  }
}
export default ProductClass;
