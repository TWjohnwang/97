import { Knex } from "knex";
import { v4 as uuidv4 } from "uuid";
import {
  Product,
  Purchase_records,
  Sales_detail,
  Sales_records,
} from "../../../utils/interface";

const laptop: Product = {
  id: uuidv4(),
  name: "Laptop",
  selling_price: 999.99,
  quantity_sold: 100,
  inventory: 100,
  note: "High-performance laptop for professional use",
};

const smartphone: Product = {
  id: uuidv4(),
  name: "Smartphone",
  selling_price: 699.99,
  quantity_sold: 200,
  inventory: 100,
  note: "Latest model with advanced features",
};

const headphones: Product = {
  id: uuidv4(),
  name: "Headphones",
  selling_price: 149.99,
  quantity_sold: 150,
  inventory: 75,
  // note: "Noise-canceling headphones for immersive audio experience",
  note: "這是一個產品註釋",
};

const product1: Product = {
  id: uuidv4(),
  name: "product1",
  selling_price: 999.99,
  quantity_sold: 100,
  inventory: 100,
  note: "High-performance laptop for professional use",
};

const product2: Product = {
  id: uuidv4(),
  name: "product2",
  selling_price: 699.99,
  quantity_sold: 200,
  inventory: 100,
  note: "Latest model with advanced features",
};

const product3: Product = {
  id: uuidv4(),
  name: "product3",
  selling_price: 149.99,
  quantity_sold: 150,
  inventory: 75,
  // note: "Noise-canceling headphones for immersive audio experience",
  note: "這是一個產品註釋",
};

const product4: Product = {
  id: uuidv4(),
  name: "product4",
  selling_price: 999.99,
  quantity_sold: 100,
  inventory: 100,
  note: "High-performance laptop for professional use",
};

const product5: Product = {
  id: uuidv4(),
  name: "product5",
  selling_price: 699.99,
  quantity_sold: 200,
  inventory: 100,
  note: "Latest model with advanced features",
};

const product6: Product = {
  id: uuidv4(),
  name: "product6",
  selling_price: 149.99,
  quantity_sold: 150,
  inventory: 75,
  // note: "Noise-canceling headphones for immersive audio experience",
  note: "這是一個產品註釋",
};

const product7: Product = {
  id: uuidv4(),
  name: "product7",
  selling_price: 999.99,
  quantity_sold: 100,
  inventory: 100,
  note: "High-performance laptop for professional use",
};

const product8: Product = {
  id: uuidv4(),
  name: "product8",
  selling_price: 699.99,
  quantity_sold: 200,
  inventory: 100,
  note: "Latest model with advanced features",
};

const product9: Product = {
  id: uuidv4(),
  name: "product9",
  selling_price: 149.99,
  quantity_sold: 150,
  inventory: 75,
  // note: "Noise-canceling headphones for immersive audio experience",
  note: "這是一個產品註釋",
};

const products: Product[] = [
  laptop,
  smartphone,
  headphones,
  product1,
  product2,
  product3,
  product4,
  product5,
  product6,
  product7,
  product8,
  product9,
];

const recordLaptop: Purchase_records = {
  id: uuidv4(),
  product_id: laptop.id,
  purchase_price: 800.0,
  quantity_purchased: 150,
};

const recordSmartphone: Purchase_records = {
  id: uuidv4(),
  product_id: smartphone.id,
  purchase_price: 600.0,
  quantity_purchased: 300,
};

const recordHeadphones: Purchase_records = {
  id: uuidv4(),
  product_id: headphones.id,
  purchase_price: 100.0,
  quantity_purchased: 225,
};

const purchaseRecords: Purchase_records[] = [
  recordLaptop,
  recordSmartphone,
  recordHeadphones,
];

const sales1: Sales_records = {
  id: uuidv4(),
  total_revenue:
    laptop.selling_price * 30 +
    smartphone.selling_price * 150 +
    headphones.selling_price * 75,
};

const sales2: Sales_records = {
  id: uuidv4(),
  total_revenue: laptop.selling_price * 70 + headphones.selling_price * 75,
};

const salesRecords: Sales_records[] = [sales1, sales2];

const sales1Laptop: Sales_detail = {
  sales_id: sales1.id,
  product_id: laptop.id,
  quantity: 30,
  total_revenue: laptop.selling_price * 30,
};

const sales1Smartphone: Sales_detail = {
  sales_id: sales1.id,
  product_id: smartphone.id,
  quantity: 150,
  total_revenue: smartphone.selling_price * 150,
};

const sales1Headphones: Sales_detail = {
  sales_id: sales1.id,
  product_id: headphones.id,
  quantity: 200,
  total_revenue: headphones.selling_price * 75,
};

const sales2Laptop: Sales_detail = {
  sales_id: sales2.id,
  product_id: laptop.id,
  quantity: 70,
  total_revenue: laptop.selling_price * 70,
};

const sales2Headphones: Sales_detail = {
  sales_id: sales2.id,
  product_id: headphones.id,
  quantity: 75,
  total_revenue: headphones.selling_price * 75,
};

const salesDetails: Sales_detail[] = [
  sales1Laptop,
  sales1Smartphone,
  sales1Headphones,
  sales2Laptop,
  sales2Headphones,
];

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  await knex("purchase_records").del();
  await knex("sales_detail").del();
  await knex("sales_records").del();
  await knex("product").del();

  // Inserts seed entries
  await knex("product").insert(products);
  await knex("purchase_records").insert(purchaseRecords);
  await knex("sales_records").insert(salesRecords);
  await knex("sales_detail").insert(salesDetails);
}
