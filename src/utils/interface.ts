export enum Status {
  Success = 200,
  BadRequest = 400,
  NotFound = 404,
  InternalServerError = 500,
}

export interface Product {
  id: string;
  name: string;
  selling_price: number;
  quantity_sold: number;
  inventory: number;
  note?: string;
}

export type ProductData = Omit<Product, "id">;

export interface Purchase_records {
  id: string;
  product_id: string;
  purchase_price: number;
  quantity_purchased: number;
}

export type PurchaseData = Pick<
  Purchase_records & Product,
  "name" | "purchase_price" | "quantity_purchased"
> & {
  date_purchased: string;
};

export interface Sales_detail {
  sales_id: string;
  product_id: string;
  quantity: number;
  total_revenue: number;
}

export interface Sales_records {
  id: string;
  total_revenue: number;
}

export type SalesData = Pick<Product & Sales_detail, "name" | "quantity">;
export type ProductSalesData = Pick<
  Product,
  "id" | "name" | "selling_price" | "inventory"
>;

export interface ErrorMessage {
  code: string;
  errno: number;
  sqlMessage: string;
  sqlState: string;
  index: number;
  sql: string;
}
